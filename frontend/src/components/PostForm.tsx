import { useState, useEffect, FormEvent } from 'react';
import { Post } from '../services/api';

interface PostFormProps {
  onSubmit: (post: Omit<Post, 'id' | 'created_at' | 'updated_at'>) => void;
  initialPost?: Partial<Post>;
  isEditing?: boolean;
}

const PostForm = ({ onSubmit, initialPost, isEditing = false }: PostFormProps) => {
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [content, setContent] = useState('');
  const [published_status, setPublishedStatus] = useState(false);

  useEffect(() => {
    if (initialPost) {
      setTitle(initialPost.title || '');
      setSlug(initialPost.slug || '');
      setContent(initialPost.content || '');
      setPublishedStatus(initialPost.published_status || false);
    }
  }, [initialPost]);
  
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    setSlug(generateSlug(newTitle));
};


  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit({ title, slug, content, published_status });
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>{isEditing ? 'Edit Post' : 'Create Post'}</h2>
      <div>
        <label htmlFor="title">Title</label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={handleTitleChange}
          required
        />
      </div>
      <div>
        <label htmlFor="slug">Slug</label>
        <input
          id="slug"
          type="text"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          required
        />
      </div>
      <div>
        <label htmlFor="content">Content</label>
        <textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
        />
      </div>
      <div>
        <label>
          <input
            type="checkbox"
            checked={published_status}
            onChange={(e) => setPublishedStatus(e.target.checked)}
          />
          Published
        </label>
      </div>
      <button type="submit">{isEditing ? 'Update' : 'Create'}</button>
    </form>
  );
};

export default PostForm;
