import { getDailyQuote } from '@/lib/quotes';

export default function QuoteOfTheDay() {
  const quote = getDailyQuote();

  return (
    <section className="max-w-[1200px] mx-auto px-5 py-10">
      <div className="relative rounded-2xl border border-[--brand-border] p-8 md:p-10 text-center overflow-hidden">
        <div className="absolute top-4 left-6 text-[100px] leading-none text-[--brand-border] font-serif select-none">&ldquo;</div>
        <blockquote className="relative z-10 max-w-2xl mx-auto">
          <p className="font-display italic text-[clamp(20px,3vw,28px)] leading-relaxed text-[--brand-text]">
            {quote.text}
          </p>
          <footer className="mt-5">
            <span className="text-sm font-medium text-[--brand-text-secondary] tracking-wide">
              — {quote.author}
            </span>
          </footer>
        </blockquote>
      </div>
    </section>
  );
}
