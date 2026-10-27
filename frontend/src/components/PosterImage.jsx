import React, { useState } from 'react';
import { Film } from 'lucide-react';

export default function PosterImage({ src, alt, className = "", title = "Movie" }) {
  const [hasError, setHasError] = useState(false);

  if (hasError || !src) {
    // Elegant fallback poster with dark gradient and movie initials
    const initials = title
      .split(' ')
      .slice(0, 2)
      .map((w) => w[0])
      .join('')
      .toUpperCase();

    return (
      <div
        className={`flex flex-col items-center justify-center bg-gradient-to-br from-slate-800 to-indigo-950 border border-slate-700/60 text-slate-300 relative overflow-hidden select-none ${className}`}
      >
        <div className="absolute inset-0 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px] opacity-15" />
        <Film className="w-8 h-8 text-indigo-400/70 mb-2" />
        <span className="text-xl font-bold tracking-wider text-slate-200">{initials}</span>
        <span className="text-[11px] text-slate-400 text-center px-2 line-clamp-2 mt-1 z-10 font-medium">
          {title}
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt || title}
      onError={() => setHasError(true)}
      loading="lazy"
      className={`object-cover ${className}`}
    />
  );
}
