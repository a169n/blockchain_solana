import React, { Component } from 'react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Do nothing here to suppress the error
  }

  render() {
    return this.state.hasError ? null : this.props.children;
  }
}

export default ErrorBoundary;
