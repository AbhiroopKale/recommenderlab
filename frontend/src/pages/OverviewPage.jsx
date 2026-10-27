import React from 'react';
import { 
  Users, 
  Film, 
  GitCompare, 
  ArrowRight, 
  Sparkles, 
  CheckCircle2, 
  Calculator, 
  Layers, 
  BookOpen,
  Zap,
  HelpCircle
} from 'lucide-react';

export default function OverviewPage({ onNavigate }) {
  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      {/* Hero Section */}
      <div className="relative rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900/90 to-indigo-950/70 border border-slate-800 p-6 sm:p-10 overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-12 -ml-12 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold mb-4">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Interactive Machine Learning Lab</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
            How Do Movie Recommenders Actually <span className="gradient-text">Think?</span>
          </h1>

          <p className="mt-4 text-slate-300 text-sm sm:text-base leading-relaxed">
            Welcome to <strong>RecommenderLab</strong>, an educational simulation workbench designed to deconstruct
            recommendation algorithms down to their mathematical fundamentals. Step inside the algorithmic pipeline, 
            modify user ratings live, tweak neighbor parameters, inspect multi-hot feature vectors, and observe 
            how mathematical similarity translates into personalized discovery.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={() => onNavigate('collaborative')}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-5 py-2.5 rounded-xl shadow-lg shadow-indigo-600/25 transition-all text-sm cursor-pointer"
            >
              <Users className="w-4 h-4" />
              <span>Explore Collaborative Filtering</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>

            <button
              onClick={() => onNavigate('content')}
              className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium px-5 py-2.5 rounded-xl border border-slate-700 transition-all text-sm cursor-pointer"
            >
              <Film className="w-4 h-4 text-cyan-400" />
              <span>Explore Content-Based</span>
            </button>
          </div>
        </div>
      </div>

      {/* Two Algorithm Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Collaborative Filtering Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-7 shadow-xl hover:border-indigo-500/50 transition-all group flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center mb-4 text-indigo-400 group-hover:scale-110 transition-transform">
              <Users className="w-6 h-6" />
            </div>

            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">
                User-Based Collaborative Filtering
              </h2>
              <span className="text-[11px] font-semibold bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-500/30">
                Social Signal
              </span>
            </div>

            <p className="mt-2 text-sm text-slate-300 leading-relaxed">
              Finds people who share your cinematic taste profile and predicts ratings for unseen movies
              based on what those like-minded peers loved.
            </p>

            <div className="mt-4 space-y-2 text-xs text-slate-400">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                <span><strong>Cosine Similarity on Overlapping Items:</strong> Computes taste alignment strictly on movies both users have seen.</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                <span><strong>K-Nearest Neighbors (KNN):</strong> Isolates the top K closest peers with positive similarity.</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                <span><strong>Weighted Average Prediction:</strong> Higher-similarity neighbors exert more influence on predicted ratings.</span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800/80">
            <button
              onClick={() => onNavigate('collaborative')}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-indigo-600/10 hover:bg-indigo-600/20 border border-indigo-500/30 text-indigo-300 font-semibold text-xs transition-colors cursor-pointer"
            >
              <span>Launch Collaborative Simulator</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Content-Based Filtering Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-7 shadow-xl hover:border-cyan-500/50 transition-all group flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-xl bg-cyan-600/20 border border-cyan-500/30 flex items-center justify-center mb-4 text-cyan-400 group-hover:scale-110 transition-transform">
              <Film className="w-6 h-6" />
            </div>

            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">
                Content-Based Filtering
              </h2>
              <span className="text-[11px] font-semibold bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded-full border border-cyan-500/30">
                Item Attributes
              </span>
            </div>

            <p className="mt-2 text-sm text-slate-300 leading-relaxed">
              Analyzes the intrinsic metadata features of movies (such as genre tags) and recommends titles
              that share identical or closely overlapping feature fingerprints.
            </p>

            <div className="mt-4 space-y-2 text-xs text-slate-400">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <span><strong>Multi-Hot Vectorization:</strong> Encodes catalog genres into mathematical binary vectors [0, 1, 0, 1...].</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <span><strong>Cosine Angle in Feature Space:</strong> Measures the geometric angle between movie vectors.</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <span><strong>Cold-Start Resilience:</strong> Can recommend brand-new items immediately without requiring user ratings.</span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800/80">
            <button
              onClick={() => onNavigate('content')}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-cyan-600/10 hover:bg-cyan-600/20 border border-cyan-500/30 text-cyan-300 font-semibold text-xs transition-colors cursor-pointer"
            >
              <span>Launch Content-Based Simulator</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Mathematical Foundations Cheat Sheet */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl">
        <div className="flex items-center gap-2 mb-4 border-b border-slate-800 pb-3">
          <Calculator className="w-5 h-5 text-indigo-400" />
          <h3 className="font-bold text-white text-lg">
            Mathematical Foundations & Formulas
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-300">
          {/* Cosine Similarity formula card */}
          <div className="bg-slate-950/70 border border-slate-800/90 rounded-xl p-4">
            <h4 className="font-semibold text-cyan-300 text-sm mb-1 flex items-center gap-1.5">
              <span>Cosine Similarity</span>
            </h4>
            <p className="text-slate-400 mb-3 leading-relaxed">
              Measures the cosine of the angle between two multi-dimensional vectors regardless of their magnitudes:
            </p>
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 font-mono text-center text-indigo-300 mb-2">
              sim(u, v) = (u · v) / (||u|| * ||v||)
            </div>
            <p className="text-[11px] text-slate-400 leading-normal">
              In Collaborative Filtering, this is evaluated exclusively across common co-rated movies. In Content-Based, it compares binary genre feature vectors.
            </p>
          </div>

          {/* Rating prediction formula card */}
          <div className="bg-slate-950/70 border border-slate-800/90 rounded-xl p-4">
            <h4 className="font-semibold text-amber-300 text-sm mb-1 flex items-center gap-1.5">
              <span>Weighted Average Prediction</span>
            </h4>
            <p className="text-slate-400 mb-3 leading-relaxed">
              Estimates user u's rating for unrated item i by weighting top-K neighbor ratings by their similarity score:
            </p>
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 font-mono text-center text-amber-300 mb-2">
              r̂(u, i) = ∑(sim(u, v) * r(v, i)) / ∑|sim(u, v)|
            </div>
            <p className="text-[11px] text-slate-400 leading-normal">
              Neighbors with higher similarity exert proportionally greater influence on the resulting score.
            </p>
          </div>
        </div>
      </div>

      {/* Comparison Callout banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/50 to-slate-900 border border-indigo-500/30 rounded-2xl p-6 sm:p-7 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-white text-base flex items-center gap-2">
            <GitCompare className="w-5 h-5 text-indigo-400" />
            <span>Ready to Compare Both Approaches Side-by-Side?</span>
          </h3>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            See how the same user receives totally different recommendations from social signal (Collaborative)
            versus genre metadata (Content-Based), and inspect the overlap.
          </p>
        </div>
        <button
          onClick={() => onNavigate('comparison')}
          className="whitespace-nowrap px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition-colors cursor-pointer"
        >
          Open Comparison Lab
        </button>
      </div>
    </div>
  );
}
