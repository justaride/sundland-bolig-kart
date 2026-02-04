import { Component, type ReactNode } from "react";

type Props = { children: ReactNode };
type State = { error: Error | null };

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div className="h-full flex items-center justify-center bg-atmosphere">
          <div className="glass-panel rounded-2xl p-8 max-w-md text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Noe gikk galt
            </h2>
            <p className="text-sm text-gray-500 mb-4">
              {this.state.error.message}
            </p>
            <button
              onClick={() => this.setState({ error: null })}
              className="px-4 py-2 bg-slate-900 text-white text-sm rounded-lg hover:bg-slate-800 transition-colors"
            >
              Prøv igjen
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
