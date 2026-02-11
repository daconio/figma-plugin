#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { parseMarkdownToSlides, generateSlideHTML } = require('./md-to-slides');
const { batchRenderSVGs } = require('./html-to-svg');

async function main() {
    const inputFile = process.argv[2];

    if (!inputFile) {
        console.error('❌ Usage: node convert.js <markdown-file>');
        console.error('   Example: node convert.js ../daker_presentation_content.md');
        process.exit(1);
    }

    const resolvedPath = path.resolve(inputFile);

    if (!fs.existsSync(resolvedPath)) {
        console.error(`❌ File not found: ${resolvedPath}`);
        process.exit(1);
    }

    console.log('');
    console.log('╔══════════════════════════════════════╗');
    console.log('║   Markdown → SVG Slide Converter     ║');
    console.log('╚══════════════════════════════════════╝');
    console.log('');

    // 1. Read Markdown
    console.log(`📄 Reading: ${resolvedPath}`);
    const markdown = fs.readFileSync(resolvedPath, 'utf-8');

    // 2. Parse into slides
    console.log('📝 Parsing Markdown into slides...');
    const slides = parseMarkdownToSlides(markdown);
    console.log(`   Found ${slides.length} slides`);

    // 3. Generate styled HTML for each slide
    console.log('🎨 Generating styled HTML...');
    const styledSlides = slides.map(slide => ({
        ...slide,
        styledHTML: generateSlideHTML(slide, slides.length)
    }));

    // 4. Render to SVG
    const outputDir = path.join(__dirname, 'output');
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    console.log(`🖼️  Rendering ${slides.length} SVGs to: ${outputDir}`);
    console.log('');

    const results = await batchRenderSVGs(styledSlides, outputDir);

    // 5. Summary
    console.log('');
    console.log('═══════════════════════════════════════');
    console.log(`✅ Done! ${results.length} SVG files generated:`);
    console.log('');

    for (const filePath of results) {
        const stats = fs.statSync(filePath);
        const sizeKB = (stats.size / 1024).toFixed(0);
        console.log(`   📊 ${path.basename(filePath)} (${sizeKB} KB)`);
    }

    console.log('');
    console.log('📂 Output directory:', outputDir);
    console.log('');
    console.log('Next steps:');
    console.log('  1. Open Figma → Create a new Design File');
    console.log('  2. File → Import → Select all SVG files from output/');
    console.log('  3. Arrange frames as needed');
    console.log('');
}

main().catch(err => {
    console.error('❌ Error:', err.message);
    process.exit(1);
});
