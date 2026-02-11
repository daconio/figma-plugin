// DAKER Markdown Slide Creator - Figma Plugin Code (v5 - Best Approach)
// Creates editable Figma Slides from Markdown AST
//
// STRATEGY:
//   Figma Slides mode → figma.createSlide() (real presentation slides)
//                        + styled Frame inside (for gradient/deco/content)
//   Figma Design mode → figma.createFrame() laid out horizontally

figma.showUI(__html__, { width: 520, height: 560 });

// ─── Theme Definitions ────────────────────────────────────────
const THEMES = {
    'daker-dark': {
        name: 'DAKER Dark',
        colors: {
            bg: { r: 0.059, g: 0.047, b: 0.161 },
            bgMid: { r: 0.094, g: 0.082, b: 0.263 },
            accent1: { r: 0.506, g: 0.549, b: 0.945 },
            accent2: { r: 0.753, g: 0.522, b: 0.965 },
            accent3: { r: 0.957, g: 0.447, b: 0.714 },
            subtitle: { r: 0.769, g: 0.710, b: 0.992 },
            bodyText: { r: 0.820, g: 0.835, b: 0.855 },
            boldText: { r: 0.878, g: 0.906, b: 1.0 },
            uiText: { r: 1, g: 1, b: 1 },
        },
        background: {
            type: 'gradient',
            stops: [
                { position: 0, color: { r: 0.059, g: 0.047, b: 0.161, a: 1 } },
                { position: 0.4, color: { r: 0.094, g: 0.082, b: 0.263, a: 1 } },
                { position: 0.7, color: { r: 0.188, g: 0.169, b: 0.388, a: 1 } },
                { position: 1.0, color: { r: 0.141, g: 0.141, b: 0.243, a: 1 } },
            ],
            transform: [[0.7, 0.7, 0], [-0.7, 0.7, 0.5]]
        },
        decorations: {
            circles: [
                { x: 1420, y: -200, size: 600, colorKey: 'accent1', opacity: 0.12 },
                { x: -100, y: 730, size: 500, colorKey: 'accent2', opacity: 0.08 }
            ],
            accentBar: true
        }
    },
    'daker-light': {
        name: 'DAKER Light',
        colors: {
            bg: { r: 0.96, g: 0.96, b: 0.98 },
            bgMid: { r: 0.92, g: 0.92, b: 0.96 },
            accent1: { r: 0.4, g: 0.45, b: 0.85 },
            accent2: { r: 0.6, g: 0.4, b: 0.8 },
            accent3: { r: 0.85, g: 0.35, b: 0.6 },
            subtitle: { r: 0.4, g: 0.35, b: 0.6 },
            bodyText: { r: 0.25, g: 0.25, b: 0.3 },
            boldText: { r: 0.15, g: 0.15, b: 0.2 },
            uiText: { r: 0.3, g: 0.3, b: 0.4 },
        },
        background: {
            type: 'gradient',
            stops: [
                { position: 0, color: { r: 0.98, g: 0.98, b: 1.0, a: 1 } },
                { position: 0.5, color: { r: 0.94, g: 0.94, b: 0.98, a: 1 } },
                { position: 1.0, color: { r: 0.90, g: 0.90, b: 0.96, a: 1 } },
            ],
            transform: [[0.7, 0.7, 0], [-0.7, 0.7, 0.5]]
        },
        decorations: {
            circles: [
                { x: 1420, y: -200, size: 600, colorKey: 'accent1', opacity: 0.06 },
                { x: -100, y: 730, size: 500, colorKey: 'accent2', opacity: 0.05 }
            ],
            accentBar: true
        }
    },
    'corporate-blue': {
        name: 'Corporate Blue',
        colors: {
            bg: { r: 0.11, g: 0.15, b: 0.22 },
            bgMid: { r: 0.14, g: 0.18, b: 0.26 },
            accent1: { r: 0.2, g: 0.5, b: 0.9 },
            accent2: { r: 0.3, g: 0.6, b: 0.95 },
            accent3: { r: 0.4, g: 0.7, b: 1.0 },
            subtitle: { r: 0.6, g: 0.75, b: 0.9 },
            bodyText: { r: 0.8, g: 0.85, b: 0.9 },
            boldText: { r: 0.9, g: 0.95, b: 1.0 },
            uiText: { r: 1, g: 1, b: 1 },
        },
        background: {
            type: 'gradient',
            stops: [
                { position: 0, color: { r: 0.08, g: 0.12, b: 0.18, a: 1 } },
                { position: 0.5, color: { r: 0.12, g: 0.16, b: 0.24, a: 1 } },
                { position: 1.0, color: { r: 0.15, g: 0.2, b: 0.3, a: 1 } },
            ],
            transform: [[1, 0, 0], [0, 1, 0]]
        },
        decorations: {
            circles: [
                { x: 1520, y: -150, size: 500, colorKey: 'accent1', opacity: 0.1 }
            ],
            accentBar: true
        }
    },
    'minimal': {
        name: 'Minimal',
        colors: {
            bg: { r: 1, g: 1, b: 1 },
            bgMid: { r: 0.98, g: 0.98, b: 0.98 },
            accent1: { r: 0.1, g: 0.1, b: 0.1 },
            accent2: { r: 0.2, g: 0.2, b: 0.2 },
            accent3: { r: 0.3, g: 0.3, b: 0.3 },
            subtitle: { r: 0.4, g: 0.4, b: 0.4 },
            bodyText: { r: 0.2, g: 0.2, b: 0.2 },
            boldText: { r: 0, g: 0, b: 0 },
            uiText: { r: 0.3, g: 0.3, b: 0.3 },
        },
        background: {
            type: 'solid',
            color: { r: 1, g: 1, b: 1 }
        },
        decorations: {
            circles: [],
            accentBar: true
        }
    },
    'clean-white': {
        name: 'Clean White',
        colors: {
            bg: { r: 1, g: 1, b: 1 },
            bgMid: { r: 1, g: 1, b: 1 },
            accent1: { r: 0.235, g: 0.486, b: 0.871 },  // #3C7CDE
            accent2: { r: 0.235, g: 0.486, b: 0.871 },
            accent3: { r: 0.235, g: 0.486, b: 0.871 },
            subtitle: { r: 0.235, g: 0.486, b: 0.871 },
            bodyText: { r: 0.2, g: 0.2, b: 0.2 },
            boldText: { r: 0.1, g: 0.1, b: 0.1 },
            uiText: { r: 0.4, g: 0.4, b: 0.4 },
        },
        background: {
            type: 'solid',
            color: { r: 1, g: 1, b: 1 }
        },
        decorations: {
            circles: [],       // 장식 원형 없음
            accentBar: false   // 상단 바 없음
        },
        font: {
            family: 'Pretendard',
            titleStyle: 'ExtraBold',
            bodyStyle: 'Medium'
        }
    }
};

