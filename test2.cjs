const fs = require('fs');

let code = fs.readFileSync('src/app/utils/i18n.tsx', 'utf8');
const match = code.match(/export const TRANSLATIONS: Dict = (\{[\s\S]*?\n\});/);
if (match) {
  const jsonStr = match[1];
  try {
    const evalCode = `module.exports = ${jsonStr}`;
    fs.writeFileSync('temp.cjs', evalCode);
    const obj = require('./temp.cjs');
    console.log("Keys count:", Object.keys(obj).length);
    console.log("Has stage.hero:", !!obj['stage.hero']);
    console.log("Has crew.bo.name:", !!obj['crew.bo.name']);
  } catch (e) {
    console.error("Eval error:", e);
  }
} else {
  console.log("No match found");
}
