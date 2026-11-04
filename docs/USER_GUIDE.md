# Next Draft — Admin User Manual

**For:** Owner/administrator of Next Draft  
**Audience:** Complete beginners. No technical knowledge assumed.  
**Application:** Next Draft (Next.js 15 publication + admin Studio)  
**Admin URL:** `/admin/login` on your live site (for example, `https://insights.manikantar.in/admin/login`)  
**Local development URL:** `http://localhost:3000` (only while the dev server is running on your computer)

> **Safety note:** This guide never asks you to share passwords, 2FA codes, recovery codes, API keys, or service-role keys. If any step seems to require them, stop and contact your developer.

---

## Table of Contents

1. [If You Are Completely New, Start Here](#if-you-are-completely-new-start-here)
2. [1. Introduction to Next Draft](#1-introduction-to-next-draft)
3. [2. Admin Login and Account Security](#2-admin-login-and-account-security)
4. [3. Admin Dashboard Explained](#3-admin-dashboard-explained)
5. [4. Creating and Publishing Articles](#4-creating-and-publishing-articles)
6. [5. AI Article Generation](#5-ai-article-generation)
7. [6. Media Library: Images and PDFs](#6-media-library-images-and-pdfs)
8. [7. Categories, Tags and Website Navigation](#7-categories-tags-and-website-navigation)
9. [8. Newsletter Management](#8-newsletter-management)
10. [9. Website Settings and Branding](#9-website-settings-and-branding)
11. [10. Supabase and Cloudflare R2 — Simple Explanation](#10-supabase-and-cloudflare-r2-simple-explanation)
12. [11. Common Problems and Solutions](#11-common-problems-and-solutions)
13. [12. Daily and Weekly Admin Checklist](#12-daily-and-weekly-admin-checklist)
14. [13. Important Security Rules](#13-important-security-rules)
15. [Appendix A. Admin Routes and Screens](#appendix-a-admin-routes-and-screens)
16. [Appendix B. Features Not Yet Implemented](#appendix-b-features-not-yet-implemented)

---

## If You Are Completely New, Start Here

These are the first five actions to learn. Do them in order.

1. **Open the admin login page** at `/admin/login` and sign in with your administrator password.
2. **Complete two-factor authentication (2FA) setup** the first time you log in. Save the 10 recovery codes somewhere safe.
3. **Open the Studio** (`/admin`) and click **Dashboard** to see your article, draft, subscriber, and inbox counts.
4. **Create one draft article** in **Editor**: add a title, write content, choose a section, add a cover image, then click **Save Draft**.
5. **Preview and publish** the draft only after you have read it fully. Use **Preview**, then click **Publish** (or **Save & Publish**) only when it is ready.

If you do only these five things, you can already run Next Draft safely.

---

## 1. Introduction to Next Draft

### 1.1 What Next Draft is

Next Draft is your own digital publication. It is a website where readers can read long-form articles organized into sections such as AI, Business, Career, Productivity, Essays, and Signals. It also includes a personal Journal, an About/author page, a newsletter, and search.

Behind the scenes, Next Draft is a Next.js web application. You do not need to know how the code works to use it. You manage it through the admin area called **The Studio**.

### 1.2 What the website and admin dashboard do

- **Public website:** This is what every visitor sees. It displays published articles, the journal, author information, and newsletter signup. Visitors cannot edit anything.
- **Admin dashboard (The Studio):** This is your private control room. It is available only after login. Here you write, edit, generate, schedule, publish, upload media, manage settings, and review activity.

### 1.3 How the public website differs from the admin panel

| Item | Public website | Admin panel (The Studio) |
| --- | --- | --- |
| URL | `/` and public pages | `/admin` (after login) |
| Who can use it | Everyone | Only you (admin) |
| What it shows | Published content only | Drafts, published content, tools, settings |
| Can content be changed? | No | Yes |
| Login required? | No | Yes |

A draft article exists in the admin panel but does not appear on the public website until its status becomes **published**.

### 1.4 How to access the live website and admin login

- **Live website:** Open your site URL in a browser, for example `https://insights.manikantar.in`.
- **Admin login:** Open `https://insights.manikantar.in/admin/login`.
- **Local development:** If a developer is running the site on your computer, use `http://localhost:3000` for the site and `http://localhost:3000/admin/login` for admin login.

### 1.5 Purpose of every major admin section

Open `/admin` after login. The left sidebar contains these tabs:

| Sidebar item | What it is for |
| --- | --- |
| Dashboard | Quick counts: articles, published, drafts, journal entries, subscribers, pending social posts, new inbox items |
| Editor | Write, edit, preview, save, and publish articles |
| AI Studio | Generate a full article from a section and an angle using AI |
| Content Inbox | Collect ideas, URLs, and news; turn each one into a draft with one click |
| Drafts | List all articles; publish, unpublish, view, or delete them |
| Calendar | See articles grouped by their scheduled/published/created date |
| Media | Upload, generate, view, copy URLs, and delete images/PDFs |
| Journal | View recorded journal entries |
| Social Queue | Review, edit, approve, reject, schedule, and publish social media posts |
| RSS Sources | Add or remove RSS feeds that feed the Content Inbox |
| Automation Logs | Review automation actions and errors |
| Settings | Store API keys and integration endpoints; manage 2FA recovery tools |
| Categories | Create, edit, and delete editorial categories |
| Tags | Create, edit, and delete tags |

There is also a separate analytics page at `/admin/analytics`. It is not in the Studio sidebar. It shows counts and recent articles.

---

## 2. Admin Login and Account Security

### 2.1 How to open the admin login page

1. Open your web browser.
2. Go to your site URL followed by `/admin/login`.  
   Example: `https://insights.manikantar.in/admin/login`
3. You will see the **NEXT DRAFT** sign-in screen with a password box.

If you are already logged in and visit `/admin/login`, you can still use it, but normally you will be sent to `/admin`.

### 2.2 How to log in with your administrator password

1. Type your administrator password into the password box.
2. Click **Sign in** (or press Enter).
3. The system checks the password. For security, after 5 failed attempts from the same internet connection within 15 minutes, login is temporarily blocked.

**How the password is created the first time:**  
The first time the site starts, if no admin user exists, it creates one with the username `admin` using the password from the environment variable `ADMIN_BOOTSTRAP_PASSWORD` (or `ADMIN_PASSWORD`). After that first login, changing the password is not available in the dashboard. See section 2.4.

### 2.3 Two-factor authentication (2FA / TOTP)

Next Draft uses time-based one-time passwords (TOTP). After your password is accepted:

- If 2FA is already enabled, you must enter a 6-digit code from your authenticator app.
- If 2FA is not enabled yet, the system requires you to set it up before you can enter the dashboard.

#### How to install and use an authenticator app

Install one of these on your phone (or password manager):

- Google Authenticator
- Microsoft Authenticator
- Authy
- 1Password / Bitwarden (if you use a password manager with OTP support)

These apps generate a new 6-digit code every 30 seconds.

#### How to scan or enter the setup key

**Important:** The Next Draft login screen does **not** show a scannable QR image. It shows:

1. A secret key (a long text string).
2. An `otpauth://` URI (a text link).

Use **manual entry** in your authenticator app:

1. Log in with your password.
2. When the screen says 2FA setup is required, click **Begin 2FA enrollment**.
3. Copy the secret key shown on the screen.
4. In your authenticator app, choose **Add account** → **Enter a setup key** (or **Manual entry**).
5. Set the account name to something like `Next Draft - admin`.
6. Paste the secret key.
7. Choose time-based, 6 digits, 30 seconds (these are the defaults used by Next Draft).
8. Save the account in the app.

If your app can import an `otpauth://` URI, you may paste the displayed URI instead. The app does not generate a QR code image.

#### How to enter the six-digit verification code

1. Open your authenticator app.
2. Find the Next Draft entry.
3. Type the current 6-digit code into the Next Draft verification box.
4. Click **Enable 2FA** (during setup) or **Verify** (during normal login).
5. If the code is wrong or expired, wait for the next 30-second code and try again.

#### How to log in after 2FA is enabled

1. Open `/admin/login`.
2. Enter your password and click **Sign in**.
3. The screen changes to a code entry step.
4. Enter the current 6-digit code from your authenticator app.
5. Click **Verify**.
6. You are taken to `/admin`.

The login challenge expires after 5 minutes, so complete step 3 promptly.

---

#### How to use recovery codes if you lose access to your authenticator

Recovery codes are one-time codes. You receive 10 of them when you first enable 2FA. They look like `XXXXX-XXXXX`.

If you cannot use your authenticator app:

1. Open `/admin/login`.
2. Enter your password and click **Sign in**.
3. On the code screen, click **Use a recovery code**.
4. Enter one unused recovery code.
5. Click **Redeem**.
6. If accepted, you are logged in. That code can never be used again.

You can also log in directly with password + recovery code through the recovery screen.

#### How to securely store recovery codes

- Save them in a password manager as a secure note.
- Or print them and store them in a locked, private place.
- Do not store them in email, chat messages, screenshots in shared photo libraries, or on your public computer.
- Do not share them with anyone, including support or developers, unless you are performing an emergency recovery with someone you trust.

#### How to regenerate recovery codes

You can create a new set of 10 recovery codes, but only while you are already logged in and can prove your identity:

1. Go to **Settings** → **Security (2FA)**.
2. Click **Regenerate recovery codes**.
3. Enter your password when prompted.
4. Enter your current 6-digit authenticator code when prompted.
5. Copy the new codes shown in the alert box.
6. Store them safely. The old codes are replaced.

#### How to disable 2FA

1. Go to **Settings** → **Security (2FA)**.
2. Click **Disable 2FA**.
3. Enter your password when prompted.
4. Enter your current 6-digit authenticator code when prompted.
5. 2FA is turned off and recovery codes are cleared.

### 2.4 Passwords: what is actually supported

**Important:** Next Draft does **not** currently include a self-service “change password” or “forgot password” screen. Please do not look for a button that does not exist.

What is actually supported:

- **First account creation:** from `ADMIN_BOOTSTRAP_PASSWORD` or `ADMIN_PASSWORD` when no admin user exists.
- **Login:** password + optional 2FA.
- **Recovery login:** password + recovery code.
- **Regenerating recovery codes:** requires current password and current TOTP code.
- **Disabling 2FA:** requires current password and current TOTP code.

There is no API or UI to change the admin password after the first login. If you need to change or reset it, contact your developer. They can update the password hash in the database or reset the admin user according to your hosting setup.

### 2.5 How to log out

1. In the Studio, look at the top-right area of the page.
2. Click **Log out**.
3. Your browser session cookie is cleared and you are sent back to `/admin/login`.

Your session also expires automatically after 8 hours, or after 30 minutes of inactivity.

### 2.6 How to revoke sessions

- Clicking **Log out** ends the session in your current browser.
- The backend also has a “revoke all sessions” function, but it is not connected to a button in the dashboard. It requires an authenticated API request with `{ "all": true }`.
- If you believe someone else has access, contact your developer immediately. They can revoke sessions and reset credentials.

### 2.7 What to do if you lose access

| Situation | What to do |
| --- | --- |
| You forgot your password | Contact your developer. There is no self-service password reset. |
| You lost your phone but still have recovery codes | Use password + one recovery code to log in, then regenerate recovery codes. |
| You lost your phone and recovery codes | Contact your developer. 2FA cannot be disabled without the current TOTP code. |
| You still have your phone but codes are wrong | Wait for the next 30-second code; check the phone’s time is correct. |
| You suspect unauthorized access | Contact your developer to revoke sessions and reset credentials. |

---

## 3. Admin Dashboard Explained

The Studio is at `/admin`. It has a left sidebar. Click a sidebar item to open that section. The main area on the right shows the selected tool.

### 3.1 Dashboard and analytics

- **Where to find it:** Sidebar → **Dashboard**. Separate analytics page at `/admin/analytics`.
- **What it is used for:** Shows counts and recent activity. Dashboard cards: Total Articles, Published, Drafts, Journal Entries, Subscribers, Pending Social, Inbox (new). `/admin/analytics` shows Total Articles, Published, Subscribers, Drafts, plus the 10 most recent articles with status.
- **How to use it:** Open it when you start work. Use it to spot backlog (drafts, inbox, pending social).
- **What happens when you save changes:** Nothing is saved here; it only reads data.
- **Common mistakes to avoid:** Do not assume zero counts mean an error. An empty site is normal before you publish.

### 3.2 Articles (Editor)

- **Where to find it:** Sidebar → **Editor**.
- **What it is used for:** Writing and editing articles. This is the main content tool.
- **How to use it:** See section 4 for the full workflow.
- **What happens when you save changes:** The article is created or updated in the database. The public site cache is refreshed. A new article receives an automatic URL slug.
- **Common mistakes to avoid:** Leaving the title or content empty; clicking **Publish** before previewing; forgetting to choose the right section.

### 3.3 AI Studio

- **Where to find it:** Sidebar → **AI Studio**.
- **What it is used for:** Generating a full article from a section and optional angle.
- **How to use it:** See section 5.
- **What happens when you save changes:** **Generate Draft** creates a draft article. **Generate & Publish** creates and immediately publishes an article.
- **Common mistakes to avoid:** Using **Generate & Publish** before reviewing; expecting AI text to be fact-checked.

### 3.4 Content Inbox

- **Where to find it:** Sidebar → **Content Inbox**.
- **What it is used for:** Storing ideas, URLs, news items, and image links. Processing an item creates a full draft article (never auto-published).
- **How to use it:**
  1. Choose a type: Idea, URL / Article link, News item, or Image link.
  2. Paste content.
  3. Choose a target section.
  4. Add optional notes.
  5. Click **Add**.
  6. Later, click **Process** on an item to generate a draft.
  7. Click the trash icon to delete an item.
- **Webhook:** You can generate a webhook secret and URL. External tools (such as Google Sheets or n8n) can POST rows to `/api/inbox/webhook?secret=...`. A sample Google Apps Script is shown in the page.
- **What happens when you save changes:** Inbox items are stored. Processing creates a draft article and marks the item done/failed.
- **Common mistakes to avoid:** Leaving the webhook secret blank; sharing the webhook URL publicly; expecting processing to publish automatically.

### 3.5 Drafts (Draft Queue)

- **Where to find it:** Sidebar → **Drafts**.
- **What it is used for:** Listing all articles (drafts and published). Publishing, unpublishing, viewing, and deleting.
- **How to use it:**
  - **Publish:** on a draft, click **Publish**.
  - **Unpublish:** on a published article, click **Unpublish**.
  - **View:** click **View** to open the public article page.
  - **Delete:** click the trash icon, then confirm.
- **What happens when you save changes:** Article status changes. The public site cache is refreshed.
- **Common mistakes to avoid:** Deleting an article you meant to keep; forgetting that deleting does not delete uploaded media files.

### 3.6 Calendar (Content Calendar)

- **Where to find it:** Sidebar → **Calendar**.
- **What it is used for:** Shows articles grouped by date (scheduled date if present, otherwise published date, otherwise created date).
- **How to use it:** Read-only review. No editing is available here.
- **What happens when you save changes:** Nothing; this page only displays data.
- **Common mistakes to avoid:** Expecting drag-and-drop scheduling. Scheduling is not implemented in this UI.

### 3.7 Media Library

- **Where to find it:** Sidebar → **Media**.
- **What it is used for:** Uploading, generating, viewing, copying URLs, and deleting images/PDFs.
- **How to use it:** See section 6.
- **What happens when you save changes:** Files are uploaded to storage (R2 or Supabase) and metadata is stored. Deleted files are removed from storage when possible.
- **Common mistakes to avoid:** Uploading files that are too large; deleting a file that is still used by an article.

---

### 3.8 Journal Management

- **Where to find it:** Sidebar → **Journal**.
- **What it is used for:** Viewing recorded journal entries and their count.
- **How to use it:** This screen is view-only. It shows date/time, mood, and title/content preview. It links to the public `/journal` page.
- **What happens when you save changes:** Nothing; this screen does not create or edit entries.
- **Common mistakes to avoid:** Expecting to add a journal entry here. Journal creation is not available in this admin screen.

### 3.9 Social Queue

- **Where to find it:** Sidebar → **Social Queue**.
- **What it is used for:** Reviewing social media posts generated from articles. Nothing posts automatically; you approve, schedule, or publish each one.
- **How to use it:**
  1. Use filters: All, Pending approval, Approved, Scheduled, Posted, Failed, Rejected.
  2. Click **Edit** to change the caption or slide text.
  3. For pending items, click **Approve** or **Reject**.
  4. For approved/pending items, click **Schedule** and enter a date/time (`YYYY-MM-DD HH:MM`, local time).
  5. For approved/scheduled/failed items, click **Publish Now** to post immediately.
  6. Click the trash icon to delete.
- **Platforms:** LinkedIn and Instagram are supported for publishing from the queue.
- **What happens when you save changes:** Queue status changes; posting attempts are recorded with errors if they fail.
- **Common mistakes to avoid:** Publishing without checking captions; ignoring failed posts; scheduling in the wrong time zone.

### 3.10 RSS Sources

- **Where to find it:** Sidebar → **RSS Sources**.
- **What it is used for:** Adding RSS feeds. Feed items are turned into Content Inbox entries.
- **How to use it:**
  1. Enter a name.
  2. Enter the feed URL.
  3. Choose a target section.
  4. Click **Add Source**.
  5. Click the trash icon to remove a source.
- **What happens when you save changes:** The source is stored. RSS ingestion creates inbox items (automation may be triggered separately).
- **Common mistakes to avoid:** Adding broken feed URLs; expecting automatic publishing (items become inbox entries, not articles).

### 3.11 Automation Logs

- **Where to find it:** Sidebar → **Automation Logs**.
- **What it is used for:** Reviewing automation actions (RSS ingest, AI generation, newsletter send, social updates, scheduler) with success/failure status.
- **How to use it:** Read-only. Green `[ok]`, red `[failed]`.
- **What happens when you save changes:** Nothing.
- **Common mistakes to avoid:** Ignoring failed entries; assuming logs delete or archive automatically (no such feature is shown).

### 3.12 Settings

- **Where to find it:** Sidebar → **Settings**.
- **What it is used for:** Storing API keys and integration endpoints. Also contains 2FA recovery tools.
- **Sections in Settings:**
  - Author: author photo URL, portfolio URL.
  - AI Providers: Groq API Key, OpenRouter API Key.
  - Hashnode: personal access token, publication ID.
  - Social OAuth: LinkedIn token/actor URN, Instagram token/business account ID.
  - Automation: n8n webhook URL, n8n trigger secret, inbox webhook secret, cron secret.
  - Analytics: Umami URL and website ID.
  - Security (2FA): regenerate recovery codes, disable 2FA.
- **How to use it:** Type values into fields and click **Save Settings**.
- **What happens when you save changes:** Settings are stored and used by the app. Secrets are stored in the database/settings row.
- **Common mistakes to avoid:** Pasting secrets into chat or GitHub; saving an empty value and overwriting a working key; sharing screenshots of this page.

### 3.13 Categories

- **Where to find it:** Sidebar → **Categories**.
- **What it is used for:** Managing editorial categories (name, slug, accent color, sort order).
- **How to use it:**
  1. Click **+ Add Category** to start a new one.
  2. Fill Name, Slug, Accent (color picker), Order (number).
  3. Click **Create** or **Save**.
  4. Click **Edit** to change, or **Delete** to remove.
- **What happens when you save changes:** The category is stored and can be used by public category pages.
- **Common mistakes to avoid:** Creating duplicate slugs; deleting a category that articles reference.

### 3.14 Tags

- **Where to find it:** Sidebar → **Tags**.
- **What it is used for:** Managing tags (name, slug).
- **How to use it:** Fill Name and Slug, then click **Create** or **Save**. Edit or delete existing tags.
- **What happens when you save changes:** Tags are stored.
- **Common mistakes to avoid:** Duplicating tags with different casing; deleting tags that may be referenced.

### 3.15 Important note about categories, tags, and articles

The Editor currently stores **section**, **hashtags**, and **SEO** for an article. It does not include a selector for editorial categories or Tags-admin tags, and it does not assign tags from the Tags admin screen to an article. Categories and tags are managed separately, and public category pages filter articles by a `categoryId` field, but assigning that field is not available in the dashboard UI. If you need category/tag assignment on articles, contact your developer.

---

## 4. Creating and Publishing Articles

### 4.1 Open Articles in the admin panel

1. Log in.
2. Click **Editor** in the sidebar.
3. You will see the Editor screen with a title box, excerpt box, content area, and a settings column.

### 4.2 Create a new article

1. Click **+ New** to clear the form.
2. Or choose an existing article from the **Open existing…** dropdown to edit it.

### 4.3 Enter the title

1. Click in the large **Title** box.
2. Type a clear, specific title.
3. The title is used for the article page, SEO defaults, and AI cover generation.

### 4.4 Write or paste the article content

1. Click in the **Content (Markdown)** box.
2. Type your article using Markdown:
   - `# Heading` and `## Heading` for headings
   - `- item` for bullet lists
   - `1. item` for numbered lists
   - `> quote` for quotes
   - `**bold**` and `*italic*`
   - `[text](https://example.com)` for links
   - `![alt text](image-url)` for images
   - Triple backticks for code blocks
3. The word count is shown below the box.
4. Click **Preview** to see how it will look. Click **Edit** to return to typing.
5. To insert an image at your cursor, click **Insert Image** and choose a file. The image uploads and Markdown is inserted automatically.

### 4.5 Add an excerpt

1. Type 1–3 sentences in the **Excerpt** box.
2. This appears on article cards and under the title. It also becomes the default meta description if you leave SEO description empty.

### 4.6 Select a section

1. In the right column, use the **Section** dropdown.
2. Choose one of: AI, Business, Career, Productivity, Essays, Signals.
3. This determines where the article appears on the public site.

### 4.7 Add tags (hashtags)

1. In **Hashtags (comma-separated)**, type hashtags separated by commas.  
   Example: `#hr, #analytics, #career`
2. These are stored with the article and displayed as hashtags.

### 4.8 Upload a cover image

You have three options:

1. **Paste a URL:** Paste an image URL into the **Cover Image** box.
2. **Upload:** Click **Upload**, choose an image from your computer. The file uploads and the URL is filled in.
3. **Generate (AI):** Click **Generate (AI)**. The system creates a cover image based on the title using Pollinations AI.

A preview of the cover image appears above the controls.

### 4.9 Set the author

The Editor does not include an author selector. Articles are attributed to **Manikanta** on the public site. If you need multi-author support, contact your developer.

### 4.10 Configure the URL slug

The Editor does not include a slug field. When you create a new article, the system automatically creates a slug from the title plus a short random code. For example, a title “Hiring for Judgment” becomes something like `hiring-for-judgment-a1b2`.

- You cannot change the slug in the dashboard.
- If you need a specific URL, contact your developer.

### 4.11 Add SEO title and description

1. **SEO Title:** Optional. If left empty, the article title is used.
2. **Meta Description:** Optional. If left empty, the excerpt is used. A counter shows up to 160 characters.

### 4.12 Save as a draft

1. Make sure Title and Content are not empty.
2. Click **Save Draft**.
3. A success message appears. The article now has status **draft**.
4. It is saved in the database but does not appear on the public site.

### 4.13 Preview the article

1. Click **Preview** above the content box to render the Markdown.
2. For a public preview, use **Drafts** → **View** (the article page is accessible by URL even if unpublished, depending on implementation; treat it as a review link).
3. Read the whole article before publishing.

### 4.14 Edit and update an existing article

1. In **Editor**, use **Open existing…** to load the article.
2. Make changes.
3. Click **Save Draft** to keep it as a draft, or **Save & Publish** to update the published version.

### 4.15 Publish an article

Option A — from Editor:

1. Load or create the article.
2. Click **Publish** (for a new article) or **Save & Publish** (for an existing one).
3. The status becomes **published** and `publishedAt` is set.

Option B — from Drafts:

1. Go to **Drafts**.
2. Find the article.
3. Click **Publish**.

### 4.16 Unpublish or archive an article

- **Unpublish:** In **Drafts**, click **Unpublish** on a published article. Its status becomes **draft**.
- There is no separate “archive” status in the dashboard.

### 4.17 Delete an article safely

1. Go to **Drafts**.
2. Click the trash icon on the article.
3. Confirm the deletion prompt.
4. The article is permanently removed from the database.

**Important:** Deleting an article does not delete uploaded media files. If you want to remove files, delete them separately in **Media**.

### 4.18 Draft vs published status

| Status | Visible on public site? | Meaning |
| --- | --- | --- |
| draft | No | Work in progress or unpublished |
| published | Yes | Live for readers |

---

### 4.19 Complete example: creating and publishing a sample article

Goal: publish an article titled “How to Run a Better Weekly Review” in the Productivity section.

1. Log in and open **Editor**.
2. Click **+ New**.
3. Title: `How to Run a Better Weekly Review`
4. Excerpt: `A simple weekly review routine that helps you close loops, choose priorities, and start Monday with clarity.`
5. Content: write your Markdown article.
6. Section: **Productivity**.
7. Hashtags: `#productivity, #weeklyreview, #systems`
8. Cover Image: click **Upload** and choose a photo, or click **Generate (AI)**.
9. SEO Title: `How to Run a Better Weekly Review | Next Draft`
10. Meta Description: `Learn a simple weekly review routine to close open loops, set priorities, and start Monday with clarity.`
11. Click **Save Draft**.
12. Click **Preview** and read the whole article.
13. Fix any errors and click **Save Draft** again.
14. Click **Save & Publish**.
15. Go to **Drafts** and click **View** to check the live page.

### 4.20 How to avoid accidentally publishing unfinished content

- Use **Save Draft** by default.
- Do not click **Publish** or **Save & Publish** until you have previewed the full article.
- Be careful with **AI Studio → Generate & Publish**. It publishes immediately without a review step. Prefer **Generate Draft**.
- In **Content Inbox**, processing creates drafts, not published articles. Review them in **Drafts** before publishing.
- Keep titles and excerpts final before publishing; they affect cards and SEO.
- If you publish by mistake, use **Drafts → Unpublish** immediately.

---

## 5. AI Article Generation

### 5.1 Where to find AI article generation

- **AI Studio:** Sidebar → **AI Studio**.
- **Content Inbox:** Sidebar → **Content Inbox** → **Process** (turns an inbox item into a draft using AI).
- **Cover images:** Editor → **Generate (AI)** creates a cover image using Pollinations AI (not the text AI provider).

The text AI provider chain is Groq → OpenRouter → mock fallback. Keys are read from Settings first, then environment variables.

### 5.2 How to enter a topic

1. Open **AI Studio**.
2. Choose a **Section** from the dropdown (AI, Business, Career, Productivity, Essays, Signals).
3. Type an **Angle** (optional but recommended) in the text box.  
   Example angle: `Why most career advice ignores compounding skills`
4. Click **Generate Draft** or **Generate & Publish**.

There are no separate fields for tone, audience, keywords, or article length in the dashboard. The prompt and length are fixed by the application (about 1,600–2,200 words). You can influence the topic and viewpoint through the **Angle** field and by editing the result.

### 5.3 How to write an effective generation prompt (angle)

Good angles are specific and opinionated. Include:

- The exact question or argument.
- The target reader.
- A real-world context or example.
- What you want the reader to do or think.

Examples:

- `Argue that middle managers are becoming product managers of human workflows`
- `A practical guide to hiring for judgment, not credentials`
- `Why AI agents will change customer support economics in 2026`
- `The hidden cost of too many meetings in remote teams`

Avoid vague angles like `marketing tips` or `AI trends`.

### 5.4 How to generate an article

1. Choose the section.
2. Enter an angle.
3. Click **Generate Draft**.
4. Wait. The system calls the AI provider, parses the result, generates a cover image, and creates social copy.
5. A result card appears with title, provider, excerpt, cover image, and a link to the article.
6. The article is saved as a **draft**.

Clicking **Generate & Publish** does the same but sets status to **published** immediately.

### 5.5 How to review and edit AI-generated content

1. Open **Drafts** and find the new article.
2. Click **View** to read it.
3. To edit, open **Editor**, choose the article from **Open existing…**, make changes, and click **Save Draft** or **Save & Publish**.
4. Check the generated hashtags and SEO fields; edit them if needed.

### 5.6 How to verify references and facts

AI may produce plausible but incorrect details. Before publishing:

- Verify every statistic, company name, study, quote, and date.
- Remove or soften claims you cannot verify.
- Ensure the article matches your voice and publication standards.
- Check that inline images and pull quotes make sense.

### 5.7 How to save generated content as a draft

Use **Generate Draft** in AI Studio, or **Process** in Content Inbox. Both create drafts, not published articles. Then review and publish manually.

### 5.8 How to publish only after manual approval

1. Generate as a draft.
2. Review and edit.
3. Publish from **Editor** or **Drafts** when ready.

Never use **Generate & Publish** unless you have already reviewed similar output and accept the risk of immediate publication.

### 5.9 What to do if AI generation fails

- Read the error message in the toast notification.
- Check **Automation Logs** for `ai.generate` entries.
- If no AI key is configured, the system may return a mock article (provider shown as `mock` or `...-parseFail`). Add Groq or OpenRouter keys in Settings.
- If the AI returns invalid JSON, the system falls back to a mock article. Try again or use a different angle.
- Rate limiting: AI generation is limited to 3 requests per IP in the rate-limit window. Wait and retry.
- Check your internet connection and provider status.

---

### 5.10 Practical example prompts for Next Draft subject areas

Use these as **Angle** values in AI Studio.

| Subject area | Section to choose | Example angle |
| --- | --- | --- |
| Business strategy | Business | `Argue that durable companies win by focusing on one painful customer job, with examples from software and retail` |
| Leadership | Career | `Explain how new managers should run their first 30 days without damaging team trust` |
| Marketing | Business | `Why most content marketing fails because it has no point of view, and how to fix it` |
| Human resources | Career | `A practical guide to hiring for judgment instead of credentials` |
| AI and technology | AI | `How AI agents will change customer support economics and what operators should measure` |

Additional examples:

- Productivity section: `A system for reducing meeting load without losing alignment`
- Essays section: `On slowness: why considered work outperforms constant urgency`
- Signals section: `Five things worth your attention this week in AI and business`

---

## 6. Media Library: Images and PDFs

### 6.1 How to upload images

1. Open **Media** in the sidebar.
2. Click **Upload Your Own Photo**.
3. Choose an image file from your computer.
4. Wait for the success message.
5. The image appears in the grid.
6. Click **Copy URL** to copy its link for use elsewhere.

You can also upload from **Editor**:
- **Cover Image → Upload** sets the article cover.
- **Insert Image** uploads and inserts Markdown at the cursor.

### 6.2 Supported file formats and size limits

Supported types:
- Images: JPEG, JPG, PNG, WebP, GIF, AVIF, SVG
- PDF: application/pdf

Size limits:
- Images: 8 MB maximum.
- PDFs: 25 MB maximum.

### 6.3 How to upload PDFs

1. Open **Media**.
2. Click **Upload Your Own Photo** (the same button accepts PDFs).
3. Choose a `.pdf` file.
4. The library shows a **PDF** placeholder tile.
5. Click **Copy URL** to use the PDF link in an article or elsewhere.

### 6.4 How to select an image for an article

- **Cover image:** In Editor, paste a URL, upload, or generate with AI.
- **Inline image:** In Editor, click **Insert Image** and choose a file. The Markdown `![alt](url)` is inserted at your cursor.

### 6.5 How to reuse uploaded media

1. Open **Media**.
2. Find the file.
3. Click **Copy URL**.
4. Paste the URL into an article, cover image field, or any other place that accepts an image/PDF URL.

### 6.6 How to delete unwanted files

1. Open **Media**.
2. Hover over the file tile.
3. Click **Delete**.
4. Confirm the prompt.

The file is removed from storage when possible and its metadata is deleted. If an article still references the URL, the link will break, so delete only files you no longer need.

### 6.7 What Cloudflare R2 does (simple explanation)

Cloudflare R2 is an online storage space for your files. Think of it as a private filing cabinet in the cloud.

- You upload files through Next Draft.
- Next Draft stores them in R2 (or Supabase Storage if R2 is not configured).
- The files are not normally public directly. Next Draft serves them through a proxy link like `/api/media/file?key=...`.
- This keeps your storage private and avoids exposing secret keys.

### 6.8 How image delivery works

1. You upload a file.
2. The app stores it and returns a proxy URL.
3. When a visitor opens the page, the browser requests the proxy URL.
4. Next Draft fetches the file from storage and sends it to the browser.
5. Images and PDFs are cached for performance.

### 6.9 Common upload errors

| Error | Likely cause | What to try |
| --- | --- | --- |
| Unauthorized | You are not logged in | Log in again |
| Unsupported file type | File format not allowed | Use a supported image or PDF |
| File too large | Over 8 MB (image) or 25 MB (PDF) | Compress or split the file |
| Media storage is not configured | Neither R2 nor Supabase credentials are set | Contact your developer |
| Upload failed | Network or storage issue | Retry; check logs |
| Delete failed | File or metadata issue | Retry; contact developer |

---

## 7. Categories, Tags and Website Navigation

### 7.1 Create and edit categories

1. Open **Categories**.
2. Click **+ Add Category**.
3. Fill:
   - **Name:** display name.
   - **Slug:** URL-friendly name (lowercase, hyphens).
   - **Accent:** color used in the UI.
   - **Order:** sorting number.
4. Click **Create** or **Save**.
5. To change, click **Edit**, update, then **Save**.
6. To remove, click **Delete** and confirm.

### 7.2 Create and edit tags

1. Open **Tags**.
2. Fill **Name** and **Slug**.
3. Click **Create** or **Save**.
4. Edit or delete as needed.

### 7.3 Assign categories and tags to articles

- **Hashtags:** In the Editor, enter comma-separated hashtags in **Hashtags**. These are stored with the article.
- **Editorial categories and Tags-admin tags:** The Editor does not currently include selectors for these. See the note in section 3.15. Contact your developer if you need assignment.

### 7.4 How these appear on the public website

- Sections (AI, Business, etc.) are the main article groupings and appear in navigation.
- Categories have public pages at `/category/[slug]` and display articles whose `categoryId` matches.
- Hashtags are shown with the article.

### 7.5 Avoid duplicate or confusing categories

- Use a consistent naming style (title case).
- Keep slugs short and stable; changing a slug can break links.
- Avoid overlapping categories with the same meaning.
- Review existing categories before creating new ones.

---
## 8. Newsletter Management

### 8.1 How visitors subscribe

Visitors subscribe through the public newsletter page or form. The system validates the email and stores it. Duplicate emails are ignored.

### 8.2 How to view subscribers

- The **Dashboard** shows the subscriber count.
- `/admin/analytics` also shows the subscriber count.
- The full subscriber list is available through the admin API (`GET /api/newsletter`) but there is no dedicated subscriber-management screen in the Studio. Contact your developer if you need to view or export the full list.

### 8.3 How to manage subscriptions

There is no unsubscribe or delete button in the dashboard. Subscriber records are stored in the database with status `active`. If you need to remove or update a subscriber, contact your developer.

### 8.4 Newsletter features that exist

- Automated newsletter generation from the latest 5–6 published articles.
- Weekday vs weekend editions.
- Sending to all active subscribers by email.
- Logging the send result in Automation Logs.

### 8.5 What email configuration is required

Newsletter sending uses Zoho Mail SMTP. Required environment variables:

- `ZOHO_EMAIL`
- `ZOHO_APP_PASSWORD`

The sender address is the Zoho email. If these are not set, sending is disabled.

### 8.6 How to troubleshoot email delivery

1. Check that `ZOHO_EMAIL` and `ZOHO_APP_PASSWORD` are set.
2. Check Automation Logs for `newsletter.send`.
3. If there are no subscribers, sending returns “No subscribers.”
4. If SMTP authentication fails, verify the Zoho app password.
5. If recipients do not receive email, check spam folders and sending limits.
6. Trigger sending via `GET /api/newsletter/send` with admin access or cron secret.

---

## 9. Website Settings and Branding

### 9.1 How to manage available website settings

1. Open **Settings**.
2. Update fields in each section.
3. Click **Save Settings**.
4. Wait for the success message.

### 9.2 How to update publication information

- **Author Photo URL:** Replaces the default portrait in the About section on the homepage.
- **Portfolio URL:** Your portfolio link.
- **Blog name/description:** These are stored in settings/database defaults; the public branding is largely “NEXT DRAFT” in code. Changing the site name globally requires code changes by your developer.

### 9.3 How Next Draft name, logo, tagline, and SEO details are configured

- The name “NEXT DRAFT” and tagline “Ideas. Intelligence. Impact.” are set in application code and templates.
- SEO details per article are set in the Editor (SEO Title, Meta Description, keywords generated by AI).
- Site-wide SEO defaults are in code. Contact your developer to change the site name or default metadata.

### 9.4 Which changes are safe for a beginner

- Author photo URL and portfolio URL.
- Optional integration keys (only if you have them).
- Webhook secrets.
- Umami analytics settings.

### 9.5 Which settings should not be modified without technical assistance

- Cron secret and n8n secrets (unless you know the integration).
- Database-related environment variables (not in this UI).
- Any value you do not understand.

If a setting breaks the site, contact your developer.

---
## 10. Supabase and Cloudflare R2 — Simple Explanation

### 10.1 What Supabase does

Supabase is your database and (optionally) file storage. It stores articles, categories, tags, subscribers, settings, logs, and media metadata. It is a hosted Postgres database with an API.

### 10.2 What Cloudflare R2 does

Cloudflare R2 is file storage for uploaded images and PDFs. It is like a private online folder. Next Draft uploads files there and serves them through a proxy link.

### 10.3 Why both are used

- Supabase is great for structured data (articles, settings).
- R2 is great for large files (images, PDFs) and can be cheaper for storage/egress.
- The app can use Supabase Storage instead if R2 is not configured.

### 10.4 Where your articles and media are stored

- Articles, metadata, settings, logs, subscribers: Supabase database.
- Uploaded images/PDFs: Cloudflare R2 if configured; otherwise Supabase Storage.
- Media metadata: database.

### 10.5 Why you should never share service-role keys, API keys, or encryption secrets

These keys give full or powerful access to your data and services. Anyone with them can read, change, or delete your content, or send email as you. Never put them in GitHub, chat, email, or screenshots.

### 10.6 What to do if a service stops working

1. Check Automation Logs and browser error messages.
2. Verify environment variables are set in your hosting platform.
3. Confirm Supabase project is active and credentials are correct.
4. Confirm R2 credentials and bucket exist.
5. Contact your developer with the exact error message and time it happened.

---

## 11. Common Problems and Solutions

### 11.1 Unable to log in

- **Symptom:** “Invalid credentials” or “Admin login is not configured.”
- **Safe to try:** Re-enter password carefully; wait 15 minutes if rate-limited; confirm caps lock; try a different browser.
- **Contact developer if:** The password is definitely correct but login fails, or you see “Admin login is not configured.”

### 11.2 Incorrect authenticator code

- **Symptom:** “Invalid credentials” after entering TOTP.
- **Safe to try:** Wait for the next 30-second code; check your phone’s time is set to automatic; re-enter the secret in a new authenticator entry.
- **Contact developer if:** Codes never work even with correct time.

### 11.3 Lost recovery codes

- **Symptom:** No recovery codes available.
- **Safe to try:** If you still have your authenticator, regenerate new codes in Settings → Security.
- **Contact developer if:** You lost both phone and codes.

### 11.4 Article not saving

- **Symptom:** Error toast or no success message.
- **Safe to try:** Ensure Title and Content are not empty; check internet connection; retry; copy your text into a safe place first.
- **Contact developer if:** Saving fails repeatedly or returns 401/500.

### 11.5 Article not appearing on the homepage

- **Symptom:** Published article not visible.
- **Safe to try:** Confirm status is **published** in Drafts; refresh the page; wait a moment for cache refresh.
- **Contact developer if:** It remains missing after several minutes.

### 11.6 Image upload failure

- **Symptom:** Upload error.
- **Safe to try:** Check file type and size (max 8 MB); retry; try a different image.
- **Contact developer if:** All uploads fail or storage is not configured.

### 11.7 PDF upload failure

- **Symptom:** Upload error for PDF.
- **Safe to try:** Ensure it is a real PDF under 25 MB; retry.
- **Contact developer if:** All PDF uploads fail.

### 11.8 AI generation failure

- **Symptom:** Error toast or mock article returned.
- **Safe to try:** Add Groq/OpenRouter keys in Settings; try a different angle; wait if rate-limited.
- **Contact developer if:** Generation fails with server errors.

### 11.9 Newsletter subscription problems

- **Symptom:** Subscription fails or emails not sent.
- **Safe to try:** Check email format; confirm Zoho variables; check Automation Logs.
- **Contact developer if:** SMTP or database errors persist.

### 11.10 Admin page not loading

- **Symptom:** Blank or error page.
- **Safe to try:** Refresh; clear cache; try incognito; confirm you are logged in.
- **Contact developer if:** The error persists.

### 11.11 Website showing an error

- **Symptom:** Public site error.
- **Safe to try:** Refresh; try another page; wait a few minutes.
- **Contact developer if:** The error persists or affects all pages.

---
## 12. Daily and Weekly Admin Checklist

### Daily checklist (publishing a new article)

- [ ] Log in and check Dashboard counts.
- [ ] Create or open article in Editor.
- [ ] Write/edit content and excerpt.
- [ ] Choose section and hashtags.
- [ ] Upload or select cover image.
- [ ] Fill SEO title/description.
- [ ] Save Draft.
- [ ] Preview full article.
- [ ] Publish only if ready.
- [ ] View the live article.
- [ ] Check Automation Logs if anything failed.

### Website review checklist

- [ ] Open the homepage.
- [ ] Open one article from each section.
- [ ] Check images load.
- [ ] Check mobile layout (resize browser).
- [ ] Verify navigation links work.

### Newsletter checklist

- [ ] Confirm subscriber count.
- [ ] Ensure latest articles are published.
- [ ] Trigger newsletter send if scheduled.
- [ ] Check Automation Logs for send status.

### Media checklist

- [ ] Upload needed images/PDFs.
- [ ] Remove unused files.
- [ ] Confirm media URLs work.

### Security checklist

- [ ] Log out when finished.
- [ ] Do not leave admin open on shared computers.
- [ ] Keep recovery codes secure.
- [ ] Review for unauthorized changes.

### Backup/protection checklist

- [ ] Keep a copy of your recovery codes.
- [ ] Keep environment secrets in a secure password manager.
- [ ] Do not commit `.env.local` to GitHub.
- [ ] Ask your developer to back up the database regularly.

---
## 13. Important Security Rules

1. **Never share admin passwords.**
2. **Never share 2FA codes.**
3. **Never share recovery codes.**
4. **Never commit `.env.local` to GitHub.**
5. **Never expose Supabase service-role keys.**
6. **Always use strong, unique passwords.**
7. **Keep recovery codes in a secure location.**
8. **Log out on shared computers.**
9. **Do not paste secrets into chat, email, or tickets.**
10. **Do not share webhook URLs publicly.**

---
## Appendix A. Admin Routes and Screens

| Route | Purpose |
| --- | --- |
| `/` | Public homepage |
| `/admin/login` | Admin login |
| `/admin` | Studio dashboard |
| `/admin/analytics` | Analytics page |
| `/article/[slug]` | Public article page |
| `/category/[slug]` | Public category page |
| `/journal` | Public journal page |
| `/newsletter` | Public newsletter page |

---
## Appendix B. Features Not Yet Implemented

The following are **not** currently available in the dashboard. Do not look for them:

- Self-service password change or password reset.
- Manual URL slug editing.
- Author selection per article.
- Assigning editorial categories or Tags-admin tags to articles in the Editor.
- Drag-and-drop content calendar scheduling.
- Subscriber management/unsubscribe UI.
- Journal entry creation in the admin screen.
- QR code image for 2FA setup (manual key entry is used).
- “Revoke all sessions” button (backend function exists but no UI button).
- Automatic publishing from AI or inbox (drafts are created; publishing is manual).

---

*End of Next Draft Admin User Manual.*
