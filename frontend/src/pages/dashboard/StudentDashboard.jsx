import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { dummyDataService } from '../../services/dummyDataService'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { APPLICATION_STATUS } from '../../types'
import { BookOpen, FileText, TrendingUp, Plus, ExternalLink, Briefcase } from 'lucide-react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'

export function StudentDashboard() {
  const { currentUser } = useAuth()
  const [applications, setApplications] = useState([])
  const [projects, setProjects] = useState([])
  const [featuredOpportunities, setFeaturedOpportunities] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [currentUser])

  const fetchData = async () => {
    try {
      if (!currentUser) {
        setLoading(false)
        return
      }

      // Fetch applications submitted by this student
      const appsData = dummyDataService.getApplications({ studentId: currentUser.uid })
      setApplications(appsData)

      // Fetch student projects (if any)
      const projectsData = dummyDataService.getStudentProjects({ createdBy: currentUser.uid })
      setProjects(projectsData)

      // Fetch featured opportunities (published projects)
      const oppsData = dummyDataService.getAllPublishedOpportunities().slice(0, 3)
      setFeaturedOpportunities(oppsData)
    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error('Failed to fetch data')
    } finally {
      setLoading(false)
    }
  }

  const stats = [
    {
      label: 'My Applications',
      value: applications.length,
      icon: FileText,
      color: 'text-blue-500',
    },
    {
      label: 'Accepted',
      value: applications.filter((a) => a.status === APPLICATION_STATUS.ACCEPTED).length,
      icon: TrendingUp,
      color: 'text-green-500',
    },
    {
      label: 'My Projects',
      value: projects.length,
      icon: BookOpen,
      color: 'text-purple-500',
    },
  ]

  const getStatusBadge = (status) => {
    const variants = {
      [APPLICATION_STATUS.PENDING]: 'default',
      [APPLICATION_STATUS.ACCEPTED]: 'success',
      [APPLICATION_STATUS.WAITLISTED]: 'warning',
      [APPLICATION_STATUS.REJECTED]: 'danger',
    }
    return variants[status] || 'default'
  }

  return (
    <div className="space-y-8 bg-gradient-to-br from-green-50 via-white to-emerald-50 min-h-screen -m-6 p-6">
      <div className="flex justify-between items-center bg-white rounded-xl p-6 shadow-sm border border-green-100">
        <div>
          <h1 className="text-3xl font-display font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
            Student Dashboard
          </h1>
          <p className="text-gray-600 mt-1">Track your applications and projects</p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" as={Link} to="/opportunities">
            Browse Opportunities
            <ExternalLink className="w-4 h-4 ml-2" />
          </Button>
          <Button as={Link} to="/projects/create">
            <Plus className="w-5 h-5 mr-2" />
            Create Project
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.label}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                    <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                  <Icon className={`w-12 h-12 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Featured Opportunities */}
      {featuredOpportunities.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Featured Opportunities</CardTitle>
              <Button variant="ghost" size="sm" as={Link} to="/opportunities">
                View All
                <ExternalLink className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {featuredOpportunities.map((opportunity) => (
                <div
                  key={opportunity.id}
                  className="p-4 border border-gray-200 rounded-lg hover:border-primary-300 transition-colors cursor-pointer"
                  onClick={() => window.location.href = `/opportunities/${opportunity.id}`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <Badge variant="primary">Research Project</Badge>
                  </div>
                  <h3 className="text-lg font-semibold mb-2 line-clamp-2">{opportunity.title}</h3>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">{opportunity.description}</p>
                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <div className="text-xs text-gray-500">
                      {opportunity.positions || 0} positions
                    </div>
                    <Button size="sm" variant="ghost" as={Link} to={`/opportunities/${opportunity.id}`}>
                      View
                      <ExternalLink className="w-3 h-3 ml-1" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Applications */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Recent Applications</CardTitle>
            <Button variant="ghost" size="sm" as={Link} to="/applications">
              View All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto"></div>
            </div>
          ) : applications.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">No applications yet</p>
              <Button as={Link} to="/opportunities">
                Browse Opportunities
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {applications.slice(0, 5).map((application) => (
                <div
                  key={application.id}
                  className="p-4 border border-gray-200 rounded-lg hover:border-primary-300 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold">{application.projectTitle || application.opportunityTitle || 'Opportunity'}</h3>
                        <Badge variant={getStatusBadge(application.status)}>
                          {application.status}
                        </Badge>
                      </div>
                      <p className="text-gray-600 mb-2 line-clamp-2">{application.description || 'No description provided'}</p>
                      <p className="text-sm text-gray-500">
                        Applied on {application.createdAt ? new Date(application.createdAt).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                    <Button variant="ghost" size="sm" as={Link} to={`/applications/${application.id}`}>
                      View
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* My Projects */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>My Projects</CardTitle>
            <Button variant="ghost" size="sm" as={Link} to="/projects/create">
              <Plus className="w-4 h-4 mr-2" />
              Create New
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {projects.length === 0 ? (
            <div className="text-center py-8">
              <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">No projects yet</p>
              <Button as={Link} to="/projects/create">
                Create Your First Project
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {projects.map((project) => (
                <div
                  key={project.id}
                  className="p-4 border border-gray-200 rounded-lg hover:border-primary-300 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold mb-2">{project.title}</h3>
                      <p className="text-gray-600 mb-3 line-clamp-2">{project.description}</p>
                    </div>
                    <Button variant="ghost" size="sm" as={Link} to={`/projects/${project.id}`}>
                      View
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

