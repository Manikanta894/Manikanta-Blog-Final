// Thin decorative divider that separates sections within an article or
// listing page. Shares the `.hairline` CSS in globals.css.
export default function SectionRule({ className = '' }) {
  return <div className={`hairline my-8 ${className}`} aria-hidden="true" />;
}
