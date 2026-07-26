export default function Kicker({ children, className = '', color }) {
  return (
    <span
      className={`inline-block font-mono text-[10px] uppercase tracking-[0.24em] ${color ? '' : 'text-[#555555]'} ${className}`}
      style={color ? { color } : undefined}
    >
      {children}
    </span>
  );
}
