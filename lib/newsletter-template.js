export function newsletterHtml({ subject, greeting, articles, intro, outro }) {
  const cards = (articles || []).map((a) => `
    <tr>
      <td style="padding: 24px 0; border-bottom: 1px solid #eaeaea;">
        <a href="${a.url || '#'}" style="text-decoration: none; color: inherit;">
          <h3 style="margin: 0 0 8px; font-family: -apple-system, BlinkMacSystemFont, sans-serif; font-size: 18px; font-weight: 600; color: #0A0A0A; line-height: 1.3;">${a.title}</h3>
          <p style="margin: 0; font-family: Georgia, serif; font-size: 15px; color: #6B6B6B; line-height: 1.6;">${a.excerpt}</p>
          ${a.readTime ? `<span style="display: inline-block; margin-top: 8px; font-size: 12px; color: #999;">${a.readTime} min read</span>` : ''}
        </a>
      </td>
    </tr>
  `).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#FAFAFA;font-family:-apple-system,BlinkMacSystemFont,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#FAFAFA;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#FFFFFF;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.06);">
          <tr>
            <td style="padding:40px 40px 24px;border-bottom:1px solid #EAEAEA;">
              <h2 style="margin:0;font-size:24px;font-weight:700;color:#0A0A0A;letter-spacing:-0.02em;">INSIGHTS</h2>
              <p style="margin:8px 0 0;font-size:14px;color:#6B6B6B;">${subject}</p>
            </td>
          </tr>
          ${greeting ? `<tr><td style="padding:24px 40px 0;"><p style="margin:0;font-size:16px;color:#333;line-height:1.6;">${greeting}</p></td></tr>` : ''}
          ${cards ? `<tr><td style="padding:8px 40px;">${cards}</td></tr>` : ''}
          ${intro ? `<tr><td style="padding:24px 40px 0;"><p style="margin:0;font-size:15px;color:#444;line-height:1.6;">${intro}</p></td></tr>` : ''}
          ${outro ? `<tr><td style="padding:16px 40px 24px;"><p style="margin:0;font-size:14px;color:#6B6B6B;line-height:1.6;">${outro}</p></td></tr>` : ''}
          <tr>
            <td style="padding:24px 40px 40px;border-top:1px solid #EAEAEA;">
              <p style="margin:0 0 8px;font-size:13px;color:#6B6B6B;">INSIGHTS — Ideas. Intelligence. Impact.</p>
              <p style="margin:0;font-size:12px;color:#999;">You're receiving this because you subscribed at insights.manikantar.in. <a href="https://insights.manikantar.in/newsletter" style="color:#0A0A0A;">Unsubscribe</a></p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
