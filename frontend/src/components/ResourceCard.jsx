export function ResourceCard({ resource }) {
  return (
    <a className="resource-card" href={resource.url} target="_blank" rel="noreferrer">
      <span>{resource.subject}</span>
      <strong>{resource.title}</strong>
      <small>{resource.type} · {resource.difficulty}</small>
    </a>
  );
}
