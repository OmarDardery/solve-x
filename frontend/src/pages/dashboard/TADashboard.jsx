import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { apiService } from '../../services/api'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { Modal } from '../../components/ui/Modal'
import { OpportunityForm } from '../../components/forms/OpportunityForm'
import { Plus, BookOpen, Users, FileText, TrendingUp, Briefcase, ExternalLink, Calendar } from 'lucide-react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'

export function TADashboard() {
  const { currentUser } = useAuth()
  const [opportunities, setOpportunities] = useState([])
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)

  useEffect(() => {
    fetchData()
  }, [currentUser])

  const fetchData = async () => {
    try {
      if (!currentUser) {
        setLoading(false)
        return
      }

      // Fetch TA's opportunities
      const oppsData = await apiService.getMyOpportunities()

      // Fetch applications for TA's opportunities
      const appsData = await apiService.getMyApplications()

      setOpportunities(oppsData)
      setApplications(appsData)
    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error('Failed to fetch data')
    } finally {
      setLoading(false)
    }
  }

  const publishedOpportunities = opportunities
  const pendingApplications = applications.filter((a) => a.status === 'pending')

  const stats = [
    {
      label: 'Published Opportunities',
      value: publishedOpportunities.length,
      icon: Briefcase,
      color: 'text-blue-500',
    },
    {
      label: 'Total Opportunities',
      value: opportunities.length,
      icon: BookOpen,
      color: 'text-green-500',
    },
    {
      label: 'Pending Applications',
      value: pendingApplications.length,
      icon: Users,
      color: 'text-purple-500',
    },
    {
      label: 'Total Applications',
      value: applications.length,
      icon: FileText,
      color: 'text-orange-500',
    },
  ]

  return (
    <div className="space-y-8 bg-gradient-to-br from-purple-50 via-white to-pink-50 min-h-screen -m-6 p-6">
      <div className="flex justify-between items-center bg-white rounded-xl p-6 shadow-sm border border-purple-100">
        <div>
          <h1 className="text-3xl font-display font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            TA Dashboard
          </h1>
          <p className="text-gray-600 mt-1">Manage your research projects and applications</p>
        </div>
        <div className="flex gap-3">
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="w-5 h-5 mr-2" />
            Create Project
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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

      {/* Published Opportunities */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>My Published Opportunities</CardTitle>
            <Button variant="ghost" size="sm" as={Link} to="/opportunities">
              View All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto"></div>
            </div>
          ) : publishedOpportunities.length === 0 ? (
            <div className="text-center py-8">
              <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">No published opportunities yet. Create and publish your first opportunity!</p>
              <Button onClick={() => setShowCreateModal(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Opportunity
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {publishedOpportunities.slice(0, 5).map((opportunity) => {
                const oppApplications = applications.filter(a => a.opportunityId === opportunity.id)
                return (
                  <div
                    key={opportunity.id}
                    className="p-4 border border-gray-200 rounded-lg hover:border-primary-300 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold">{opportunity.title}</h3>
                          <Badge variant="success">Published</Badge>
                          {oppApplications.length > 0 && (
                            <Badge variant="default">{oppApplications.length} applications</Badge>
                          )}
                        </div>
                        <p className="text-gray-600 mb-3 line-clamp-2">{opportunity.description}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span>{opportunity.positions || 0} positions</span>
                          <span>•</span>
                          <span>{opportunity.skills?.length || 0} skills required</span>
                          <span>•</span>
                          <span>{oppApplications.filter(a => a.status === APPLICATION_STATUS.PENDING).length} pending</span>
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Button variant="ghost" size="sm" as={Link} to={`/opportunities/${opportunity.id}`}>
                          View
                        </Button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

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
              <p className="text-gray-600">No applications yet. Applications will appear here when students apply to your opportunities.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {applications.slice(0, 5).map((application) => {
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
                  <div
                    key={application.id}
                    className="p-4 border border-gray-200 rounded-lg hover:border-primary-300 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold">{application.projectTitle || application.opportunityTitle || 'Application'}</h3>
                          <Badge variant={getStatusBadge(application.status)}>
                            {application.status}
                          </Badge>
                        </div>
                        <p className="text-gray-600 mb-2 line-clamp-2">{application.description || 'No description provided'}</p>
                        <p className="text-sm text-gray-500">
                          Applied on {application.createdAt ? new Date(application.createdAt).toLocaleDateString() : 'N/A'}
                          {application.studentName && ` • Student: ${application.studentName}`}
                        </p>
                      </div>
                      <Button variant="ghost" size="sm" as={Link} to={`/applications/${application.id}`}>
                        View
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Received Reports */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Received Reports</CardTitle>
            <Button variant="ghost" size="sm" as={Link} to="/reports">
              View All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto"></div>
            </div>
          ) : reports.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No reports received yet. Reports submitted by students will appear here.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reports.slice(0, 5).map((report) => (
                <div
                  key={report.id}
                  className="p-4 border border-gray-200 rounded-lg hover:border-primary-300 transition-colors"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-gray-400" />
                      <span className="font-semibold">
                        Week {report.week}, {report.year}
                      </span>
                    </div>
                    {report.studentName && (
                      <Badge variant="default">{report.studentName}</Badge>
                    )}
                  </div>
                  <div className="space-y-2 text-sm">
                    {report.studentName && (
                      <div>
                        <span className="font-medium">Student:</span>
                        <p className="text-gray-600">{report.studentName}</p>
                      </div>
                    )}
                    <div>
                      <span className="font-medium">Accomplishments:</span>
                      <p className="text-gray-600 line-clamp-2">{report.accomplishments}</p>
                    </div>
                    {report.driveLink && (
                      <div>
                        <span className="font-medium">Report Document:</span>
                        <div className="mt-1">
                          <a
                            href={report.driveLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary-500 hover:text-primary-600 text-sm flex items-center gap-1"
                          >
                            View Document
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Opportunity Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Opportunity"
        size="xl"
      >
        <OpportunityForm
          onSuccess={() => {
            setShowCreateModal(false)
            fetchData()
            toast.success('Opportunity created successfully!')
          }}
          onCancel={() => setShowCreateModal(false)}
        />
      </Modal>
    </div>
  )
}


