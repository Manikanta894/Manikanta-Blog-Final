'use client';
import { useState } from 'react';

export default function ShimmerImage({ src, alt, className = '', wrapperClass = '', style }) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className={`relative overflow-hidden ${wrapperClass}`}>
      {!loaded && <div className="absolute inset-0 shimmer" />}
      <img
        src={src}
        alt={alt}
        style={style}
        className={`${className} transition-opacity duration-500 ${loaded ? 'opacity-100' : 'opacity-0'}`}
        onLoad={() => setLoaded(true)}
        loading="lazy"
      />
    </div>
  );
}
