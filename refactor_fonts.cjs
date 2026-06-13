const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    const dirPath = path.join(dir, f);
    const isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

walkDir('src/app/components', (filePath) => {
  if (filePath.endsWith('.tsx')) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Pattern 1: style={{ fontFamily: "'Space Grotesk', sans-serif" }} -> removed entirely
    content = content.replace(/style=\{\{\s*fontFamily:\s*['"](?:'Space Grotesk'|"Space Grotesk"),\s*sans-serif['"]\s*\}\}/g, '');
    
    // Pattern 2: style={{ color: "...", fontFamily: "'Space Grotesk', sans-serif", ... }}
    // We remove the fontFamily property from inside the object.
    content = content.replace(/fontFamily:\s*['"](?:'Space Grotesk'|"Space Grotesk"),\s*sans-serif['"],?\s*/g, '');
    
    // Clean up empty style objects that might be left behind: style={{ }} -> removed
    content = content.replace(/style=\{\{\s*\}\}/g, '');
    
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Refactored ${filePath}`);
  }
});
