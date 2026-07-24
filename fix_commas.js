const fs = require('fs');
let lines = fs.readFileSync('src/lib/data.ts', 'utf-8').split('\n');

for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('technicalChallenges: "')) {
        // If the line does not end with a comma (ignoring trailing whitespace)
        if (!lines[i].trim().endsWith(',')) {
            lines[i] = lines[i].trimEnd() + ',';
        }
    }
}

fs.writeFileSync('src/lib/data.ts', lines.join('\n'), 'utf-8');
console.log('Fixed commas!');
