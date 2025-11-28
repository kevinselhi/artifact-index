import fs from 'fs';

const content = fs.readFileSync('You-com ARI appendix_The 2020 Human Artifact Index_ Complete Ranked Table of 100 Artifacts (CSV Format).md', 'utf8');

const csvMatch = content.match(/```csv\n([\s\S]+?)\n```/);
const csvData = csvMatch[1];
const lines = csvData.split('\n').filter(line => line.trim());
const dataLines = lines.slice(1);

const regex = /^(\d+),([^,]+),(\$[0-9,]+-\$[0-9,]+),([^,]+),(.+)$/;
const matched = [];
const unmatched = [];

for (const line of dataLines) {
  const match = line.match(regex);
  if (match) {
    matched.push(parseInt(match[1]));
  } else {
    unmatched.push(line);
  }
}

console.log('Matched:', matched.length);
console.log('Unmatched:', unmatched.length);
console.log('\nUnmatched lines:');
unmatched.forEach(line => console.log(line));

const allRanks = Array.from({length: 100}, (_, i) => i + 1);
const missing = allRanks.filter(r => !matched.includes(r));
console.log('\nMissing ranks:', missing);
