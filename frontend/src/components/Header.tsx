import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const Header = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <header className={`public-header${isHome ? ' transparent' : ''}`}>
      <div className="header-inner">
        <Link to="/" className="logo">
          <span className="logo-icon">◆</span>
          <span className="logo-text">DevBlog</span>
        </Link>
        <nav className="header-nav">
          <Link to="/" className="nav-link">Home</Link>
          {isAuthenticated ? (
            <>
              <Link to="/admin" className="nav-link">Dashboard</Link>
              <span className="nav-user">{user?.username}</span>
              <button onClick={logout} className="btn-logout-header">Logout</button>
            </>
          ) : (
            <Link to="/login" className="nav-link nav-login">Sign In</Link>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
