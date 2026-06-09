import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const Header = () => {
  const { isAuthenticated, logout } = useAuth();

  return (
    <header>
      <nav>
        <Link to="/">Home</Link>
        {isAuthenticated ? (
          <>
            <Link to="/admin">Admin</Link>
            <button onClick={logout}>Logout</button>
          </>
        ) : (
          <Link to="/login">Login</Link>
        )}
      </nav>
    </header>
  );
};

export default Header;
