import { Component } from 'react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    // eslint-disable-next-line no-console
    console.error('ErrorBoundary caught an error', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 text-red-200">
          <h2 className="text-lg font-semibold">Something went wrong.</h2>
          <p className="mt-2 text-sm opacity-80">{String(this.state.error)}</p>
        </div>
      )
    }
    return this.props.children
  }
}


