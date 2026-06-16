import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const args = parseArgs(process.argv.slice(2));
const outputPath = args.output ?? "data/raw/solutions.json";
const listUrl = args.url ?? "https://www.modoo.or.kr/ai-solution/list";
const maxPages = Number(args.pages ?? 100);
const limit = Number(args.limit ?? 0);
const headless = args.headful ? false : true;

let chromium;
try {
  ({ chromium } = await import("playwright"));
} catch {
  console.error("Playwright is required for crawling. Install it with: npm install -D playwright && npx playwright install chromium");
  process.exit(1);
}

const browser = await chromium.launch({ headless });
const page = await browser.newPage({
  locale: "ko-KR",
  userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36"
});

const listItems = new Map();

try {
  if (args.inputList) {
    const listPayload = JSON.parse(await readFile(args.inputList, "utf8"));
    for (const item of listPayload.solutions ?? []) {
      if (!listItems.has(item.id)) listItems.set(item.id, item);
    }
    console.log(`Loaded ${listItems.size} solution links from ${args.inputList}`);
  } else {
    await page.goto(listUrl, { waitUntil: "domcontentloaded", timeout: 60000 });
    await page.waitForTimeout(Number(args.initialWait ?? 20000));

    for (let pageNumber = 1; pageNumber <= maxPages; pageNumber += 1) {
      const links = await extractListLinks(page);
      for (const item of links) {
        if (!listItems.has(item.id)) listItems.set(item.id, item);
      }

      console.log(`List page ${pageNumber}: collected ${listItems.size} unique solution links`);

      if (limit > 0 && listItems.size >= limit) break;
      const clicked = await clickPagination(page, pageNumber + 1);
      if (!clicked) break;
      await page.waitForTimeout(Number(args.pageWait ?? 5000));
    }
  }

  const items = [...listItems.values()].slice(0, limit > 0 ? limit : undefined);

  const shouldCrawlDetails = !args.listOnly;

  if (!shouldCrawlDetails) {
    const payload = {
      source: {
        name: "모두의창업 AI 솔루션 리스트",
        url: listUrl
      },
      generatedAt: new Date().toISOString(),
      solutions: items
    };

    await mkdir(path.dirname(outputPath), { recursive: true });
    await writeFile(outputPath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
    console.log(`Wrote ${items.length} list items to ${outputPath}`);
  } else {
    const solutions = [];

    for (let index = 0; index < items.length; index += 1) {
      const item = items[index];
      console.log(`Detail ${index + 1}/${items.length}: ${item.name}`);

      const detail = await crawlDetail(page, item).catch((error) => ({
        ...item,
        crawlError: error.message
      }));

      solutions.push(detail);
    }

    const payload = {
      source: {
        name: "모두의창업 AI 솔루션 리스트",
        url: listUrl
      },
      generatedAt: new Date().toISOString(),
      solutions
    };

    await mkdir(path.dirname(outputPath), { recursive: true });
    await writeFile(outputPath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
    console.log(`Wrote ${solutions.length} solutions to ${outputPath}`);
  }
} finally {
  await browser.close();
}

async function extractListLinks(page) {
  return page.locator("a").evaluateAll((anchors) => {
    const categoryHints = ["기획조사", "마케팅/콘텐츠", "경영/백오피스", "DB/솔루션 설계", "기술 개발", "생산성"];

    return anchors
      .map((anchor) => {
        const href = anchor.href;
        const text = anchor.innerText || "";
        if (!href.includes("/ai-solution/organization/")) return null;
        if (href.endsWith("/ai-solution/organization/list")) return null;

        const organizationId = href.match(/organization\/(\d+)/)?.[1];
        const solutionTab = (() => {
          try {
            return new URL(href).searchParams.get("solutionTab") || "";
          } catch {
            return "";
          }
        })();
        const slugSource = solutionTab || lines[0] || "";
        const solutionSlug = slugSource
          .toLowerCase()
          .normalize("NFKD")
          .replace(/[^\w가-힣]+/g, "-")
          .replace(/^-+|-+$/g, "")
          .slice(0, 80);
        let hash = 0;
        for (let index = 0; index < href.length; index += 1) {
          hash = (Math.imul(31, hash) + href.charCodeAt(index)) | 0;
        }
        const hrefHash = Math.abs(hash).toString(36);
        const id = `${organizationId}-${solutionSlug || "solution"}-${hrefHash}`;
        const lines = text.split("\n").map((line) => line.trim()).filter(Boolean);
        const category = lines.find((line) => categoryHints.includes(line)) || "";
        const categoryIndex = category ? lines.indexOf(category) : -1;
        const keywords = categoryIndex >= 0 ? lines.slice(categoryIndex + 1).filter((line) => !line.startsWith("+")) : [];

        return {
          id,
          organizationId,
          name: lines[0] || "",
          summary: lines[1] || "",
          category,
          keywords,
          modooUrl: href,
          sourceUrl: href
        };
      })
      .filter((item) => item && item.organizationId && item.id && item.name);
  });
}

async function clickPagination(page, targetPage) {
  const targetButton = page
    .locator("button")
    .filter({ hasText: new RegExp(`^${targetPage}$`) });

  if ((await targetButton.count()) > 0) {
    await targetButton.first().click({ timeout: 5000 }).catch(() => null);
    return true;
  }

  return page.evaluate(() => {
    const buttons = [...document.querySelectorAll("button")];
    const nextButton = buttons.find((button) => button.querySelector(".lucide-chevron-right"));
    if (!nextButton || nextButton.disabled || nextButton.getAttribute("aria-disabled") === "true") {
      return false;
    }
    nextButton.click();
    return true;
  });
}

async function crawlDetail(page, listItem) {
  await page.goto(listItem.modooUrl, { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.waitForTimeout(Number(args.detailWait ?? 8000));

  const bodyText = await page.locator("body").innerText();
  if (bodyText.includes("업체 정보를 찾을 수 없습니다")) {
    return listItem;
  }

  const detail = parseDetailText(bodyText);
  const links = await extractDetailLinks(page, bodyText);

  return {
    ...listItem,
    ...detail,
    id: listItem.id,
    name: listItem.name || detail.name,
    summary: detail.summary || listItem.summary,
    category: detail.category || listItem.category || "기타",
    keywords: detail.keywords.length > 0 ? detail.keywords : listItem.keywords,
    links,
    modooUrl: listItem.modooUrl,
    sourceUrl: listItem.modooUrl,
    sourceCapturedAt: new Date().toISOString()
  };
}

async function extractDetailLinks(page, bodyText) {
  const anchorLinks = await page.locator("a").evaluateAll((anchors) => anchors
    .map((anchor) => ({
      label: (anchor.innerText || anchor.getAttribute("aria-label") || "").trim(),
      url: anchor.href
    }))
    .filter((link) => link.url && !link.url.startsWith("javascript:")));

  const textUrls = [...String(bodyText).matchAll(/https?:\/\/[^\s)\]}>\"'，。]+/g)]
    .map((match) => ({ label: "", url: match[0] }));

  const seen = new Set();
  return [...anchorLinks, ...textUrls]
    .map((link) => ({
      label: link.label.replace(/\s+/g, " ").slice(0, 120),
      url: link.url
    }))
    .filter((link) => {
      if (!/^https?:\/\//.test(link.url)) return false;
      if (link.url.includes("modoo.or.kr/intro")) return false;
      if (link.url.includes("modoo.or.kr/auth/")) return false;
      if (link.url.includes("modoo.or.kr/terms")) return false;
      if (link.url === "https://www.modoo.or.kr/ai-solution") return false;
      if (link.url.includes("modoo.or.kr/ai-solution/list?keyword=")) return false;
      if (link.url.includes("instagram.com/modoo_startup")) return false;
      if (link.url.includes("facebook.com/modoostartupofficial")) return false;
      if (link.url.includes("youtube.com/@modoo_startup_official")) return false;
      if (link.url.includes("tiktok.com/@modoo_startup")) return false;
      if (link.url.includes("mss.go.kr")) return false;
      if (link.url.includes("kised.or.kr")) return false;
      if (link.url.includes("semas.or.kr")) return false;
      if (link.url.includes("/ai-solution/organization/")) return false;
      if (link.url.includes("/notice/")) return false;
      if (link.url === "https://www.modoo.or.kr/") return false;
      const key = normalizeUrlKey(link.url);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

function normalizeUrlKey(url) {
  try {
    const parsed = new URL(url);
    parsed.hash = "";
    let normalized = parsed.toString();
    normalized = normalized.replace(/^http:\/\//, "https://");
    normalized = normalized.replace(/\/$/, "");
    return normalized;
  } catch {
    return url.replace(/^http:\/\//, "https://").replace(/\/$/, "");
  }
}

function parseDetailText(text) {
  const lines = text.split("\n").map((line) => line.trim()).filter(Boolean);
  const categoryHints = ["기획조사", "마케팅/콘텐츠", "경영/백오피스", "DB/솔루션 설계", "기술 개발", "생산성"];

  const name = lineAfterSequence(lines, ["회사 소개", "AI 솔루션"]) || "";
  const summary = valueAfterLabel(lines, "한 줄 설명");
  const usageAndPrice = valueAfterLabel(lines, "사용 방식 / 월 사용료");
  const usageParts = usageAndPrice.split("·").map((part) => part.trim()).filter(Boolean);
  const priceText = usageParts.find((part) => part.includes("원")) || usageAndPrice;
  const usageType = usageParts.filter((part) => !part.includes("원")).join(" · ");
  const keywords = sectionAfterLabel(lines, "키워드", ["사용 방식 / 월 사용료"]).map((line) => line.replace(/^#/, ""));
  const freeOffer = sectionAfterLabel(lines, "무료 서비스 설명", [
    "솔루션 자세히 보기",
    "가격 정보",
    "■ 가격 정보",
    "공지사항"
  ]).join(" ");
  const category = lines.find((line) => categoryHints.includes(line)) || "";
  const officialUrl = sectionAfterLabel(lines, "솔루션 자세히 보기", ["공지사항"])
    .find((line) => /^https?:\/\//.test(line)) || lines.find((line) => /^https?:\/\/[^\s]+$/.test(line)) || "";

  return {
    name,
    category,
    summary,
    keywords,
    usageType,
    priceText,
    freeOffer,
    officialUrl
  };
}

function valueAfterLabel(lines, label) {
  const section = sectionAfterLabel(lines, label, []);
  return section[0] || "";
}

function sectionAfterLabel(lines, startLabel, endLabels) {
  const start = lines.findIndex((line) => line === startLabel || line.startsWith(startLabel));
  if (start < 0) return [];

  const section = [];
  for (let index = start + 1; index < lines.length; index += 1) {
    const line = lines[index];
    if (line === "ㅣ") continue;
    if (endLabels.some((label) => line === label || line.startsWith(label))) break;
    section.push(line);
  }
  return section;
}

function lineAfterSequence(lines, sequence) {
  for (let index = 0; index < lines.length - sequence.length; index += 1) {
    const matches = sequence.every((part, offset) => lines[index + offset] === part);
    if (matches) return lines[index + sequence.length] || "";
  }
  return "";
}

function parseArgs(argv) {
  const parsed = {};
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--headful") parsed.headful = true;
    else if (arg === "--listOnly") parsed.listOnly = true;
    else if (arg.startsWith("--")) parsed[arg.slice(2)] = argv[index + 1];
  }
  return parsed;
}
