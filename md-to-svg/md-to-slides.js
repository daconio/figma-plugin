const { marked } = require('marked');
const fs = require('fs');
const path = require('path');

/**
 * Parse a Markdown file and split it into individual slide objects.
 * Slides are separated by "---" (horizontal rules).
 */
function parseMarkdownToSlides(markdownContent) {
  // Split by horizontal rules (---)
  const slideTexts = markdownContent.split(/\n---\n/).map(s => s.trim()).filter(Boolean);

  const slides = slideTexts.map((text, index) => {
    const html = marked.parse(text);
    return {
      index: index + 1,
      markdown: text,
      html: html
    };
  });

  return slides;
}

/**
 * Generate a styled HTML page for a single slide (1920x1080, 16:9).
 */
function generateSlideHTML(slide, totalSlides) {
  const slideNumber = String(slide.index).padStart(2, '0');

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;700;900&display=swap');

  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    width: 1920px;
    height: 1080px;
    overflow: hidden;
    font-family: 'Noto Sans KR', -apple-system, BlinkMacSystemFont, sans-serif;
    background: linear-gradient(135deg, #0f0c29 0%, #181545 40%, #302b63 70%, #24243e 100%);
    color: #f0f0f0;
    display: flex;
    flex-direction: column;
    padding: 80px 100px;
  }

  /* Decorative Background Elements */
  body::before {
    content: '';
    position: absolute;
    top: -200px;
    right: -200px;
    width: 600px;
    height: 600px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, transparent 70%);
    pointer-events: none;
  }

  body::after {
    content: '';
    position: absolute;
    bottom: -150px;
    left: -100px;
    width: 500px;
    height: 500px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(139, 92, 246, 0.1) 0%, transparent 70%);
    pointer-events: none;
  }

  .content {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    position: relative;
    z-index: 1;
  }

  h1 {
    font-size: 54px;
    font-weight: 900;
    margin-bottom: 30px;
    line-height: 1.3;
    background: linear-gradient(135deg, #818cf8, #c084fc, #f472b6);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    letter-spacing: -1px;
  }

  /* First slide (cover) special styling */
  ${slide.index === 1 ? `
  h1 {
    font-size: 72px;
    text-align: center;
    margin-bottom: 40px;
  }
  .content {
    align-items: center;
    text-align: center;
  }
  p strong {
    font-size: 28px;
    color: #c4b5fd;
    display: block;
    margin-bottom: 20px;
  }
  ` : ''}

  /* Last slide special styling */
  ${slide.index === totalSlides ? `
  h1 {
    font-size: 64px;
    text-align: center;
    margin-bottom: 40px;
  }
  .content {
    align-items: center;
    text-align: center;
  }
  ` : ''}

  h2 {
    font-size: 36px;
    font-weight: 700;
    color: #c4b5fd;
    margin-bottom: 24px;
  }

  p {
    font-size: 24px;
    line-height: 1.6;
    color: #d1d5db;
    margin-bottom: 16px;
  }

  p strong {
    color: #e0e7ff;
    font-weight: 700;
  }

  ul {
    list-style: none;
    padding: 0;
    margin: 12px 0;
  }

  li {
    font-size: 26px;
    line-height: 1.7;
    color: #d1d5db;
    padding: 10px 0 10px 40px;
    position: relative;
    margin-bottom: 4px;
  }

  li::before {
    content: '';
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: linear-gradient(135deg, #818cf8, #c084fc);
  }

  li strong {
    color: #e0e7ff;
    font-weight: 700;
  }

  /* Slide number */
  .slide-number {
    position: absolute;
    bottom: 40px;
    right: 60px;
    font-size: 18px;
    font-weight: 300;
    color: rgba(255, 255, 255, 0.3);
    letter-spacing: 2px;
    z-index: 2;
  }

  /* Top accent bar */
  .accent-bar {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, #818cf8, #c084fc, #f472b6, #818cf8);
    z-index: 2;
  }

  /* DAKER logo area */
  .logo {
    position: absolute;
    bottom: 40px;
    left: 60px;
    font-size: 20px;
    font-weight: 700;
    color: rgba(255, 255, 255, 0.25);
    letter-spacing: 3px;
    z-index: 2;
  }
</style>
</head>
<body>
  <div class="accent-bar"></div>
  <div class="content">
    ${slide.html}
  </div>
  <div class="logo">DAKER.ai</div>
  <div class="slide-number">${slideNumber} / ${String(totalSlides).padStart(2, '0')}</div>
</body>
</html>`;
}


/**
 * Parse Markdown and return structured data (AST) for Figma plugin.
 */
function parseMarkdownToJSON(markdownContent) {
  const slideTexts = markdownContent.split(/\n---\n/).map(s => s.trim()).filter(Boolean);

  return slideTexts.map((text, index) => {
    const tokens = marked.lexer(text);
    return {
      index: index + 1,
      markdown: text,
      tokens: tokens
    };
  });
}

module.exports = { parseMarkdownToSlides, generateSlideHTML, parseMarkdownToJSON };