const DEFAULT_THEME = 'clean-white';
let currentTheme = THEMES[DEFAULT_THEME];

function getColors() {
    return currentTheme.colors;
}

// Backward compatibility alias
const COLORS = THEMES[DEFAULT_THEME].colors;

const SLIDE_W = 1920;
const SLIDE_H = 1080;

// ─── Detect editor type once ──────────────────────────────────
let isSlides = false;
try { isSlides = (figma.editorType === "slides"); } catch (_) { }

// ─── Font Loading ─────────────────────────────────────────────
let fontsLoaded = false;
let hasKoreanFont = false;
let hasPretendard = false;

async function loadFonts() {
    if (fontsLoaded) return;

    const coreFonts = [
        { family: "Inter", style: "Regular" },
        { family: "Inter", style: "Bold" },
        { family: "Inter", style: "Medium" },
        { family: "Inter", style: "Light" },
    ];
    await Promise.all(coreFonts.map(f => figma.loadFontAsync(f)));

    // Try Pretendard fonts (best effort)
    const pretendardFonts = [
        { family: "Pretendard", style: "ExtraBold" },
        { family: "Pretendard", style: "Bold" },
        { family: "Pretendard", style: "Medium" },
        { family: "Pretendard", style: "Regular" },
    ];
    for (const pf of pretendardFonts) {
        try { await figma.loadFontAsync(pf); } catch (_) { }
    }

    try {
        await figma.loadFontAsync({ family: "Pretendard", style: "Regular" });
        hasPretendard = true;
    } catch (_) {
        hasPretendard = false;
    }

    // Try Korean fonts (best effort)
    const koreanFonts = [
        { family: "Noto Sans KR", style: "Regular" },
        { family: "Noto Sans KR", style: "Bold" },
        { family: "Noto Sans KR", style: "Medium" },
        { family: "Noto Sans KR", style: "Light" },
    ];
    for (const kf of koreanFonts) {
        try { await figma.loadFontAsync(kf); } catch (_) { }
    }

    try {
        await figma.loadFontAsync({ family: "Noto Sans KR", style: "Regular" });
        hasKoreanFont = true;
    } catch (_) {
        hasKoreanFont = false;
    }

    fontsLoaded = true;
}

