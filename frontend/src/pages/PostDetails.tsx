import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  getPostBySlug,
  getPostComments,
  submitComment,
  uploadImage,
  type Post,
  type Comment,
} from '../services/api';

const avatarColors = ['#667eea', '#f5576c', '#4facfe', '#43e97b', '#fa709a', '#a18cd1', '#f093fb', '#00f2fe'];

function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() || '')
    .join('');
}

function getAvatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return avatarColors[Math.abs(hash) % avatarColors.length];
}

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5 MB

const PostDetails = () => {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Comment form
  const [authorName, setAuthorName] = useState('');
  const [commentContent, setCommentContent] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [commentMsg, setCommentMsg] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchComments = useCallback(async () => {
    if (!slug) return;
    try {
      const response = await getPostComments(slug);
      setComments(response.data);
    } catch (err) {
      // may be empty
    }
  }, [slug]);

  useEffect(() => {
    if (!slug) return;
    const fetchPost = async () => {
      try {
        const response = await getPostBySlug(slug);
        setPost(response.data);
      } catch (err) {
        setError('Failed to fetch post.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
    fetchComments();
  }, [slug, fetchComments]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setCommentMsg('Only JPEG, PNG, GIF, and WebP images are allowed.');
      return;
    }

    // Validate size
    if (file.size > MAX_IMAGE_SIZE) {
      setCommentMsg('Image must be under 5 MB.');
      return;
    }

    setCommentMsg('');
    setImageFile(file);

    // Preview
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!post || !authorName.trim() || !commentContent.trim()) return;
    setSubmitting(true);
    setCommentMsg('');

    try {
      let imageUrl: string | undefined;

      // Upload image first if selected
      if (imageFile) {
        const uploadResult = await uploadImage(imageFile);
        imageUrl = uploadResult.url;
      }

      await submitComment({
        post_id: post.id,
        author_name: authorName.trim(),
        content: commentContent.trim(),
        image_url: imageUrl,
      });

      setAuthorName('');
      setCommentContent('');
      setImageFile(null);
      setImagePreview(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      setCommentMsg('✓ Comment submitted for review. It will appear once approved.');
    } catch (err) {
      setCommentMsg('Failed to submit comment.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="post-detail-loading">
        <div className="skeleton-post-title" />
        <div className="skeleton-post-meta" />
        <div className="skeleton-post-line" />
        <div className="skeleton-post-line" />
        <div className="skeleton-post-line short" />
      </div>
    );
  }

  if (error) return <div className="post-error">{error}</div>;
  if (!post) return <div className="post-error">Post not found.</div>;

  return (
    <div className="post-detail-page">
      <Link to="/" className="back-link">← Back to articles</Link>

      <article className="post-detail-article">
        <header className="post-detail-header">
          <div className="post-detail-badge">Article</div>
          <h1>{post.title}</h1>
          <div className="post-detail-meta">
            <span className="post-detail-date">
              {new Date(post.created_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </span>
          </div>
        </header>

        <div className="post-detail-content" dangerouslySetInnerHTML={{ __html: post.content }} />

        <div className="post-detail-footer">
          <p>Thanks for reading! If you enjoyed this article, feel free to leave a comment below.</p>
          <div className="post-detail-share">
            <span>Share:</span>
            <button
              className="share-btn"
              onClick={() => navigator.clipboard.writeText(window.location.href)}
              title="Copy link"
            >
              🔗 Copy Link
            </button>
          </div>
        </div>
      </article>

      {/* Comments */}
      <section className="comments-section">
        <h2 className="comments-title">
          <span className="comments-icon">💬</span>
          Comments
          {comments.length > 0 && <span className="comments-count">{comments.length}</span>}
        </h2>

        {comments.length > 0 ? (
          <div className="comments-list">
            {comments.map((c) => (
              <div key={c.id} className="comment-card">
                <div
                  className="comment-avatar"
                  style={{ backgroundColor: getAvatarColor(c.author_name) }}
                >
                  {getInitials(c.author_name)}
                </div>
                <div className="comment-body">
                  <div className="comment-header">
                    <strong className="comment-author">{c.author_name}</strong>
                    <span className="comment-date">
                      {new Date(c.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                  <p className="comment-content">{c.content}</p>
                  {c.image_url && (
                    <div className="comment-image-wrapper">
                      <a href={c.image_url} target="_blank" rel="noopener noreferrer">
                        <img src={c.image_url} alt="comment attachment" className="comment-image" />
                      </a>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="no-comments">No comments yet. Be the first to comment!</p>
        )}

        {/* Comment Form */}
        <div className="comment-form-wrapper">
          <h3>Leave a Comment</h3>
          <form onSubmit={handleCommentSubmit} className="comment-form">
            <div className="comment-form-fields">
              <div className="form-group">
                <label htmlFor="author-name">Your Name</label>
                <input
                  id="author-name"
                  type="text"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  placeholder="John Doe"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="image-upload">Attach Image (optional)</label>
                <input
                  id="image-upload"
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  onChange={handleFileChange}
                  style={{ padding: '8px' }}
                />
                {imagePreview && (
                  <div className="image-preview">
                    <img src={imagePreview} alt="Preview" />
                    <button type="button" className="btn btn-sm btn-danger" onClick={handleRemoveImage} style={{ marginTop: 6 }}>
                      ✕ Remove
                    </button>
                  </div>
                )}
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="comment-content">Your Comment</label>
              <textarea
                id="comment-content"
                value={commentContent}
                onChange={(e) => setCommentContent(e.target.value)}
                placeholder="Write your thoughts..."
                required
                rows={4}
              />
            </div>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? (imageFile ? 'Uploading & submitting…' : 'Submitting…') : 'Post Comment'}
            </button>
            {commentMsg && (
              <p className={`comment-msg ${commentMsg.startsWith('✓') ? 'success' : 'error'}`}>
                {commentMsg}
              </p>
            )}
          </form>
        </div>
      </section>
    </div>
  );
};

export default PostDetails;
