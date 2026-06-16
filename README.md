# 모두의창업 AI 솔루션팩 도우미

모두의창업 1기 1라운드 선정자들이 자신에게 맞는 AI 솔루션을 더 쉽게 찾을 수 있도록 만든 프로젝트입니다.

모두의창업에서 제공하는 AI 솔루션은 수가 많고, 각 솔루션의 목적과 가격, 산출물, 링크를 하나씩 열어보며 비교하기가 쉽지 않습니다. 그래서 전체 솔루션 정보를 수집해 목표별/카테고리별 Markdown 솔루션팩으로 만들고, 사용자가 본인이 쓰는 AI에 그대로 붙여넣어 추천을 받을 수 있게 구성했습니다.

## 왜 만들었나요?

처음에는 제가 직접 모두의창업 AI 솔루션 목록을 크롤링해서, 참가자들이 필요한 솔루션을 더 쉽게 찾을 수 있게 하려는 생각에서 시작했습니다.

그런데 모두의창업 오리엔테이션에 다녀와 보니 선정된 대표님들 중에는 코딩이나 컴퓨터 사용이 익숙하지 않은 분들도 생각보다 많았습니다. 그 모습을 보고 “기술을 잘 아는 사람만 쓸 수 있는 도구”가 아니라, 버튼 몇 번으로 필요한 자료를 복사하거나 다운로드해서 바로 사용할 수 있는 형태로 만들어야겠다고 생각했습니다.

또 하나 중요하게 본 부분은 아이디어 유출에 대한 불안입니다. 창업 대표님들은 자신의 사업 아이디어가 외부 서비스나 낯선 시스템에 입력되는 것을 매우 꺼려합니다. 그래서 이 프로젝트는 일부러 별도의 AI API를 붙이지 않았습니다. 사용자의 사업 아이디어를 이 프로젝트에 입력받지 않고, 대표님들이 이미 사용하던 ChatGPT, Claude, Gemini 같은 개인 AI 도구에 솔루션팩만 직접 넣어 질문할 수 있도록 설계했습니다.

즉, 이 프로젝트의 목표는 AI가 대신 판단해주는 서비스가 아니라, 대표님들이 자신의 아이디어를 안전하게 지키면서 더 좋은 질문을 할 수 있게 돕는 자료 준비 도구입니다.

## 무엇을 만드나요?

- 모두의창업 AI 솔루션 목록 수집
- 솔루션 상세 정보 정리
- 목표별 솔루션팩 생성
- 카테고리별 솔루션팩 생성
- 전체 요약본 생성
- AI에게 붙여넣기 좋은 Markdown 파일 생성
- 데이터 품질 검증

## 준비하기

이 저장소의 데이터 생성 스크립트는 Node.js와 Playwright를 사용합니다.

의존성을 설치합니다.

```bash
npm install
```

Playwright 브라우저가 필요하면 다음 명령을 실행합니다.

```bash
npx playwright install chromium
```

## 스크립트 사용법

### 1. 목록만 크롤링하기

모두의창업 AI 솔루션 목록 페이지에서 상세 페이지 링크 목록만 수집합니다.

```bash
npm run data:crawl:list
```

결과 파일:

```text
data/raw/solutions.list.json
```

### 2. 상세 정보 크롤링하기

수집된 목록을 기준으로 각 솔루션의 상세 정보를 크롤링합니다.

```bash
npm run data:crawl:details
```

결과 파일:

```text
data/raw/solutions.json
```

### 3. 정적 데이터 만들기

크롤링된 원본 데이터를 AI에게 입력하기 좋은 정적 JSON과 Markdown 팩으로 변환합니다.

```bash
npm run data:build
```

생성되는 주요 파일:

```text
public/data/index.min.json
public/data/details/*.json
public/packs/*.md
public/packs/all-summary.csv
```

### 4. 데이터 검증하기

생성된 인덱스, 상세 JSON, 솔루션팩 개수가 서로 맞는지 확인합니다.

```bash
npm run data:validate
```

정상 예시:

```text
Validated 407 solutions, 407 details, 17 packs
```

### 5. 전체 데이터 갱신하기

목록 크롤링, 상세 크롤링, 정적 데이터 생성, 검증을 한 번에 실행합니다.

```bash
npm run data:refresh
```

솔루션이 추가되거나 수정되었을 때는 이 명령을 다시 실행하면 됩니다.

### 6. 크롤링 없이 정적 데이터만 다시 만들기

원본 크롤링 데이터는 그대로 두고 Markdown 팩과 정적 JSON만 다시 생성합니다.

```bash
npm run data:all
```

## 생성되는 파일 설명

### `public/packs/*.md`

사용자가 자신의 AI에 바로 붙여넣을 수 있는 Markdown 솔루션팩입니다.

예시:

```text
public/packs/goal-business-plan.md
public/packs/goal-market-research.md
public/packs/category-marketing-content.md
public/packs/all-summary.md
```

### `public/data/index.min.json`

솔루션 목록을 빠르게 확인하기 위한 요약 인덱스입니다.

### `public/data/details/*.json`

각 솔루션별 상세 정보입니다.

### `public/packs/all-summary.csv`

전체 솔루션을 표 형태로 확인하기 위한 CSV 파일입니다.

## 데이터 품질 기준

솔루션 데이터에는 `contextQuality` 값이 포함됩니다.

- `sufficient`: 기본 추천 판단 가능
- `limited`: 일부 정보가 제한적이므로 공식 링크 확인 필요
- `insufficient`: 판단 보류가 필요하며 AI가 추정하면 안 됨

생성되는 Markdown 솔루션팩에는 AI에게 다음 원칙을 지키도록 안내하는 문구가 포함됩니다.

- 제공된 정보만 근거로 판단하기
- 제공되지 않은 기능, 가격, 지원 범위, 성과를 추정하지 않기
- 정보가 부족한 솔루션은 불확실성을 명시하기
- 공식 링크 확인이 필요한 경우 분명히 말하기

## 주의사항

- 이 프로젝트는 모두의창업 공식 서비스가 아닙니다.
- 원본 정보는 모두의창업 AI 솔루션 목록을 기준으로 합니다.
- 실제 신청 전에는 반드시 모두의창업 상세 페이지와 각 솔루션의 공식 링크를 확인해야 합니다.
- 사용자의 사업 아이디어는 이 프로젝트에 입력하지 않는 것을 전제로 설계되었습니다.
