import React, { useState } from 'react';
import { Star, Percent, Info, ChevronDown, ChevronUp, Sparkles, Users } from 'lucide-react';
import PosterImage from './PosterImage';

export default function MovieCard({
  movie,
  rank,
  type = 'collaborative', // 'collaborative' | 'content' | 'general'
  similarity,
  predictedRating,
  reason,
  breakdown,
  sharedGenres = [],
}) {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden hover:border-slate-700 transition-all duration-200 shadow-lg flex flex-col group">
      {/* Top Banner with Rank and Scores */}
      <div className="relative aspect-[16/10] sm:aspect-[16/9] w-full overflow-hidden bg-slate-950">
        <PosterImage
          src={movie.poster_url}
          title={movie.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

        {/* Rank Badge */}
        {rank && (
          <div className="absolute top-2.5 left-2.5 bg-indigo-600/90 text-white font-bold text-xs px-2.5 py-1 rounded-full shadow-md backdrop-blur-sm border border-indigo-400/30 flex items-center gap-1">
            <span>#{rank}</span>
          </div>
        )}

        {/* Metric Badges */}
        <div className="absolute top-2.5 right-2.5 flex flex-col gap-1 items-end">
          {predictedRating !== undefined && (
            <div className="bg-amber-500/90 text-slate-950 font-bold text-xs px-2.5 py-1 rounded-full shadow-md backdrop-blur-sm flex items-center gap-1">
              <Star className="w-3.5 h-3.5 fill-current" />
              <span>{predictedRating.toFixed(2)} ★</span>
            </div>
          )}

          {similarity !== undefined && (
            <div className="bg-cyan-500/90 text-slate-950 font-bold text-xs px-2.5 py-1 rounded-full shadow-md backdrop-blur-sm flex items-center gap-1">
              <Percent className="w-3 h-3" />
              <span>{(similarity * 100).toFixed(1)}% Match</span>
            </div>
          )}
        </div>

        {/* Bottom Title inside Image overlay */}
        <div className="absolute bottom-2 left-3 right-3">
          <h3 className="font-semibold text-slate-100 text-sm sm:text-base leading-tight drop-shadow-md line-clamp-1">
            {movie.title}
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">{movie.year}</p>
        </div>
      </div>

      {/* Content Area */}
      <div className="p-3.5 flex-1 flex flex-col justify-between">
        {/* Genre Tags */}
        <div className="flex flex-wrap gap-1 mb-2.5">
          {(movie.genres || []).map((genre) => {
            const isShared = sharedGenres.includes(genre);
            return (
              <span
                key={genre}
                className={`text-[11px] px-2 py-0.5 rounded-full font-medium transition-colors ${
                  isShared
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                    : 'bg-slate-800 text-slate-400 border border-slate-700/50'
                }`}
              >
                {isShared && '✓ '}
                {genre}
              </span>
            );
          })}
        </div>

        {/* Overview snippet if available */}
        {movie.overview && (
          <p className="text-xs text-slate-400 line-clamp-2 mb-3 leading-relaxed">
            {movie.overview}
          </p>
        )}

        {/* Pedagogical Explanation Snippet */}
        {reason && (
          <div className="mt-auto pt-2 border-t border-slate-800/80">
            <div className="bg-slate-950/60 rounded-lg p-2.5 border border-slate-800 text-xs">
              <div className="flex items-start gap-1.5 text-slate-300">
                <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-[11px] font-medium text-slate-300 leading-normal">
                    {reason}
                  </p>
                </div>
              </div>

              {/* Expandable Mathematical Breakdown */}
              {breakdown && (
                <div className="mt-2">
                  <button
                    onClick={() => setShowDetails(!showDetails)}
                    className="text-[10px] text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <span>{showDetails ? 'Hide calculation details' : 'Show calculation breakdown'}</span>
                    {showDetails ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  </button>

                  {showDetails && (
                    <div className="mt-2 pt-2 border-t border-slate-800/60 font-mono text-[10px] text-slate-400 space-y-1">
                      <div className="text-slate-300">
                        Formula: <span className="text-amber-300">{breakdown.formula || ''}</span>
                      </div>
                      {movie.contributing_neighbors && (
                        <div className="mt-1 space-y-0.5">
                          <span className="text-slate-500 block">Contributing Neighbors:</span>
                          {movie.contributing_neighbors.map((n) => (
                            <div key={n.user_id} className="flex justify-between text-slate-300">
                              <span>User {n.user_id} (sim: {n.similarity})</span>
                              <span>gave {n.rating}★ → {n.weighted_score}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
