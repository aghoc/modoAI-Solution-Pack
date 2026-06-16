import { readFile, readdir } from "node:fs/promises";
import path from "node:path";

const dataRoot = "public/data";
const packsRoot = "public/packs";
const indexPath = path.join(dataRoot, "index.min.json");

const index = JSON.parse(await readFile(indexPath, "utf8"));
const failures = [];

if (!index.generatedAt) failures.push("index.min.json: generatedAt is missing");
if (!Array.isArray(index.solutions)) failures.push("index.min.json: solutions must be an array");
if (index.count !== index.solutions.length) failures.push("index.min.json: count does not match solutions.length");

const ids = new Set();
for (const solution of index.solutions ?? []) {
  for (const field of ["id", "name", "category", "summary", "priceText", "modooUrl"]) {
    if (!solution[field]) failures.push(`${solution.id ?? "unknown"}: ${field} is missing`);
  }
  if (ids.has(solution.id)) failures.push(`${solution.id}: duplicate id`);
  ids.add(solution.id);
  if (!Array.isArray(solution.goals) || solution.goals.length === 0) failures.push(`${solution.id}: goals are missing`);
  if (!Array.isArray(solution.outputTypes) || solution.outputTypes.length === 0) failures.push(`${solution.id}: outputTypes are missing`);
  if (!["sufficient", "limited", "insufficient"].includes(solution.contextQuality)) {
    failures.push(`${solution.id}: contextQuality is invalid`);
  }
  if (!Array.isArray(solution.decisionWarnings)) {
    failures.push(`${solution.id}: decisionWarnings must be an array`);
  }
}

const detailFiles = await readdir(path.join(dataRoot, "details"));
for (const id of ids) {
  if (!detailFiles.includes(`${id}.json`)) failures.push(`${id}: detail json is missing`);
}

const packFiles = await readdir(packsRoot);
for (const requiredFile of ["all-summary.md", "all-summary.csv", "goal-not-sure.md"]) {
  if (!packFiles.includes(requiredFile)) failures.push(`${requiredFile}: required pack is missing`);
}

if (failures.length > 0) {
  console.error(failures.map((failure) => `- ${failure}`).join("\n"));
  process.exit(1);
}

console.log(`Validated ${index.solutions.length} solutions, ${detailFiles.length} details, ${packFiles.length} packs`);
