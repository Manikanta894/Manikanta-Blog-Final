import Nav from '@/components/site/Nav';
import Footer from '@/components/site/Footer';
import WhosBehindInsights from '@/components/site/WhosBehindInsights';

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      <Nav />
      <WhosBehindInsights />
      <Footer />
    </div>
  );
}
