import React, { Component } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Winter Arc App Error caught by boundary:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-[#07090e] text-slate-100 font-sans">
          <div className="glass-panel max-w-lg w-full p-8 rounded-3xl border border-white/10 shadow-2xl text-center space-y-5 animate-fadeIn">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-rose-500/10 border border-rose-500/25 flex items-center justify-center text-rose-400 shadow-lg">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <div className="space-y-2">
              <h1 className="text-xl font-bold tracking-tight text-white">
                Something didn't load right
              </h1>
              <p className="text-xs text-slate-400 leading-relaxed font-mono">
                An unexpected interface error occurred. Your study progress and streak data are safely preserved in storage.
              </p>
            </div>

            {this.state.error && (
              <pre className="p-3 rounded-xl bg-black/40 border border-white/5 text-[11px] font-mono text-rose-300 text-left overflow-x-auto max-h-32">
                {this.state.error.message || String(this.state.error)}
              </pre>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                onClick={this.handleReload}
                className="apple-press w-full sm:w-auto px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition-all"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Reload Page</span>
              </button>
              <button
                onClick={this.handleGoHome}
                className="apple-press w-full sm:w-auto px-4 py-2.5 rounded-xl glass-ultra text-slate-300 hover:text-white border border-white/10 text-xs font-bold flex items-center justify-center gap-2 transition-all"
              >
                <Home className="w-4 h-4" />
                <span>Return to Dashboard</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

