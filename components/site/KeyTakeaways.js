// Boxed callout for a "Key Takeaways" list (or any short stat/summary
// callout) — bordered card in the accent color, standing clearly apart
// from body copy. Shares the `.callout-box` CSS the markdown renderer uses
// for the auto-managed "## Key Takeaways" section, so this component and
// the auto-rendered version always look identical.
export default function KeyTakeaways({ items = [], label = 'Key Takeaways' }) {
  if (!items?.length) return null;
  return (
    <div className="callout-box">
      <div className="callout-box__label">{label}</div>
      <ul className="callout-box__list">
        {items.map((item, i) => <li key={i}>{item}</li>)}
      </ul>
    </div>
  );
}

// Alias — same component, named for the "stat callout" use case (a single
// notable figure/claim rather than a takeaways list).
export function StatCallout({ items = [], label = 'By The Numbers' }) {
  return <KeyTakeaways items={items} label={label} />;
}