function fontFamily() {
    // 테마에 폰트 설정이 있으면 해당 폰트 사용, 그렇지 않으면 기본 폰트
    if (currentTheme.font && currentTheme.font.family) {
        // Pretendard가 설치되어 있으면 사용
        if (currentTheme.font.family === 'Pretendard' && hasPretendard) {
            return 'Pretendard';
        }
    }
    return hasKoreanFont ? "Noto Sans KR" : "Inter";
}

function getTitleStyle() {
    if (currentTheme.font && currentTheme.font.titleStyle && hasPretendard) {
        return currentTheme.font.titleStyle;
    }
    return "Bold";
}

function getBodyStyle() {
    if (currentTheme.font && currentTheme.font.bodyStyle && hasPretendard) {
        return currentTheme.font.bodyStyle;
    }
    return "Regular";
}

function safeSetFont(node, family, style) {
    try {
        node.fontName = { family: family, style: style };
    } catch (_) {
        try { node.fontName = { family: "Inter", style: "Regular" }; } catch (_2) { }
    }
}

// ─── Text Helpers ─────────────────────────────────────────────
function createRichText(rawText, fontSize, isBold, color, parent) {
    var text = figma.createText();
    var fam = fontFamily();
    // 제목(isBold=true)이면 titleStyle 사용, 본문이면 bodyStyle 사용
    var style = isBold ? getTitleStyle() : getBodyStyle();
    safeSetFont(text, fam, style);

    // Strip ** markers for display
    var boldRx = /\*\*(.+?)\*\*/g;
    var plain = rawText.replace(boldRx, "$1");

    text.characters = plain;
    text.fontSize = fontSize;
    text.fills = [{ type: "SOLID", color: color }];

    // Apply bold ranges (inline **bold**)
    var removed = 0;
    var rx2 = /\*\*(.+?)\*\*/g;
    var match;
    var boldStyle = getTitleStyle(); // 굵은 텍스트에는 titleStyle 적용
    while ((match = rx2.exec(rawText)) !== null) {
        var start = match.index - removed;
        var bold = match[1];
        if (start >= 0 && start + bold.length <= plain.length) {
            try {
                text.setRangeFontName(start, start + bold.length, { family: fam, style: boldStyle });
                text.setRangeFills(start, start + bold.length, [{ type: "SOLID", color: getColors().boldText }]);
            } catch (_) { }
        }
        removed += 4;
    }

    text.resize(SLIDE_W - 200, fontSize * 2);
    text.textAutoResize = "HEIGHT";

    parent.appendChild(text);
    return text;
}

function simpleText(content, fontSize, style, color) {
    var t = figma.createText();
    var fam = fontFamily();
    // 테마 폰트에 맞게 스타일 매핑
    var mappedStyle = style;
    if (fam === 'Pretendard') {
        if (style === 'Light') mappedStyle = 'Regular';
    }
    safeSetFont(t, fam, mappedStyle);
    t.characters = content;
    t.fontSize = fontSize;
    t.fills = [{ type: "SOLID", color: color }];
    t.resize(SLIDE_W - 200, fontSize * 2);
    t.textAutoResize = "HEIGHT";
    return t;
}

// ─── Decorative Elements ──────────────────────────────────────
function addAccentBar(parent) {
    var colors = getColors();
    var bar = figma.createRectangle();
    bar.name = "Accent Bar";
    bar.resize(SLIDE_W, 4);
    bar.x = 0;
    bar.y = 0;
    bar.fills = [{
        type: "GRADIENT_LINEAR",
        gradientStops: [
            { position: 0, color: { r: colors.accent1.r, g: colors.accent1.g, b: colors.accent1.b, a: 1 } },
            { position: 0.5, color: { r: colors.accent2.r, g: colors.accent2.g, b: colors.accent2.b, a: 1 } },
            { position: 1, color: { r: colors.accent3.r, g: colors.accent3.g, b: colors.accent3.b, a: 1 } },
        ],
        gradientTransform: [[1, 0, 0], [0, 1, 0]]
    }];
    parent.appendChild(bar);
}

