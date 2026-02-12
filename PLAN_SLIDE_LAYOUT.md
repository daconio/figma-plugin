# 슬라이드 레이아웃 개선 계획

## 현재 상태 분석

### 현재 레이아웃 문제점
- Content 프레임이 Auto Layout으로 모든 요소를 수직 나열
- 제목, 리드 메시지, 본문이 구분 없이 동일한 영역에 배치
- 일반적인 프레젠테이션 슬라이드 형태와 다름

### 현재 폰트 크기
| 요소 | 현재 크기 |
|------|-----------|
| 제목 (커버/엔딩) | 72px |
| 제목 (일반) | 54px |
| 부제목 (depth 2) | 36px |
| 본문 (paragraph) | 24px |
| 리스트 아이템 | 26px |

---

## 목표: 일반적인 프레젠테이션 슬라이드 레이아웃

### 영역 구분
```
┌─────────────────────────────────────────────────────────────────┐
│  [80px 여백]                                                      │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  HEADER 영역 (고정 위치)                                     │   │
│  │  - 제목: 좌측 상단, 큰 폰트                                   │   │
│  │  - 리드 메시지: 제목 바로 아래, 중간 폰트, 회색 계열           │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                   │
│  [40px 간격]                                                      │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  BODY 영역                                                   │   │
│  │  - 리스트, 추가 paragraph 등                                 │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                   │
│  [하단 여백: 슬라이드 번호, 로고]                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 새로운 폰트 크기
| 요소 | 새 크기 | 스타일 | 색상 |
|------|---------|--------|------|
| 제목 (커버/엔딩) | 56px | ExtraBold | 포인트 컬러 (#3C7CDE) |
| 제목 (일반) | 44px | ExtraBold | 포인트 컬러 (#3C7CDE) |
| 리드 메시지 | 22px | Medium | 진한 회색 (#4A4A4A) |
| 본문 (paragraph) | 20px | Medium | 본문 회색 (#333333) |
| 리스트 아이템 | 22px | Medium | 본문 회색 (#333333) |
| 부제목 (depth 2) | 28px | Bold | 포인트 컬러 |

### 위치 설정
| 영역 | X | Y | Width |
|------|---|---|-------|
| Header 시작 | 80 | 80 | 1760 (1920-160) |
| Body 시작 | 80 | Header 높이 + 160 | 1760 |
| 슬라이드 번호 | 1760 | 1020 | - |
| 로고 | 60 | 1020 | - |

---

## 수정 파일: `figma-plugin/code.js`

### 1. 슬라이드 레이아웃 상수 추가

```javascript
// ─── Slide Layout Constants ───────────────────────────────────
const LAYOUT = {
    padding: {
        left: 80,
        right: 80,
        top: 80,
        bottom: 60
    },
    header: {
        titleSize: 44,
        titleSizeCover: 56,
        leadSize: 22,
        spacing: 16  // 제목과 리드 메시지 사이 간격
    },
    body: {
        topOffset: 200,  // 상단에서 Body 영역 시작 위치
        paragraphSize: 20,
        listItemSize: 22,
        spacing: 16
    },
    colors: {
        lead: { r: 0.29, g: 0.29, b: 0.29 }  // #4A4A4A
    }
};
```

### 2. processTokens() 함수 리팩토링

**변경 사항:**
- 첫 번째 `heading (depth 1)`을 Header 제목으로 처리
- 첫 번째 `paragraph`를 리드 메시지로 처리 (크기 22px, 회색)
- 나머지 요소는 Body 영역에 배치

```javascript
function processTokens(tokens, headerFrame, bodyFrame, idx, total) {
    var isCover = (idx === 0);
    var isEnding = (idx === total - 1);
    var colors = getColors();

    var isFirstHeading = true;
    var isFirstParagraph = true;

    for (var i = 0; i < tokens.length; i++) {
        var tk = tokens[i];

        if (tk.type === "heading" && tk.depth === 1) {
            // 제목 → Header 영역
            var fs = isCover || isEnding ? 56 : 44;
            createRichText(tk.text || "", fs, true, colors.accent2, headerFrame);
            isFirstHeading = false;

        } else if (tk.type === "paragraph" && isFirstParagraph) {
            // 첫 번째 paragraph → 리드 메시지 (Header 영역)
            var leadColor = { r: 0.29, g: 0.29, b: 0.29 };
            createRichText(tk.text || "", 22, false, leadColor, headerFrame);
            isFirstParagraph = false;

        } else if (tk.type === "heading" && tk.depth === 2) {
            // 부제목 → Body 영역
            createRichText(tk.text || "", 28, true, colors.subtitle, bodyFrame);

        } else if (tk.type === "paragraph") {
            // 추가 본문 → Body 영역
            createRichText(tk.text || "", 20, false, colors.bodyText, bodyFrame);

        } else if (tk.type === "list") {
            // 리스트 → Body 영역 (리스트 아이템 크기 22px)
            // ... 기존 리스트 처리 코드 (fontSize: 22로 변경)
        }
    }
}
```

### 3. buildSlideFrame() 함수 수정

**변경 사항:**
- Content 영역을 Header와 Body로 분리
- 커버/엔딩 페이지는 기존 중앙 정렬 유지

```javascript
function buildSlideFrame(slideData, index, total) {
    var isCover = (index === 0);
    var isEnding = (index === total - 1);

    // ... 배경 및 장식 코드 유지 ...

    if (isCover || isEnding) {
        // 커버/엔딩: 기존 중앙 정렬 유지
        var content = figma.createFrame();
        content.name = "Content";
        // ... 기존 중앙 정렬 코드 ...
        processTokensCentered(slideData.tokens, content, index, total);
    } else {
        // 일반 슬라이드: Header + Body 분리

        // Header 영역 (제목 + 리드 메시지)
        var header = figma.createFrame();
        header.name = "Header";
        header.x = 80;
        header.y = 80;
        header.resize(1760, 120);
        header.layoutMode = "VERTICAL";
        header.itemSpacing = 16;
        header.fills = [];

        // Body 영역 (본문 내용)
        var body = figma.createFrame();
        body.name = "Body";
        body.x = 80;
        body.y = 200;
        body.resize(1760, 780);
        body.layoutMode = "VERTICAL";
        body.itemSpacing = 16;
        body.fills = [];

        processTokens(slideData.tokens, header, body, index, total);

        bg.appendChild(header);
        bg.appendChild(body);
    }

    addSlideNumber(bg, index, total);
    addLogo(bg);

    return bg;
}
```

### 4. 테마 색상 업데이트 (clean-white)

```javascript
'clean-white': {
    // ... 기존 설정 ...
    colors: {
        // ... 기존 색상 ...
        leadText: { r: 0.29, g: 0.29, b: 0.29 },  // 리드 메시지 색상 추가
    }
}
```

---

## 수정 파일: `CLAUDE.md`

### Token → Figma Mapping 테이블 업데이트

| Markdown Token | Figma Creation | Style | Size |
|---|---|---|---|
| `heading (depth:1)` - 커버/엔딩 | Header 프레임 내 TextNode | ExtraBold, 포인트 컬러 | 56px |
| `heading (depth:1)` - 일반 | Header 프레임 내 TextNode | ExtraBold, 포인트 컬러 | 44px |
| `paragraph` (첫 번째) | Header 프레임 내 TextNode (리드 메시지) | Medium, 진한 회색 | 22px |
| `heading (depth:2)` | Body 프레임 내 TextNode | Bold, 포인트 컬러 | 28px |
| `paragraph` (추가) | Body 프레임 내 TextNode | Medium, 본문 회색 | 20px |
| `list` | Body 프레임 내 Frame (Auto Layout) | - | - |
| `list_item` | Frame + Ellipse (bullet) + TextNode | Medium, 본문 회색 | 22px |

### 슬라이드 레이아웃 섹션 추가

```markdown
### Slide Layout Structure

일반 슬라이드는 두 영역으로 구분:
- **Header 영역** (y: 80): 제목 + 리드 메시지
- **Body 영역** (y: 200): 본문 내용, 리스트

커버/엔딩 슬라이드:
- 중앙 정렬 레이아웃 유지
```

---

## 구현 순서

1. **LAYOUT 상수 추가** - 레이아웃 수치를 상수로 정의
2. **processTokens 분리** - Header/Body 영역 구분 로직
3. **buildSlideFrame 수정** - 두 영역 프레임 생성
4. **폰트 크기 조정** - 새 크기 적용
5. **테마 색상 추가** - leadText 색상
6. **CLAUDE.md 업데이트** - 문서화

---

## 검증 방법

1. Figma Desktop App에서 플러그인 실행
2. 테스트 마크다운으로 슬라이드 생성
3. 확인 항목:
   - 제목이 상단 좌측에 위치하는지 (y: 80)
   - 리드 메시지가 제목 바로 아래에 위치하는지
   - 본문/리스트가 Body 영역에 위치하는지 (y: 200)
   - 폰트 크기가 적절한지
   - 커버/엔딩 페이지는 중앙 정렬인지
