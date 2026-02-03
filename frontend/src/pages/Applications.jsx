import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { apiService } from '../services/api'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { Select } from '../components/ui/Input'
import { APPLICATION_STATUS } from '../types'
import { FileText, CheckCircle, Clock, XCircle, AlertCircle, ExternalLink } from 'lucide-react'
import toast from 'react-hot-toast'

export function Applications() {
  const { currentUser, userRole } = useAuth()
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    fetchApplications()
  }, [userRole, currentUser])

  const fetchApplications = async () => {
    try {
      if (!currentUser) {
        setLoading(false)
        return
      }

      // GET /api/applications/me returns applications based on role
      const appsData = await apiService.getMyApplications()
      setApplications(appsData)
    } catch (error) {
      console.error('Error fetching applications:', error)
      toast.error('Failed to fetch applications')
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (applicationId, newStatus) => {
    try {
      await apiService.updateApplicationStatus(applicationId, newStatus)
      toast.success('Application status updated')
      fetchApplications()
    } catch (error) {
      toast.error('Failed to update status')
    }
  }

  const getStatusIcon = (status) => {
    const icons = {
      [APPLICATION_STATUS.PENDING]: Clock,
      [APPLICATION_STATUS.ACCEPTED]: CheckCircle,
      [APPLICATION_STATUS.WAITLISTED]: AlertCircle,
      [APPLICATION_STATUS.REJECTED]: XCircle,
    }
    return icons[status] || FileText
  }

  const getStatusBadge = (status) => {
    const variants = {
      [APPLICATION_STATUS.PENDING]: 'default',
      [APPLICATION_STATUS.ACCEPTED]: 'success',
      [APPLICATION_STATUS.WAITLISTED]: 'warning',
      [APPLICATION_STATUS.REJECTED]: 'danger',
    }
    return variants[status] || 'default'
  }

  const filteredApplications = statusFilter === 'all'
    ? applications
    : applications.filter((app) => app.status === statusFilter)

  const canManageStatus = ['professor', 'ta', 'organization_representative'].includes(userRole)

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-display font-bold text-gray-900">Applications</h1>
          <p className="text-gray-600 mt-1">
            {userRole === 'student' ? 'Track your applications' : 'Manage applications'}
          </p>
        </div>
        {canManageStatus && (
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-48"
          >
            <option value="all">All Statuses</option>
            <option value={APPLICATION_STATUS.PENDING}>Pending</option>
            <option value={APPLICATION_STATUS.ACCEPTED}>Accepted</option>
            <option value={APPLICATION_STATUS.WAITLISTED}>Waitlisted</option>
            <option value={APPLICATION_STATUS.REJECTED}>Rejected</option>
          </Select>
        )}
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
        </div>
      ) : filteredApplications.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No applications found.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredApplications.map((application) => {
            const StatusIcon = getStatusIcon(application.status)
            return (
              <Card key={application.ID}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <StatusIcon className="w-5 h-5 text-gray-400" />
                        <h3 className="text-lg font-semibold">
                          {application.opportunity?.name || 'Opportunity'}
                        </h3>
                        <Badge variant={getStatusBadge(application.status)}>
                          {application.status}
                        </Badge>
                      </div>
                      {application.opportunity?.details && (
                        <p className="text-gray-600 mb-3">{application.opportunity.details.substring(0, 150)}...</p>
                      )}
                      
                      {/* Application Message */}
                      {application.message && (
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-3">
                          <p className="text-sm font-medium text-gray-700 mb-1">Message:</p>
                          <p className="text-gray-600 text-sm whitespace-pre-wrap">{application.message}</p>
                        </div>
                      )}
                      
                      {/* Resume Link */}
                      {application.resume_link && (
                        <div className="mb-3">
                          <a 
                            href={application.resume_link} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700"
                          >
                            <ExternalLink className="w-4 h-4" />
                            View Resume/CV
                          </a>
                        </div>
                      )}
                      
                      <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                        <span>
                          Applied: {application.CreatedAt ? new Date(application.CreatedAt).toLocaleDateString() : 'N/A'}
                        </span>
                        {application.student && (
                          <span>Student: {application.student.first_name} {application.student.last_name}</span>
                        )}
                      </div>
                    </div>
                    {canManageStatus && (
                      <div className="flex flex-col gap-2 ml-4">
                        <Select
                          value={application.status}
                          onChange={(e) => updateStatus(application.ID, e.target.value)}
                          className="w-40"
                        >
                          <option value="pending">Pending</option>
                          <option value="accepted">Accepted</option>
                          <option value="rejected">Rejected</option>
                        </Select>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}

