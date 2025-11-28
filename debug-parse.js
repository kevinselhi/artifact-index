import fs from 'fs';
const content = fs.readFileSync('2020 Top 100 Artifacts Index created by Claude 4.5 Opus with Extended Thinking and Web Search via Claude Code in CLI.md', 'utf8');
const tableRegex = /\|\s*(\d+)\s*\|\s*([^|]+)\s*\|\s*\$([^|]+)\s*\|\s*([^|]+)\s*\|/g;
const ranks = [];
let match;
while ((match = tableRegex.exec(content)) !== null) {
  const rank = parseInt(match[1].trim());
  ranks.push(rank);
}
console.log('Total matches:', ranks.length);
console.log('Unique ranks:', new Set(ranks).size);
console.log('Ranks > 100:', ranks.filter(r => r > 100));
console.log('Duplicate ranks:', ranks.filter((r, i) => ranks.indexOf(r) !== i).sort((a,b) => a-b));
console.log('Missing ranks 1-100:', Array.from({length: 100}, (_, i) => i + 1).filter(r => !ranks.includes(r)));
