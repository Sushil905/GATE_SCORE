export function TestCard({ test, onOpen }) {
  return (
    <button className="action-card" onClick={onOpen}>
      <span>{test.title}</span>
      <small>{test.duration_minutes} minutes · {test.subject}</small>
    </button>
  );
}
