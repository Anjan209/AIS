const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'App.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Replace specific shadow classes
content = content.replace(/shadow-\[0_0_10px_rgba\(99,102,241,[0-9.]+\)\]/g, 'shadow-glow-theme-sm');
content = content.replace(/shadow-\[0_0_15px_rgba\(99,102,241,[0-9.]+\)\]/g, 'shadow-glow-theme');
content = content.replace(/shadow-\[0_0_20px_rgba\(99,102,241,[0-9.]+\)\]/g, 'shadow-glow-theme-lg');
content = content.replace(/shadow-\[0_0_25px_rgba\(99,102,241,[0-9.]+\)\]/g, 'shadow-glow-theme-lg');
content = content.replace(/shadow-\[0_0_30px_rgba\(99,102,241,[0-9.]+\)\]/g, 'shadow-glow-theme-lg');
content = content.replace(/shadow-\[inset_0_0_10px_rgba\(99,102,241,[0-9.]+\)\]/g, 'shadow-[inset_0_0_10px_color-mix(in_srgb,var(--color-theme-500)_5%,transparent)]');

// Replace the conic gradient
content = content.replace(/bg-\[conic-gradient\(from_0deg,transparent_0deg,transparent_270deg,rgba\(99,102,241,0\.3\)_360deg\)\]/g, 'bg-[conic-gradient(from_0deg,transparent_0deg,transparent_270deg,color-mix(in_srgb,var(--color-theme-500)_30%,transparent)_360deg)]');

// Replace the linear gradient
content = content.replace(/bg-\[linear-gradient\(45deg,transparent_25%,rgba\(99,102,241,0\.1\)_50%,transparent_75%\)\]/g, 'bg-[linear-gradient(45deg,transparent_25%,color-mix(in_srgb,var(--color-theme-500)_10%,transparent)_50%,transparent_75%)]');

// Replace any remaining rgba(99,102,241,...) with color-mix
content = content.replace(/rgba\(99,102,241,([0-9.]+)\)/g, (match, opacity) => {
  return `color-mix(in srgb, var(--color-theme-500) ${parseFloat(opacity) * 100}%, transparent)`;
});

fs.writeFileSync(filePath, content);
console.log('Replaced hardcoded indigo shadows with theme glow classes');
