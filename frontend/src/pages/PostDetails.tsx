import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { getPostBySlug, getPostComments, submitComment, type Post, type Comment } from '../services/api';

const PostDetails = () => {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [authorName, setAuthorName] = useState('');
  const [commentContent, setCommentContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [commentMsg, setCommentMsg] = useState('');

  const fetchComments = useCallback(async () => {
    if (!slug) return;
    try {
      const response = await getPostComments(slug);
      setComments(response.data);
    } catch (err) {
      // comments may not be available yet
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

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!post || !authorName.trim() || !commentContent.trim()) return;
    setSubmitting(true);
    setCommentMsg('');
    try {
      await submitComment({
        post_id: post.id,
        author_name: authorName.trim(),
        content: commentContent.trim(),
      });
      setAuthorName('');
      setCommentContent('');
      setCommentMsg('Comment submitted for review. It will appear once approved.');
    } catch (err) {
      setCommentMsg('Failed to submit comment.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="page-loading">Loading...</div>;
  if (error) return <div className="page-error">{error}</div>;
  if (!post) return <div className="page-error">Post not found.</div>;

  return (
    <article className="post-detail">
      <h1>{post.title}</h1>
      <p className="post-meta">
        Published on: {new Date(post.created_at).toLocaleDateString()}
      </p>
      <div className="post-content" dangerouslySetInnerHTML={{ __html: post.content }} />

      <section className="comments-section">
        <h2>Comments ({comments.length})</h2>

        {comments.map((c) => (
          <div key={c.id} className="comment">
            <div className="comment-header">
              <strong>{c.author_name}</strong>
              <span className="comment-date">
                {new Date(c.created_at).toLocaleDateString()}
              </span>
            </div>
            <p className="comment-content">{c.content}</p>
          </div>
        ))}

        <h3>Leave a Comment</h3>
        <form onSubmit={handleCommentSubmit} className="comment-form">
          <div className="form-group">
            <label htmlFor="author-name">Name</label>
            <input
              id="author-name"
              type="text"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="comment-content">Comment</label>
            <textarea
              id="comment-content"
              value={commentContent}
              onChange={(e) => setCommentContent(e.target.value)}
              required
              rows={4}
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? 'Submitting...' : 'Submit Comment'}
          </button>
          {commentMsg && <p className="comment-msg">{commentMsg}</p>}
        </form>
      </section>
    </article>
  );
};

export default PostDetails;
