const fs = require("fs"), path = require("path");
const SLIDES = "work/ppt/003_visual_spec/slides";

// Step 1: Delete old files 013-029
const toDelete = [];
for (let i = 13; i <= 29; i++) {
  const pref = String(i).padStart(3,"0");
  fs.readdirSync(SLIDES).forEach(f => {
    if (f.startsWith(pref + "_") && f.endsWith(".json")) toDelete.push(f);
    if (f.startsWith("___OLD___" + pref)) toDelete.push(f);
  });
}
toDelete.forEach(f => { fs.unlinkSync(path.join(SLIDES, f)); console.log("  DELETED: " + f); });

// Step 2: Rename ___NEW___ files to final names
const newMap = {
  "___NEW___013_workflow_svg.json": "013_workflow_svg.json",
  "___NEW___014_nine_grid.json": "014_nine_grid.json",
  "___NEW___015_phases.json": "015_phases.json",
  "___NEW___016_svg_full.json": "016_svg_full.json",
  "___NEW___017_svg_full.json": "017_svg_full.json",
  "___NEW___018_steps.json": "018_steps.json",
  "___NEW___019_svg_full.json": "019_svg_full.json",
  "___NEW___020_svg_full.json": "020_svg_full.json",
  "___NEW___021_svg_full.json": "021_svg_full.json",
  "___NEW___022_svg_full.json": "022_svg_full.json",
};
for (const [tmp, final] of Object.entries(newMap)) {
  const tp = path.join(SLIDES, tmp);
  const fp = path.join(SLIDES, final);
  if (fs.existsSync(tp)) { fs.renameSync(tp, fp); console.log(`  ${tmp} → ${final}`); }
}

console.log("\nFinal slide files:");
fs.readdirSync(SLIDES).filter(f=>f.endsWith(".json")).sort().forEach(f => console.log("  " + f));
