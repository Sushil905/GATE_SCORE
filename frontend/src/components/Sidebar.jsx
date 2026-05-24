import { GraduationCap, LogOut } from 'lucide-react';
import { menuItems } from '../data/menuData.js';

export function Sidebar({ page, setPage, user, logout }) {
  const visiblePages = menuItems.filter((item) => {
    if (item.admin) return user?.role === 'admin';
    if (item.guest) return !user;
    return true;
  });

  return (
    <aside className="sidebar">
      <button className="brand" onClick={() => setPage('home')}>
        <GraduationCap size={28} />
        <span>
          <strong>GATE_SCORE</strong>
          <small>Gen AI prep</small>
        </span>
      </button>
      <nav className="nav-list">
        {visiblePages.map((item) => {
          const Icon = item.icon;
          return (
            <button key={item.id} className={page === item.id ? 'active' : ''} onClick={() => setPage(item.id)}>
              <Icon size={18} />
              {item.label}
            </button>
          );
        })}
      </nav>
      <div className="sidebar-user">
        {user ? (
          <>
            <span>{user.name}</span>
            <small>{user.role}</small>
            <button className="ghost" onClick={logout}><LogOut size={16} /> Logout</button>
          </>
        ) : (
          <>
            <span>Guest Mode</span>
            <small>Login to save progress</small>
          </>
        )}
      </div>
    </aside>
  );
}
