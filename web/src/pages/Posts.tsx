import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { toast } from 'react-hot-toast'
import { useAuth } from '../hooks/useAuth'
import { postsAPI, Post } from '../services/api'
import {
  Plus,
  Trash2,
  Edit,
  Calendar,
  User,
  AlertCircle,
  Filter,
} from 'lucide-react'
import { useRef, useCallback, useEffect } from 'react';

const Posts = () => {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [editingPost, setEditingPost] = useState<Post | null>(null)
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    author: '',
    sortBy: 'created',
    sortOrder: 'desc'
  })
  const [showFilters, setShowFilters] = useState(false)
  const [posts, setPosts] = useState<Post[]>([]);
  const [isFetchingNext, setIsFetchingNext] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const observer = useRef<IntersectionObserver | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm()

  const editForm = useForm()

  // Fetch posts with filters
  const { isLoading, error } = useQuery({
    queryKey: ['posts', filters],
    queryFn: () => postsAPI.getAll(filters),
    refetchOnWindowFocus: false,
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 1
  })

  // Create post mutation
  const createMutation = useMutation({
    mutationFn: postsAPI.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] })
      toast.success('Post created successfully!')
      setIsCreateModalOpen(false)
      reset()
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create post')
    },
  })

  // Update post mutation
  const updateMutation = useMutation({
    mutationFn: postsAPI.update,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] })
      toast.success('Post updated successfully!')
      setEditingPost(null)
      editForm.reset()
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update post')
    },
  })

  // Delete post mutation
  const deleteMutation = useMutation({
    mutationFn: postsAPI.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] })
      toast.success('Post deleted successfully!')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete post')
    },
  })


  const onSubmit = (data: any) => {
    createMutation.mutate(data)
  }

  const onEditSubmit = (data: any) => {
    updateMutation.mutate({ id: editingPost?.id, ...data })
  }

  const handleDelete = (postId: string) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      deleteMutation.mutate(postId)
    }
  }

  const handleEdit = (post: Post) => {
    setEditingPost(post)
    editForm.reset({
      content: post.content,
    })
  }

  const canDeletePost = (post: Post) => {
    return user?.role === 'admin' || post.author.id === user?.id || post.author === user?.id
  }

  const canEditPost = (post: Post) => { 
    return user?.role === 'admin' || post.author.id === user?.id || post.author === user?.id
  }

  const updateFilters = (newFilters: any) => {
    setFilters(prev => ({ ...prev, ...newFilters, page: 1 }))
  }

  // Infinite scroll: observe the loadMoreRef
  const lastPostRef = useCallback(
    (node: any) => {
      if (isFetchingNext) {
        return;
      }
      if (observer.current) {
        observer.current.disconnect();
      }
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          fetchNextPage();
        }
      });
      if (node) {
        observer.current.observe(node);
      }
    },
    [isFetchingNext, hasMore]
  );

  const fetchNextPage = async () => {
    if (!hasMore) {
      return;
    }
    setIsFetchingNext(true);
    const nextPage = filters.page + 1;
    try {
      const res = await postsAPI.getAll({ ...filters, page: nextPage });
      if (res.data && res.data.posts.length > 0) {
        setPosts((prev) => [...prev, ...res.data!.posts]);
        setFilters((prev) => ({ ...prev, page: nextPage }));
        setHasMore(res.data!.pagination.hasNext);
      } else {
        setHasMore(false);
      }
    } catch (e) {
      setHasMore(false);
    } finally {
      setIsFetchingNext(false);
    }
  };

  // Reset posts and pagination when filters (except page) change
  useEffect(() => {
    setFilters((prev) => ({ ...prev, page: 1 }));
    setHasMore(true);
    // fetch first page
    (async () => {
      const res = await postsAPI.getAll({ ...filters, page: 1 });
      if (res.data) {
        setPosts(res.data.posts);
        setHasMore(res.data.pagination.hasNext);
      }
    })();
  }, [filters.author, filters.sortBy, filters.sortOrder]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white p-6 rounded-lg shadow-sm">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <div className="text-red-600 mb-4">Failed to load posts</div>
        <button
          onClick={() => window.location.reload()}
          className="btn btn-primary"
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Posts</h1>
          <p className="text-gray-600">Manage and view all posts</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="btn btn-secondary"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </button>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="btn btn-primary"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Post
          </button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Filters</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Author
              </label>
              <input
                type="text"
                value={filters.author}
                onChange={(e) => updateFilters({ author: e.target.value })}
                className="input"
                placeholder="Filter by author"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sort By
              </label>
              <select
                value={filters.sortBy}
                onChange={(e) => updateFilters({ sortBy: e.target.value })}
                className="input"
              >
                <option value="created">Date Created</option>
                <option value="comments">Comments</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sort Order
              </label>
              <select
                value={filters.sortOrder}
                onChange={(e) => updateFilters({ sortOrder: e.target.value })}
                className="input"
              >
                <option value="desc">Descending</option>
                <option value="asc">Ascending</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Posts Per Page
              </label>
              <select
                value={filters.limit}
                onChange={(e) => updateFilters({ limit: parseInt(e.target.value) })}
                className="input"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Posts List */}
      <div className="space-y-4">
        {posts.map((post, idx) => (
          <div key={post.id} ref={idx === posts.length - 1 ? lastPostRef : undefined}>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">{post.content}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="h-4 w-4 mr-1" />
                      <span>
                        {new Date(post.created).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                      <span className="mx-2">•</span>
                      <User className="h-4 w-4 mr-1" />
                      <span>Author: {post.author}</span>
                      {post.author.id === user?.id && (
                        <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                          You
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4">
                      {canEditPost(post) && (
                        <button
                          onClick={() => handleEdit(post)}
                          className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors"
                          title="Edit post"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                      )}
                      {canDeletePost(post) && (
                        <button
                          onClick={() => handleDelete(post.id)}
                          disabled={deleteMutation.isPending}
                          className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors"
                          title="Delete post"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
        {isFetchingNext && <div className="flex items-center justify-center py-4"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>}
        {!hasMore && posts.length > 0 && <div className="text-center py-4 text-gray-400">No more posts</div>}
      </div>

      {/* Create Post Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Create New Post</h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
                  Content
                </label>
                <textarea
                  id="content"
                  rows={4}
                  {...register('content', {
                    required: 'Content is required',
                    maxLength: {
                      value: 1000,
                      message: 'Content must be less than 1000 characters'
                    }
                  })}
                  className="input resize-none"
                  placeholder="What's on your mind?"
                />
                {errors.content && (
                  <p className="mt-1 text-sm text-red-600">{errors.content.message?.toString()}</p>
                )}
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreateModalOpen(false)
                    reset()
                  }}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="btn btn-primary"
                >
                  {createMutation.isPending ? 'Creating...' : 'Create Post'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Post Modal */}
      {editingPost && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Edit Post</h2>
            <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
              <div>
                <label htmlFor="edit-content" className="block text-sm font-medium text-gray-700 mb-1">
                  Content
                </label>
                <textarea
                  id="edit-content"
                  rows={4}
                  {...editForm.register('content', {
                    required: 'Content is required',
                    maxLength: {
                      value: 1000,
                      message: 'Content must be less than 1000 characters'
                    }
                  })}
                  className="input resize-none"
                />
                {editForm.formState.errors.content && (
                  <p className="mt-1 text-sm text-red-600">{editForm.formState.errors.content.message?.toString()}</p>
                )}
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setEditingPost(null)
                    editForm.reset()
                  }}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updateMutation.isPending}
                  className="btn btn-primary"
                >
                  {updateMutation.isPending ? 'Updating...' : 'Update Post'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Posts 