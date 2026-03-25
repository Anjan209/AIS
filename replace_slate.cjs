const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'App.tsx');
let content = fs.readFileSync(filePath, 'utf8');

content = content.replace(/bg-slate-800/g, 'bg-theme-900');
content = content.replace(/bg-slate-900/g, 'bg-theme-950');
content = content.replace(/bg-slate-950/g, 'bg-theme-950');

fs.writeFileSync(filePath, content);
console.log('Replaced slate backgrounds with theme backgrounds');
