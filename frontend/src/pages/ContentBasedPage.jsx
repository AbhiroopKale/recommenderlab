import React, { useState, useEffect } from 'react';
import { 
  Film, 
  Play, 
  Sparkles, 
  AlertCircle, 
  Loader2, 
  BarChart3, 
  Binary, 
  Check, 
  X,
  Layers,
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
import { fetchMovies, fetchContentRecommendations } from '../services/api';
import MovieCard from '../components/MovieCard';
import PosterImage from '../components/PosterImage';
import ExplanationPanel from '../components/ExplanationPanel';

export default function ContentBasedPage() {
  const [movies, setMovies] = useState([]);
  const [selectedMovieId, setSelectedMovieId] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  // Load initial movies catalog
  useEffect(() => {
    async function loadCatalog() {
      try {
        setLoading(true);
        const moviesData = await fetchMovies();
        setMovies(moviesData);
        if (moviesData.length > 0) {
          setSelectedMovieId(moviesData[0].movie_id);
        }
      } catch (err) {
        setError("Failed to load movies from backend: " + (err.response?.data?.error || err.message));
      } finally {
        setLoading(false);
      }
    }
    loadCatalog();
  }, []);

  // Run content-based recommendation
  const runSimulation = async (movieId = selectedMovieId) => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchContentRecommendations({
        movieId: movieId,
        topN: 5
      });
      setResult(data);
    } catch (err) {
      setError(err.response?.data?.error || err.message || "Failed to calculate recommendations.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (movies.length > 0 && selectedMovieId) {
      runSimulation(selectedMovieId);
    }
  }, [selectedMovieId]);

  const selectedMovieObj = movies.find((m) => m.movie_id === selectedMovieId);

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-16">
      {/* Page Header */}
      <div className="border-b border-slate-800 pb-5">
        <div className="flex items-center gap-2.5 mb-2">
          <div className="w-9 h-9 rounded-xl bg-cyan-600/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
            <Film className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Content-Based Filtering Lab
            </h1>
            <p className="text-xs sm:text-sm text-slate-400">
              Analyze multi-hot genre feature vectors and compute cosine angles in attribute space.
            </p>
          </div>
        </div>
      </div>

      {/* Movie Selection & Simulation Control */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
          {/* Movie Dropdown Selector */}
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              1. Select Seed Movie
            </label>
            <select
              value={selectedMovieId}
              onChange={(e) => setSelectedMovieId(parseInt(e.target.value))}
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-cyan-500 transition-colors"
            >
              {movies.map((m) => (
                <option key={m.movie_id} value={m.movie_id}>
                  {m.title} ({m.year}) — [{m.genres.join(', ')}]
                </option>
              ))}
            </select>
            {selectedMovieObj && (
              <p className="text-[11px] text-slate-400 mt-1.5 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-cyan-400" />
                <span>{selectedMovieObj.overview}</span>
              </p>
            )}
          </div>

          {/* Run Button */}
          <div>
            <button
              onClick={() => runSimulation(selectedMovieId)}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-semibold py-2.5 px-4 rounded-xl shadow-lg shadow-cyan-600/25 transition-all text-xs cursor-pointer"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-current" />}
              <span>{loading ? 'Computing Similarities...' : 'Run Simulation'}</span>
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

      {/* Seed Movie Details & Feature Vector Visualizer */}
      {result && result.selected_movie && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Selected Movie Spotlight Card */}
          <div className="bg-slate-900/90 border border-cyan-500/30 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
                <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Seed Movie Profile</span>
                </span>
                <span className="text-[10px] bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 px-2 py-0.5 rounded font-mono">
                  ID: #{result.selected_movie.movie_id}
                </span>
              </div>

              <div className="aspect-[16/10] rounded-xl overflow-hidden mb-3 border border-slate-800">
                <PosterImage
                  src={result.selected_movie.poster_url}
                  title={result.selected_movie.title}
                  className="w-full h-full object-cover"
                />
              </div>

              <h3 className="font-bold text-white text-base">
                {result.selected_movie.title} ({result.selected_movie.year})
              </h3>

              <div className="flex flex-wrap gap-1 my-2">
                {result.selected_movie.genres.map((g) => (
                  <span
                    key={g}
                    className="text-[11px] bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 px-2 py-0.5 rounded-full font-medium"
                  >
                    {g}
                  </span>
                ))}
              </div>

              <p className="text-xs text-slate-400 leading-relaxed mt-2">
                {result.selected_movie.overview}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-500">
              Active genres: {result.selected_movie.genres.length} of {result.vocabulary?.length || 15} catalog genres
            </div>
          </div>

          {/* Genre Feature Vector Visualizer */}
          <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
                <h3 className="font-semibold text-slate-100 text-sm flex items-center gap-2">
                  <Binary className="w-4 h-4 text-cyan-400" />
                  <span>Multi-Hot Feature Vector Representation</span>
                </h3>
                <span className="text-xs font-mono text-cyan-300 bg-cyan-950/60 border border-cyan-500/30 px-2 py-0.5 rounded">
                  Dim: {result.vocabulary?.length || 0}
                </span>
              </div>

              <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                Each genre is a dimension in feature space. Movies with a genre have value <strong className="text-cyan-400">1</strong>, 
                and all other genres have value <strong className="text-slate-500">0</strong>.
              </p>

              {/* Grid of Vector Dimensions */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {(result.vocabulary || []).map((genreName, idx) => {
                  const val = result.selected_movie.feature_vector[idx];
                  const isActive = val === 1;

                  return (
                    <div
                      key={genreName}
                      className={`p-2.5 rounded-xl border text-xs flex items-center justify-between transition-all ${
                        isActive
                          ? 'bg-cyan-500/15 border-cyan-500/50 text-cyan-200 shadow-sm shadow-cyan-500/10'
                          : 'bg-slate-950/60 border-slate-800 text-slate-500'
                      }`}
                    >
                      <span className="font-medium truncate mr-1">{genreName}</span>
                      <span
                        className={`w-5 h-5 rounded-md flex items-center justify-center font-mono font-bold text-xs shrink-0 ${
                          isActive
                            ? 'bg-cyan-500 text-slate-950'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {val}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex flex-wrap items-center justify-between gap-2">
              <span className="font-mono text-cyan-300">
                Vector: [{result.selected_movie.feature_vector.join(', ')}]
              </span>
              <span className="text-slate-500">
                Vector Norm ||v|| = {Math.sqrt(result.selected_movie.active_genre_count).toFixed(3)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Top 5 Content-Based Recommendations */}
      {result && result.recommendations && (
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span>Top 5 Content-Based Recommendations</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Ranked by cosine similarity against '{result.selected_movie?.title}'. Self-match is strictly excluded.
              </p>
            </div>
            <span className="text-xs bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 font-semibold px-2.5 py-1 rounded-full">
              {result.total_movies_compared} Movies Evaluated
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {result.recommendations.map((rec) => (
              <MovieCard
                key={rec.movie_id}
                movie={rec}
                rank={rec.rank}
                type="content"
                similarity={rec.similarity}
                reason={rec.explanation}
                sharedGenres={rec.shared_genres}
              />
            ))}
          </div>
        </div>
      )}

      {/* Cosine Similarity Scores Ranking Chart */}
      {result && result.chart_data && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-lg">
          <div className="flex items-center justify-between mb-3 border-b border-slate-800/80 pb-2">
            <h3 className="font-semibold text-slate-100 text-sm flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-cyan-400" />
              <span>Cosine Similarity Ranking Spectrum (Top 12 Catalog Matches)</span>
            </h3>
            <span className="text-[11px] font-mono text-slate-400">
              Cosine angle in genre space
            </span>
          </div>
          <p className="text-xs text-slate-400 mb-4">
            Shows how closely other movies align with the seed movie's genre vector. Top 5 highlighted in bright cyan.
          </p>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={result.chart_data}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 90, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                <XAxis type="number" domain={[0, 1]} stroke="#64748b" tick={{ fontSize: 10 }} />
                <YAxis dataKey="title" type="category" stroke="#94a3b8" tick={{ fontSize: 10 }} width={90} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const item = payload[0].payload;
                      return (
                        <div className="bg-slate-950 border border-slate-800 p-2.5 rounded-lg shadow-xl text-xs">
                          <p className="font-bold text-slate-200">{item.title}</p>
                          <p className="text-cyan-400 font-mono mt-1">Cosine Sim: {item.similarity}</p>
                          <p className="text-slate-400 text-[11px]">Match Percentage: {item.similarity_pct}%</p>
                          <p className="text-slate-400 text-[11px]">Shared Genres: {item.shared_genres_count}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="similarity" radius={[0, 4, 4, 0]}>
                  {result.chart_data.map((entry, idx) => (
                    <Cell
                      key={`cell-${idx}`}
                      fill={idx < 5 ? '#06b6d4' : '#334155'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Step-by-Step Educational Stepper */}
      {result && result.workflow_steps && (
        <ExplanationPanel
          steps={result.workflow_steps}
          title="Content-Based Filtering Step-by-Step Mathematical Workflow"
        />
      )}
    </div>
  );
}
