'use client';
import { useEffect, useRef, useState } from 'react';

export default function Reveal({ children, className = '', delay = 0, duration = 700 }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(30px)',
        transition: `opacity ${duration}ms cubic-bezier(0.22, 1, 0.36, 1), transform ${duration}ms cubic-bezier(0.22, 1, 0.36, 1)`,
        transitionDelay: `${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}