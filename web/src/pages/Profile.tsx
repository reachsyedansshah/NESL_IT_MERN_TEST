import { useAuth } from '../hooks/useAuth'
import { User, Shield, Key } from 'lucide-react'

const Profile = () => {
  const { user } = useAuth()

  const profileInfo = [
    {
      label: 'Name',
      value: user?.name || 'Unknown',
      icon: User,
      color: 'bg-blue-500',
    },
    {
      label: 'User ID',
      value: user?.id || 'Unknown',
      icon: Key,
      color: 'bg-purple-500',
    },
    {
      label: 'Role',
      value: user?.role || 'Unknown',
      icon: Shield,
      color: user?.role === 'admin' ? 'bg-red-500' : 'bg-green-500',
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
        <p className="text-gray-600">Your account information</p>
      </div>

      {/* Profile Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center">
            <span className="text-white text-xl font-bold">
              {user?.name?.charAt(0) || 'U'}
            </span>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{user?.name}</h2>
            <p className="text-gray-600">{user?.role === 'admin' ? 'Administrator' : 'User'}</p>
          </div>
        </div>
      </div>

      {/* Profile Information */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {profileInfo.map((info) => {
          const Icon = info.icon
          return (
            <div key={info.label} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className={`p-3 rounded-lg ${info.color}`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{info.label}</p>
                  <p className="text-lg font-semibold text-gray-900">{info.value}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Role Information */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Role Permissions</h3>
        <div className="space-y-4">
          {user?.role === 'admin' ? (
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-700">Can view all posts</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-700">Can create posts</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-700">Can delete any post</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-700">Full administrative access</span>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-700">Can view all posts</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-700">Can create posts</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-700">Can delete own posts only</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                <span className="text-sm text-gray-500">Cannot delete other users' posts</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Account Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Account Actions</h3>
        <div className="space-y-3">
          <button className="w-full text-left px-4 py-3 rounded-md border border-gray-200 hover:bg-gray-50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Shield className="h-5 w-5 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Change Password</span>
              </div>
              <span className="text-xs text-gray-500">Coming soon</span>
            </div>
          </button>
          <button className="w-full text-left px-4 py-3 rounded-md border border-gray-200 hover:bg-gray-50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <User className="h-5 w-5 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Edit Profile</span>
              </div>
              <span className="text-xs text-gray-500">Coming soon</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}

export default Profile 