import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PostForm from '../components/PostForm';
import { getAdminPosts, updatePost, Post } from '../services/api';

const EditPost = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const fetchPost = async () => {
      try {
        // We get all posts and find the one with the id, because there is no getPostById endpoint
        const response = await getAdminPosts();
        const postToEdit = response.data.find(p => p.id === parseInt(id, 10));
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
      navigate('/admin');
    } catch (err) {
      console.error('Failed to update post', err);
      // You might want to show an error to the user
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;
  if (!post) return <div>Post not found.</div>;

  return <PostForm onSubmit={handleSubmit} initialPost={post} isEditing={true} />;
};

export default EditPost;