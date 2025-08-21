'use client'

import { useState } from 'react'

import { AppLayout } from '@/components/layout/app-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Search,
  UserPlus,
  Edit,
  Trash2,
  Eye,
  Shield,
  User,
  Users,
  Crown,
  Settings,
  Mail,
  Phone,
  Calendar,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface User {
  id: string
  username: string
  email: string
  firstName: string
  lastName: string
  role: 'ADMIN' | 'OPERATOR' | 'VIEWER' | 'MAINTENANCE'
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED'
  phone?: string
  department: string
  lastLogin?: string
  createdAt: string
  permissions: string[]
  avatar?: string
}

// Mock users data
const mockUsers: User[] = [
  {
    id: '1',
    username: 'admin',
    email: 'admin@uavsystem.com',
    firstName: 'System',
    lastName: 'Administrator',
    role: 'ADMIN',
    status: 'ACTIVE',
    phone: '+1-555-0101',
    department: 'IT Operations',
    lastLogin: '2025-08-20T14:30:00Z',
    createdAt: '2025-01-01T00:00:00Z',
    permissions: ['ALL']
  },
  {
    id: '2',
    username: 'operator1',
    email: 'john.doe@uavsystem.com',
    firstName: 'John',
    lastName: 'Doe',
    role: 'OPERATOR',
    status: 'ACTIVE',
    phone: '+1-555-0102',
    department: 'Flight Operations',
    lastLogin: '2025-08-20T13:45:00Z',
    createdAt: '2025-02-15T10:00:00Z',
    permissions: ['UAV_CONTROL', 'MISSION_PLANNING', 'VIEW_ANALYTICS']
  },
  {
    id: '3',
    username: 'viewer1',
    email: 'jane.smith@uavsystem.com',
    firstName: 'Jane',
    lastName: 'Smith',
    role: 'VIEWER',
    status: 'ACTIVE',
    phone: '+1-555-0103',
    department: 'Security',
    lastLogin: '2025-08-20T12:20:00Z',
    createdAt: '2025-03-10T14:30:00Z',
    permissions: ['VIEW_DASHBOARD', 'VIEW_MAPS', 'VIEW_ALERTS']
  },
  {
    id: '4',
    username: 'maintenance1',
    email: 'mike.wilson@uavsystem.com',
    firstName: 'Mike',
    lastName: 'Wilson',
    role: 'MAINTENANCE',
    status: 'ACTIVE',
    phone: '+1-555-0104',
    department: 'Technical Services',
    lastLogin: '2025-08-19T16:10:00Z',
    createdAt: '2025-04-05T09:15:00Z',
    permissions: ['UAV_MAINTENANCE', 'BATTERY_MANAGEMENT', 'DOCKING_STATIONS']
  },
  {
    id: '5',
    username: 'operator2',
    email: 'sarah.johnson@uavsystem.com',
    firstName: 'Sarah',
    lastName: 'Johnson',
    role: 'OPERATOR',
    status: 'INACTIVE',
    phone: '+1-555-0105',
    department: 'Flight Operations',
    lastLogin: '2025-08-15T11:30:00Z',
    createdAt: '2025-05-20T13:45:00Z',
    permissions: ['UAV_CONTROL', 'MISSION_PLANNING']
  },
  {
    id: '6',
    username: 'supervisor1',
    email: 'david.brown@uavsystem.com',
    firstName: 'David',
    lastName: 'Brown',
    role: 'ADMIN',
    status: 'SUSPENDED',
    phone: '+1-555-0106',
    department: 'Operations Management',
    lastLogin: '2025-08-10T14:20:00Z',
    createdAt: '2025-06-01T08:00:00Z',
    permissions: ['USER_MANAGEMENT', 'SYSTEM_CONFIG', 'VIEW_ANALYTICS']
  }
]

