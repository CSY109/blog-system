import { useNavigate } from 'react-router-dom';
import PostForm from '../../components/PostForm';
import { createPost } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';

const PostCreate = () => {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();

  const handleSubmit = async (postData: any) => {
    await createPost(postData);
    navigate(isAdmin ? '/admin/posts' : '/my-posts');
  };

  return (
    <div className="page" style={{ maxWidth: 860, margin: '0 auto' }}>
      <PostForm onSubmit={handleSubmit} />
    </div>
  );
};

export default PostCreate;
