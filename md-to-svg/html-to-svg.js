const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

/**
 * Render an HTML slide string to SVG using Puppeteer.
 * Uses foreignObject to embed the full HTML as an SVG.
 */
async function renderHTMLtoSVG(htmlContent, outputPath, width = 1920, height = 1080) {
    const browser = await puppeteer.launch({
        headless: 'new',
        executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setViewport({ width, height });

    // Load the HTML content
    await page.setContent(htmlContent, { waitUntil: 'networkidle0', timeout: 30000 });

    // Wait for fonts to load
    await page.evaluate(() => document.fonts.ready);
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Take a screenshot as PNG first (for high-fidelity SVG embedding)
    const screenshotBuffer = await page.screenshot({
        type: 'png',
        clip: { x: 0, y: 0, width, height }
    });

    const base64Image = screenshotBuffer.toString('base64');

    // Create SVG with embedded image (preserves all styling perfectly)
    const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" 
     xmlns:xlink="http://www.w3.org/1999/xlink"
     width="${width}" height="${height}" 
     viewBox="0 0 ${width} ${height}">
  <title>Slide</title>
  <image width="${width}" height="${height}" 
         href="data:image/png;base64,${base64Image}"/>
</svg>`;

    fs.writeFileSync(outputPath, svgContent);

    await browser.close();

    return outputPath;
}

/**
 * Batch-render multiple HTML slides to SVG files.
 */
async function batchRenderSVGs(slides, outputDir) {
    const browser = await puppeteer.launch({
        headless: 'new',
        executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const results = [];
    const width = 1920;
    const height = 1080;

    for (const slide of slides) {
        const slideNum = String(slide.index).padStart(2, '0');
        const outputPath = path.join(outputDir, `slide_${slideNum}.svg`);

        console.log(`  🎨 Rendering slide ${slideNum}...`);

        const page = await browser.newPage();
        await page.setViewport({ width, height });
        await page.setContent(slide.styledHTML, { waitUntil: 'networkidle0', timeout: 30000 });

        // Wait for fonts
        await page.evaluate(() => document.fonts.ready);
        await new Promise(resolve => setTimeout(resolve, 1500));

        const screenshotBuffer = await page.screenshot({
            type: 'png',
            clip: { x: 0, y: 0, width, height }
        });

        const base64Image = screenshotBuffer.toString('base64');

        const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" 
     xmlns:xlink="http://www.w3.org/1999/xlink"
     width="${width}" height="${height}" 
     viewBox="0 0 ${width} ${height}">
  <title>DAKER.ai - Slide ${slideNum}</title>
  <image width="${width}" height="${height}" 
         href="data:image/png;base64,${base64Image}"/>
</svg>`;

        fs.writeFileSync(outputPath, svgContent);
        await page.close();

        results.push(outputPath);
        console.log(`  ✅ slide_${slideNum}.svg saved`);
    }

    await browser.close();
    return results;
}

module.exports = { renderHTMLtoSVG, batchRenderSVGs };
