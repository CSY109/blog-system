import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PostForm from '../../components/PostForm';
import { getPostForEdit, updatePost, type Post } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';

const PostEdit = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const response = await getPostForEdit(parseInt(id, 10));
        setPost(response.data);
      } catch (err: any) {
        if (err.response?.status === 403) setError('You can only edit your own posts.');
        else setError('Failed to fetch post.');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const handleSubmit = async (postData: any) => {
    if (!id) return;
    await updatePost(parseInt(id, 10), postData);
    navigate(isAdmin ? '/admin/posts' : '/my-posts');
  };

  if (loading) return <div className="page-loading">Loading...</div>;
  if (error) return <div className="page-error">{error}</div>;
  if (!post) return <div className="page-error">Post not found.</div>;

  return (
    <div className="page" style={{ maxWidth: 860, margin: '0 auto' }}>
      <PostForm onSubmit={handleSubmit} initialPost={post} isEditing />
    </div>
  );
};

export default PostEdit;