export default function UsersPage() {
  const [users] = useState<User[]>(mockUsers)
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('ALL')
  const [statusFilter, setStatusFilter] = useState<string>('ALL')

  const getRoleIcon = (role: User['role']) => {
    switch (role) {
      case 'ADMIN':
        return <Crown className="h-4 w-4" />
      case 'OPERATOR':
        return <Settings className="h-4 w-4" />
      case 'VIEWER':
        return <Eye className="h-4 w-4" />
      case 'MAINTENANCE':
        return <Settings className="h-4 w-4" />
      default:
        return <User className="h-4 w-4" />
    }
  }

  const getRoleColor = (role: User['role']) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'OPERATOR':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'VIEWER':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'MAINTENANCE':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusColor = (status: User['status']) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'INACTIVE':
        return 'bg-gray-100 text-gray-800 border-gray-200'
      case 'SUSPENDED':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusIcon = (status: User['status']) => {
    switch (status) {
      case 'ACTIVE':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'INACTIVE':
        return <Clock className="h-4 w-4 text-gray-600" />
      case 'SUSPENDED':
        return <XCircle className="h-4 w-4 text-red-600" />
      default:
        return null
    }
  }

  const formatLastLogin = (lastLogin?: string) => {
    if (!lastLogin) return 'Never'
    const date = new Date(lastLogin)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    return date.toLocaleDateString()
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = searchQuery === '' || 
      user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.department.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesRole = roleFilter === 'ALL' || user.role === roleFilter
    const matchesStatus = statusFilter === 'ALL' || user.status === statusFilter
    
    return matchesSearch && matchesRole && matchesStatus
  })

  const activeUsers = users.filter(u => u.status === 'ACTIVE').length
  const totalUsers = users.length
  const adminUsers = users.filter(u => u.role === 'ADMIN').length

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          <div>
            <h1 className="text-3xl font-bold tracking-tight font-orbitron">
              User Management
            </h1>
            <p className="text-muted-foreground">
              Manage user accounts and permissions
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <Shield className="h-4 w-4 mr-2" />
              Permissions
            </Button>
            <Button size="sm">
              <UserPlus className="h-4 w-4 mr-2" />
              Add User
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalUsers}</div>
              <p className="text-xs text-muted-foreground">
                registered accounts
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Users</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeUsers}</div>
              <p className="text-xs text-muted-foreground">
                currently active
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Administrators</CardTitle>
              <Crown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{adminUsers}</div>
              <p className="text-xs text-muted-foreground">
                admin accounts
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search users by name, email, or department..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="px-3 py-2 border border-input bg-background rounded-md text-sm"
                >
                  <option value="ALL">All Roles</option>
                  <option value="ADMIN">Admin</option>
                  <option value="OPERATOR">Operator</option>
                  <option value="VIEWER">Viewer</option>
                  <option value="MAINTENANCE">Maintenance</option>
                </select>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-input bg-background rounded-md text-sm"
                >
                  <option value="ALL">All Status</option>
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                  <option value="SUSPENDED">Suspended</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Users List */}
        <div className="space-y-4">
          {filteredUsers.length === 0 ? (
            <Card>
              <CardContent className="flex items-center justify-center py-12">
                <div className="text-center">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-muted-foreground">No users found</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Try adjusting your search criteria
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            filteredUsers.map((user) => (
              <Card key={user.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                        <User className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold">
                            {user.firstName} {user.lastName}
                          </h3>
                          <Badge className={cn("border", getRoleColor(user.role))}>
                            <div className="flex items-center space-x-1">
                              {getRoleIcon(user.role)}
                              <span>{user.role}</span>
                            </div>
                          </Badge>
                          <Badge className={cn("border", getStatusColor(user.status))}>
                            <div className="flex items-center space-x-1">
                              {getStatusIcon(user.status)}
                              <span>{user.status}</span>
                            </div>
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground mb-3">
                          <div className="flex items-center space-x-2">
                            <User className="h-4 w-4" />
                            <span>{user.username}</span>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Mail className="h-4 w-4" />
                            <span>{user.email}</span>
                          </div>
                          
                          {user.phone && (
                            <div className="flex items-center space-x-2">
                              <Phone className="h-4 w-4" />
                              <span>{user.phone}</span>
                            </div>
                          )}
                          
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4" />
                            <span>Last login: {formatLastLogin(user.lastLogin)}</span>
                          </div>
                        </div>
                        
                        <div className="text-sm">
                          <span className="font-medium">Department:</span>
                          <span className="ml-2 text-muted-foreground">{user.department}</span>
                        </div>
                        
                        <div className="mt-2">
                          <span className="text-sm font-medium">Permissions: </span>
                          <div className="inline-flex flex-wrap gap-1 mt-1">
                            {user.permissions.slice(0, 3).map((permission) => (
                              <Badge key={permission} variant="outline" className="text-xs">
                                {permission.replace('_', ' ')}
                              </Badge>
                            ))}
                            {user.permissions.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{user.permissions.length - 3} more
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </AppLayout>
  )
}
