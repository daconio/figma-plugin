# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**DAKER Slide Automation** — Markdown → Figma 슬라이드 자동 생성 파이프라인

## Commands

```bash
# Install dependencies (from md-to-svg directory)
cd md-to-svg && npm install

# Generate SVG files (legacy raster-based approach)
npm run convert

# Start development server (port 9876)
node server.js

# Test API endpoints
curl http://localhost:9876/api/data    # Current: JSON AST
curl http://localhost:9876/api/slides  # Legacy: SVG file list
```

## Architecture

The pipeline has three stages:

```
Markdown File  →  Node.js Server (port 9876)  →  Figma Plugin
    (.md)           (parse & serve JSON)         (render native nodes)
```

### Data Flow

1. **Source**: `daker_presentation_content.md` at project root, slides separated by `---`
2. **Backend** (`md-to-svg/`):
   - `md-to-slides.js`: `parseMarkdownToJSON(md)` uses `marked.lexer()` to produce AST tokens
   - `server.js`: `/api/data` endpoint serves `{ slides: [...], total: N }`
3. **Plugin** (`figma-plugin/`):
   - `ui.html`: Fetches JSON from server OR parses pasted markdown directly (uses marked.js via CDN)
   - `code.js`: Converts AST tokens to Figma native nodes via `processTokens()`

### Slide Layout Structure

```
┌─────────────────────────────────────────────────────────────────┐
│                                                     1920×1080   │
│  x:80, y:80                                                     │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  HEADER 영역 (height: auto)                               │   │
│  │  • 제목: 44px ExtraBold, 포인트 컬러                       │   │
│  │  • 리드 메시지: 20px Medium, 진한 회색 (#4A4A4A)           │   │
│  │  • 간격: 12px                                             │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                   │
│  x:80, y:200 (고정)                                              │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  BODY 영역                                                 │   │
│  │  • 리스트 아이템: 20px                                     │   │
│  │  • 추가 paragraph: 18px                                    │   │
│  │  • 간격: 14px                                              │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                   │
│  DAKER.ai                                        01 / 12        │
└─────────────────────────────────────────────────────────────────┘
```

- **커버/엔딩 슬라이드**: 중앙 정렬, 제목 52px
- **일반 슬라이드**: Header + Body 분리, 좌측 상단 정렬

### Token → Figma Mapping (code.js)

| Markdown Token | Figma Creation | Style |
|---|---|---|
| `heading (depth:1)` | Header 영역 `figma.createText()` | 44px (커버/엔딩: 52px), ExtraBold, accent2 color |
| `heading (depth:2)` | Body 영역 `figma.createText()` | 28px, Bold, subtitle color |
| `paragraph` (첫번째) | Header 영역 `figma.createText()` | 20px, Medium, leadText color (#4A4A4A) |
| `paragraph` (이후) | Body 영역 `figma.createText()` | 18px, Medium, bodyText color |
| `list` | Body 영역 `figma.createFrame()` with Auto Layout | vertical, itemSpacing: 14px |
| `list_item` | Frame with Ellipse (bullet) + TextNode | 8px circle + 20px text |

### Key Functions

- `md-to-slides.js:parseMarkdownToJSON()` — Splits markdown by `\n---\n`, returns slides with tokens
- `code.js:buildSlideFrame()` — Creates 1920×1080 frame with Header/Body 분리 레이아웃
- `code.js:processTokens()` — 토큰을 Header/Body 영역에 분배하여 변환
- `code.js:buildList()` — 리스트 프레임 생성 (20px 텍스트, 14px 간격)
- `code.js:createRichText()` — Handles inline bold styling via `setRangeFontName()`

## Design Decisions

- **Native nodes over raster**: Plugin uses `figma.createText()`/`figma.createFrame()` for editable slides (not embedded PNG)
- **Dual API endpoints**: `/api/data` (active, JSON AST) and `/api/slides` (legacy, SVG list) both maintained
- **Fonts**: Inter (fallback) + Noto Sans KR; loaded via `figma.loadFontAsync()`
- **Slide dimensions**: 1920×1080 (16:9)
- **Plugin UI tabs**: Direct paste mode OR server fetch mode

## Constraints

- Figma Plugin requires **Figma Desktop App** (not browser version)
- Server port `9876` is hardcoded in `server.js` and `ui.html`
- Chrome path hardcoded for Puppeteer: `/Applications/Google Chrome.app/Contents/MacOS/Google Chrome` (macOS)
- `manifest.json` network access restricted to `localhost:9876` and `cdn.jsdelivr.net`

## Development Workflow (필수)

**⚠️ 모든 개발 작업 완료 후 반드시 아래 단계를 수행할 것:**

### 1. CLAUDE.md 업데이트
변경된 내용이 있으면 이 파일의 관련 섹션을 업데이트

### 2. Git Commit & Push
```bash
# 변경 사항 확인
git status
git diff

# 스테이징 및 커밋
git add -A
git commit -m "feat: 변경 내용 요약

- 상세 변경 사항 1
- 상세 변경 사항 2

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"

# 원격 저장소에 푸시
git push origin main
```

### 체크리스트
- [ ] 코드 변경 완료
- [ ] CLAUDE.md 업데이트 (아키텍처, 함수, 상수 등 변경 시)
- [ ] git commit 완료
- [ ] git push 완료
