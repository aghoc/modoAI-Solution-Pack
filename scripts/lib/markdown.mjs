import { GOALS } from "./catalog.mjs";

const goalLabelById = new Map(GOALS.map((goal) => [goal.id, goal.label]));

export function buildPackMarkdown({ title, description, generatedAt, sourceUrl, solutions }) {
  const lines = [
    `# ${title}`,
    "",
    description,
    "",
    `- 생성일: ${generatedAt}`,
    sourceUrl ? `- 원본 출처: ${sourceUrl}` : null,
    "- 안내: 이 파일에는 참가자의 사업 아이디어가 포함되어 있지 않습니다.",
    "",
    "## AI에게 이렇게 요청하세요",
    "",
    "```text",
    "나는 모두의창업 1기 1라운드 진출자야.",
    "아래는 내가 선택 가능한 AI 솔루션 후보 목록이야.",
    "반드시 아래 제공된 정보만 근거로 판단해줘.",
    "제공되지 않은 기능, 가격, 지원 범위, 성과를 추정하거나 지어내지 마.",
    "정보충실도가 limited 또는 insufficient인 솔루션은 불확실성을 명시하고, 공식 링크 확인이 필요하다고 말해줘.",
    "",
    "내 사업 아이디어와 현재 상황을 기준으로 다음을 추천해줘.",
    "",
    "1. 가장 적합한 솔루션 3개",
    "2. 왜 적합한지",
    "3. 7월 한 달 안에 어떤 산출물을 만들면 2라운드 평가에 유리할지",
    "4. 월 지원 한도 내에서 어떤 조합이 좋은지",
    "5. 지금 상황에서 피해야 할 솔루션 유형",
    "```",
    "",
    "## 솔루션 후보 목록",
    ""
  ].filter((line) => line !== null);

  if (solutions.length === 0) {
    lines.push("해당 조건에 맞는 솔루션이 아직 없습니다.", "");
    return lines.join("\n");
  }

  solutions.forEach((solution, index) => {
    lines.push(
      `### ${index + 1}. ${solution.name}`,
      "",
      `- 카테고리: ${solution.category || "확인 필요"}`,
      `- 월 사용료: ${solution.priceText || "확인 필요"}`,
      `- 사용 방식: ${solution.usageType || "확인 필요"}`,
      `- 한 줄 설명: ${solution.summary || "확인 필요"}`,
      `- 적합한 목적: ${solution.goals.map((goal) => goalLabelById.get(goal) ?? goal).join(", ")}`,
      `- 만들 수 있는 산출물: ${solution.outputTypes.join(", ")}`,
      `- 정보충실도: ${formatQuality(solution.contextQuality)}`,
      solution.keywords.length > 0 ? `- 키워드: ${solution.keywords.map((keyword) => `#${keyword}`).join(" ")}` : null,
      solution.freeOffer ? `- 무료/추가 혜택: ${truncateText(solution.freeOffer, 260)}` : null,
      solution.decisionWarnings.length > 0 ? `- 판단 제한: ${solution.decisionWarnings.join(" ")}` : null,
      solution.links.length > 0 ? `- 추가 링크: ${formatLinks(solution.links)}` : null,
      solution.officialUrl ? `- 솔루션 링크: ${solution.officialUrl}` : null,
      solution.modooUrl ? `- 모두의창업 상세: ${solution.modooUrl}` : null,
      ""
    );
  });

  return lines.filter((line) => line !== null).join("\n");
}

export function buildDetailMarkdownSnippet(solution) {
  return [
    `# ${solution.name}`,
    "",
    `- 업체명: ${solution.organizationName || "확인 필요"}`,
    `- 카테고리: ${solution.category || "확인 필요"}`,
    `- 월 사용료: ${solution.priceText || "확인 필요"}`,
    `- 사용 방식: ${solution.usageType || "확인 필요"}`,
    `- 한 줄 설명: ${solution.summary || "확인 필요"}`,
    `- 산출물: ${solution.outputTypes.join(", ")}`,
    `- 정보충실도: ${formatQuality(solution.contextQuality)}`,
    solution.decisionWarnings.length > 0 ? `- 판단 제한: ${solution.decisionWarnings.join(" ")}` : null,
    solution.freeOffer ? `- 무료/추가 혜택: ${solution.freeOffer}` : null,
    solution.links.length > 0 ? `- 추가 링크: ${formatLinks(solution.links)}` : null,
    solution.officialUrl ? `- 솔루션 링크: ${solution.officialUrl}` : null,
    solution.modooUrl ? `- 모두의창업 상세: ${solution.modooUrl}` : null
  ].filter(Boolean).join("\n");
}

function formatQuality(quality) {
  if (quality === "sufficient") return "sufficient - 기본 추천 판단 가능";
  if (quality === "limited") return "limited - 제한적 판단 가능, 공식 링크 확인 권장";
  return "insufficient - 근거 부족, 상위 추천 단정 금지";
}

function truncateText(text, maxLength) {
  if (!text || text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 1)}…`;
}

function formatLinks(links) {
  return links
    .slice(0, 6)
    .map((link) => link.label ? `${link.label} (${link.url})` : link.url)
    .join(", ");
}
