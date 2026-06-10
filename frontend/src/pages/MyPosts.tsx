import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getMyPosts, deletePost, type Post, type PaginatedResponse } from '../services/api';
import SearchBar from '../components/SearchBar';
import Pagination from '../components/Pagination';
import { ConfirmDialog } from '../components/Modal';

const PAGE_SIZE = 10;

const MyPosts = () => {
  const [data, setData] = useState<PaginatedResponse<Post> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<Post | null>(null);

  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getMyPosts(search || undefined, page, PAGE_SIZE);
      setData(response.data);
    } catch (err) {
      setError('Failed to fetch your posts.');
    } finally {
      setLoading(false);
    }
  }, [search, page]);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deletePost(deleteTarget.id);
      setDeleteTarget(null);
      fetchPosts();
    } catch (err: any) {
      console.error('Delete failed', err);
      if (err.response?.status === 403) alert('You can only delete your own posts.');
    }
  };

  if (loading) return <div className="page-loading">Loading...</div>;
  if (error) return <div className="page-error">{error}</div>;

  return (
    <div className="posts-section" style={{ paddingTop: 32 }}>
      <div className="page-header">
        <h1>My Posts</h1>
        <Link to="/new-post" className="btn btn-primary">+ New Post</Link>
      </div>

      <SearchBar value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search my posts..." />

      <table className="table">
        <thead>
          <tr><th>Title</th><th>Slug</th><th>Status</th><th>Created</th><th>Actions</th></tr>
        </thead>
        <tbody>
          {data?.data.map((post) => (
            <tr key={post.id}>
              <td>{post.title}</td>
              <td>{post.slug}</td>
              <td>
                <span className={`status-badge ${post.published_status ? 'published' : 'draft'}`}>
                  {post.published_status ? 'Published' : 'Draft'}
                </span>
              </td>
              <td>{new Date(post.created_at).toLocaleDateString()}</td>
              <td className="actions-cell">
                <Link to={`/edit-post/${post.id}`} className="btn btn-sm btn-secondary">Edit</Link>
                <button className="btn btn-sm btn-danger" onClick={() => setDeleteTarget(post)}>Delete</button>
              </td>
            </tr>
          ))}
          {data?.data.length === 0 && (
            <tr><td colSpan={5} className="text-center">No posts yet. <Link to="/new-post">Create one!</Link></td></tr>
          )}
        </tbody>
      </table>

      {data && <Pagination current={data.page} total={data.total} pageSize={data.limit} onChange={setPage} />}

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Post"
        message={`Are you sure you want to delete "${deleteTarget?.title}"?`}
      />
    </div>
  );
};

export default MyPosts;
