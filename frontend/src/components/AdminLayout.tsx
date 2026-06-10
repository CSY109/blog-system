import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const navItems = [
  { to: '/admin', label: 'Dashboard', end: true },
  { to: '/admin/posts', label: 'Posts', end: false },
  { to: '/admin/users', label: 'Users', end: false },
  { to: '/admin/tags', label: 'Tags', end: false },
  { to: '/admin/comments', label: 'Comments', end: false },
];

const AdminLayout = () => {
  const { user, logout } = useAuth();

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-header">
          <h2>Blog MIS</h2>
        </div>
        <nav className="admin-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => `admin-nav-link${isActive ? ' active' : ''}`}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="admin-sidebar-footer">
          <span className="admin-user-badge">{user?.username}</span>
          <button className="btn btn-logout" onClick={logout}>
            Logout
          </button>
        </div>
      </aside>
      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
