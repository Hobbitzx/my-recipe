import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="h-full bg-morandi-bg flex items-center justify-center p-4" style={{ height: '100dvh' }}>
          <div className="max-w-md w-full bg-morandi-surface rounded-2xl shadow-lg p-6 text-center">
            <h2 className="text-2xl font-bold text-morandi-text mb-4">出现错误</h2>
            <p className="text-morandi-subtext mb-6">
              应用遇到了一个问题。请尝试刷新页面或重新打开应用。
            </p>
            <div className="space-y-3">
              <button
                onClick={this.handleReset}
                className="w-full py-3 rounded-xl font-semibold text-white bg-morandi-primary hover:opacity-90 transition-opacity"
              >
                重试
              </button>
              <button
                onClick={() => window.location.reload()}
                className="w-full py-3 rounded-xl font-semibold text-morandi-text bg-morandi-bg hover:bg-gray-200 transition-colors"
              >
                刷新页面
              </button>
            </div>
            {this.state.error && (
              <details className="mt-4 text-left">
                <summary className="cursor-pointer text-sm text-morandi-subtext">
                  错误详情
                </summary>
                <pre className="mt-2 text-xs bg-morandi-bg p-3 rounded overflow-auto max-h-40">
                  {this.state.error.toString()}
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

