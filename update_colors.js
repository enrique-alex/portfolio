const fs = require('fs');
let content = fs.readFileSync('src/lib/data.ts', 'utf-8');

const colors = {
    'robotino': '{ r: 66, g: 133, b: 196 }',
    'awale': '{ r: 196, g: 87, b: 76 }',
    'pygroove': '{ r: 196, g: 150, b: 74 }',
    'terminal-c': '{ r: 85, g: 98, b: 115 }',
    'ferme-poo': '{ r: 58, g: 148, b: 137 }',
    'snake': '{ r: 140, g: 95, b: 168 }',
    'budget': '{ r: 122, g: 140, b: 74 }',
    'voiture-bluetooth': '{ r: 93, g: 101, b: 168 }'
};

const lines = content.split('\n');
let currentId = null;

for (let i = 0; i < lines.length; i++) {
    const idMatch = lines[i].match(/id:\s*"([^"]+)"/);
    if (idMatch) {
        currentId = idMatch[1];
    }
    
    if (lines[i].includes('themeColor:') && currentId && colors[currentId]) {
        const indent = lines[i].match(/^\s*/)[0];
        const hasComma = lines[i].trim().endsWith(',');
        lines[i] = `${indent}themeColor: ${colors[currentId]}${hasComma ? ',' : ''}`;
        currentId = null; // reset
    }
}

fs.writeFileSync('src/lib/data.ts', lines.join('\n'), 'utf-8');
console.log('Colors updated!');
