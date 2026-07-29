'use client';
import { useEffect, useState } from 'react';

export default function CursorGlow() {
  const [pos, setPos] = useState({ x: -999, y: -999 });

  useEffect(() => {
    const handle = (e) => setPos({ x: e.clientX, y: e.clientY });
    window.addEventListener('pointermove', handle, { passive: true });
    return () => window.removeEventListener('pointermove', handle);
  }, []);

  return (
    <div
      className="pointer-events-none fixed inset-0 z-[9999] opacity-60 transition-opacity duration-1000"
      style={{
        background: `radial-gradient(600px circle at ${pos.x}px ${pos.y}px, rgba(79,70,229,0.07), transparent 50%)`,
      }}
      aria-hidden
    />
  );
}