import { useNavigate } from 'react-router-dom';
import PostForm from '../components/PostForm';
import { createPost, Post } from '../services/api';

const CreatePost = () => {
  const navigate = useNavigate();

  const handleSubmit = async (post: Omit<Post, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      await createPost(post);
      navigate('/admin');
    } catch (err) {
      console.error('Failed to create post', err);
      // You might want to show an error to the user
    }
  };

  return <PostForm onSubmit={handleSubmit} />;
};

export default CreatePost;