import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getPosts, type Post } from '../services/api';

const Home = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await getPosts();
        setPosts(response.data.data);
      } catch (err) {
        setError('Failed to fetch posts.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
      <h1>Blog</h1>
      {posts.length === 0 ? (
        <p>No posts yet.</p>
      ) : (
        <ul>
          {posts.map((post) => (
            <li key={post.id}>
              <Link to={`/posts/${post.slug}`}>
                <h2>{post.title}</h2>
              </Link>
              <p>Published on: {new Date(post.created_at).toLocaleDateString()}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Home;