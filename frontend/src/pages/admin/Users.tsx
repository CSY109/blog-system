import { useState, useEffect, useCallback } from 'react';
import { getUsers, createUser, updateUser, deleteUser, type User } from '../../services/api';
import Modal, { ConfirmDialog } from '../../components/Modal';

interface UserFormData {
  username: string;
  password: string;
}

const emptyForm: UserFormData = { username: '', password: '' };

const Users = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [form, setForm] = useState<UserFormData>(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [formError, setFormError] = useState('');

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getUsers();
      setUsers(response.data);
    } catch (err) {
      setError('Failed to fetch users.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const openCreate = () => {
    setEditingUser(null);
    setForm(emptyForm);
    setFormError('');
    setModalOpen(true);
  };

  const openEdit = (user: User) => {
    setEditingUser(user);
    setForm({ username: user.username, password: '' });
    setFormError('');
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!form.username.trim()) {
      setFormError('Username is required');
      return;
    }

    try {
      if (editingUser) {
        const payload: { username: string; password?: string } = { username: form.username };
        if (form.password) payload.password = form.password;
        await updateUser(editingUser.id, payload);
      } else {
        if (!form.password) {
          setFormError('Password is required');
          return;
        }
        await createUser(form);
      }
      setModalOpen(false);
      fetchUsers();
    } catch (err: any) {
      if (err.response?.status === 409) {
        setFormError('Username already exists');
      } else {
        setFormError('Operation failed');
      }
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteUser(deleteTarget.id);
      setDeleteTarget(null);
      fetchUsers();
    } catch (err: any) {
      console.error('Delete failed', err);
    }
  };

  if (loading) return <div className="page-loading">Loading...</div>;
  if (error) return <div className="page-error">{error}</div>;

  return (
    <div className="page">
      <div className="page-header">
        <h1>Users</h1>
        <button className="btn btn-primary" onClick={openCreate}>
          + New User
        </button>
      </div>

      <table className="table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Username</th>
            <th>Created</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id}>
              <td>{u.id}</td>
              <td>{u.username}</td>
              <td>{new Date(u.created_at).toLocaleDateString()}</td>
              <td className="actions-cell">
                <button className="btn btn-sm btn-secondary" onClick={() => openEdit(u)}>
                  Edit
                </button>
                <button className="btn btn-sm btn-danger" onClick={() => setDeleteTarget(u)}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
          {users.length === 0 && (
            <tr><td colSpan={4} className="text-center">No users found.</td></tr>
          )}
        </tbody>
      </table>

      {/* Create / Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingUser ? 'Edit User' : 'New User'}
      >
        <form onSubmit={handleSubmit} className="modal-form">
          {formError && <div className="form-error">{formError}</div>}
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">
              Password{editingUser ? ' (leave blank to keep unchanged)' : ''}
            </label>
            <input
              id="password"
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required={!editingUser}
            />
          </div>
          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {editingUser ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete User"
        message={`Are you sure you want to delete "${deleteTarget?.username}"?`}
      />
    </div>
  );
};

export default Users;
