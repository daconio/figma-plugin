# ARD.md - Architecture Reference Document

## 프로젝트: DAKER Slide Automation
> Markdown 콘텐츠를 Figma 프레젠테이션 슬라이드로 자동 변환하는 파이프라인

---

## 1. 아키텍처 다이어그램

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  Markdown File  │────▶│  Node.js Server  │────▶│  Figma Plugin   │
│  (.md)          │     │  (port 9876)     │     │  (Desktop App)  │
└─────────────────┘     └──────────────────┘     └─────────────────┘
       │                        │                        │
   ① 작성             ② 파싱 & 서빙              ③ 네이티브 렌더링
   (수동)               (자동)                     (자동)
```

## 2. 데이터 흐름

### Phase 1: 콘텐츠 준비
- 사용자가 `daker_presentation_content.md` 작성
- `---` 구분자로 슬라이드 분리

### Phase 2: 서버 처리
```
Markdown → marked.lexer() → AST (JSON) → HTTP Response
```
- `md-to-slides.js`의 `parseMarkdownToJSON()` 함수가 AST 생성
- `server.js`의 `/api/data` 엔드포인트가 JSON 서빙

### Phase 3: Figma 렌더링
```
JSON AST → Figma API → Native Nodes (Frame, Text, Rectangle)
```
- `code.js`의 `processTokens()` 함수가 토큰별 매핑:

| Markdown Token | Figma Node | Style |
|---|---|---|
| `heading (depth:1)` | `TextNode` | 64px, Bold, Purple |
| `heading (depth:2)` | `TextNode` | 40px, Bold, White |
| `paragraph` | `TextNode` | 24px, Regular, Gray |
| `list` | `Frame (Auto Layout)` + `TextNode` per item | 24px, Bullet prefix |

## 3. 진행 기록

### 2026-02-11

#### Phase 1: 기존 파이프라인 분석 및 검증
- [x] `md-to-svg/` 코드 분석 완료
- [x] `figma-plugin/` 코드 분석 완료
- [x] `npm install` 의존성 설치
- [x] `npm run convert` 실행 → 12개 SVG 생성 확인
- [x] `node server.js` 실행 → `localhost:9876` 서버 정상 동작 확인
- [x] `curl /api/slides` → 12개 SVG 파일 목록 반환 확인

#### Phase 2: 편집 가능한 슬라이드로 리팩토링
- **문제 발견**: 기존 방식은 Puppeteer로 HTML 스크린샷(PNG)을 찍어 SVG에 임베딩 → Figma에서 텍스트 수정 불가
- **해결 방안**: Markdown AST를 직접 Figma 네이티브 노드로 렌더링

**백엔드 변경:**
- [x] `md-to-slides.js`에 `parseMarkdownToJSON()` 함수 추가
- [x] `server.js`에 `parseMarkdownToJSON` import 추가
- [x] `server.js`에 `/api/data` 엔드포인트 추가
- [x] `/api/data` 응답 검증 완료 (12개 슬라이드 AST 반환)

**프론트엔드 변경:**
- [x] `ui.html`: SVG 다운로드 → JSON AST fetch로 변경
- [x] `code.js`: `figma.createNodeFromSvg()` → 네이티브 노드 렌더링으로 전면 교체
  - `figma.createFrame()` (슬라이드 배경, 1920x1080)
  - `figma.createText()` (제목, 본문, 리스트)
  - Auto Layout 적용
  - Inter 폰트 로드

#### 미해결 / 향후 과제
- [ ] Figma Desktop App에서 실제 플러그인 테스트
- [ ] 한글 폰트 (Noto Sans KR) 지원 추가
- [ ] 그라데이션 배경 구현 (현재 단색)
- [ ] 슬라이드 번호/로고 요소 추가
- [ ] Bold 텍스트 인라인 스타일링 (현재 plain text)

## 4. 기술 스택 상세

| 구분 | 기술 | 버전 |
|---|---|---|
| Runtime | Node.js | - |
| MD Parser | marked | ^15.0.0 |
| Headless Browser | Puppeteer | ^24.0.0 (레거시용) |
| Plugin API | Figma Plugin API | Latest |
| Server | Node.js http module | Built-in |

## 5. 파일별 역할

| 파일 | 역할 | 상태 |
|---|---|---|
| `convert.js` | CLI: MD → SVG 변환 실행 | ✅ 동작 (레거시) |
| `md-to-slides.js` | MD 파싱 (HTML + JSON AST) | ✅ 리팩토링 완료 |
| `html-to-svg.js` | Puppeteer HTML → PNG → SVG 렌더링 | ⚠️ 레거시 (편집 불가) |
| `server.js` | HTTP 서버 (`/api/data`, `/api/slides`) | ✅ 리팩토링 완료 |
| `code.js` | Figma Plugin: AST → 네이티브 노드 렌더링 | ✅ 리팩토링 완료 |
| `ui.html` | Figma Plugin UI: 서버 연동 & 진행률 표시 | ✅ 리팩토링 완료 |
