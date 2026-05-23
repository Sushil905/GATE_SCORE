export function PageTitle({ icon: Icon, title, text }) {
  return (
    <div className="page-title">
      <Icon size={28} />
      <div>
        <h1>{title}</h1>
        <p>{text}</p>
      </div>
    </div>
  );
}
