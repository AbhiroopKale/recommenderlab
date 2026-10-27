import React, { useState } from 'react';
import { Edit2, RotateCcw, Check, Sparkles, AlertCircle } from 'lucide-react';

export default function RatingMatrix({
  matrix = [],
  movies = [],
  targetUserId,
  topKNeighbors = [],
  onRatingChange,
  pendingUpdates = {},
  onResetRatings,
}) {
  const [editingCell, setEditingCell] = useState(null); // { userId, movieId }
  const [tempRating, setTempRating] = useState('5.0');

  const topKUserIds = new Set(topKNeighbors.map((n) => n.user_id));

  const handleCellClick = (userId, movieId, currentVal) => {
    setEditingCell({ userId, movieId });
    setTempRating(currentVal !== null && currentVal !== undefined ? currentVal.toString() : '5.0');
  };

  const handleSaveRating = (userId, movieId) => {
    const val = parseFloat(tempRating);
    if (!isNaN(val) && val >= 0 && val <= 5.0) {
      onRatingChange(userId, movieId, val);
    }
    setEditingCell(null);
  };

  const pendingCount = Object.keys(pendingUpdates).length;

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-lg">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 border-b border-slate-800/80 pb-3">
        <div>
          <h3 className="font-semibold text-slate-100 text-base flex items-center gap-2">
            <span>User-Movie Rating Matrix</span>
            <span className="text-xs font-normal text-slate-400">
              ({matrix.length} Users × {movies.length} Movies)
            </span>
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Click any cell to edit ratings and observe how collaborative filtering predictions dynamically adapt.
          </p>
        </div>

        {pendingCount > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2.5 py-1 rounded-full font-medium">
              {pendingCount} rating{pendingCount > 1 ? 's' : ''} modified
            </span>
            <button
              onClick={onResetRatings}
              className="flex items-center gap-1 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-2.5 py-1 rounded-lg border border-slate-700 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 mb-3 px-1">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-indigo-500 border border-indigo-400 ring-2 ring-indigo-500/30" />
          <span className="text-slate-300 font-medium">Target User</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-cyan-500/80 border border-cyan-400" />
          <span className="text-slate-300 font-medium">Top-K Neighbor</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-amber-500/30 border border-amber-500/50" />
          <span>Edited Cell</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-slate-500">-</span>
          <span>Unrated (Missing NaN)</span>
        </div>
      </div>

      {/* Scrollable Matrix Table */}
      <div className="overflow-x-auto max-h-[460px] border border-slate-800 rounded-lg">
        <table className="w-full text-xs text-left border-collapse select-none">
          <thead className="bg-slate-950 text-slate-400 sticky top-0 z-20 border-b border-slate-800">
            <tr>
              <th className="py-2.5 px-3 font-semibold sticky left-0 bg-slate-950 z-30 border-r border-slate-800 min-w-[100px]">
                User
              </th>
              {movies.map((m) => (
                <th
                  key={m.movie_id}
                  title={`${m.title} (${m.year}) - ${m.genres_str || m.genres?.join(', ')}`}
                  className="py-2.5 px-2 font-medium text-center min-w-[70px] max-w-[90px] truncate border-r border-slate-800/60"
                >
                  <span className="block truncate text-slate-300">{m.title}</span>
                  <span className="text-[10px] text-slate-500">#{m.movie_id}</span>
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-800/60">
            {matrix.map((row) => {
              const uid = row.user_id;
              const isTarget = uid === targetUserId;
              const isTopK = topKUserIds.has(uid);

              let rowClass = "hover:bg-slate-800/40 transition-colors";
              if (isTarget) rowClass = "bg-indigo-950/40 hover:bg-indigo-950/60 font-semibold";
              else if (isTopK) rowClass = "bg-cyan-950/20 hover:bg-cyan-950/40";

              return (
                <tr key={uid} className={rowClass}>
                  {/* Sticky User Label Column */}
                  <td
                    className={`py-2 px-3 sticky left-0 z-10 border-r border-slate-800 font-medium ${
                      isTarget
                        ? 'bg-indigo-950/90 text-indigo-300 border-l-4 border-l-indigo-500'
                        : isTopK
                        ? 'bg-cyan-950/90 text-cyan-300 border-l-4 border-l-cyan-500'
                        : 'bg-slate-900 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>User {uid}</span>
                      {isTarget && (
                        <span className="text-[9px] bg-indigo-500/30 text-indigo-300 px-1 py-0.2 rounded uppercase">
                          Target
                        </span>
                      )}
                      {!isTarget && isTopK && (
                        <span className="text-[9px] bg-cyan-500/30 text-cyan-300 px-1 py-0.2 rounded uppercase">
                          Top-K
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Rating Cells */}
                  {movies.map((m) => {
                    const mid = m.movie_id;
                    const ratingKey = `${uid}_${mid}`;
                    const isPending = pendingUpdates[ratingKey] !== undefined;
                    const rawVal = isPending ? pendingUpdates[ratingKey] : row[mid.toString()];
                    const hasVal = rawVal !== null && rawVal !== undefined && !isNaN(rawVal);
                    const isEditing = editingCell && editingCell.userId === uid && editingCell.movieId === mid;

                    return (
                      <td
                        key={mid}
                        onClick={() => handleCellClick(uid, mid, rawVal)}
                        className={`py-1.5 px-1 text-center border-r border-slate-800/40 cursor-pointer transition-colors relative ${
                          isPending ? 'bg-amber-500/15' : ''
                        } hover:bg-indigo-600/20`}
                      >
                        {isEditing ? (
                          <div
                            className="flex items-center justify-center gap-1 z-30"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <input
                              type="number"
                              min="0"
                              max="5"
                              step="0.5"
                              autoFocus
                              value={tempRating}
                              onChange={(e) => setTempRating(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSaveRating(uid, mid);
                                if (e.key === 'Escape') setEditingCell(null);
                              }}
                              className="w-12 text-center bg-slate-950 border border-indigo-400 text-white rounded px-1 py-0.5 text-xs focus:outline-none"
                            />
                            <button
                              onClick={() => handleSaveRating(uid, mid)}
                              className="bg-indigo-600 text-white p-0.5 rounded hover:bg-indigo-500"
                            >
                              <Check className="w-3 h-3" />
                            </button>
                          </div>
                        ) : hasVal ? (
                          <span
                            className={`inline-block font-mono font-medium rounded px-1.5 py-0.5 text-[11px] ${
                              rawVal >= 4.5
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : rawVal >= 3.0
                                ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                                : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            }`}
                          >
                            {Number(rawVal).toFixed(1)}★
                          </span>
                        ) : (
                          <span className="text-slate-600">-</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
