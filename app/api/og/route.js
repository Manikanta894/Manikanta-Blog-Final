import { NextResponse } from 'next/server';

export async function GET(request) {
  const url = new URL(request.url);
  const title = url.searchParams.get('title') || 'INSIGHTS';
  const section = url.searchParams.get('section') || '';

  const fontBase = 'https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@1&family=JetBrains+Mono&display=swap';

  const html = `<!DOCTYPE html>
<html>
<head>
  <link href="${fontBase}" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      width: 1200px; height: 630px;
      background: #181818;
      display: flex; flex-direction: column;
      justify-content: center;
      padding: 70px 80px;
      position: relative;
      overflow: hidden;
    }
    body::before {
      content: '';
      position: absolute;
      top: -200px; right: -200px;
      width: 600px; height: 600px;
      background: radial-gradient(circle, rgba(212,106,46,0.15), transparent 70%);
      border-radius: 50%;
    }
    body::after {
      content: '';
      position: absolute;
      bottom: -100px; left: -100px;
      width: 400px; height: 400px;
      background: radial-gradient(circle, rgba(212,106,46,0.08), transparent 70%);
      border-radius: 50%;
    }
    .section {
      font-family: 'JetBrains Mono', monospace;
      font-size: 14px;
      letter-spacing: 0.18em;
      text-transform: uppercase;
      color: #D46A2E;
      margin-bottom: 20px;
    }
    .title {
      font-family: 'Instrument Serif', serif;
      font-style: italic;
      font-size: 56px;
      line-height: 1.05;
      color: #F8F5EF;
      max-width: 900px;
      position: relative;
      z-index: 1;
    }
    .footer {
      font-family: 'JetBrains Mono', monospace;
      font-size: 12px;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: rgba(248,245,239,0.4);
      margin-top: 50px;
    }
    .accent-line {
      width: 80px;
      height: 2px;
      background: #D46A2E;
      margin-top: 10px;
      margin-bottom: 35px;
    }
  </style>
</head>
<body>
  ${section ? `<div class="section">${section}</div>` : ''}
  <div class="accent-line"></div>
  <div class="title">${title}</div>
  <div class="footer">INSIGHTS</div>
</body>
</html>`;

  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
}
