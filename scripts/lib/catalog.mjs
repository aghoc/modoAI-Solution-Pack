export const GOALS = [
  {
    id: "business-plan",
    label: "사업계획서/멘토링 보고서",
    file: "goal-business-plan.md",
    description: "사업계획서, 멘토링 보고서, 지원사업 제출자료를 고도화하려는 참가자를 위한 솔루션팩",
    keywords: ["사업계획서", "사업계획", "멘토링", "보고서", "사업전략", "비즈니스모델", "BM", "딥리서치"]
  },
  {
    id: "market-research",
    label: "시장조사/고객검증",
    file: "goal-market-research.md",
    description: "고객 인터뷰, 설문, 수요조사, 시장성 검증 자료를 만들기 위한 솔루션팩",
    keywords: ["시장", "고객", "수요", "리서치", "설문", "인터뷰", "검증", "패널", "MVP테스트", "시장조사"]
  },
  {
    id: "mvp-landing",
    label: "MVP/랜딩페이지",
    file: "goal-mvp-landing.md",
    description: "랜딩페이지, 웹/앱 MVP, 노코드 프로토타입, 데이터 구조를 만들기 위한 솔루션팩",
    keywords: ["MVP", "랜딩", "홈페이지", "웹", "앱", "노코드", "로우코드", "DB", "솔루션 설계", "프로토타입"]
  },
  {
    id: "branding",
    label: "브랜딩/마케팅",
    file: "goal-branding.md",
    description: "브랜드 정체성, 로고, SNS, 광고, 상세페이지 등 시장에 보여줄 결과물을 만들기 위한 솔루션팩",
    keywords: ["브랜드", "브랜딩", "로고", "명함", "디자인", "SNS", "상세페이지", "마케팅", "광고", "콘텐츠"]
  },
  {
    id: "ir-pitchdeck",
    label: "IR/피칭덱",
    file: "goal-ir-pitchdeck.md",
    description: "IR 자료, 발표자료, 피칭덱, PPT를 준비하기 위한 솔루션팩",
    keywords: ["IR", "피칭", "피치", "PPT", "발표", "덱", "투자", "사업소개서"]
  },
  {
    id: "patent-ip",
    label: "특허/IP/기술조사",
    file: "goal-patent-ip.md",
    description: "선행특허, 명세서, 도면, 연구동향, 기술사업화 자료를 준비하기 위한 솔루션팩",
    keywords: ["특허", "IP", "KIPRIS", "KRPRIS", "명세서", "선행", "도면", "기술조사", "연구동향", "기술사업화"]
  },
  {
    id: "video-content",
    label: "영상/콘텐츠",
    file: "goal-video-content.md",
    description: "IR 영상, 기업소개 영상, 숏폼, 광고 영상, 이미지 콘텐츠를 만들기 위한 솔루션팩",
    keywords: ["영상", "숏폼", "이미지 생성", "음성", "광고영상", "기업소개영상", "IR영상", "카드뉴스"]
  },
  {
    id: "not-sure",
    label: "아직 모르겠음",
    file: "goal-not-sure.md",
    description: "무엇을 골라야 할지 모르는 참가자를 위한 전체 요약 중심 솔루션팩",
    keywords: []
  }
];

export const CATEGORY_FILES = new Map([
  ["기획조사", "category-planning-research.md"],
  ["마케팅/콘텐츠", "category-marketing-content.md"],
  ["경영/백오피스", "category-management-backoffice.md"],
  ["DB/솔루션 설계", "category-db-solution-design.md"],
  ["생산성", "category-productivity.md"],
  ["기술 개발", "category-tech-development.md"],
  ["기타", "category-etc.md"]
]);

export const OUTPUT_RULES = [
  { label: "사업계획서", keywords: ["사업계획서", "계획서", "지원서"] },
  { label: "멘토링 보고서", keywords: ["멘토링", "보고서"] },
  { label: "시장조사 리포트", keywords: ["시장조사", "시장", "리서치", "수요조사"] },
  { label: "고객검증 자료", keywords: ["고객", "설문", "인터뷰", "검증", "패널"] },
  { label: "랜딩페이지", keywords: ["랜딩", "홈페이지", "상세페이지"] },
  { label: "MVP/프로토타입", keywords: ["MVP", "프로토타입", "노코드", "웹", "앱"] },
  { label: "브랜드 자산", keywords: ["브랜드", "브랜딩", "로고", "명함", "디자인"] },
  { label: "마케팅 콘텐츠", keywords: ["SNS", "마케팅", "광고", "콘텐츠", "카드뉴스"] },
  { label: "IR/PPT", keywords: ["IR", "PPT", "피칭", "피치", "발표", "덱"] },
  { label: "특허/IP 자료", keywords: ["특허", "IP", "명세서", "도면", "선행"] },
  { label: "영상 콘텐츠", keywords: ["영상", "숏폼", "광고영상", "기업소개영상", "IR영상"] }
];
