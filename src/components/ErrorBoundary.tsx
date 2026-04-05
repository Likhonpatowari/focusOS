import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      let errorMessage = "An unexpected error occurred.";
      
      try {
        // Check if it's a Firestore error JSON
        if (this.state.error?.message.startsWith('{')) {
          const errData = JSON.parse(this.state.error.message);
          if (errData.error.includes('permission')) {
            errorMessage = "You don't have permission to perform this action. Please make sure you are logged in correctly.";
          } else if (errData.error.includes('offline')) {
            errorMessage = "The database is currently offline. Please check your internet connection.";
          } else {
            errorMessage = `Database Error: ${errData.error}`;
          }
        }
      } catch (e) {
        // Fallback to default message
      }

      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl shadow-slate-200 p-8 border border-slate-100 text-center">
            <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="text-rose-500" size={32} />
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-2">System Error</h2>
            <p className="text-slate-500 text-sm mb-8 leading-relaxed">
              {errorMessage}
            </p>
            <button
              onClick={this.handleReset}
              className="w-full flex items-center justify-center gap-2 py-4 bg-primary-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-primary-700 transition-all shadow-lg shadow-primary-600/20"
            >
              <RefreshCcw size={18} />
              Restart System
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
