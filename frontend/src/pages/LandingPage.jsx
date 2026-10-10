import React, { useState } from 'react';
import { 
  Terminal, 
  ShieldCheck, 
  Code2, 
  Sparkles, 
  Bug, 
  CheckCircle2, 
  ArrowRight, 
  Zap, 
  Activity, 
  GitPullRequest,
  Layers,
  ChevronRight,
  Database
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export const LandingPage = ({ onGetStarted: propOnGetStarted, onOpenAuth: propOnOpenAuth }) => {
  const navigate = useNavigate();
  const onGetStarted = propOnGetStarted || (() => navigate('/register'));
  const onOpenAuth = propOnOpenAuth || ((mode) => navigate(mode === 'register' ? '/register' : '/login'));

  const [demoRole, setDemoRole] = useState('tester');
  const { quickLogin } = useAuth();

  const handleInstantLogin = async (role) => {
    await quickLogin(role);
    navigate('/projects');
  };

  const isTesterDemo = demoRole === 'tester';

  return (
    <div className="min-h-screen bg-[#080C16] text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Top Header */}
      <header className="w-full border-b border-slate-700/60 bg-slate-950/70 backdrop-blur-2xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-950/70 border border-cyan-500/50 text-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.3)]">
              <Terminal size={20} />
            </div>
            <span className="font-extrabold tracking-tight text-lg text-slate-100">
              Tester's<span className="text-cyan-400">Home</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onOpenAuth('login')}
              className="px-4 py-2 text-sm font-semibold text-slate-300 hover:text-white transition-colors"
            >
              Sign In
            </button>
            <button
              onClick={() => onOpenAuth('register')}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-bold text-sm transition-all shadow-lg shadow-cyan-950/50 hover:shadow-cyan-500/25"
            >
              Get Started Free
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 sm:py-28 px-4 sm:px-6 border-b border-slate-800">
        {/* Glow backdrop circles */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 left-1/3 w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center space-y-7 relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-cyan-500/30 bg-cyan-950/40 text-cyan-300 text-xs font-semibold shadow-sm">
            <Zap size={14} className="text-cyan-400" />
            <span>Next-Generation QA & Developer Collaboration Hub</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.1] text-white">
            Where Bugs Meet <br />
            <span className="cyber-gradient-text">Their Demise.</span>
          </h1>

          <p className="text-base sm:text-xl text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed">
            Bridge the gap between testers breaking things and developers fixing them. Execute test runs, log defects with AI polish, capture screen clips, and sync PRs with zero friction.
          </p>

          {/* Dual CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button
              onClick={() => handleInstantLogin('tester')}
              className="w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-sm tracking-wide shadow-[0_0_30px_rgba(6,182,212,0.4)] transition-all hover:-translate-y-0.5 active:translate-y-0"
            >
              <ShieldCheck size={20} />
              <span>Enter as Tester (QA)</span>
            </button>

            <button
              onClick={() => handleInstantLogin('developer')}
              className="w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-black text-sm tracking-wide shadow-[0_0_30px_rgba(139,92,246,0.4)] transition-all hover:-translate-y-0.5 active:translate-y-0"
            >
              <Code2 size={20} />
              <span>Enter as Developer (Dev)</span>
            </button>
          </div>

          <div className="text-xs text-slate-400 font-medium pt-1 space-y-1.5">
            <div>⚡ Instant 1-click test login pre-connected to MongoDB Compass sample data.</div>
            <div className="inline-flex flex-wrap items-center justify-center gap-3 text-[11px] font-mono py-1 px-3 rounded-xl bg-slate-950/80 border border-slate-800">
              <span className="text-cyan-300 font-bold">QA Tester: tester@testers-home.io / tester123</span>
              <span className="text-slate-600">|</span>
              <span className="text-purple-300 font-bold">Developer: dev@testers-home.io / dev123</span>
            </div>
          </div>
        </div>
      </section>

      {/* Key Metrics Ticker */}
      <section className="border-b border-slate-800 bg-slate-950/70 py-8 px-4">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div>
            <div className="text-3xl sm:text-4xl font-black text-cyan-400">14,890+</div>
            <div className="text-xs sm:text-sm text-slate-300 mt-1 font-semibold">Test Cases Executed</div>
          </div>
          <div>
            <div className="text-3xl sm:text-4xl font-black text-emerald-400">99.4%</div>
            <div className="text-xs sm:text-sm text-slate-300 mt-1 font-semibold">System Stability Score</div>
          </div>
          <div>
            <div className="text-3xl sm:text-4xl font-black text-purple-400">3,420+</div>
            <div className="text-xs sm:text-sm text-slate-300 mt-1 font-semibold">Defects Verified & Closed</div>
          </div>
          <div>
            <div className="text-3xl sm:text-4xl font-black text-amber-400">&lt; 15 min</div>
            <div className="text-xs sm:text-sm text-slate-300 mt-1 font-semibold">Avg Triage to Retest</div>
          </div>
        </div>
      </section>

      {/* Interactive Role Switcher Demo */}
      <section className="py-20 px-4 sm:px-6 max-w-5xl mx-auto w-full space-y-8">
        <div className="text-center space-y-3">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white">
            Interactive Role Switcher Demo
          </h2>
          <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto">
            Experience how Tester's Home dynamically customizes workflows, colors, and permissions for each role.
          </p>

          {/* Toggle Button */}
          <div className="inline-flex p-1.5 rounded-2xl border border-slate-700 bg-slate-950/90 mt-4 shadow-xl">
            <button
              onClick={() => setDemoRole('tester')}
              className={`flex items-center gap-2.5 px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                isTesterDemo
                  ? 'bg-cyan-950 text-cyan-200 border border-cyan-400/60 shadow-[0_0_20px_rgba(6,182,212,0.35)]'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ShieldCheck size={18} />
              <span>Tester (QA) Perspective</span>
            </button>
            <button
              onClick={() => setDemoRole('developer')}
              className={`flex items-center gap-2.5 px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                !isTesterDemo
                  ? 'bg-purple-950 text-purple-200 border border-purple-400/60 shadow-[0_0_20px_rgba(139,92,246,0.35)]'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Code2 size={18} />
              <span>Developer (Dev) Perspective</span>
            </button>
          </div>
        </div>

        {/* Morphing Perspective Card Preview */}
        <div className={`p-6 sm:p-8 rounded-3xl border backdrop-blur-2xl transition-all duration-500 shadow-2xl ${
          isTesterDemo
            ? 'bg-slate-900/80 border-cyan-500/40 shadow-cyan-950/30'
            : 'bg-slate-900/80 border-purple-500/40 shadow-purple-950/30'
        }`}>
          <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-800">
            <div className="space-y-1">
              <span className={`text-xs font-bold uppercase tracking-wider ${
                isTesterDemo ? 'text-cyan-400' : 'text-purple-400'
              }`}>
                {isTesterDemo ? 'QA Operations Matrix' : 'Developer Issue Stream'}
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-white">
                {isTesterDemo ? 'Alex Rivera (QA Lead)' : 'Samira Chen (Full-Stack Engineer)'}
              </h3>
            </div>

            <div className="flex items-center gap-2.5">
              {isTesterDemo ? (
                <>
                  <button className="px-4 py-2 rounded-xl bg-cyan-600/30 border border-cyan-500/50 text-cyan-200 text-xs font-bold shadow-sm">
                    + Log Bug
                  </button>
                  <button className="px-4 py-2 rounded-xl bg-emerald-600/30 border border-emerald-500/50 text-emerald-200 text-xs font-bold shadow-sm">
                    Start Test Run
                  </button>
                </>
              ) : (
                <>
                  <button className="px-4 py-2 rounded-xl bg-purple-600/30 border border-purple-500/50 text-purple-200 text-xs font-bold shadow-sm">
                    Assigned to Me (3)
                  </button>
                  <button className="px-4 py-2 rounded-xl bg-indigo-600/30 border border-indigo-500/50 text-indigo-200 text-xs font-bold shadow-sm">
                    Ready for Retest
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6">
            <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800/80 space-y-1.5">
              <span className="text-xs font-semibold text-slate-400">
                {isTesterDemo ? 'Assigned Test Suites' : 'Claimed Defect Tickets'}
              </span>
              <div className="text-2xl font-black text-white">
                {isTesterDemo ? '3 Active Suites' : '2 In-Progress Tickets'}
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800/80 space-y-1.5">
              <span className="text-xs font-semibold text-slate-400">
                {isTesterDemo ? 'Verification Permissions' : 'Code PR Resolution'}
              </span>
              <div className="text-2xl font-black text-emerald-400">
                {isTesterDemo ? 'Verify & Close' : 'Git Webhook Sync'}
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800/80 space-y-1.5">
              <span className="text-xs font-semibold text-slate-400">
                Accent Glow
              </span>
              <div className={`text-2xl font-black ${isTesterDemo ? 'text-cyan-400' : 'text-purple-400'}`}>
                {isTesterDemo ? 'Electric Cyan / Emerald' : 'Electric Purple / Indigo'}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Pillars */}
      <section className="py-16 px-4 sm:px-6 max-w-6xl mx-auto w-full grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 sm:p-7 rounded-2xl border border-slate-700/70 bg-slate-900/60 backdrop-blur-md space-y-3.5 hover:border-cyan-500/50 transition-all">
          <div className="p-3 rounded-xl bg-cyan-950/70 border border-cyan-800/50 text-cyan-400 w-fit">
            <Sparkles size={24} />
          </div>
          <h3 className="text-lg font-bold text-white">AI Bug Report Polish</h3>
          <p className="text-sm text-slate-300 leading-relaxed font-normal">
            Paste messy notes or runtime stack traces. Built-in AI structures them into clean, numbered reproduction steps and extracts diagnostic logs into markdown.
          </p>
        </div>

        <div className="p-6 sm:p-7 rounded-2xl border border-slate-700/70 bg-slate-900/60 backdrop-blur-md space-y-3.5 hover:border-purple-500/50 transition-all">
          <div className="p-3 rounded-xl bg-purple-950/70 border border-purple-800/50 text-purple-400 w-fit">
            <GitPullRequest size={24} />
          </div>
          <h3 className="text-lg font-bold text-white">Git Webhook PR Sync</h3>
          <p className="text-sm text-slate-300 leading-relaxed font-normal">
            Developers can claim defects and link PRs. Merging a pull request automatically moves tickets to "Ready for QA" with live real-time notifications.
          </p>
        </div>

        <div className="p-6 sm:p-7 rounded-2xl border border-slate-700/70 bg-slate-900/60 backdrop-blur-md space-y-3.5 hover:border-emerald-500/50 transition-all">
          <div className="p-3 rounded-xl bg-emerald-950/70 border border-emerald-800/50 text-emerald-400 w-fit">
            <Database size={24} />
          </div>
          <h3 className="text-lg font-bold text-white">MongoDB Compass Native</h3>
          <p className="text-sm text-slate-300 leading-relaxed font-normal">
            Connect directly to <code className="text-emerald-300 font-mono bg-slate-950 px-2 py-0.5 rounded border border-emerald-900/60">mongodb://127.0.0.1:27017</code> in MongoDB Compass to inspect all JSON collections, test runs, and activity records.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-800/80 bg-slate-950/90 py-6 px-4 text-center text-xs text-slate-400 font-medium">
        Tester’s Home — Modern QA & Developer Collaboration Platform
      </footer>
    </div>
  );
};
