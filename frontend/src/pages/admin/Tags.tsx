import { useState, useEffect, useCallback } from 'react';
import { getTags, createTag, updateTag, deleteTag, type Tag } from '../../services/api';
import Modal, { ConfirmDialog } from '../../components/Modal';

interface TagFormData {
  name: string;
  slug: string;
}

const emptyForm: TagFormData = { name: '', slug: '' };

const generateSlug = (name: string) =>
  name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

const Tags = () => {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [form, setForm] = useState<TagFormData>(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState<Tag | null>(null);
  const [formError, setFormError] = useState('');

  const fetchTags = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getTags();
      setTags(response.data);
    } catch (err) {
      setError('Failed to fetch tags.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTags();
  }, [fetchTags]);

  const openCreate = () => {
    setEditingTag(null);
    setForm(emptyForm);
    setFormError('');
    setModalOpen(true);
  };

  const openEdit = (tag: Tag) => {
    setEditingTag(tag);
    setForm({ name: tag.name, slug: tag.slug });
    setFormError('');
    setModalOpen(true);
  };

  const handleNameChange = (name: string) => {
    setForm({ name, slug: editingTag ? form.slug : generateSlug(name) });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!form.name.trim() || !form.slug.trim()) {
      setFormError('Name and slug are required');
      return;
    }

    try {
      if (editingTag) {
        await updateTag(editingTag.id, form);
      } else {
        await createTag(form);
      }
      setModalOpen(false);
      fetchTags();
    } catch (err: any) {
      if (err.response?.status === 409) {
        setFormError('Tag name or slug already exists');
      } else {
        setFormError('Operation failed');
      }
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteTag(deleteTarget.id);
      setDeleteTarget(null);
      fetchTags();
    } catch (err) {
      console.error('Delete failed', err);
    }
  };

  if (loading) return <div className="page-loading">Loading...</div>;
  if (error) return <div className="page-error">{error}</div>;

  return (
    <div className="page">
      <div className="page-header">
        <h1>Tags</h1>
        <button className="btn btn-primary" onClick={openCreate}>
          + New Tag
        </button>
      </div>

      <table className="table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Slug</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {tags.map((t) => (
            <tr key={t.id}>
              <td>{t.id}</td>
              <td>{t.name}</td>
              <td>{t.slug}</td>
              <td className="actions-cell">
                <button className="btn btn-sm btn-secondary" onClick={() => openEdit(t)}>
                  Edit
                </button>
                <button className="btn btn-sm btn-danger" onClick={() => setDeleteTarget(t)}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
          {tags.length === 0 && (
            <tr><td colSpan={4} className="text-center">No tags found.</td></tr>
          )}
        </tbody>
      </table>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingTag ? 'Edit Tag' : 'New Tag'}
      >
        <form onSubmit={handleSubmit} className="modal-form">
          {formError && <div className="form-error">{formError}</div>}
          <div className="form-group">
            <label htmlFor="tag-name">Name</label>
            <input
              id="tag-name"
              type="text"
              value={form.name}
              onChange={(e) => handleNameChange(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="tag-slug">Slug</label>
            <input
              id="tag-slug"
              type="text"
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
              required
            />
          </div>
          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {editingTag ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Tag"
        message={`Are you sure you want to delete "${deleteTarget?.name}"?`}
      />
    </div>
  );
};

export default Tags;
