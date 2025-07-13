import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../hooks/useAuth'
import { postsAPI } from '../services/api'
import { User, FileText, Shield, Calendar } from 'lucide-react'

const Dashboard = () => {
  const { user } = useAuth()

  const { data: postsData, isLoading, error } = useQuery({
    queryKey: ['posts', 'dashboard'],
    queryFn: () => postsAPI.getAll({ page: 1, limit: 10 }),
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1
  })

  const posts = postsData?.data?.posts || []

  const stats = [
    {
      name: 'Total Posts',
      value: posts?.length || 0,
      icon: FileText,
      color: 'bg-blue-500',
    },
    {
      name: 'Your Role',
      value: user?.role || 'Unknown',
      icon: Shield,
      color: 'bg-green-500',
    },
    {
      name: 'User ID',
      value: user?.id || 'Unknown',
      icon: User,
      color: 'bg-purple-500',
    },
  ]

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white p-6 rounded-lg shadow-sm">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/3"></div>
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
        <div className="text-red-600 mb-4">Failed to load dashboard data</div>
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
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome back, {user?.name}!</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.name} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className={`p-3 rounded-lg ${stat.color}`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Recent Posts */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Recent Posts</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {posts?.slice(0, 5).map((post) => (
            <div key={post.id} className="px-6 py-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm text-gray-900">{post.content}</p>
                  <div className="flex items-center mt-2 text-xs text-gray-500">
                    <Calendar className="h-3 w-3 mr-1" />
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
                    <span>Author: {post.author || 'Unknown'}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {posts?.length === 0 && (
            <div className="px-6 py-8 text-center text-gray-500">
              No posts found
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Dashboard 