import React from 'react';

// Catches render-time errors anywhere below it and shows a friendly fallback
// instead of a blank white screen. Error boundaries must be class components.
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    // eslint-disable-next-line no-console
    console.error('[ErrorBoundary]', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6">
          <div className="w-16 h-16 rounded-2xl bg-danger/10 text-danger flex items-center justify-center text-3xl mb-4">!</div>
          <h1 className="text-2xl font-extrabold text-text-main mb-2">Something went wrong</h1>
          <p className="text-text-muted mb-6 max-w-md">
            An unexpected error occurred. Try reloading the page — if it keeps happening, please report it.
          </p>
          <button onClick={() => window.location.reload()} className="btn btn-primary">
            Reload page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
