import { useNavigate } from 'react-router-dom';
import PostForm from '../../components/PostForm';
import { createPost } from '../../services/api';

const PostCreate = () => {
  const navigate = useNavigate();

  const handleSubmit = async (postData: any) => {
    await createPost(postData);
    navigate('/admin/posts');
  };

  return (
    <div className="page" style={{ maxWidth: 860, margin: '0 auto' }}>
      <PostForm onSubmit={handleSubmit} />
    </div>
  );
};

export default PostCreate;
