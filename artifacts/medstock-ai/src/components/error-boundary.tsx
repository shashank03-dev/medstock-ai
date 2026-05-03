import React from "react";
import { AlertCircle, RotateCcw } from "lucide-react";

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<{ children: React.ReactNode }, State> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("[ErrorBoundary]", error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-full min-h-[400px] gap-5 text-center p-8">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center"
            style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)" }}
          >
            <AlertCircle className="w-7 h-7 text-destructive" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-1">Something went wrong</h2>
            <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">
              {this.state.error?.message ?? "An unexpected error occurred in this page."}
            </p>
          </div>
          <button
            onClick={() => this.setState({ hasError: false, error: undefined })}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:opacity-80"
            style={{ background: "rgba(200,146,42,0.12)", border: "1px solid rgba(200,146,42,0.22)", color: "#E8B84B" }}
          >
            <RotateCcw className="w-4 h-4" />
            Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
