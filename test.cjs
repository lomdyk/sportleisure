const fs = require('fs');

let code = fs.readFileSync('src/app/utils/i18n.tsx', 'utf8');
// Naive regex to match TRANSLATIONS object
const match = code.match(/export const TRANSLATIONS: Dict = (\{[\s\S]*?\n\});/);
if (match) {
  const jsonStr = match[1];
  try {
    // we can't JSON.parse because it's JS (keys aren't quoted usually, but here they are). But values are { en: "..." }
    // Let's just evaluate it
    const evalCode = `module.exports = ${jsonStr}`;
    fs.writeFileSync('temp.js', evalCode);
    const obj = require('./temp.js');
    console.log("Keys count:", Object.keys(obj).length);
    console.log("Has stage.hero:", !!obj['stage.hero']);
    console.log("Has crew.bo.name:", !!obj['crew.bo.name']);
  } catch (e) {
    console.error("Eval error:", e);
  }
} else {
  console.log("No match found");
}
