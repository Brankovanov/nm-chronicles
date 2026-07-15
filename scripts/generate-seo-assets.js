const fs = require('fs');
const path = require('path');
const { routeMetadata } = require('./route-metadata');

const ENVIRONMENTS = {
  'github-pages': {
    baseUrl: 'https://brankovanov.github.io/nm-chronicles',
    robotsRules: 'User-agent: *\nAllow: /\n',
  },
  production: {
    baseUrl: 'https://newportmaeve.com',
    robotsRules: 'User-agent: *\nAllow: /\n',
  },
  default: {
    baseUrl: 'http://localhost:4200',
    robotsRules: 'User-agent: *\nDisallow: /\n',
  },
};

const getEnvironmentConfig = (env) => ENVIRONMENTS[env] ?? ENVIRONMENTS.default;

const createSitemapXml = (baseUrl, routes) => {
  const escapeXml = (value) =>
    value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');

  const urlEntries = routes
    .map((route) => {
      const routePath = route.path === '/' ? '/' : route.path;
      const location = `${baseUrl}${routePath}`;
      return `  <url>\n    <loc>${escapeXml(location)}</loc>\n  </url>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urlEntries}\n</urlset>\n`;
};

const createRobotsTxt = (baseUrl, rules) => `${rules}Sitemap: ${baseUrl}/sitemap.xml\n`;

const run = () => {
  const [env, outputDir] = process.argv.slice(2);

  if (!outputDir) {
    console.error('Usage: node scripts/generate-seo-assets.js <environment> <output-directory>');
    process.exit(1);
  }

  const outputPath = path.resolve(process.cwd(), outputDir);
  if (!fs.existsSync(outputPath)) {
    console.error('Output directory not found:', outputPath);
    process.exit(1);
  }

  const { baseUrl, robotsRules } = getEnvironmentConfig(env);
  const sitemapXml = createSitemapXml(baseUrl, routeMetadata);
  const robotsTxt = createRobotsTxt(baseUrl, robotsRules);

  fs.writeFileSync(path.join(outputPath, 'sitemap.xml'), sitemapXml, 'utf8');
  fs.writeFileSync(path.join(outputPath, 'robots.txt'), robotsTxt, 'utf8');

  console.log(`Generated sitemap.xml and robots.txt for ${env ?? 'default'} in ${outputPath}`);
};

run();