function addDecoCircle(parent, x, y, size, color, opacity) {
    var c = figma.createEllipse();
    c.name = "Deco";
    c.resize(size, size);
    c.x = x;
    c.y = y;
    c.fills = [{
        type: "GRADIENT_RADIAL",
        gradientStops: [
            { position: 0, color: { r: color.r, g: color.g, b: color.b, a: opacity } },
            { position: 1, color: { r: color.r, g: color.g, b: color.b, a: 0 } },
        ],
        gradientTransform: [[0.5, 0, 0.25], [0, 0.5, 0.25]]
    }];
    parent.appendChild(c);
}

function addSlideNumber(parent, idx, total) {
    var s = String(idx + 1).padStart(2, "0") + " / " + String(total).padStart(2, "0");
    var t = simpleText(s, 18, "Light", getColors().uiText);
    t.opacity = 0.3;
    t.x = SLIDE_W - 160;
    t.y = SLIDE_H - 60;
    t.resize(100, 20);
    t.textAutoResize = "WIDTH_AND_HEIGHT";
    t.name = "Slide Number";
    parent.appendChild(t);
}

function addLogo(parent) {
    var t = simpleText("DAKER.ai", 20, "Bold", getColors().uiText);
    t.opacity = 0.25;
    t.x = 60;
    t.y = SLIDE_H - 60;
    t.resize(120, 24);
    t.textAutoResize = "WIDTH_AND_HEIGHT";
    t.letterSpacing = { value: 3, unit: "PIXELS" };
    t.name = "Logo";
    parent.appendChild(t);
}

// ─── Process Tokens ───────────────────────────────────────────
function processTokens(tokens, frame, idx, total) {
    var isCover = (idx === 0);
    var isEnding = (idx === total - 1);
    var colors = getColors();

    for (var i = 0; i < tokens.length; i++) {
        var tk = tokens[i];

        if (tk.type === "heading") {
            var fs = tk.depth === 1 ? (isCover || isEnding ? 72 : 54) : 36;
            var col = tk.depth === 1 ? colors.accent2 : colors.subtitle;
            createRichText(tk.text || "", fs, true, col, frame);

        } else if (tk.type === "paragraph") {
            if (tk.text) {
                createRichText(tk.text, 24, false, colors.bodyText, frame);
            }

        } else if (tk.type === "list") {
            var lf = figma.createFrame();
            lf.name = "List";
            lf.layoutMode = "VERTICAL";
            lf.primaryAxisSizingMode = "AUTO";
            lf.counterAxisSizingMode = "FIXED";
            lf.resize(SLIDE_W - 200, 100);
            lf.itemSpacing = 12;
            lf.fills = [];

            if (tk.items) {
                for (var j = 0; j < tk.items.length; j++) {
                    var item = tk.items[j];
                    var iFrame = figma.createFrame();
                    iFrame.name = "List Item";
                    iFrame.layoutMode = "HORIZONTAL";
                    iFrame.primaryAxisSizingMode = "FIXED";
                    iFrame.counterAxisSizingMode = "AUTO";
                    iFrame.resize(SLIDE_W - 240, 30);
                    iFrame.itemSpacing = 16;
                    iFrame.paddingLeft = 8;
                    iFrame.fills = [];

                    // Bullet
                    var bWrap = figma.createFrame();
                    bWrap.name = "BulletWrap";
                    bWrap.resize(10, 30);
                    bWrap.layoutMode = "VERTICAL";
                    bWrap.primaryAxisAlignItems = "CENTER";
                    bWrap.primaryAxisSizingMode = "FIXED";
                    bWrap.counterAxisSizingMode = "FIXED";
                    bWrap.fills = [];

                    var bullet = figma.createEllipse();
                    bullet.resize(10, 10);
                    bullet.fills = [{ type: "SOLID", color: colors.accent1 }];
                    bWrap.appendChild(bullet);
                    iFrame.appendChild(bWrap);

                    // Text
                    createRichText(item.text || "", 26, false, colors.bodyText, iFrame);
                    lf.appendChild(iFrame);
                }
            }
            frame.appendChild(lf);
        }
        // 'space' tokens ignored (Auto Layout handles spacing)
    }
}

