import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Play, 
  RotateCcw, 
  Sliders, 
  Star, 
  Sparkles, 
  AlertCircle, 
  Loader2, 
  BarChart3, 
  Eye, 
  ChevronRight,
  TrendingUp,
  Info
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  Cell, 
  CartesianGrid 
} from 'recharts';
import { 
  fetchUsers, 
  fetchMovies, 
  fetchCollaborativeRecommendations, 
  fetchUserRatings 
} from '../services/api';
import MovieCard from '../components/MovieCard';
import RatingMatrix from '../components/RatingMatrix';
import ExplanationPanel from '../components/ExplanationPanel';

export default function CollaborativePage() {
  const [users, setUsers] = useState([]);
  const [movies, setMovies] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(1);
  const [kValue, setKValue] = useState(3);
  const [pendingRatingUpdates, setPendingRatingUpdates] = useState({}); // { `${userId}_${movieId}`: rating }
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  // Load initial users and movies catalog
  useEffect(() => {
    async function initData() {
      try {
        setLoading(true);
        const [usersData, moviesData] = await Promise.all([fetchUsers(), fetchMovies()]);
        setUsers(usersData);
        setMovies(moviesData);
        if (usersData.length > 0) {
          setSelectedUserId(usersData[0].user_id);
        }
      } catch (err) {
        setError("Failed to load initial lab data from backend: " + (err.response?.data?.error || err.message));
      } finally {
        setLoading(false);
      }
    }
    initData();
  }, []);

  // Run simulation whenever selected user, K, or manual simulation trigger runs
  const runSimulation = async (targetId = selectedUserId, k = kValue, updates = pendingRatingUpdates) => {
    try {
      setLoading(true);
      setError(null);

      // Convert updates dictionary into array format for API
      const updatesList = Object.entries(updates).map(([key, rating]) => {
        const [uid, mid] = key.split('_');
        return {
          user_id: parseInt(uid),
          movie_id: parseInt(mid),
          rating: parseFloat(rating)
        };
      });

      const data = await fetchCollaborativeRecommendations({
        userId: targetId,
        k: k,
        ratingsUpdates: updatesList,
        topN: 5
      });
      setResult(data);
    } catch (err) {
      setError(err.response?.data?.error || err.message || "Failed to calculate recommendations.");
    } finally {
      setLoading(false);
    }
  };

  // Run simulation on user or K change once users are loaded
  useEffect(() => {
    if (users.length > 0 && selectedUserId) {
      runSimulation(selectedUserId, kValue, pendingRatingUpdates);
    }
  }, [selectedUserId, kValue]);

  // Handle cell rating changes from RatingMatrix
  const handleRatingChange = (uid, mid, newRating) => {
    const key = `${uid}_${mid}`;
    const nextUpdates = { ...pendingRatingUpdates, [key]: newRating };
    setPendingRatingUpdates(nextUpdates);
    // Auto re-run simulation with modified ratings
    runSimulation(selectedUserId, kValue, nextUpdates);
  };

  const handleResetRatings = () => {
    setPendingRatingUpdates({});
    runSimulation(selectedUserId, kValue, {});
  };

  const selectedUserObj = users.find((u) => u.user_id === selectedUserId);

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-16">
      {/* Page Header */}
      <div className="border-b border-slate-800 pb-5">
        <div className="flex items-center gap-2.5 mb-2">
          <div className="w-9 h-9 rounded-xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              User-Based Collaborative Filtering Lab
            </h1>
            <p className="text-xs sm:text-sm text-slate-400">
              Simulate how shared user opinions produce personalized movie predictions.
            </p>
          </div>
        </div>
      </div>

      {/* Control Panel Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
          {/* Target User Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              1. Select Target User
            </label>
            <select
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(parseInt(e.target.value))}
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
            >
              {users.map((u) => (
                <option key={u.user_id} value={u.user_id}>
                  User {u.user_id} — {u.persona_summary} ({u.ratings_count} ratings)
                </option>
              ))}
            </select>
            {selectedUserObj && (
              <p className="text-[11px] text-slate-400 mt-1.5 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-indigo-400" />
                <span>{selectedUserObj.persona_summary} (Avg: {selectedUserObj.avg_rating}★)</span>
              </p>
            )}
          </div>

          {/* K-Nearest Neighbor Slider */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-indigo-400" />
                <span>2. Neighbors Parameter (K = {kValue})</span>
              </label>
              <span className="text-xs font-bold bg-indigo-600/30 text-indigo-300 px-2 py-0.5 rounded border border-indigo-500/40">
                K = {kValue}
              </span>
            </div>
            <input
              type="range"
              min="1"
              max={Math.max(1, users.length - 1 || 8)}
              step="1"
              value={kValue}
              onChange={(e) => setKValue(parseInt(e.target.value))}
              className="w-full h-2 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
            <div className="flex justify-between text-[10px] text-slate-500 mt-1">
              <span>1 Neighbor</span>
              <span>K={kValue}</span>
              <span>{Math.max(1, users.length - 1 || 8)} Neighbors</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => runSimulation(selectedUserId, kValue, pendingRatingUpdates)}
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold py-2.5 px-4 rounded-xl shadow-lg shadow-indigo-600/25 transition-all text-xs cursor-pointer"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-current" />}
              <span>{loading ? 'Computing...' : 'Run Simulation'}</span>
            </button>

            {Object.keys(pendingRatingUpdates).length > 0 && (
              <button
                onClick={handleResetRatings}
                title="Reset modified ratings back to original"
                className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 py-2.5 px-3 rounded-xl text-xs transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="bg-rose-950/40 border border-rose-500/40 text-rose-300 rounded-xl p-4 flex items-center gap-3 text-xs">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      {/* Top 5 Recommendations Grid */}
      {result && result.recommendations && (
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Top 5 Recommended Movies for User {selectedUserId}</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Ranked by weighted average predicted rating from Top {kValue} nearest neighbors.
              </p>
            </div>
            <span className="text-xs bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 font-semibold px-2.5 py-1 rounded-full">
              K = {result.k} Neighbors Active
            </span>
          </div>

          {result.recommendations.length === 0 ? (
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-8 text-center text-slate-400 text-xs">
              No unseen movies could be predicted with current neighbors. Try increasing K or adding co-ratings.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {result.recommendations.map((rec) => (
                <MovieCard
                  key={rec.movie_id}
                  movie={rec}
                  rank={rec.rank}
                  type="collaborative"
                  predictedRating={rec.predicted_rating}
                  reason={rec.reason}
                  breakdown={rec.calculation_breakdown}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Nearest Neighbors & Similarity Scores Chart */}
      {result && result.all_similarities && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Similarity Scores Bar Chart */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3 border-b border-slate-800/80 pb-2">
                <h3 className="font-semibold text-slate-100 text-sm flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-indigo-400" />
                  <span>Neighbor Taste Similarity Scores</span>
                </h3>
                <span className="text-[11px] text-slate-400 font-mono">
                  Cosine sim over co-rated movies
                </span>
              </div>
              <p className="text-xs text-slate-400 mb-4">
                Users highlighted in indigo are within the top <strong className="text-indigo-300">K={kValue}</strong> nearest neighbors.
              </p>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={result.all_similarities.map((s, idx) => ({
                      name: `User ${s.user_id}`,
                      similarity: s.similarity,
                      isTopK: idx < kValue && s.similarity > 0,
                      coRated: s.co_rated_count
                    }))}
                    margin={{ top: 10, right: 10, left: -20, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 10 }} />
                    <YAxis domain={[0, 1]} stroke="#64748b" tick={{ fontSize: 10 }} />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const item = payload[0].payload;
                          return (
                            <div className="bg-slate-950 border border-slate-800 p-2.5 rounded-lg shadow-xl text-xs">
                              <p className="font-bold text-slate-200">{item.name}</p>
                              <p className="text-indigo-400 font-mono mt-1">Cosine Sim: {item.similarity}</p>
                              <p className="text-slate-400 text-[11px]">Co-rated Movies: {item.coRated}</p>
                              <p className="text-[11px] mt-1 font-semibold text-amber-400">
                                {item.isTopK ? '✓ Included in Top-K' : 'Excluded from Top-K'}
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar dataKey="similarity" radius={[4, 4, 0, 0]}>
                      {result.all_similarities.map((s, idx) => {
                        const isTop = idx < kValue && s.similarity > 0;
                        return (
                          <Cell
                            key={`cell-${idx}`}
                            fill={isTop ? '#6366f1' : '#334155'}
                          />
                        );
                      })}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-indigo-500" />
                <span>Selected Neighbors (K={kValue})</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-slate-600" />
                <span>Other Users</span>
              </span>
            </div>
          </div>

          {/* Target User's Current Ratings */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3 border-b border-slate-800/80 pb-2">
                <h3 className="font-semibold text-slate-100 text-sm flex items-center gap-2">
                  <Star className="w-4 h-4 text-amber-400 fill-current" />
                  <span>User {selectedUserId}'s Watch History & Ratings</span>
                </h3>
                <span className="text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded">
                  {result.target_rated_movies?.length || 0} Rated
                </span>
              </div>
              <p className="text-xs text-slate-400 mb-3">
                Collaborative filtering only suggests movies this user has <em>not</em> yet rated.
              </p>

              <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
                {(result.target_rated_movies || []).map((m) => (
                  <div
                    key={m.movie_id}
                    className="flex items-center justify-between bg-slate-950/70 border border-slate-800/80 rounded-lg p-2 text-xs"
                  >
                    <div>
                      <p className="font-semibold text-slate-200">{m.title}</p>
                      <p className="text-[10px] text-slate-400">{m.genres?.join(', ')}</p>
                    </div>
                    <div className="flex items-center gap-1 font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                      <span>{m.rating.toFixed(1)}</span>
                      <Star className="w-3 h-3 fill-current" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-slate-800/80 text-[11px] text-slate-500">
              Total movies unrated in catalog: {result.total_movies - (result.target_rated_movies?.length || 0)}
            </div>
          </div>
        </div>
      )}

      {/* Step-by-Step Educational Stepper */}
      {result && result.workflow_steps && (
        <ExplanationPanel
          steps={result.workflow_steps}
          title="Collaborative Filtering Step-by-Step Calculation Trace"
        />
      )}

      {/* Interactive Rating Matrix */}
      {result && result.rating_matrix && (
        <RatingMatrix
          matrix={result.rating_matrix}
          movies={movies}
          targetUserId={selectedUserId}
          topKNeighbors={result.top_k_neighbors || []}
          onRatingChange={handleRatingChange}
          pendingUpdates={pendingRatingUpdates}
          onResetRatings={handleResetRatings}
        />
      )}
    </div>
  );
}
