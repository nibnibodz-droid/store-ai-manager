import { Component, type ReactNode } from 'react'

interface Props { children: ReactNode }
interface State { hasError: boolean; error: Error | null }

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }
  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }
  componentDidCatch(error: Error) {
    console.error('ErrorBoundary caught:', error)
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 40, background: '#1a1a2e', color: '#ff6b6b', fontFamily: 'monospace', minHeight: '100vh' }}>
          <h1>⚠️ Runtime Error</h1>
          <pre style={{ background: '#0f0f25', padding: 20, borderRadius: 8, overflow: 'auto' }}>
            {this.state.error?.name}: {this.state.error?.message}
            {'\n'}
            {this.state.error?.stack}
          </pre>
          <button onClick={() => window.location.reload()} style={{ padding: '10px 20px', background: '#4c6ef5', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', marginTop: 20 }}>
            Reload Page
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
