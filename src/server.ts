import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import { existsSync } from 'node:fs';
import { mkdir, readFile, readdir, stat, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';

const browserDistFolder = join(import.meta.dirname, '../browser');
const dataFolder = join(import.meta.dirname, '../assets/data');
const imageFolder = (() => {
  const projectRoot = process.cwd();
  const candidates = [
    join(projectRoot, 'src/assets/images'),
    join(projectRoot, 'browser/assets/images'),
    join(projectRoot, 'dist/nm-chronicles/browser/assets/images'),
  ];

  const resolved = candidates.find((folder) => existsSync(folder));
  if (resolved) {
    return resolved;
  }

  throw new Error(
    `Unable to resolve image folder. Tried: ${candidates.join(', ')}`,
  );
})();
const allowedDataFiles = new Set([
  'audiobook.json',
  'author.json',
  'community.json',
  'quotes.json',
  'series.json',
  'home-content.json',
  'city.json',
  'characters.json',
]);

const getDataFilePath = (fileName: string) => {
  if (!allowedDataFiles.has(fileName)) {
    throw new Error('Invalid data file name.');
  }

  return join(dataFolder, fileName);
};

const getImageFilePath = (relativePath: string) => {
  const normalized = relativePath.replace(/\\/g, '/').replace(/^\/+/, '');
  if (!normalized || normalized.includes('..')) {
    throw new Error('Invalid image path.');
  }

  const absolutePath = join(imageFolder, normalized);
  if (!absolutePath.startsWith(imageFolder)) {
    throw new Error('Invalid image path.');
  }

  return absolutePath;
};

const readImageFiles = async (dir: string, rootDir = dir): Promise<string[]> => {
  const entries = await readdir(dir, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const entryPath = join(dir, entry.name);

    if (entry.isDirectory()) {
      files.push(...await readImageFiles(entryPath, rootDir));
    } else if (entry.isFile()) {
      const relative = entryPath.slice(rootDir.length + 1).replace(/\\/g, '/');
      files.push(relative);
    }
  }

  return files;
};

const app = express();
const angularApp = new AngularNodeAppEngine();

const adminAccounts = new Map([
  ['admin', 'ChangeMe123!'],
  ['editor', 'EditorPass123!'],
]);

const isValidAdminCredentials = (authorization: string | undefined): boolean => {
  if (!authorization?.startsWith('Basic ')) {
    return false;
  }

  const encoded = authorization.slice('Basic '.length);
  let decoded: string;

  try {
    decoded = Buffer.from(encoded, 'base64').toString('utf8');
  } catch {
    return false;
  }

  const [username, password] = decoded.split(':');
  if (!username || !password) {
    return false;
  }

  return adminAccounts.get(username) === password;
};

const adminAuthMiddleware = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const authorization = req.headers['authorization'];
  if (typeof authorization !== 'string' || !isValidAdminCredentials(authorization)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  return next();
};

/**
 * Example Express Rest API endpoints can be defined here.
 * Uncomment and define endpoints as necessary.
 *
 * Example:
 * ```ts
 * app.get('/api/{*splat}', (req, res) => {
 *   // Handle API request
 * });
 * ```
 */

/**
 * Admin API for editing JSON content and uploading images.
 */
app.use(express.json({ limit: '20mb' }));
app.use('/api/admin', adminAuthMiddleware);

app.get('/api/admin/data', (req, res) => {
  res.json(Array.from(allowedDataFiles));
});

app.get('/api/admin/data/:fileName', async (req, res) => {
  try {
    const filePath = getDataFilePath(req.params.fileName);
    const contents = await readFile(filePath, 'utf8');
    res.type('application/json').send(contents);
  } catch (error) {
    res.status(400).json({ error: error instanceof Error ? error.message : 'Unable to read data file.' });
  }
});

app.post('/api/admin/data/:fileName', async (req, res) => {
  try {
    const filePath = getDataFilePath(req.params.fileName);
    const content = req.body?.content;

    if (typeof content !== 'string') {
      return res.status(400).json({ error: 'Missing content in request body.' });
    }

    JSON.parse(content);
    await writeFile(filePath, content, 'utf8');
    return res.json({ success: true });
  } catch (error) {
    return res.status(400).json({ error: error instanceof Error ? error.message : 'Unable to save data file.' });
  }
});

app.get('/api/admin/images', async (req, res) => {
  try {
    const files = await readImageFiles(imageFolder);
    res.json(files);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unable to list images.' });
  }
});

app.post('/api/admin/images', async (req, res) => {
  try {
    const relativePath = String(req.body?.path ?? '');
    const contentBase64 = String(req.body?.contentBase64 ?? '');

    if (!relativePath || !contentBase64) {
      return res.status(400).json({ error: 'Upload payload must include path and contentBase64.' });
    }

    const destination = getImageFilePath(relativePath);
    await mkdir(dirname(destination), { recursive: true });

    const buffer = Buffer.from(contentBase64.replace(/^data:[^;]+;base64,/, ''), 'base64');
    await writeFile(destination, buffer);
    return res.status(201).json({ success: true });
  } catch (error) {
    return res.status(400).json({ error: error instanceof Error ? error.message : 'Unable to save uploaded image.' });
  }
});

/**
 * Serve static files from /browser
 */
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    immutable: true,
    index: false,
    redirect: false,
    setHeaders: (res, filePath) => {
      if (filePath.match(/\.(js|css|png|jpe?g|webp|svg|ttf|otf|woff2?)$/i)) {
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      }
    },
  }),
);

/**
 * Handle all other requests by rendering the Angular application.
 */
app.use((req, res, next) => {
  angularApp
    .handle(req)
    .then((response) => {
      if (!response) {
        return next();
      }

      response.headers.set(
        'Cache-Control',
        'public, max-age=3600, stale-while-revalidate=86400',
      );

      return writeResponseToNodeResponse(response, res);
    })
    .catch(next);
});

/**
 * Start the server if this module is the main entry point, or it is ran via PM2.
 * The server listens on the port defined by the `PORT` environment variable, or defaults to 4000.
 */
if (isMainModule(import.meta.url) || process.env['pm_id']) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, (error) => {
    if (error) {
      throw error;
    }

    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

/**
 * Request handler used by the Angular CLI (for dev-server and during build) or Firebase Cloud Functions.
 */
export const reqHandler = createNodeRequestHandler(app);
