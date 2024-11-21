import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getTimeline, createPost } from '../services/bluesky';

function Feed() {
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const { session } = useAuth();

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const response = await getTimeline();
      console.log('Timeline fetch response:', response);

      if (response.success) {
        setPosts(response.data);
      } else {
        setError('Failed to load posts');
      }
    } catch (error) {
      console.error('Feed error:', error);
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!newPost.trim()) return;

    try {
      const response = await createPost(newPost);
      if (response.success) {
        setNewPost('');
        fetchPosts();
      } else {
        setError('Failed to create post');
      }
    } catch (error) {
      console.error('Post creation error:', error);
      setError('Failed to create post');
    }
  };

  // Function to create proxy URL for images
  const getProxyImageUrl = (originalUrl) => {
    const baseUrl = originalUrl.split('?')[0];
    return `https://images.weserv.nl/?url=${encodeURIComponent(baseUrl)}&default=placeholder`;
  };

  const renderPostContent = (post) => {
    const embed = post.post.embed;
    const hasImages = embed?.images?.length > 0;
    
    return (
      <>
        <p className="post-content">{post.post.record.text}</p>
        {hasImages && (
          <div className="post-images">
            {embed.images.map((image, index) => (
              <img
                key={index}
                src={getProxyImageUrl(image.thumb)}
                alt={image.alt || 'Post image'}
                className="post-image"
                onClick={() => window.open(getProxyImageUrl(image.fullsize), '_blank')}
                crossOrigin="anonymous"
              />
            ))}
          </div>
        )}
      </>
    );
  };

  // Filter posts based on search term
  const filteredPosts = posts.filter(post => {
    if (!searchTerm) return true;
    
    const content = post.post.record.text.toLowerCase();
    const author = post.post.author.handle.toLowerCase();
    const search = searchTerm.toLowerCase();
    
    return content.includes(search) || author.includes(search);
  });

  if (loading) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '2rem' }}>
        Loading your feed...
      </div>
    );
  }

  return (
    <div className="container">
      <div className="search-container">
        <input
          type="text"
          className="search-input"
          placeholder="Search posts by content or author..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <form onSubmit={handleCreatePost} style={{ marginBottom: '2rem' }}>
        <div className="form-group">
          <textarea
            className="input"
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
            placeholder="What's happening?"
            style={{ minHeight: '100px', resize: 'vertical' }}
          />
        </div>
        <button type="submit" className="btn btn-primary">Post</button>
      </form>

      {error && (
        <div className="error" style={{ marginBottom: '1rem' }}>
          {error}
        </div>
      )}

      <div className="feed">
        {filteredPosts.map((post) => (
          <div key={post.post.uri} className="post">
            <div className="post-header">
              <div className="post-author-info">
                <span className="post-author">@{post.post.author.handle}</span>
                <span className="post-time">
                  {new Date(post.post.indexedAt).toLocaleString()}
                </span>
              </div>
            </div>
            {renderPostContent(post)}
          </div>
        ))}

        {filteredPosts.length === 0 && !loading && (
          <div className="no-results">
            {searchTerm 
              ? 'No posts found matching your search' 
              : 'No posts available'}
          </div>
        )}
      </div>
    </div>
  );
}

export default Feed;