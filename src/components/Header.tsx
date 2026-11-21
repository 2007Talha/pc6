import type { Theme } from '../hooks/useTheme.ts';

interface HeaderProps {
  readonly theme: Theme;
  readonly onToggleTheme: () => void;
}

export function Header({ theme, onToggleTheme }: HeaderProps) {
  return (
    <header className="app-header" role="banner">
      <div className="header-content">
        <div className="logo-area">
          <img
            src="/logo.jpg"
            alt="VayuShield logo"
            className="app-logo"
            width="42"
            height="42"
          />
          <div>
            <h1>VayuShield</h1>
            <p className="tagline">Smart Air Quality Guidance for Families &amp; Communities</p>
          </div>
        </div>
        <button
          type="button"
          className="btn-icon theme-toggle"
          onClick={onToggleTheme}
          aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
          {theme === 'light' ? '🌙' : '☀️'}
        </button>
      </div>
    </header>
  );
}
