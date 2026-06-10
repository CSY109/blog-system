import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getPosts, type Post } from '../services/api';
import SearchBar from '../components/SearchBar';
import Pagination from '../components/Pagination';

const PAGE_SIZE = 6;

const categoryColors = [
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
];

function getReadingTime(html: string): number {
  const text = html.replace(/<[^>]+>/g, '');
  const words = text.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}

function getExcerpt(html: string, maxLen = 120): string {
  const text = html.replace(/<[^>]+>/g, '');
  if (text.length <= maxLen) return text;
  return text.slice(0, maxLen).replace(/\s+\S*$/, '') + '…';
}

const Home = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getPosts(search || undefined, page, PAGE_SIZE);
      setPosts(response.data.data);
      setTotal(response.data.total);
    } catch (err) {
      setError('Failed to fetch posts.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [search, page]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <span className="hero-badge">📝 Blog Platform</span>
          <h1 className="hero-title">
            Insights & <span className="hero-accent">Ideas</span>
          </h1>
          <p className="hero-subtitle">
            Exploring web development, programming, and technology — one article at a time.
          </p>
          <div className="hero-search">
            <SearchBar value={search} onChange={handleSearch} placeholder="Search articles by keyword..." />
          </div>
        </div>
        <div className="hero-decoration">
          <div className="hero-shape shape-1" />
          <div className="hero-shape shape-2" />
          <div className="hero-shape shape-3" />
        </div>
      </section>

      {/* Posts Section */}
      <section className="posts-section">
        <div className="posts-section-header">
          <h2>{search ? `Results for "${search}"` : 'Latest Articles'}</h2>
          {search && total > 0 && <span className="results-count">{total} article{total !== 1 ? 's' : ''} found</span>}
        </div>

        {loading ? (
          <div className="posts-grid-skeleton">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="skeleton-card">
                <div className="skeleton-img" />
                <div className="skeleton-line skeleton-title" />
                <div className="skeleton-line skeleton-text" />
                <div className="skeleton-line skeleton-text short" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="error-state">
            <span className="error-icon">⚠</span>
            <p>{error}</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">📭</span>
            <h3>{search ? 'No articles found' : 'No articles yet'}</h3>
            <p>{search ? 'Try a different keyword.' : 'Check back soon for new content.'}</p>
          </div>
        ) : (
          <>
            <div className="posts-grid">
              {posts.map((post, i) => (
                <Link to={`/posts/${post.slug}`} key={post.id} className="post-card">
                  <div
                    className="post-card-image"
                    style={post.cover_image
                      ? { backgroundImage: `url(${post.cover_image})`, backgroundSize: 'cover', backgroundPosition: 'center' }
                      : { background: categoryColors[i % categoryColors.length] }
                    }
                  >
                    {!post.cover_image && <span className="post-card-category">Article</span>}
                  </div>
                  <div className="post-card-body">
                    <h3 className="post-card-title">{post.title}</h3>
                    <p className="post-card-excerpt">{getExcerpt(post.content)}</p>
                    <div className="post-card-meta">
                      <span className="post-card-date">
                        {new Date(post.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                      <span className="post-card-reading-time">{getReadingTime(post.content)} min read</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            <Pagination current={page} total={total} pageSize={PAGE_SIZE} onChange={setPage} />
          </>
        )}
      </section>
    </div>
  );
};

export default Home;
