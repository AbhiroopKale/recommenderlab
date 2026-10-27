import React, { useState } from 'react';
import { CheckCircle2, ChevronRight, BookOpen, Calculator, Layers, Award } from 'lucide-react';

export default function ExplanationPanel({ steps = [], title = "Step-by-Step Algorithm Workflow" }) {
  const [activeStep, setActiveStep] = useState(0);

  if (!steps || steps.length === 0) return null;

  const stepIcons = [BookOpen, Calculator, Layers, Calculator, Award];

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-lg">
      <div className="flex items-center gap-2 mb-4 border-b border-slate-800/80 pb-3">
        <BookOpen className="w-5 h-5 text-indigo-400" />
        <h3 className="font-semibold text-slate-100 text-base">{title}</h3>
      </div>

      {/* Step Pills Bar */}
      <div className="flex flex-wrap gap-2 mb-4">
        {steps.map((stepItem, idx) => {
          const Icon = stepIcons[idx % stepIcons.length];
          const isCurrent = activeStep === idx;
          return (
            <button
              key={stepItem.step || idx}
              onClick={() => setActiveStep(idx)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                isCurrent
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20 border border-indigo-400/40'
                  : 'bg-slate-800/70 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-700/50'
              }`}
            >
              <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                isCurrent ? 'bg-indigo-800 text-white' : 'bg-slate-700 text-slate-300'
              }`}>
                {stepItem.step || idx + 1}
              </span>
              <span>{stepItem.title.split(' ')[0]} {stepItem.title.split(' ')[1] || ''}</span>
            </button>
          );
        })}
      </div>

      {/* Active Step Details Card */}
      {steps[activeStep] && (
        <div className="bg-slate-950/80 border border-slate-800/90 rounded-lg p-4 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs uppercase tracking-wider font-semibold text-indigo-400">
              Step {steps[activeStep].step || activeStep + 1} of {steps.length}
            </span>
            <div className="flex gap-1">
              <button
                disabled={activeStep === 0}
                onClick={() => setActiveStep((prev) => Math.max(0, prev - 1))}
                className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-700"
              >
                Prev
              </button>
              <button
                disabled={activeStep === steps.length - 1}
                onClick={() => setActiveStep((prev) => Math.min(steps.length - 1, prev + 1))}
                className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-700"
              >
                Next
              </button>
            </div>
          </div>

          <h4 className="text-sm font-semibold text-slate-200 mb-2">
            {steps[activeStep].title}
          </h4>

          <p className="text-xs text-slate-300 leading-relaxed">
            {steps[activeStep].description}
          </p>
        </div>
      )}
    </div>
  );
}
