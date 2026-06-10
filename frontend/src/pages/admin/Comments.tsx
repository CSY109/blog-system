import { useState, useEffect, useCallback } from 'react';
import {
  getComments,
  updateCommentStatus,
  deleteComment,
  type Comment,
} from '../../services/api';
import { ConfirmDialog } from '../../components/Modal';

const Comments = () => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<Comment | null>(null);

  const fetchComments = useCallback(async () => {
    try {
      setLoading(true);
      const params: { status?: string } = {};
      if (statusFilter) params.status = statusFilter;
      const response = await getComments(params);
      setComments(response.data);
    } catch (err) {
      setError('Failed to fetch comments.');
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const handleStatusChange = async (id: number, status: string) => {
    try {
      await updateCommentStatus(id, status);
      fetchComments();
    } catch (err) {
      console.error('Failed to update comment', err);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteComment(deleteTarget.id);
      setDeleteTarget(null);
      fetchComments();
    } catch (err) {
      console.error('Delete failed', err);
    }
  };

  if (loading) return <div className="page-loading">Loading...</div>;
  if (error) return <div className="page-error">{error}</div>;

  return (
    <div className="page">
      <div className="page-header">
        <h1>Comments</h1>
        <select
          className="form-select"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      <table className="table">
        <thead>
          <tr>
            <th>Author</th>
            <th>Post</th>
            <th>Content</th>
            <th>Status</th>
            <th>Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {comments.map((c) => (
            <tr key={c.id}>
              <td>{c.author_name}</td>
              <td>{c.post_title || '—'}</td>
              <td className="content-cell">{c.content.slice(0, 80)}{c.content.length > 80 ? '...' : ''}</td>
              <td>
                <span className={`status-badge ${c.status}`}>{c.status}</span>
              </td>
              <td>{new Date(c.created_at).toLocaleDateString()}</td>
              <td className="actions-cell">
                {c.status !== 'approved' && (
                  <button
                    className="btn btn-sm btn-success"
                    onClick={() => handleStatusChange(c.id, 'approved')}
                  >
                    Approve
                  </button>
                )}
                {c.status !== 'rejected' && (
                  <button
                    className="btn btn-sm btn-warning"
                    onClick={() => handleStatusChange(c.id, 'rejected')}
                  >
                    Reject
                  </button>
                )}
                <button
                  className="btn btn-sm btn-danger"
                  onClick={() => setDeleteTarget(c)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
          {comments.length === 0 && (
            <tr><td colSpan={6} className="text-center">No comments found.</td></tr>
          )}
        </tbody>
      </table>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Comment"
        message={`Are you sure you want to delete this comment?`}
      />
    </div>
  );
};

export default Comments;
