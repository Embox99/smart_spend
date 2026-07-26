import { Component } from "react";

class ErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error("Unhandled render error:", error, info.componentStack);
  }

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-6 text-center">
        <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
          Something went wrong
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md">
          The page failed to render. Reloading usually clears it.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 text-sm font-medium text-white bg-violet-500 rounded-md"
        >
          Reload
        </button>
      </div>
    );
  }
}

export default ErrorBoundary;
