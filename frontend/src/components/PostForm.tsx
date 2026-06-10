import { useState, useEffect, useRef, type FormEvent, type ChangeEvent } from 'react';
import { uploadImage } from '../services/api';
import type { Post } from '../services/api';

interface PostFormProps {
  onSubmit: (post: Omit<Post, 'id' | 'created_at' | 'updated_at'> & { cover_image?: string }) => Promise<void>;
  initialPost?: Partial<Post>;
  isEditing?: boolean;
}

const MAX_COVER_SIZE = 5 * 1024 * 1024;

// Simple toolbar actions that wrap selected text in markdown/html
function insertTag(textarea: HTMLTextAreaElement, before: string, after: string) {
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const selected = textarea.value.slice(start, end);
  const replacement = before + selected + after;
  textarea.setRangeText(replacement, start, end, 'select');
  textarea.focus();
}

const TOOLBAR_ITEMS = [
  { label: 'H2',   before: '<h2>', after: '</h2>',   title: 'Heading 2' },
  { label: 'B',    before: '<strong>', after: '</strong>', title: 'Bold', style: 'bold' },
  { label: 'I',    before: '<em>', after: '</em>',       title: 'Italic', style: 'italic' },
  { label: '</>',  before: '<code>', after: '</code>',   title: 'Inline code', style: 'mono' },
  { label: 'PRE',  before: '<pre><code>', after: '</code></pre>', title: 'Code block' },
  { label: 'UL',   before: '<ul>\n  <li>', after: '</li>\n</ul>', title: 'Unordered list' },
  { label: 'OL',   before: '<ol>\n  <li>', after: '</li>\n</ol>', title: 'Ordered list' },
  { label: 'P',    before: '<p>', after: '</p>',      title: 'Paragraph' },
  { label: 'LINK', before: '<a href="', after: '">link</a>', title: 'Link' },
  { label: 'IMG',  before: '<img src="', after: '" alt="" />', title: 'Image' },
];

const PostForm = ({ onSubmit, initialPost, isEditing = false }: PostFormProps) => {
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [content, setContent] = useState('');
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [published, setPublished] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'write' | 'preview'>('write');

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialPost) {
      setTitle(initialPost.title || '');
      setSlug(initialPost.slug || '');
      setContent(initialPost.content || '');
      setPublished(initialPost.published_status || false);
      if (initialPost.cover_image) setCoverPreview(initialPost.cover_image);
    }
  }, [initialPost]);

  const generateSlug = (t: string) =>
    t.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

  const handleTitle = (e: ChangeEvent<HTMLInputElement>) => {
    const t = e.target.value;
    setTitle(t);
    if (!isEditing) setSlug(generateSlug(t));
  };

  const handleCoverSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(file.type)) {
      setError('Only JPEG, PNG, GIF, WebP images allowed.');
      return;
    }
    if (file.size > MAX_COVER_SIZE) {
      setError('Cover image must be under 5 MB.');
      return;
    }
    setError('');
    setCoverFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setCoverPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const removeCover = () => {
    setCoverFile(null);
    setCoverPreview(null);
    if (coverInputRef.current) coverInputRef.current.value = '';
  };

  const handleToolbar = (item: typeof TOOLBAR_ITEMS[number]) => {
    const ta = textareaRef.current;
    if (!ta) return;
    insertTag(ta, item.before, item.after);
    setContent(ta.value);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !slug.trim() || !content.trim()) {
      setError('Title, slug, and content are required.');
      return;
    }
    setSaving(true);
    setError('');

    try {
      let coverUrl = coverPreview && !coverPreview.startsWith('/uploads/') ? null : (initialPost?.cover_image || undefined);

      // Upload new cover if selected
      if (coverFile) {
        const result = await uploadImage(coverFile);
        coverUrl = result.url;
      }

      await onSubmit({
        title: title.trim(),
        slug: slug.trim(),
        content: content.trim(),
        cover_image: coverUrl || undefined,
        published_status: published,
      } as any);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Save failed.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="post-editor">
      {/* Header bar */}
      <div className="editor-header">
        <h2>{isEditing ? 'Edit Post' : 'Create New Post'}</h2>
        <div className="editor-header-actions">
          <label className="switch-label">
            <span>Published</span>
            <input
              type="checkbox"
              checked={published}
              onChange={(e) => setPublished(e.target.checked)}
              className="toggle-input"
            />
          </label>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Saving…' : isEditing ? 'Update Post' : 'Publish Post'}
          </button>
        </div>
      </div>

      {error && <div className="form-error" style={{ marginBottom: 16 }}>{error}</div>}

      {/* Cover Image */}
      <div className="editor-cover-area">
        {coverPreview ? (
          <div className="cover-preview">
            <img src={coverPreview} alt="Cover preview" />
            <div className="cover-overlay">
              <button type="button" className="btn btn-sm btn-secondary" onClick={() => coverInputRef.current?.click()}>Change Cover</button>
              <button type="button" className="btn btn-sm btn-danger" onClick={removeCover}>Remove</button>
            </div>
          </div>
        ) : (
          <button type="button" className="cover-upload-zone" onClick={() => coverInputRef.current?.click()}>
            <span className="cover-upload-icon">🖼</span>
            <span className="cover-upload-text">Add a cover image</span>
            <span className="cover-upload-hint">JPEG, PNG, GIF, WebP — max 5 MB</span>
          </button>
        )}
        <input
          ref={coverInputRef}
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp"
          onChange={handleCoverSelect}
          hidden
        />
      </div>

      {/* Title + Slug row */}
      <div className="editor-meta-row">
        <div className="editor-field editor-field-title">
          <input
            type="text"
            value={title}
            onChange={handleTitle}
            placeholder="Post title..."
            className="editor-title-input"
            required
          />
        </div>
        <div className="editor-field editor-field-slug">
          <label className="editor-field-label">Slug</label>
          <input
            type="text"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="post-slug"
            className="editor-slug-input"
            required
          />
        </div>
      </div>

      {/* Content Editor */}
      <div className="editor-content-area">
        {/* Toolbar */}
        <div className="editor-toolbar">
          {TOOLBAR_ITEMS.map((item) => (
            <button
              key={item.label}
              type="button"
              className={`toolbar-btn${item.style ? ` tb-${item.style}` : ''}`}
              title={item.title}
              onClick={() => handleToolbar(item)}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Tabs */}
        <div className="editor-tabs">
          <button type="button" className={`editor-tab ${activeTab === 'write' ? 'active' : ''}`} onClick={() => setActiveTab('write')}>Write</button>
          <button type="button" className={`editor-tab ${activeTab === 'preview' ? 'active' : ''}`} onClick={() => setActiveTab('preview')}>Preview</button>
        </div>

        {/* Write pane */}
        {activeTab === 'write' ? (
          <textarea
            ref={textareaRef}
            id="post-content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your post content here…"
            className="editor-textarea"
            required
            rows={20}
          />
        ) : (
          <div
            className="editor-preview"
            dangerouslySetInnerHTML={{ __html: content || '<p style="color:#94a3b8">Nothing to preview yet…</p>' }}
          />
        )}
      </div>
    </form>
  );
};

export default PostForm;
