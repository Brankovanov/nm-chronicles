const fs = require('fs');
const paths = [
  { path: 'dist/github-pages/browser/main-2H2LDRRV.js', pos: 17413 },
  { path: 'dist/github-pages/browser/chunk-COl406L5.js', pos: 6105 }
];
for (const { path, pos } of paths) {
  const content = fs.readFileSync(path, 'utf8');
  const start = Math.max(0, pos - 200);
  const end = Math.min(content.length, pos + 200);
  console.log('=== ' + path + ' ===');
  console.log(content.slice(start, end).replace(/\n/g, '\\n'));
}
