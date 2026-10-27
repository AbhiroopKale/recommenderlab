import React, { useState, useEffect } from 'react';
import { 
  GitCompare, 
  Users, 
  Film, 
  Sparkles, 
  AlertCircle, 
  Loader2, 
  Layers, 
  ArrowRight, 
  CheckCircle2, 
  HelpCircle,
  Zap,
  Info
} from 'lucide-react';
import { fetchUsers, fetchMovies, fetchUserRatings, compareAlgorithms } from '../services/api';
import MovieCard from '../components/MovieCard';
import PosterImage from '../components/PosterImage';

export default function ComparisonPage() {
  const [users, setUsers] = useState([]);
  const [userRatings, setUserRatings] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(1);
  const [selectedMovieId, setSelectedMovieId] = useState(1);
  const [kValue, setKValue] = useState(3);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [comparison, setComparison] = useState(null);

  // Load users initially
  useEffect(() => {
    async function loadInitial() {
      try {
        setLoading(true);
        const usersData = await fetchUsers();
        setUsers(usersData);
        if (usersData.length > 0) {
          setSelectedUserId(usersData[0].user_id);
        }
      } catch (err) {
        setError("Failed to load users: " + (err.response?.data?.error || err.message));
      } finally {
        setLoading(false);
      }
    }
    loadInitial();
  }, []);

  // When selected user changes, fetch their rated movies to populate the Seed Movie selector
  useEffect(() => {
    async function loadRatings() {
      if (!selectedUserId) return;
      try {
        const ratings = await fetchUserRatings(selectedUserId);
        setUserRatings(ratings);
        // Pre-select the highest rated movie from their history
        if (ratings.length > 0) {
          setSelectedMovieId(ratings[0].movie_id);
        }
      } catch (err) {
        console.error("Error loading user ratings:", err);
      }
    }
    loadRatings();
  }, [selectedUserId]);

  // Run comparative experiment
  const runComparison = async (userId = selectedUserId, movieId = selectedMovieId, k = kValue) => {
    if (!userId || !movieId) return;
    try {
      setLoading(true);
      setError(null);
      const data = await compareAlgorithms({
        userId,
        movieId,
        k,
        topN: 5,
      });
      setComparison(data);
    } catch (err) {
      setError(err.response?.data?.error || err.message || "Failed to compare algorithms.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedUserId && selectedMovieId) {
      runComparison(selectedUserId, selectedMovieId, kValue);
    }
  }, [selectedUserId, selectedMovieId, kValue]);

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-16">
      {/* Header */}
      <div className="border-b border-slate-800 pb-5">
        <div className="flex items-center gap-2.5 mb-2">
          <div className="w-9 h-9 rounded-xl bg-purple-600/20 border border-purple-500/40 flex items-center justify-center text-purple-400">
            <GitCompare className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Algorithm Comparison Lab
            </h1>
            <p className="text-xs sm:text-sm text-slate-400">
              Benchmark social collaborative filtering against item metadata content-based filtering.
            </p>
          </div>
        </div>
      </div>

      {/* Control Selector Panel */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
          {/* User Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              1. Target User (Collaborative Input)
            </label>
            <select
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(parseInt(e.target.value))}
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
            >
              {users.map((u) => (
                <option key={u.user_id} value={u.user_id}>
                  User {u.user_id} — {u.persona_summary}
                </option>
              ))}
            </select>
            <p className="text-[11px] text-slate-400 mt-1">
              Provides community rating vector & taste neighborhood.
            </p>
          </div>

          {/* Seed Movie Selector (Chosen from User's Liked Movies) */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              2. Seed Movie (Content-Based Input)
            </label>
            <select
              value={selectedMovieId}
              onChange={(e) => setSelectedMovieId(parseInt(e.target.value))}
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-cyan-500 transition-colors"
            >
              {userRatings.map((r) => (
                <option key={r.movie_id} value={r.movie_id}>
                  {r.title} ({r.rating}★) — [{r.genres?.join(', ')}]
                </option>
              ))}
            </select>
            <p className="text-[11px] text-slate-400 mt-1">
              Select one of User {selectedUserId}'s rated films as the genre anchor.
            </p>
          </div>

          {/* Run Button */}
          <div>
            <button
              onClick={() => runComparison(selectedUserId, selectedMovieId, kValue)}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 text-white font-semibold py-2.5 px-4 rounded-xl shadow-lg transition-all text-xs cursor-pointer"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <GitCompare className="w-4 h-4" />}
              <span>{loading ? 'Running Comparison...' : 'Compare Algorithms'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-rose-950/40 border border-rose-500/40 text-rose-300 rounded-xl p-4 flex items-center gap-3 text-xs">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      {/* Overlap & Difference Summary Metrics */}
      {comparison && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Overlap Card */}
          <div className="bg-slate-900/90 border border-emerald-500/40 rounded-xl p-4 shadow-lg flex items-center justify-between">
            <div>
              <span className="text-[11px] uppercase tracking-wider font-semibold text-emerald-400">
                Shared Recommendations (Overlap)
              </span>
              <p className="text-2xl font-bold text-white mt-1">
                {comparison.overlap_count} Movie{comparison.overlap_count !== 1 ? 's' : ''}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Recommended by both algorithms
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              {comparison.overlap_count}
            </div>
          </div>

          {/* Collaborative Only Card */}
          <div className="bg-slate-900/90 border border-indigo-500/40 rounded-xl p-4 shadow-lg flex items-center justify-between">
            <div>
              <span className="text-[11px] uppercase tracking-wider font-semibold text-indigo-400">
                Collaborative Only
              </span>
              <p className="text-2xl font-bold text-white mt-1">
                {comparison.collaborative_only_count} Movie{comparison.collaborative_only_count !== 1 ? 's' : ''}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Driven by peer ratings / social signal
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold">
              {comparison.collaborative_only_count}
            </div>
          </div>

          {/* Content-Based Only Card */}
          <div className="bg-slate-900/90 border border-cyan-500/40 rounded-xl p-4 shadow-lg flex items-center justify-between">
            <div>
              <span className="text-[11px] uppercase tracking-wider font-semibold text-cyan-400">
                Content-Based Only
              </span>
              <p className="text-2xl font-bold text-white mt-1">
                {comparison.content_only_count} Movie{comparison.content_only_count !== 1 ? 's' : ''}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Driven strictly by genre matching
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold">
              {comparison.content_only_count}
            </div>
          </div>
        </div>
      )}

      {/* Shared Overlap Movies Spotlight (if any) */}
      {comparison && comparison.overlap_movies && comparison.overlap_movies.length > 0 && (
        <div className="bg-slate-900/90 border border-emerald-500/30 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center gap-2 mb-3 border-b border-slate-800 pb-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-white text-base">
              Dual-Consensus Recommendations (In Both Algorithm Top-5s)
            </h3>
          </div>
          <p className="text-xs text-slate-300 mb-4">
            These movies satisfy both criteria: they align with the genre characteristics of '{comparison.selected_movie?.title}' 
            AND are strongly endorsed by User {comparison.user_id}'s nearest neighbors.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {comparison.overlap_movies.map((m) => (
              <div
                key={m.movie_id}
                className="bg-slate-950/80 border border-emerald-500/40 rounded-xl p-3 flex gap-3 items-center"
              >
                <div className="w-16 h-20 shrink-0 rounded-lg overflow-hidden border border-slate-800">
                  <PosterImage
                    src={m.poster_url}
                    title={m.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-slate-100 text-xs truncate">{m.title}</h4>
                  <p className="text-[10px] text-slate-400 truncate">{m.genres?.join(', ')}</p>
                  <div className="mt-2 flex flex-col gap-1 text-[10px]">
                    <span className="text-indigo-400 font-medium">
                      CF Rank #{m.collaborative_rank} ({m.collaborative_predicted_rating}★)
                    </span>
                    <span className="text-cyan-400 font-medium">
                      CB Rank #{m.content_rank} ({(m.content_similarity * 100).toFixed(0)}% Match)
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Side-by-Side Dual Column View */}
      {comparison && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column: Collaborative Filtering */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-indigo-500/30 pb-2">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-400" />
                <h3 className="font-bold text-white text-base">
                  Collaborative Filtering Results
                </h3>
              </div>
              <span className="text-xs text-indigo-300 bg-indigo-500/20 px-2.5 py-0.5 rounded-full font-semibold">
                Social Opinion
              </span>
            </div>

            <div className="space-y-3">
              {comparison.collaborative_recommendations.map((rec) => {
                const isShared = comparison.overlap_movies.some((o) => o.movie_id === rec.movie_id);
                return (
                  <div
                    key={rec.movie_id}
                    className={`bg-slate-900/90 border rounded-xl p-3.5 flex gap-3 transition-all ${
                      isShared
                        ? 'border-emerald-500/40 bg-emerald-950/10'
                        : 'border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="w-16 h-20 shrink-0 rounded-lg overflow-hidden border border-slate-800">
                      <PosterImage
                        src={rec.poster_url}
                        title={rec.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between gap-1">
                          <h4 className="font-semibold text-slate-100 text-xs truncate">
                            #{rec.rank} {rec.title} ({rec.year})
                          </h4>
                          <span className="text-xs font-bold text-amber-400 shrink-0">
                            {rec.predicted_rating}★
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 truncate mt-0.5">
                          {rec.genres?.join(', ')}
                        </p>
                      </div>
                      <p className="text-[11px] text-slate-400 line-clamp-1 mt-1">
                        {rec.reason}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Content-Based Filtering */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-cyan-500/30 pb-2">
              <div className="flex items-center gap-2">
                <Film className="w-5 h-5 text-cyan-400" />
                <h3 className="font-bold text-white text-base">
                  Content-Based Filtering Results
                </h3>
              </div>
              <span className="text-xs text-cyan-300 bg-cyan-500/20 px-2.5 py-0.5 rounded-full font-semibold">
                Genre Fingerprint
              </span>
            </div>

            <div className="space-y-3">
              {comparison.content_recommendations.map((rec) => {
                const isShared = comparison.overlap_movies.some((o) => o.movie_id === rec.movie_id);
                return (
                  <div
                    key={rec.movie_id}
                    className={`bg-slate-900/90 border rounded-xl p-3.5 flex gap-3 transition-all ${
                      isShared
                        ? 'border-emerald-500/40 bg-emerald-950/10'
                        : 'border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="w-16 h-20 shrink-0 rounded-lg overflow-hidden border border-slate-800">
                      <PosterImage
                        src={rec.poster_url}
                        title={rec.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between gap-1">
                          <h4 className="font-semibold text-slate-100 text-xs truncate">
                            #{rec.rank} {rec.title} ({rec.year})
                          </h4>
                          <span className="text-xs font-bold text-cyan-400 shrink-0">
                            {(rec.similarity * 100).toFixed(0)}% Match
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 truncate mt-0.5">
                          {rec.genres?.join(', ')}
                        </p>
                      </div>
                      <p className="text-[11px] text-slate-400 line-clamp-1 mt-1">
                        {rec.explanation}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Deep-Dive Pedagogical Insights */}
      {comparison && comparison.pedagogical_insights && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center gap-2 mb-4 border-b border-slate-800 pb-3">
            <Zap className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-white text-base">
              Why Do These Recommendations Differ? — Theoretical Insights
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {comparison.pedagogical_insights.map((insight, idx) => (
              <div
                key={idx}
                className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between text-xs"
              >
                <div>
                  <h4 className="font-bold text-indigo-300 text-sm mb-2">
                    {insight.category}
                  </h4>
                  <div className="space-y-2 text-slate-300 mb-3">
                    <p>
                      <strong className="text-indigo-400">Collaborative:</strong> {insight.collaborative}
                    </p>
                    <p>
                      <strong className="text-cyan-400">Content-Based:</strong> {insight.content_based}
                    </p>
                  </div>
                </div>
                <div className="pt-2.5 border-t border-slate-800/80 text-[11px] text-amber-300 font-medium">
                  Takeaway: {insight.takeaway}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
