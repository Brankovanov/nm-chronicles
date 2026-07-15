const fs = require('fs');
const path = require('path');

const distDir = path.resolve(__dirname, '../dist/github-pages/browser');
const indexFile = path.join(distDir, 'index.html');

const routeMetadata = [
  {
    path: '/',
    title: 'The Newport Maeve Chronicles | Gothic Noir Fantasy',
    description: 'A gothic noir fantasy by Dean Jordanov. In Newport Maeve, a city of brass and steam, a thousand-year-old vampire is handed an assignment he cannot refuse.',
    image: 'https://newportmaeve.com/assets/images/cover.webp',
  },
  {
    path: '/city',
    title: 'Newport Maeve City | Newport Maeve Chronicles',
    description: 'Explore the map and districts of Newport Maeve, the steam-powered city at the heart of the Newport Maeve Chronicles.',
    image: 'https://newportmaeve.com/assets/images/city/map.webp',
  },
  {
    path: '/character/miroslav-dion',
    title: 'Miroslav Dion | Newport Maeve Chronicles',
    description: 'Meet Miroslav Dion, the First of the BloodBlessed, a vampire strategist with a deadly bargain and a city to protect.',
    image: 'https://newportmaeve.com/assets/images/miroslav-dion/miroslav-dion-portrait.webp',
  },
  {
    path: '/character/the-protector',
    title: 'The Protector | Newport Maeve Chronicles',
    description: 'Discover The Protector, the angelic warrior charged with safeguarding Newport Maeve from unseen threats.',
    image: 'https://newportmaeve.com/assets/images/the-protector/the-protector-portrait.webp',
  },
  {
    path: '/character/the-unknown-emissary',
    title: 'The Unknown Emissary | Newport Maeve Chronicles',
    description: 'The Unknown Emissary appears without warning — an inscrutable envoy bound to the One True.',
    image: 'https://newportmaeve.com/assets/images/the-unknown-emissary/the-unknown-emissary-portrait.webp',
  },
  {
    path: '/character/george-laris',
    title: 'George L\'Aris | Newport Maeve Chronicles',
    description: 'George L\'Aris is the vampire enforcer pulling the strings of the city\'s underground syndicates.',
    image: 'https://newportmaeve.com/assets/images/george-laris/george-laris-portrait.webp',
  },
  {
    path: '/character/aland',
    title: 'Aland | Newport Maeve Chronicles',
    description: 'Aland survives as a street con artist in Newport Maeve, using hunger and charm to survive the dark streets.',
    image: 'https://newportmaeve.com/assets/images/aland/aland-portrait.webp',
  },
];

if (!fs.existsSync(distDir)) {
  console.error('GitHub Pages build output not found:', distDir);
  process.exit(1);
}

const indexHtml = fs.readFileSync(indexFile, 'utf8');

function updateMeta(html, metadata, routeUrl) {
  return html
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
