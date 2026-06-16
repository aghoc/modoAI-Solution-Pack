import type { ContextQuality, PackDefinition } from "../types";

export const goalPacks: PackDefinition[] = [
  {
    id: "business-plan",
    title: "사업계획서/멘토링",
    eyebrow: "Goal 01",
    description: "지원사업 제출자료, 멘토링 보고서, 사업계획서 초안을 고도화합니다.",
    fileName: "goal-business-plan.md",
    mode: "goal",
    accent: "blue",
    goalId: "business-plan"
  },
  {
    id: "market-research",
    title: "시장조사/고객검증",
    eyebrow: "Goal 02",
    description: "고객 인터뷰, 시장 분석, 리서치 자료가 필요한 팀에 맞춥니다.",
    fileName: "goal-market-research.md",
    mode: "goal",
    accent: "green",
    goalId: "market-research"
  },
  {
    id: "mvp-landing",
    title: "MVP/랜딩페이지",
    eyebrow: "Goal 03",
    description: "초기 제품, 웹사이트, 프로토타입 제작 후보를 빠르게 좁힙니다.",
    fileName: "goal-mvp-landing.md",
    mode: "goal",
    accent: "teal",
    goalId: "mvp-landing"
  },
  {
    id: "branding",
    title: "브랜딩/마케팅",
    eyebrow: "Goal 04",
    description: "브랜드 메시지, SNS, 광고 소재, 콘텐츠 제작 중심으로 확인합니다.",
    fileName: "goal-branding.md",
    mode: "goal",
    accent: "purple",
    goalId: "branding"
  },
  {
    id: "ir-pitchdeck",
    title: "IR/피칭덱",
    eyebrow: "Goal 05",
    description: "피칭 자료, 발표 스토리, 투자자용 문서 제작 후보를 모읍니다.",
    fileName: "goal-ir-pitchdeck.md",
    mode: "goal",
    accent: "amber",
    goalId: "ir-pitchdeck"
  },
  {
    id: "patent-ip",
    title: "특허/IP",
    eyebrow: "Goal 06",
    description: "특허 조사, IP 문서화, 지식재산권 검토에 가까운 솔루션입니다.",
    fileName: "goal-patent-ip.md",
    mode: "goal",
    accent: "teal",
    goalId: "patent-ip"
  },
  {
    id: "video-content",
    title: "영상/콘텐츠",
    eyebrow: "Goal 07",
    description: "홍보 영상, 숏폼, 이미지·영상 산출물을 만들 때 우선 확인합니다.",
    fileName: "goal-video-content.md",
    mode: "goal",
    accent: "green",
    goalId: "video-content"
  },
  {
    id: "not-sure",
    title: "아직 잘 모르겠음",
    eyebrow: "Goal 08",
    description: "무엇을 골라야 할지 모를 때 넓게 살펴볼 수 있는 출발점입니다.",
    fileName: "goal-not-sure.md",
    mode: "goal",
    accent: "gray",
    goalId: "not-sure"
  }
];

export const categoryPacks: PackDefinition[] = [
  {
    id: "planning-research",
    title: "기획조사",
    eyebrow: "Category",
    description: "시장, 고객, 전략, 문서 기획 성격의 솔루션을 봅니다.",
    fileName: "category-planning-research.md",
    mode: "category",
    accent: "blue",
    categoryName: "기획조사"
  },
  {
    id: "marketing-content",
    title: "마케팅/콘텐츠",
    eyebrow: "Category",
    description: "광고, SNS, 디자인, 영상, 카피라이팅 관련 후보입니다.",
    fileName: "category-marketing-content.md",
    mode: "category",
    accent: "purple",
    categoryName: "마케팅/콘텐츠"
  },
  {
    id: "management-backoffice",
    title: "경영/백오피스",
    eyebrow: "Category",
    description: "운영, 문서, 고객관리, 업무관리 솔루션을 중심으로 봅니다.",
    fileName: "category-management-backoffice.md",
    mode: "category",
    accent: "green",
    categoryName: "경영/백오피스"
  },
  {
    id: "db-solution-design",
    title: "DB/솔루션 설계",
    eyebrow: "Category",
    description: "데이터베이스, 시스템 설계, 자동화 성격의 후보입니다.",
    fileName: "category-db-solution-design.md",
    mode: "category",
    accent: "teal",
    categoryName: "DB/솔루션 설계"
  },
  {
    id: "productivity",
    title: "생산성",
    eyebrow: "Category",
    description: "업무 속도, 협업, 반복 작업 절감에 가까운 솔루션입니다.",
    fileName: "category-productivity.md",
    mode: "category",
    accent: "amber",
    categoryName: "생산성"
  },
  {
    id: "etc",
    title: "기타",
    eyebrow: "Category",
    description: "기존 카테고리로 좁히기 어려운 후보까지 함께 확인합니다.",
    fileName: "category-etc.md",
    mode: "category",
    accent: "gray",
    categoryName: "기타"
  }
];

export const allPack: PackDefinition = {
  id: "all",
  title: "전체 요약본",
  eyebrow: "Complete Pack",
  description: "407개 전체 후보를 한 번에 AI에게 전달할 때 사용합니다.",
  fileName: "all-summary.md",
  mode: "all",
  accent: "blue"
};

export const qualityLabels: Record<ContextQuality, { label: string; note: string }> = {
  sufficient: {
    label: "추천 판단 가능",
    note: "핵심 정보가 충분합니다."
  },
  limited: {
    label: "공식 확인 필요",
    note: "일부 정보가 제한적입니다."
  },
  insufficient: {
    label: "판단 보류",
    note: "AI가 추정하지 않도록 주의해야 합니다."
  }
};
