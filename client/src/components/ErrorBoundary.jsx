import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-surface p-8">
          <span className="material-symbols-outlined text-6xl text-secondary mb-4">error_outline</span>
          <h1 className="text-2xl font-bold text-primary mb-2">Something went wrong</h1>
          <p className="text-on-surface-variant mb-6 text-center max-w-md">
            {this.state.error?.message === 'Failed to fetch dynamically imported module' || this.state.error?.message?.includes('ChunkLoadError')
              ? 'A page failed to load. This might be a network issue — try refreshing.'
              : 'An unexpected error occurred.'}
          </p>
          <div className="flex gap-4">
            <button
              onClick={() => window.location.reload()}
              className="bg-primary text-on-primary px-6 py-2.5 rounded-xl font-semibold hover:bg-primary-container hover:text-on-primary-container transition-all"
            >
              Refresh Page
            </button>
            <button
              onClick={() => { this.setState({ hasError: false, error: null }); }}
              className="border border-outline-variant text-on-surface px-6 py-2.5 rounded-xl font-semibold hover:bg-surface-variant transition-all"
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
