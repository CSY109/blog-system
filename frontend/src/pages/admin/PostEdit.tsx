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
    const fetchPost = async () => {
      try {
        const response = await getAdminPosts(undefined, 1, 100);
        const postToEdit = response.data.data.find((p) => p.id === parseInt(id, 10));
        if (postToEdit) {
          setPost(postToEdit);
        } else {
          setError('Post not found.');
        }
      } catch (err) {
        setError('Failed to fetch post.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [id]);

  const handleSubmit = async (updatedPostData: Omit<Post, 'id' | 'created_at' | 'updated_at'>) => {
    if (!id) return;
    try {
      await updatePost(parseInt(id, 10), updatedPostData);
      navigate('/admin/posts');
    } catch (err) {
      console.error('Failed to update post', err);
    }
  };

  if (loading) return <div className="page-loading">Loading...</div>;
  if (error) return <div className="page-error">{error}</div>;
  if (!post) return <div className="page-error">Post not found.</div>;

  return (
    <div className="page">
      <PostForm onSubmit={handleSubmit} initialPost={post} isEditing={true} />
    </div>
  );
};

export default PostEdit;
