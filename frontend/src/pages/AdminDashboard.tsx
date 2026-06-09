import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAdminPosts, deletePost, Post } from '../services/api';

const AdminDashboard = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await getAdminPosts();
      setPosts(response.data);
    } catch (err) {
      setError('Failed to fetch posts.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        await deletePost(id);
        fetchPosts(); // Refetch posts after deletion
      } catch (err) {
        setError('Failed to delete post.');
        console.error(err);
      }
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
      <h1>Admin Dashboard</h1>
      <Link to="/admin/new">Create New Post</Link>
      <table>
        <thead>
          <tr>
            <th>Title</th>
            <th>Status</th>
            <th>Created At</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {posts.map((post) => (
            <tr key={post.id}>
              <td>{post.title}</td>
              <td>{post.published_status ? 'Published' : 'Draft'}</td>
              <td>{new Date(post.created_at).toLocaleDateString()}</td>
              <td>
                <Link to={`/admin/edit/${post.id}`}>Edit</Link>
                <button onClick={() => handleDelete(post.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminDashboard;