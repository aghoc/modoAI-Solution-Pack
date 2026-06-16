import { CATEGORY_FILES, GOALS, OUTPUT_RULES } from "./catalog.mjs";

export function compactText(value) {
  return String(value ?? "")
    .replace(/\r/g, "")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function toArray(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value.map(String).map((item) => item.trim()).filter(Boolean);
  return String(value)
    .split(/[,\n#]+/g)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function parseMonthlyPrice(value) {
  const text = String(value ?? "");
  const match = text.replace(/,/g, "").match(/(\d{2,})\s*원/);
  return match ? Number(match[1]) : null;
}

export function slugifyId(value) {
  return String(value ?? "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w가-힣]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function categoryFileName(category) {
  return CATEGORY_FILES.get(category) ?? `category-${slugifyId(category || "etc") || "etc"}.md`;
}

export function csvEscape(value) {
  const text = String(value ?? "");
  if (/[",\n]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

export function includesAny(text, keywords) {
  const lower = text.toLowerCase();
  return keywords.some((keyword) => lower.includes(String(keyword).toLowerCase()));
}

export function inferGoals(solution) {
  const haystack = [
    solution.name,
    solution.category,
    solution.summary,
    solution.description,
    solution.usageType,
    ...(solution.keywords ?? [])
  ].join(" ");

  const matched = GOALS
    .filter((goal) => goal.id !== "not-sure" && includesAny(haystack, goal.keywords))
    .map((goal) => goal.id);

  return matched.length > 0 ? [...new Set(matched)] : ["not-sure"];
}

export function inferOutputTypes(solution) {
  const haystack = [
    solution.name,
    solution.category,
    solution.summary,
    solution.description,
    ...(solution.keywords ?? [])
  ].join(" ");

  const outputs = OUTPUT_RULES
    .filter((rule) => includesAny(haystack, rule.keywords))
    .map((rule) => rule.label);

  return outputs.length > 0 ? [...new Set(outputs)] : ["AI 솔루션 활용 결과물"];
}

export function normalizeSolution(raw, index = 0) {
  const id = String(raw.id ?? raw.solutionId ?? raw.modooId ?? slugifyId(raw.name) ?? `solution-${index + 1}`);
  const priceText = compactText(raw.priceText ?? raw.monthlyFeeText ?? raw.price ?? "");
  const summary = compactText(raw.summary ?? raw.description ?? raw.shortDescription ?? "");
  const keywords = toArray(raw.keywords);

  const normalized = {
    id,
    slug: slugifyId(`${id}-${raw.name ?? ""}`),
    name: compactText(raw.name),
    organizationName: compactText(raw.organizationName ?? raw.vendorName ?? ""),
    category: compactText(raw.category || "기타"),
    summary,
    description: compactText(raw.description ?? summary),
    keywords,
    usageType: compactText(raw.usageType ?? ""),
    priceText: priceText || "확인 필요",
    priceMonthly: raw.priceMonthly ?? parseMonthlyPrice(priceText),
    freeOffer: compactText(raw.freeOffer ?? ""),
    links: normalizeLinks(raw.links),
    officialUrl: compactText(raw.officialUrl ?? raw.homepageUrl ?? ""),
    modooUrl: compactText(raw.modooUrl ?? raw.sourceUrl ?? ""),
    sourceUrl: compactText(raw.sourceUrl ?? raw.modooUrl ?? ""),
    sourceCapturedAt: compactText(raw.sourceCapturedAt ?? "")
  };

  normalized.goals = raw.goals?.length ? [...new Set(toArray(raw.goals))] : inferGoals(normalized);
  normalized.outputTypes = raw.outputTypes?.length
    ? [...new Set(toArray(raw.outputTypes))]
    : inferOutputTypes(normalized);
  normalized.evidenceText = buildEvidenceText(normalized);
  normalized.contextQuality = assessContextQuality(normalized);
  normalized.decisionWarnings = buildDecisionWarnings(normalized);

  return normalized;
}

export function sortSolutions(solutions) {
  return [...solutions].sort((a, b) => {
    const categoryCompare = a.category.localeCompare(b.category, "ko");
    if (categoryCompare !== 0) return categoryCompare;
    return a.name.localeCompare(b.name, "ko");
  });
}

export function normalizeLinks(value) {
  if (!Array.isArray(value)) return [];
  const seen = new Set();
  return value
    .map((link) => ({
      label: compactText(link.label ?? ""),
      url: compactText(link.url ?? link.href ?? "")
    }))
    .filter((link) => {
      if (!/^https?:\/\//.test(link.url)) return false;
      if (seen.has(link.url)) return false;
      seen.add(link.url);
      return true;
    });
}

export function buildEvidenceText(solution) {
  return [
    solution.summary,
    solution.usageType ? `사용 방식: ${solution.usageType}` : "",
    solution.priceText && solution.priceText !== "확인 필요" ? `월 사용료: ${solution.priceText}` : "",
    solution.keywords?.length ? `키워드: ${solution.keywords.join(", ")}` : "",
    solution.freeOffer ? `무료/추가 혜택: ${solution.freeOffer}` : "",
    solution.links?.length ? `추가 링크: ${solution.links.map((link) => link.url).join(", ")}` : ""
  ].filter(Boolean).join(" ");
}

export function assessContextQuality(solution) {
  let score = 0;
  if (solution.summary && solution.summary.length >= 35) score += 2;
  else if (solution.summary) score += 1;
  if (solution.keywords?.length >= 5) score += 2;
  else if (solution.keywords?.length > 0) score += 1;
  if (solution.priceText && solution.priceText !== "확인 필요") score += 1;
  if (solution.usageType) score += 1;
  if (solution.freeOffer && solution.freeOffer.length >= 40) score += 1;
  if (solution.officialUrl) score += 1;

  if (score >= 6) return "sufficient";
  if (score >= 4) return "limited";
  return "insufficient";
}

export function buildDecisionWarnings(solution) {
  const warnings = [];
  if (!solution.summary || solution.summary.length < 35) {
    warnings.push("한 줄 설명이 짧아 용도 판단 근거가 부족합니다.");
  }
  if (!solution.keywords?.length) {
    warnings.push("키워드가 없어 목적 분류 신뢰도가 낮습니다.");
  }
  if (!solution.priceText || solution.priceText === "확인 필요") {
    warnings.push("월 사용료가 확인되지 않았습니다.");
  }
  if (!solution.usageType) {
    warnings.push("사용 방식이 확인되지 않았습니다.");
  }
  if (!solution.officialUrl) {
    warnings.push("공식 외부 링크가 확인되지 않았습니다.");
  }
  if (solution.contextQuality === "insufficient") {
    warnings.push("AI 추천 시 상위 후보로 단정하지 말고 공식 상세 링크 확인이 필요합니다.");
  }
  return warnings;
}
