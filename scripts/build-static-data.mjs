import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { CATEGORY_FILES, GOALS } from "./lib/catalog.mjs";
import { buildDetailMarkdownSnippet, buildPackMarkdown } from "./lib/markdown.mjs";
import { categoryFileName, csvEscape, normalizeSolution, sortSolutions } from "./lib/text.mjs";

const args = parseArgs(process.argv.slice(2));
const inputPath = args.input ?? "data/raw/solutions.json";
const outputRoot = args.output ?? "public";
const dataDir = path.join(outputRoot, "data");
const detailsDir = path.join(dataDir, "details");
const packsDir = path.join(outputRoot, "packs");

const rawPayload = JSON.parse(await readInput(inputPath, Boolean(args.input)));
const generatedAt = new Date().toISOString();
const sourceUrl = rawPayload.source?.url ?? "https://www.modoo.or.kr/ai-solution/list";
const solutions = sortSolutions((rawPayload.solutions ?? []).map(normalizeSolution));

await rm(detailsDir, { recursive: true, force: true });
await rm(packsDir, { recursive: true, force: true });
await mkdir(detailsDir, { recursive: true });
await mkdir(packsDir, { recursive: true });

await writeJson(path.join(dataDir, "index.min.json"), {
  generatedAt,
  source: rawPayload.source ?? { name: "모두의창업 AI 솔루션", url: sourceUrl },
  count: solutions.length,
  solutions: solutions.map((solution) => ({
    id: solution.id,
    slug: solution.slug,
    name: solution.name,
    organizationName: solution.organizationName,
    category: solution.category,
    summary: solution.summary,
    priceText: solution.priceText,
    priceMonthly: solution.priceMonthly,
    goals: solution.goals,
    outputTypes: solution.outputTypes,
    keywords: solution.keywords,
    contextQuality: solution.contextQuality,
    decisionWarnings: solution.decisionWarnings,
    links: solution.links,
    officialUrl: solution.officialUrl,
    modooUrl: solution.modooUrl
  }))
});

for (const solution of solutions) {
  await writeJson(path.join(detailsDir, `${solution.id}.json`), {
    ...solution,
    markdownSnippet: buildDetailMarkdownSnippet(solution)
  });
}

await writeFile(
  path.join(packsDir, "all-summary.md"),
  buildPackMarkdown({
    title: "모두의창업 AI 솔루션 전체 요약본",
    description: "아직 어떤 솔루션을 골라야 할지 모르는 참가자를 위한 전체 요약 솔루션팩입니다.",
    generatedAt,
    sourceUrl,
    solutions
  }),
  "utf8"
);

await writeFile(path.join(packsDir, "all-summary.csv"), buildCsv(solutions), "utf8");

for (const goal of GOALS) {
  const goalSolutions = goal.id === "not-sure"
    ? solutions
    : solutions.filter((solution) => solution.goals.includes(goal.id));

  await writeFile(
    path.join(packsDir, goal.file),
    buildPackMarkdown({
      title: `모두의창업 AI 솔루션팩 - ${goal.label}`,
      description: goal.description,
      generatedAt,
      sourceUrl,
      solutions: goalSolutions
    }),
    "utf8"
  );
}

const categories = new Set([...CATEGORY_FILES.keys(), ...solutions.map((solution) => solution.category || "기타")]);
for (const category of categories) {
  const categorySolutions = solutions.filter((solution) => (solution.category || "기타") === category);
  if (categorySolutions.length === 0 && !CATEGORY_FILES.has(category)) continue;

  await writeFile(
    path.join(packsDir, categoryFileName(category)),
    buildPackMarkdown({
      title: `모두의창업 AI 솔루션팩 - ${category}`,
      description: `${category} 카테고리에 해당하는 AI 솔루션 요약본입니다.`,
      generatedAt,
      sourceUrl,
      solutions: categorySolutions
    }),
    "utf8"
  );
}

console.log(`Built ${solutions.length} solutions into ${outputRoot}`);

async function readInput(filePath, isExplicitInput) {
  try {
    return await readFile(filePath, "utf8");
  } catch (error) {
    if (error.code !== "ENOENT" || isExplicitInput) throw error;
    const fallbackPath = "data/raw/solutions.sample.json";
    console.warn(`${filePath} not found. Falling back to ${fallbackPath}.`);
    return readFile(fallbackPath, "utf8");
  }
}

function buildCsv(items) {
  const headers = [
    "id",
    "name",
    "organizationName",
    "category",
    "priceText",
    "priceMonthly",
    "summary",
    "goals",
    "outputTypes",
    "keywords",
    "contextQuality",
    "decisionWarnings",
    "links",
    "officialUrl",
    "modooUrl"
  ];

  const rows = items.map((solution) => [
    solution.id,
    solution.name,
    solution.organizationName,
    solution.category,
    solution.priceText,
    solution.priceMonthly ?? "",
    solution.summary,
    solution.goals.join("|"),
    solution.outputTypes.join("|"),
    solution.keywords.join("|"),
    solution.contextQuality,
    solution.decisionWarnings.join("|"),
    solution.links.map((link) => link.url).join("|"),
    solution.officialUrl,
    solution.modooUrl
  ]);

  return [headers, ...rows].map((row) => row.map(csvEscape).join(",")).join("\n");
}

async function writeJson(filePath, data) {
  await writeFile(filePath, `${JSON.stringify(data)}\n`, "utf8");
}

function parseArgs(argv) {
  const parsed = {};
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--input") parsed.input = argv[++index];
    if (arg === "--output") parsed.output = argv[++index];
  }
  return parsed;
}
