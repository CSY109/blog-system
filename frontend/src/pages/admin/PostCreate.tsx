import { useNavigate } from 'react-router-dom';
import PostForm from '../../components/PostForm';
import { createPost, type Post } from '../../services/api';

const PostCreate = () => {
  const navigate = useNavigate();

  const handleSubmit = async (post: Omit<Post, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      await createPost(post);
      navigate('/admin/posts');
    } catch (err) {
      console.error('Failed to create post', err);
    }
  };

  return (
    <div className="page">
      <PostForm onSubmit={handleSubmit} />
    </div>
  );
};

export default PostCreate;
