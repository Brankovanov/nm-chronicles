const fs = require('fs');
const path = require('path');
const { routeMetadata } = require('./route-metadata');

const distDir = path.resolve(__dirname, '../dist/github-pages/browser');
const indexFile = path.join(distDir, 'index.html');

if (!fs.existsSync(distDir)) {
  console.error('GitHub Pages build output not found:', distDir);
  process.exit(1);
}

const indexHtml = fs.readFileSync(indexFile, 'utf8');

function ensureFbAppId(html) {
  if (/\<meta property="fb:app_id"/i.test(html)) {
    return html;
  }
  return html.replace(
    /(<meta property="og:site_name" content="[^"]*"\s*\/?\>)/i,
    `$1\n  <meta property="fb:app_id" content="1234567890">`
  );
}

function ensureOgImageMetadata(html) {
  let updated = html;

  if (!/<meta property="og:image:type"/i.test(updated)) {
    updated = updated.replace(
      /(<meta property="og:image" content="[^"]*"\s*\/?\>)/i,
      `$1\n  <meta property="og:image:type" content="image/webp">`
    );
  }

  if (!/<meta property="og:image:width"/i.test(updated)) {
    updated = updated.replace(
      /(<meta property="og:image:type" content="[^"]*"\s*\/?\>)/i,
      `$1\n  <meta property="og:image:width" content="1200">`
    );
  }

  if (!/<meta property="og:image:height"/i.test(updated)) {
    updated = updated.replace(
      /(<meta property="og:image:width" content="[^"]*"\s*\/?\>)/i,
      `$1\n  <meta property="og:image:height" content="630">`
    );
  }

  if (!/<meta name="twitter:image:alt"/i.test(updated)) {
    updated = updated.replace(
      /(<meta name="twitter:image" content="[^"]*"\s*\/?\>)/i,
      `$1\n  <meta name="twitter:image:alt" content="Social preview image for Newport Maeve Chronicles">`
    );
  }

  return updated;
}

function updateMeta(html, metadata, routeUrl) {
  return ensureFbAppId(ensureOgImageMetadata(html))
    .replace(/<meta property="og:title" content="[^"]*"\s*\/?>/i, `<meta property="og:title" content="${metadata.title}">`)
    .replace(/<meta property="og:description" content="[^"]*"\s*\/?>/i, `<meta property="og:description" content="${metadata.description}">`)
    .replace(/<meta property="og:image" content="[^"]*"\s*\/?>/i, `<meta property="og:image" content="${metadata.image}">`)
    .replace(/<meta property="og:url" content="[^"]*"\s*\/?>/i, `<meta property="og:url" content="https://brankovanov.github.io/nm-chronicles${routeUrl}">`)
    .replace(/<meta name="twitter:title" content="[^"]*"\s*\/?>/i, `<meta name="twitter:title" content="${metadata.title}">`)
    .replace(/<meta name="twitter:description" content="[^"]*"\s*\/?>/i, `<meta name="twitter:description" content="${metadata.description}">`)
    .replace(/<meta name="twitter:image" content="[^"]*"\s*\/?>/i, `<meta name="twitter:image" content="${metadata.image}">`)
    .replace(/<meta name="description" content="[^"]*"\s*\/?>/i, `<meta name="description" content="${metadata.description}">`)
    .replace(/<link rel="canonical" href="[^"]*"\s*\/?>/i, `<link rel="canonical" href="https://brankovanov.github.io/nm-chronicles${routeUrl}">`)
    .replace(/<title>[^<]*<\/title>/i, `<title>${metadata.title}</title>`);
}

for (const route of routeMetadata) {
  const content = updateMeta(indexHtml, route, route.path === '/' ? '/' : route.path);
  const routeDir = path.join(distDir, route.path === '/' ? '' : route.path);
  const outputDir = route.path === '/' ? distDir : routeDir;

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  fs.writeFileSync(path.join(outputDir, 'index.html'), content, 'utf8');
}

console.log('Prerendered GitHub Pages routes:', routeMetadata.map((r) => r.path).join(', '));
