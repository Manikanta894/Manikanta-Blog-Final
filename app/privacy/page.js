import Nav from '@/components/site/Nav';
import Footer from '@/components/site/Footer';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen">
      <Nav />
      <main className="max-w-[680px] mx-auto px-5 pt-16 pb-24">
        <div className="mb-10">
          <span className="text-sm font-semibold text-[--brand-accent] uppercase tracking-wider">Legal</span>
          <h1 className="cool-hero text-[--brand-text] mt-2">Privacy Policy</h1>
        </div>
        <div className="article-body">
          <p>INSIGHTS respects your privacy. This page explains, in plain language, what we collect and how it's used.</p>
          <h2>What we collect</h2>
          <p>If you subscribe to the newsletter, we store your email address solely to send you INSIGHTS updates. We don't sell or share your data with third parties.</p>
          <h2>Cookies & analytics</h2>
          <p>We may use basic, privacy-respecting analytics to understand which stories resonate — nothing that personally identifies you.</p>
          <h2>Your choices</h2>
          <p>You can unsubscribe from the newsletter at any time using the link in any email we send.</p>
          <h2>Contact</h2>
          <p>Questions about this policy? Reach out via the links on the About page.</p>
        </div>
        <p className="mt-10 text-sm text-[--brand-text-secondary]">Last updated: July 2026</p>
      </main>
      <Footer />
    </div>
  );
}
