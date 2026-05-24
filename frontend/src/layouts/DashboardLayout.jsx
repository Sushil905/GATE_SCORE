import { useEffect, useMemo, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { Footer } from '../components/Footer.jsx';
import { Navbar } from '../components/Navbar.jsx';
import { Sidebar } from '../components/Sidebar.jsx';

export function DashboardLayout({ page, setPage, user, logout, message, children }) {
  const suggestedTheme = useMemo(() => {
    const hour = new Date().getHours();
    return hour >= 18 || hour < 6 ? 'dark' : 'light';
  }, []);
  const [theme, setTheme] = useState(() => localStorage.getItem('gate_theme') || suggestedTheme);
  const [showSuggestion, setShowSuggestion] = useState(() => localStorage.getItem('gate_theme_suggestion_seen') !== 'yes');
  const suggestionText = suggestedTheme === 'dark'
    ? 'Night time detected. Dark mode is easier on the eyes.'
    : 'Morning time detected. Light mode is better for a fresh study start.';

  useEffect(() => {
    localStorage.setItem('gate_theme', theme);
  }, [theme]);

  function applySuggestion() {
    setTheme(suggestedTheme);
    setShowSuggestion(false);
    localStorage.setItem('gate_theme_suggestion_seen', 'yes');
  }

  function dismissSuggestion() {
    setShowSuggestion(false);
    localStorage.setItem('gate_theme_suggestion_seen', 'yes');
  }

  return (
    <main className={`app-theme theme-${theme}`}>
      <Sidebar page={page} setPage={setPage} user={user} logout={logout} />
      <div className="app-content">
        <Navbar message={message} />
        {showSuggestion && (
          <div className="theme-suggestion">
            <span>{suggestedTheme === 'dark' ? <Moon size={18} /> : <Sun size={18} />} {suggestionText}</span>
            <div>
              <button className="secondary" onClick={dismissSuggestion}>Later</button>
              <button className="primary" onClick={applySuggestion}>Apply {suggestedTheme === 'dark' ? 'Dark' : 'Light'} Mode</button>
            </div>
          </div>
        )}
        {children}
        <Footer />
      </div>
    </main>
  );
}
