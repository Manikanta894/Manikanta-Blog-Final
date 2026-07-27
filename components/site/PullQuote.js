// Standalone pull-quote block — same visual system (large serif italic in
// --brand-accent, thin accent left border, oversized quotation mark) as the
// blockquotes the markdown renderer auto-generates, via the shared
// `.pull-quote` CSS in globals.css. Use this directly in JSX contexts (e.g.
// hand-built landing sections, admin previews) where the content isn't
// coming through the markdown pipeline.
export default function PullQuote({ children, variant = 'inset', cite }) {
  return (
    <blockquote className={`pull-quote ${variant === 'full' ? 'pull-quote--full' : 'pull-quote--inset'}`}>
      <span className="pull-quote__mark" aria-hidden="true">&#8220;</span>
      <p>{children}</p>
      {cite && <cite className="block not-italic font-mono text-xs tracking-[0.1em] uppercase text-[#555555] mt-3">{cite}</cite>}
    </blockquote>
  );
}