// ─── Build styled background frame ────────────────────────────
function buildSlideFrame(slideData, index, total) {
    var isCover = (index === 0);
    var isEnding = (index === total - 1);
    var colors = getColors();

    // This frame holds all visual elements (gradient, deco, content, logo)
    var bg = figma.createFrame();
    bg.name = "SlideContent";
    bg.resize(SLIDE_W, SLIDE_H);
    bg.x = 0;
    bg.y = 0;
    bg.clipsContent = true;

    // Apply theme background
    if (currentTheme.background.type === 'gradient') {
        bg.fills = [{
            type: "GRADIENT_LINEAR",
            gradientStops: currentTheme.background.stops,
            gradientTransform: currentTheme.background.transform
        }];
    } else {
        bg.fills = [{ type: "SOLID", color: currentTheme.background.color }];
    }

    // Decorative elements based on theme
    if (currentTheme.decorations.circles && currentTheme.decorations.circles.length > 0) {
        currentTheme.decorations.circles.forEach(function(circle) {
            addDecoCircle(bg, circle.x, circle.y, circle.size, colors[circle.colorKey], circle.opacity);
        });
    }
    if (currentTheme.decorations.accentBar) {
        addAccentBar(bg);
    }

    // Content area (Auto Layout)
    var content = figma.createFrame();
    content.name = "Content";
    content.resize(SLIDE_W - 200, SLIDE_H - 200);
    content.x = 100;
    content.y = 80;
    content.layoutMode = "VERTICAL";
    content.primaryAxisSizingMode = "FIXED";
    content.counterAxisSizingMode = "FIXED";
    content.itemSpacing = 24;
    content.fills = [];

    if (isCover || isEnding) {
        content.primaryAxisAlignItems = "CENTER";
        content.counterAxisAlignItems = "CENTER";
    } else {
        content.primaryAxisAlignItems = "CENTER";
        content.counterAxisAlignItems = "MIN";
    }

    if (slideData && slideData.tokens) {
        processTokens(slideData.tokens, content, index, total);
    }

    bg.appendChild(content);
    addSlideNumber(bg, index, total);
    addLogo(bg);

    return bg;
}

// ─── Create Slide (adapts to editor type) ─────────────────────
async function createSlide(slideData, index, total) {
    // Build the styled content frame
    var styledFrame = buildSlideFrame(slideData, index, total);

    if (isSlides) {
        // === FIGMA SLIDES MODE ===
        // Create a real presentation slide (auto 1920x1080, can't resize)
        // Then put our styled frame inside it
        var slideNode = figma.createSlide();
        slideNode.name = "Slide " + String(index + 1).padStart(2, "0");
        slideNode.appendChild(styledFrame);
    } else {
        // === FIGMA DESIGN MODE ===
        // Just position frames horizontally on the canvas
        styledFrame.name = "Slide " + String(index + 1).padStart(2, "0");
        styledFrame.x = index * (SLIDE_W + 100);
        styledFrame.y = 0;
    }
}

// ─── Message Handler ──────────────────────────────────────────
figma.ui.onmessage = async function (msg) {
    try {
        if (msg.type === "import-slide") {
            // Apply theme if provided
            if (msg.theme && THEMES[msg.theme]) {
                currentTheme = THEMES[msg.theme];
            } else {
                currentTheme = THEMES[DEFAULT_THEME];
            }

            await loadFonts();
            await createSlide(msg.slideData, msg.index, msg.total);

            figma.ui.postMessage({
                type: "progress",
                current: msg.index + 1,
                total: msg.total
            });
        }

        if (msg.type === "all-done") {
            try {
                var slides = figma.currentPage.findAll(function (n) { return n.name.indexOf("Slide") === 0; });
                if (slides.length > 0) {
                    figma.viewport.scrollAndZoomIntoView(slides);
                }
            } catch (_) { }

            figma.notify("\u2705 " + msg.count + "\uAC1C \uC2AC\uB77C\uC774\uB4DC\uAC00 \uC131\uACF5\uC801\uC73C\uB85C \uC0DD\uC131\uB418\uC5C8\uC2B5\uB2C8\uB2E4!");
            figma.ui.postMessage({ type: "done", count: msg.count });
        }

        if (msg.type === "close") {
            figma.closePlugin();
        }
    } catch (err) {
        console.error("Plugin error:", err);
        figma.notify("\u274C Error: " + err.message);
        figma.ui.postMessage({
            type: "error",
            slide: (msg && msg.index != null) ? msg.index + 1 : 0,
            message: err.message
        });
    }
};
