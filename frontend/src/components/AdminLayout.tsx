import { NavLink, Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const adminNavItems = [
  { to: '/admin', label: 'Dashboard', icon: '📊', end: true },
  { to: '/admin/posts', label: 'Posts', icon: '📝', end: false },
  { to: '/admin/users', label: 'Users', icon: '👥', end: false },
  { to: '/admin/tags', label: 'Tags', icon: '🏷', end: false },
  { to: '/admin/comments', label: 'Comments', icon: '💬', end: false },
];

const AdminLayout = () => {
  const { user, isAdmin, logout } = useAuth();

  // Non-admin users should not be here
  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-header">
          <h2>◆ Blog MIS</h2>
        </div>
        <nav className="admin-nav">
          {adminNavItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => `admin-nav-link${isActive ? ' active' : ''}`}
            >
              <span className="nav-icon">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="admin-sidebar-footer">
          <span className="admin-user-badge">{user?.username} (admin)</span>
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
