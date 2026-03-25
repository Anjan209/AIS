const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf8');

// Replace all indigo with theme
content = content.replace(/indigo-/g, 'theme-');

// Replace all rose with theme, EXCEPT in the error toast (which is around line 1200)
// Let's just replace rose- with theme- everywhere, then fix the error toast manually.
content = content.replace(/rose-/g, 'theme-');

// Replace glass-indigo and glass-rose with glass-theme
content = content.replace(/glass-theme/g, 'glass-theme');
content = content.replace(/glass-rose/g, 'glass-theme');

// Replace text-glow-indigo and text-glow-rose with text-glow-theme
content = content.replace(/text-glow-theme/g, 'text-glow-theme');
content = content.replace(/text-glow-rose/g, 'text-glow-theme');

// Now, we have a lot of redundant ternaries like:
// result?.isDeepfake ? "bg-theme-600" : "bg-theme-600"
// Let's clean up the most common ones.
content = content.replace(/\(result\?\.isDeepfake \|\| \(liveConfidence \?\? 0\) > settings\.threshold\) \? "text-theme-500 animate-pulse" : "text-theme-500"/g, '"text-theme-500 " + ((result?.isDeepfake || (liveConfidence ?? 0) > settings.threshold) ? "animate-pulse" : "")');

content = content.replace(/confidence > 80 \? "bg-theme-500 text-theme-500" : "bg-theme-500 text-theme-500"/g, '"bg-theme-500 text-theme-500"');

content = content.replace(/result\?\.isDeepfake \? "bg-theme-600" :/g, 'result ? "bg-theme-600" :');

content = content.replace(/result\?\.isDeepfake \? "glass-theme  shadow-theme-900\/20" : "glass-theme  shadow-theme-900\/20"/g, '"glass-theme shadow-theme-900/20"');

content = content.replace(/result\.isDeepfake \? "bg-theme-500\/20 text-theme-400 border-theme-500\/50 shadow-\[0_0_20px_rgba\(244,63,94,0\.2\)\]" : "bg-theme-500\/20 text-theme-400 border-theme-500\/50 shadow-\[0_0_20px_rgba\(99,102,241,0\.2\)\]"/g, '"bg-theme-500/20 text-theme-400 border-theme-500/50 shadow-[0_0_20px_var(--theme-glow)]"');

content = content.replace(/result\.isDeepfake \? "text-theme-500  " : "text-theme-400 "/g, '"text-theme-400"');
content = content.replace(/result\.isDeepfake \? "text-theme-500 " : "text-theme-400 "/g, '"text-theme-400"');
content = content.replace(/result\.isDeepfake \? "bg-theme-500" : "bg-theme-500"/g, '"bg-theme-500"');

content = content.replace(/isLive \? "bg-theme-500" : "bg-theme-500"/g, '"bg-theme-500"');

content = content.replace(/\(result\?\.isDeepfake \|\| \(liveConfidence \?\? 0\) > settings\.threshold\) \? "text-theme-500  animate-pulse" : "text-theme-500 "/g, '"text-theme-500 " + ((result?.isDeepfake || (liveConfidence ?? 0) > settings.threshold) ? "animate-pulse" : "")');

content = content.replace(/isActive \n                              \? \(isThreat \? "bg-theme-500 shadow-\[0_0_15px_rgba\(244,63,94,0\.8\)\]" : "bg-theme-500 shadow-\[0_0_15px_rgba\(99,102,241,0\.8\)\]"\)\n                              : "bg-theme-500\/10"/g, 'isActive ? "bg-theme-500 shadow-[0_0_15px_var(--theme-glow)]" : "bg-theme-500/10"');

content = content.replace(/liveConfidence > settings\.threshold \? "text-theme-500 " : "text-theme-500 "/g, '"text-theme-500"');

content = content.replace(/item\.isDeepfake \? "bg-theme-500\/20 border-theme-500 shadow-\[0_0_20px_rgba\(244,63,94,0\.8\)\]" : "bg-theme-500\/20 border-theme-500 shadow-\[0_0_20px_rgba\(99,102,241,0\.8\)\]"/g, '"bg-theme-500/20 border-theme-500 shadow-[0_0_20px_var(--theme-glow)]"');

content = content.replace(/item\.isDeepfake \? "text-theme-400 " : "text-theme-400 "/g, '"text-theme-400"');
content = content.replace(/item\.isDeepfake \? "text-theme-500 " : "text-theme-400 "/g, '"text-theme-400"');

// Add theme class to the root div
content = content.replace(/<div className="min-h-screen bg-\[#050506\] text-\[#E0E0E0\] font-sans overflow-x-hidden">/, 
`  const isThreat = result ? result.isDeepfake : (liveConfidence ?? 0) > settings.threshold;
  const isHuman = result ? !result.isDeepfake : (isLive && liveConfidence !== null && liveConfidence <= settings.threshold);
  const themeClass = isThreat ? 'theme-deepfake' : isHuman ? 'theme-human' : 'theme-default';

  return (
    <div className={\`min-h-screen bg-[#050506] text-[#E0E0E0] font-sans overflow-x-hidden \${themeClass}\`}>`);

fs.writeFileSync('src/App.tsx', content);

