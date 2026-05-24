import React from 'react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <main className="error-shell">
          <section className="panel form">
            <h1>Something went wrong</h1>
            <p>{this.state.error.message}</p>
            <button className="primary" onClick={() => window.location.reload()}>Reload</button>
          </section>
        </main>
      );
    }

    return this.props.children;
  }
}
