import React, { useState, useCallback, useEffect } from 'react';
import { useInView } from 'react-intersection-observer';
import { MessageCircle, Share, MoreVertical, User } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';

interface Post {
  id: string;
  content: string;
  author: string; // Backend sends author ID, not author object
  created: string;
  updatedAt: string;
}

interface ApiResponse {
  success: boolean;
  data: {
    posts: Post[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
    };
  };
}

// Author mapping (since backend only sends author ID)
const authorMap = {
  'u1': { id: 'u1', name: 'John Doe', email: 'john.doe@example.com' },
  'u2': { id: 'u2', name: 'Jane Doe', email: 'jane.doe@example.com' },
  'u3': { id: 'u3', name: 'Jim Doe', email: 'jim.doe@example.com' },
  'u4': { id: 'u4', name: 'Jill Doe', email: 'jill.doe@example.com' },
  'u5': { id: 'u5', name: 'Jack Doe', email: 'jack.doe@example.com' },
};

const Feed: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Intersection observer for infinite scroll
  const { ref: loadMoreRef, inView } = useInView({
    threshold: 0.1,
    rootMargin: '100px',
  });

  // Fetch posts function
  const fetchPosts = useCallback(async (pageNum: number, append: boolean = false) => {
    try {
      setError(null);
      const params = new URLSearchParams({
        page: pageNum.toString(),
        limit: '10'
      });
      
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3030/api/v1'}/posts?${params}`);
      const data: ApiResponse = await response.json();
      
      if (data.success && data.data) {
        if (append) {
          setPosts(prev => [...prev, ...data.data.posts]);
        } else {
          setPosts(data.data.posts);
        }
        setHasMore(data.data.pagination.hasNext);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load posts');
      toast.error('Failed to load posts');
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchPosts(1, false);
  }, [fetchPosts]);

  // Load more posts when intersection observer triggers
  useEffect(() => {
    if (inView && hasMore && !isLoadingMore && !loading) {
      loadMore();
    }
  }, [inView, hasMore, isLoadingMore, loading]);

  const loadMore = useCallback(async () => {
    if (!hasMore || isLoadingMore) {
      return;
    }

    setIsLoadingMore(true);
    const nextPage = page + 1;
    setPage(nextPage);
    
    try {
      await fetchPosts(nextPage, true);
    } catch (err) {
      setPage(prev => prev - 1);
    } finally {
      setIsLoadingMore(false);
    }
  }, [hasMore, isLoadingMore, page, fetchPosts]);

  if (loading && page === 1) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Error loading feed</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => fetchPosts(1, false)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Your Feed</h1>

      {/* Load more trigger */}
      {hasMore && (
        <div ref={loadMoreRef} className="flex justify-center py-8">
          {isLoadingMore ? (
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          ) : (
            <div className="text-gray-500">Loading more posts...</div>
          )}
        </div>
      )}

      {/* End of feed */}
      {!hasMore && posts.length > 0 && (
        <div className="text-center py-8 text-gray-500">
          You've reached the end of your feed
        </div>
      )}

      {/* Empty state */}
      {posts.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="mx-auto h-12 w-12 text-gray-400 mb-4">
            <MessageCircle className="h-12 w-12" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No posts yet</h3>
          <p className="text-gray-600">Follow some users to see their posts in your feed!</p>
        </div>
      )}
    </div>
  );
};

// Optimized Post Card Component
interface PostCardProps {
  post: Post;
  onShare: (postId: string) => void;
}

const PostCard: React.FC<PostCardProps> = React.memo(({ post, onShare }) => {
  const [showMenu, setShowMenu] = useState(false);

  // Get author info from mapping
  const authorInfo = authorMap[post.author as keyof typeof authorMap] || {
    id: post.author,
    name: 'Unknown User',
    email: 'unknown@example.com'
  };

  return (
    <article className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {/* Post Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 bg-gray-300 rounded-full flex items-center justify-center">
            <User className="h-5 w-5 text-gray-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{authorInfo.name}</h3>
            <p className="text-sm text-gray-500">
              {(() => {
                try {
                  const date = new Date(post.created);
                  if (isNaN(date.getTime())) {
                    return 'Unknown date';
                  }
                  return formatDistanceToNow(date, { addSuffix: true });
                } catch (error) {
                  return 'Unknown date';
                }
              })()}
            </p>
          </div>
        </div>
        
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1 rounded-full hover:bg-gray-100"
          >
            <MoreVertical className="h-5 w-5 text-gray-400" />
          </button>
          
          {showMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-10">
              <div className="py-1">
                <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  Report
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Post Content */}
      <div className="mb-4">
        <p className="text-gray-900 leading-relaxed">{post.content}</p>
      </div>

      {/* Post Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="flex items-center space-x-6">
          <button
            onClick={() => onShare(post.id)}
            className="flex items-center space-x-2 text-sm text-gray-500 hover:text-green-600"
          >
            <Share className="h-5 w-5" />
            <span>Share</span>
          </button>
        </div>
      </div>
    </article>
  );
});

PostCard.displayName = 'PostCard';

export default Feed; 