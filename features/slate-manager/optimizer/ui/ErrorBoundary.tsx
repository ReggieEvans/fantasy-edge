'use client'

import { AlertTriangle } from 'lucide-react'
import { Component, ReactNode } from 'react'

import { Button } from '@/components/ui/button'

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: any) => void
}

export class OptimizerErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Optimizer Error Boundary caught an error:', error, errorInfo)
    this.props.onError?.(error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="flex flex-col items-center justify-center p-8 bg-card rounded-lg border border-destructive">
          <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
          <h2 className="text-lg font-semibold text-destructive mb-2">Something went wrong</h2>
          <p className="text-muted-foreground text-center mb-4">
            An error occurred while loading the optimizer. Please try refreshing the page.
          </p>
          <Button
            variant="outline"
            onClick={() => window.location.reload()}
            className="text-destructive border-destructive hover:bg-destructive hover:text-white"
          >
            Refresh Page
          </Button>
        </div>
      )
    }

    return this.props.children
  }
}
