const fs = require('fs');
const report = JSON.parse(fs.readFileSync('lighthouse-report-live.json', 'utf8'));
const audits = report.audits;
const failed = Object.entries(audits).filter(([, a]) => a.score !== null && a.score < 1);
failed.sort(([, a], [, b]) => a.score - b.score);
for (const [id, a] of failed) {
  console.log('---', id, '---');
  console.log('title:', a.title);
  console.log('score:', a.score);
  console.log('displayValue:', a.displayValue);
  if (a.details) {
    console.log('details.type:', a.details.type);
    if (Array.isArray(a.details.items)) {
      console.log('items:', JSON.stringify(a.details.items.slice(0, 5), null, 2));
    }
  }
}
