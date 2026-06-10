import { useState, useEffect, useRef, type FormEvent } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import ImageExtension from '@tiptap/extension-image';
import { uploadImage } from '../services/api';
import type { Post } from '../services/api';

interface PostFormProps {
  onSubmit: (post: Omit<Post, 'id' | 'created_at' | 'updated_at'> & { cover_image?: string }) => Promise<void>;
  initialPost?: Partial<Post>;
  isEditing?: boolean;
}

const MAX_COVER_SIZE = 5 * 1024 * 1024;

const PostForm = ({ onSubmit, initialPost, isEditing = false }: PostFormProps) => {
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [published, setPublished] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const coverInputRef = useRef<HTMLInputElement>(null);

  // Sync state when initialPost arrives (async from API)
  useEffect(() => {
    if (initialPost) {
      setTitle(initialPost.title || '');
      setSlug(initialPost.slug || '');
      setPublished(initialPost.published_status ? true : false);
      if (initialPost.cover_image) {
        setCoverPreview(initialPost.cover_image);
      }
    }
  }, [initialPost]);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      ImageExtension.configure({ allowBase64: false, inline: false }),
    ],
    content: initialPost?.content || '',
    editorProps: {
      attributes: {
        class: 'tiptap-editor',
      },
    },
    immediatelyRender: false,
  });

  // Sync editor content when initialPost changes (edit mode)
  useEffect(() => {
    if (editor && initialPost?.content) {
      const current = editor.getHTML();
      if (current !== initialPost.content) {
        editor.commands.setContent(initialPost.content);
      }
    }
  }, [editor, initialPost]);

  const generateSlug = (t: string) =>
    t.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

  const handleTitle = (val: string) => {
    setTitle(val);
    if (!isEditing) setSlug(generateSlug(val));
  };

  const handleCoverSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
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

  const insertImage = () => {
    const url = prompt('Enter image URL:');
    if (url && editor) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !slug.trim()) {
      setError('Title and slug are required.');
      return;
    }
    if (!editor) return;
    setSaving(true);
    setError('');

    try {
      // Determine cover URL
      let coverUrl: string | null | undefined;
      const hadCover = !!initialPost?.cover_image;
      const previewIsGone = hadCover && !coverPreview && !coverFile;

      if (previewIsGone) {
        coverUrl = null; // Explicitly remove cover
      } else if (coverFile) {
        const result = await uploadImage(coverFile);
        coverUrl = result.url;
      } else if (coverPreview && coverPreview.startsWith('/uploads/')) {
        coverUrl = coverPreview;
      } else if (coverPreview && coverPreview.startsWith('data:')) {
        coverUrl = initialPost?.cover_image || undefined;
      } else {
        coverUrl = undefined;
      }

      await onSubmit({
        title: title.trim(),
        slug: slug.trim(),
        content: editor.getHTML(),
        cover_image: coverUrl || undefined,
        published_status: published,
      } as any);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Save failed.');
    } finally {
      setSaving(false);
    }
  };

  if (!editor) return null;

  return (
    <form onSubmit={handleSubmit} className="post-editor">
      {/* Header bar */}
      <div className="editor-header">
        <h2>{isEditing ? 'Edit Post' : 'Create New Post'}</h2>
        <div className="editor-header-actions">
          <label className="switch-label">
            <span>Published</span>
            <input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} className="toggle-input" />
          </label>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Saving…' : isEditing ? 'Update Post' : 'Publish Post'}
          </button>
        </div>
      </div>

      {error && <div className="form-error" style={{ margin: '0 24px', marginTop: 16 }}>{error}</div>}

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
        <input ref={coverInputRef} type="file" accept="image/jpeg,image/png,image/gif,image/webp" onChange={handleCoverSelect} hidden />
      </div>

      {/* Title + Slug row */}
      <div className="editor-meta-row" style={{ padding: '16px 24px', display: 'grid', gridTemplateColumns: '1fr 200px', gap: 16, borderBottom: '1px solid #f1f5f9' }}>
        <div>
          <input
            type="text"
            value={title}
            onChange={(e) => handleTitle(e.target.value)}
            placeholder="Post title..."
            className="editor-title-input"
            style={{ border: 'none', fontSize: '1.5rem', fontWeight: 700, padding: '8px 0', fontFamily: 'inherit', outline: 'none', width: '100%', color: '#1e293b' }}
            required
          />
        </div>
        <div>
          <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>Slug</label>
          <input
            type="text"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="post-slug"
            style={{ padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: '0.9rem', fontFamily: 'inherit', outline: 'none', width: '100%' }}
            required
          />
        </div>
      </div>

      {/* TipTap Toolbar */}
      <div className="editor-toolbar">
        <button type="button" className="toolbar-btn tb-bold" onClick={() => editor.chain().focus().toggleBold().run()} title="Bold">B</button>
        <button type="button" className="toolbar-btn tb-italic" onClick={() => editor.chain().focus().toggleItalic().run()} title="Italic">I</button>
        <button type="button" className="toolbar-btn" onClick={() => editor.chain().focus().toggleStrike().run()} title="Strikethrough">S</button>
        <span className="toolbar-sep" />
        <button type="button" className="toolbar-btn" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} title="Heading 2">H2</button>
        <button type="button" className="toolbar-btn" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} title="Heading 3">H3</button>
        <span className="toolbar-sep" />
        <button type="button" className="toolbar-btn" onClick={() => editor.chain().focus().toggleBulletList().run()} title="Bullet list">• List</button>
        <button type="button" className="toolbar-btn" onClick={() => editor.chain().focus().toggleOrderedList().run()} title="Ordered list">1. List</button>
        <button type="button" className="toolbar-btn" onClick={() => editor.chain().focus().toggleBlockquote().run()} title="Quote">❝</button>
        <span className="toolbar-sep" />
        <button type="button" className="toolbar-btn" onClick={() => editor.chain().focus().toggleCodeBlock().run()} title="Code block">{'<>'}</button>
        <button type="button" className="toolbar-btn" onClick={() => editor.chain().focus().toggleCode().run()} title="Inline code">`</button>
        <button type="button" className="toolbar-btn" onClick={insertImage} title="Insert image URL">🖼</button>
      </div>

      {/* Editor */}
      <EditorContent editor={editor} />

      <style>{`
        .tiptap-editor {
          min-height: 400px;
          padding: 20px 24px;
          font-family: inherit;
          font-size: 1rem;
          line-height: 1.8;
          color: #334155;
          outline: none;
          cursor: text;
        }
        .tiptap-editor h1 { font-size: 2rem; margin: 20px 0 10px; }
        .tiptap-editor h2 { font-size: 1.5rem; margin: 20px 0 10px; }
        .tiptap-editor h3 { font-size: 1.2rem; margin: 16px 0 8px; }
        .tiptap-editor p { margin-bottom: 14px; }
        .tiptap-editor ul, .tiptap-editor ol { margin: 10px 0 14px 24px; }
        .tiptap-editor li { margin-bottom: 4px; }
        .tiptap-editor blockquote {
          border-left: 4px solid #6366f1;
          margin: 14px 0;
          padding: 8px 16px;
          background: #eef2ff;
          color: #4338ca;
          border-radius: 0 8px 8px 0;
        }
        .tiptap-editor pre {
          background: #1e293b;
          color: #e2e8f0;
          padding: 16px 20px;
          border-radius: 10px;
          overflow-x: auto;
          font-family: 'Consolas', 'Fira Code', monospace;
          font-size: 0.9rem;
          line-height: 1.5;
          margin: 14px 0;
        }
        .tiptap-editor code {
          background: #eef2ff;
          color: #6366f1;
          padding: 2px 6px;
          border-radius: 4px;
          font-family: 'Consolas', monospace;
          font-size: 0.9em;
        }
        .tiptap-editor pre code { background: none; color: inherit; padding: 0; border-radius: 0; }
        .tiptap-editor img { max-width: 100%; border-radius: 8px; margin: 12px 0; }
        .tiptap-editor hr { border: none; border-top: 2px solid #e2e8f0; margin: 24px 0; }
        .tiptap-editor a { color: #6366f1; text-decoration: underline; }
        .tiptap-editor strong { color: #1e293b; font-weight: 700; }
      `}</style>
    </form>
  );
};

export default PostForm;
