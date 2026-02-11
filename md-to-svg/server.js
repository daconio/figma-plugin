const http = require('http');
const fs = require('fs');
const path = require('path');

const { parseMarkdownToSlides, generateSlideHTML, parseMarkdownToJSON } = require('./md-to-slides');

const PORT = 9876;
const SVG_DIR = path.join(__dirname, 'output');

const MIME_TYPES = {
    '.svg': 'image/svg+xml',
    '.html': 'text/html',
    '.json': 'application/json',
    '.js': 'application/javascript',
    '.png': 'image/png'
};

const server = http.createServer((req, res) => {
    // CORS headers for Figma plugin
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    // API endpoint: list all SVG files
    if (req.url === '/api/slides') {
        const files = fs.readdirSync(SVG_DIR)
            .filter(f => f.endsWith('.svg'))
            .sort();
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ slides: files, total: files.length }));
        return;
    }

    // API endpoint: get parsed Markdown JSON (AST)
    if (req.url === '/api/data') {
        try {
            // Read the source markdown file (hardcoded path as per package.json script convention)
            // Ideally this should be dynamic, but for now we look for it in the parent directory
            // or we use the one passed to convert.js previously.
            // Since server.js is standalone, let's assume standard location:
            const mdPath = path.resolve(__dirname, '../daker_presentation_content.md');

            if (fs.existsSync(mdPath)) {
                const markdown = fs.readFileSync(mdPath, 'utf-8');
                const slidesData = parseMarkdownToJSON(markdown);
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ slides: slidesData, total: slidesData.length }));
            } else {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Markdown file not found' }));
            }
        } catch (err) {
            console.error(err);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: err.message }));
        }
        return;
    }

    // Serve static files from output directory
    let filePath = path.join(SVG_DIR, req.url === '/' ? 'importer.html' : req.url);
    const ext = path.extname(filePath);
    const contentType = MIME_TYPES[ext] || 'text/plain';

    if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath);
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(content);
    } else {
        res.writeHead(404);
        res.end('Not found');
    }
});

server.listen(PORT, () => {
    console.log(`🚀 CORS-enabled SVG server running at http://localhost:${PORT}`);
    console.log(`📂 Serving from: ${SVG_DIR}`);
    console.log(`📋 API endpoint: http://localhost:${PORT}/api/slides`);
});
