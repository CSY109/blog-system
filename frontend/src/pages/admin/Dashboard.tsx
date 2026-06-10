import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getStats, type Stats } from '../../services/api';

const Dashboard = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await getStats();
        setStats(response.data);
      } catch (err) {
        setError('Failed to load stats.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <div className="page-loading">Loading...</div>;
  if (error) return <div className="page-error">{error}</div>;
  if (!stats) return null;

  const cards = [
    { label: 'Total Posts', value: stats.posts, color: '#4a90d9' },
    { label: 'Published', value: stats.publishedPosts, color: '#52c41a' },
    { label: 'Users', value: stats.users, color: '#722ed1' },
    { label: 'Comments', value: stats.comments, color: '#fa8c16' },
    { label: 'Pending Comments', value: stats.pendingComments, color: '#f5222d' },
    { label: 'Tags', value: stats.tags, color: '#13c2c2' },
  ];

  return (
    <div className="page">
      <h1>Dashboard</h1>
      <div className="stats-grid">
        {cards.map((c) => (
          <div key={c.label} className="stat-card" style={{ borderTopColor: c.color }}>
            <div className="stat-value">{c.value}</div>
            <div className="stat-label">{c.label}</div>
          </div>
        ))}
      </div>

      <div className="dashboard-sections">
        <div className="dashboard-section">
          <h2>Recent Posts</h2>
          <table className="table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Status</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentPosts.map((p) => (
                <tr key={p.id}>
                  <td>
                    <Link to={`/admin/posts/edit/${p.id}`}>{p.title}</Link>
                  </td>
                  <td>
                    <span className={`status-badge ${p.published_status ? 'published' : 'draft'}`}>
                      {p.published_status ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td>{new Date(p.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
              {stats.recentPosts.length === 0 && (
                <tr><td colSpan={3} className="text-center">No posts yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="dashboard-section">
          <h2>Recent Comments</h2>
          <table className="table">
            <thead>
              <tr>
                <th>Author</th>
                <th>Post</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentComments.map((c) => (
                <tr key={c.id}>
                  <td>{c.author_name}</td>
                  <td>{c.post_title || '—'}</td>
                  <td>
                    <span className={`status-badge ${c.status}`}>{c.status}</span>
                  </td>
                  <td>{new Date(c.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
              {stats.recentComments.length === 0 && (
                <tr><td colSpan={4} className="text-center">No comments yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
