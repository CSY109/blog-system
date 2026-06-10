import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PostForm from '../../components/PostForm';
import { getAdminPosts, updatePost, type Post } from '../../services/api';

const PostEdit = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const response = await getAdminPosts(undefined, 1, 100);
        const found = response.data.data.find((p) => p.id === parseInt(id, 10));
        if (found) setPost(found);
        else setError('Post not found.');
      } catch (err) {
        setError('Failed to fetch post.');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const handleSubmit = async (postData: any) => {
    if (!id) return;
    await updatePost(parseInt(id, 10), postData);
    navigate('/admin/posts');
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
