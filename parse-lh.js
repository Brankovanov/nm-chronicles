const fs = require('fs');
const path = require('path');
const reportPath = path.resolve(__dirname, 'lighthouse-report-live.json');
const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
const categories = report.categories;
const scores = Object.entries(categories).map(([key, cat]) => ({ title: cat.title, score: Math.round((cat.score ?? 0) * 100) }));
const audits = report.audits;
const failing = Object.entries(audits)
  .filter(([, audit]) => audit.score !== null && audit.score !== undefined && audit.score < 1 && audit.scoreDisplayMode === 'numeric')
  .map(([id, audit]) => ({ id, title: audit.title, score: audit.score, displayValue: audit.displayValue }));
console.log('SCORES');
scores.forEach((item) => console.log(`${item.title}: ${item.score}`));
console.log('\nTOP FAILING AUDITS');
failing.slice(0, 10).forEach((item) => console.log(`${item.title} (${item.id}): ${item.score}`));
console.log(`\nLCP: ${audits['largest-contentful-paint']?.displayValue}`);
console.log(`TBT: ${audits['total-blocking-time']?.displayValue}`);
console.log(`CLS: ${audits['cumulative-layout-shift']?.displayValue}`);
