import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-white flex items-center justify-center px-4">
          <div className="max-w-md w-full text-center">
            <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-6" />
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Something went wrong</h1>
            <p className="text-gray-600 mb-8">
              We're sorry, but something unexpected happened. Please try refreshing the page or go back to the dashboard.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => window.location.reload()}
                className="inline-flex items-center px-6 py-3 bg-gray-900 text-white rounded-2xl hover:bg-gray-800 transition-all duration-300 font-medium"
              >
                <RefreshCw className="h-5 w-5 mr-2" />
                Refresh Page
              </button>
              <Link
                to="/"
                className="inline-flex items-center px-6 py-3 bg-gray-100 text-gray-700 rounded-2xl hover:bg-gray-200 transition-all duration-300 font-medium"
              >
                <Home className="h-5 w-5 mr-2" />
                Go to Dashboard
              </Link>
            </div>
            
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-8 text-left">
                <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                  Error Details (Development)
                </summary>
                <pre className="mt-4 p-4 bg-gray-100 rounded-lg text-xs text-red-600 overflow-auto">
                  {this.state.error.stack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;