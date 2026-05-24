export function ProtectedRoute({ token, setPage, children }) {
  if (!token) {
    return (
      <section className="page">
        <div className="panel form">
          <h2>Login required</h2>
          <button className="primary" onClick={() => setPage('login')}>Go to Login</button>
        </div>
      </section>
    );
  }

  return children;
}
