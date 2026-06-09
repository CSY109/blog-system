import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getPostBySlug, Post } from '../services/api';

const PostDetails = () => {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
  }, [slug]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;
  if (!post) return <div>Post not found.</div>;

  return (
    <article>
      <h1>{post.title}</h1>
      <p>Published on: {new Date(post.created_at).toLocaleDateString()}</p>
      <div dangerouslySetInnerHTML={{ __html: post.content }} />
    </article>
  );
};

export default PostDetails;