import React from 'react';

interface ErrorBoundaryProps {
  children?: React.ReactNode;
  /** Compact note, so a globe failure does not cover the rest of the page. */
  inline?: boolean;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

export default class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: unknown): void {
    console.error(error);
  }

  render() {
    const view = this as unknown as { props: ErrorBoundaryProps; state: ErrorBoundaryState };
    if (!view.state.hasError) return view.props.children;

    if (view.props.inline) {
      return (
        <div className="absolute left-1/2 top-6 z-20 -translate-x-1/2 max-w-md px-4">
          <div className="bg-imperial-parchment/95 text-imperial-ink font-serif text-sm px-4 py-3 rounded-xl border border-imperial-ink/20 shadow-lg text-center">
            海圖這一刻沒繪出來。港口和對話還在，船也可以繼續走。
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen w-full flex items-center justify-center p-6 bg-[#0f172a] text-imperial-ink font-serif">
        <div className="max-w-md bg-imperial-parchment p-8 rounded-xl border-2 border-imperial-ink/30 shadow-2xl text-center">
          <h1 className="text-2xl font-bold mb-3">這一頁沒能繪完</h1>
          <p className="leading-relaxed mb-6">
            畫面中途停了。船還在，名冊也還在。重新整理之後，可以再登一次艦。
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="bg-imperial-gold font-bold px-6 py-3 rounded-full"
          >
            重新整理
          </button>
        </div>
      </div>
    );
  }
}
