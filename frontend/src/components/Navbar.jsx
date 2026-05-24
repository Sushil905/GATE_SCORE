export function Navbar({ message }) {
  return message ? <div className="toast">{message}</div> : null;
}
