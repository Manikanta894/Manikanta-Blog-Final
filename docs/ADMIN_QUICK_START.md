# Next Draft — Admin Quick Start

Short reference guide for daily use. For full explanations, see [USER_GUIDE.md](./USER_GUIDE.md).

## 1. Access

- Public site: `/`
- Admin login: `/admin/login`
- Studio: `/admin`
- Analytics: `/admin/analytics`

## 2. Login

1. Open `/admin/login`.
2. Enter your password.
3. If 2FA is enabled, enter the current 6-digit code.
4. If 2FA is not enabled, complete setup and save the 10 recovery codes.

## 3. Studio Sidebar

Dashboard, Editor, AI Studio, Content Inbox, Drafts, Calendar, Media, Journal, Social Queue, RSS Sources, Automation Logs, Settings, Categories, Tags.

## 4. Publish an Article in 10 Steps

1. Open **Editor**.
2. Click **+ New**.
3. Enter **Title**.
4. Write content in Markdown.
5. Add **Excerpt**.
6. Choose **Section**.
7. Add hashtags.
8. Upload/select cover image.
9. Fill SEO fields if needed.
10. Click **Save Draft**, preview, then **Publish**.

## 5. AI Generate (Draft)

1. Open **AI Studio**.
2. Choose section.
3. Enter angle.
4. Click **Generate Draft**.
5. Review in **Drafts**.
6. Edit if needed.
7. Publish manually.

Avoid **Generate & Publish** unless you have reviewed the output style and accept immediate publication.

## 6. Media

- Upload: **Media** → **Upload Your Own Photo**.
- Formats: JPEG, PNG, WebP, GIF, AVIF, SVG, PDF.
- Limits: images 8 MB, PDFs 25 MB.
- Reuse: **Copy URL**.
- Delete: hover tile → **Delete**.

## 7. Categories and Tags

- **Categories:** name, slug, accent color, sort order.
- **Tags:** name and slug.
- Note: Editor does not assign categories/tags to articles; hashtags are entered per article.

## 8. Newsletter

- Visitors subscribe via public site.
- Sending uses Zoho SMTP (`ZOHO_EMAIL`, `ZOHO_APP_PASSWORD`).
- Trigger send: `GET /api/newsletter/send` (admin/cron).
- Check **Automation Logs**.

## 9. Security Essentials

- Password + TOTP login.
- 10 one-time recovery codes.
- No self-service password reset.
- Log out when done.
- Never share secrets.

## 10. Troubleshooting Quick Checks

- Login: wait 15 minutes if rate-limited.
- TOTP: check phone time.
- Upload: check type/size.
- AI: check keys and logs.
- Newsletter: check Zoho variables and logs.

---
See [USER_GUIDE.md](./USER_GUIDE.md) for full details.
