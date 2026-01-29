import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { dummyDataService } from '../services/dummyDataService'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { Input, Textarea } from '../components/ui/Input'
import { Modal } from '../components/ui/Modal'
import { APPLICATION_STATUS } from '../types'
import { ArrowLeft, Calendar, Users, FileText, ExternalLink, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'

export function OpportunityDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { currentUser, userRole } = useAuth()
  const [opportunity, setOpportunity] = useState(null)
  const [loading, setLoading] = useState(true)
  const [applying, setApplying] = useState(false)
  const [showApplyModal, setShowApplyModal] = useState(false)
  const [hasApplied, setHasApplied] = useState(false)
  const [applicationData, setApplicationData] = useState({
    description: '',
    driveLinks: '',
  })

  useEffect(() => {
    fetchOpportunity()
    checkIfApplied()
  }, [id, currentUser])

  const fetchOpportunity = async () => {
    try {
      const opp = dummyDataService.getOpportunityById(id)
      if (opp) {
        setOpportunity(opp)
      } else {
        toast.error('Opportunity not found')
        navigate('/opportunities')
      }
    } catch (error) {
      console.error('Error fetching opportunity:', error)
      toast.error('Failed to load opportunity')
      navigate('/opportunities')
    } finally {
      setLoading(false)
    }
  }

  const checkIfApplied = async () => {
    if (!currentUser || userRole !== 'student') return

    try {
      const applications = dummyDataService.getApplications({
        studentId: currentUser.uid,
        opportunityId: id,
      })
      setHasApplied(applications.length > 0)
    } catch (error) {
      console.error('Error checking application:', error)
    }
  }

  const handleApply = async () => {
    if (!applicationData.description.trim()) {
      toast.error('Please provide a description')
      return
    }

    setApplying(true)
    try {
      // Get user data
      const userData = dummyDataService.getUser(currentUser.uid) || currentUser

      const driveLinksArray = applicationData.driveLinks
        ? applicationData.driveLinks.split(',').map(link => link.trim()).filter(Boolean)
        : []

      const application = {
        opportunityId: id,
        studentId: currentUser.uid,
        studentName: userData?.displayName || `${userData?.firstName || ''} ${userData?.lastName || ''}`.trim() || currentUser.email,
        projectTitle: opportunity.title,
        opportunityTitle: opportunity.title,
        description: applicationData.description,
        driveLinks: driveLinksArray,
      }

      dummyDataService.createApplication(application)
      toast.success('Application submitted successfully!')
      setShowApplyModal(false)
      setHasApplied(true)
      setApplicationData({ description: '', driveLinks: '' })
    } catch (error) {
      console.error('Error submitting application:', error)
      toast.error('Failed to submit application')
    } finally {
      setApplying(false)
    }
  }

  const getTypeLabel = (type) => {
    const labels = {
      project: 'Research Project',
      student_project: 'Student Project',
      opportunity: 'Organization Opportunity',
    }
    return labels[type] || type
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  if (!opportunity) {
    return null
  }

  const isStudent = userRole === 'student'
  const canApply = isStudent && !hasApplied && opportunity.published

  return (
    <div className="space-y-8">
      <Button variant="ghost" onClick={() => navigate('/opportunities')} className="mb-4">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Opportunities
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Badge variant="primary">{getTypeLabel(opportunity.type)}</Badge>
                    {opportunity.published ? (
                      <Badge variant="success">Published</Badge>
                    ) : (
                      <Badge variant="default">Draft</Badge>
                    )}
                  </div>
                  <CardTitle className="text-3xl mb-2">{opportunity.title}</CardTitle>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none">
                <h3 className="text-lg font-semibold mb-3">Description</h3>
                <p className="text-gray-700 whitespace-pre-wrap mb-6">{opportunity.description}</p>

                {opportunity.skills && opportunity.skills.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-3">Required Skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {opportunity.skills.map((skill, idx) => (
                        <Badge key={idx} variant="default">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {opportunity.timeline && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                      <Calendar className="w-5 h-5" />
                      Timeline
                    </h3>
                    <p className="text-gray-700">{opportunity.timeline}</p>
                  </div>
                )}

                {opportunity.cvLink && (
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                      <FileText className="w-5 h-5" />
                      CV Template
                    </h3>
                    <a
                      href={opportunity.cvLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-600 hover:text-primary-700 flex items-center gap-2"
                    >
                      View Template
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                )}

                {opportunity.proposalLink && (
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                      <FileText className="w-5 h-5" />
                      Proposal Template
                    </h3>
                    <a
                      href={opportunity.proposalLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-600 hover:text-primary-700 flex items-center gap-2"
                    >
                      View Template
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                )}

                {opportunity.datasetLink && (
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                      <FileText className="w-5 h-5" />
                      Dataset
                    </h3>
                    <a
                      href={opportunity.datasetLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-600 hover:text-primary-700 flex items-center gap-2"
                    >
                      Access Dataset
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                )}

                {opportunity.materialLink && (
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                      <FileText className="w-5 h-5" />
                      Materials
                    </h3>
                    <a
                      href={opportunity.materialLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-600 hover:text-primary-700 flex items-center gap-2"
                    >
                      View Materials
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                {opportunity.positions && (
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Available Positions</p>
                      <p className="text-lg font-semibold">{opportunity.positions}</p>
                    </div>
                  </div>
                )}

                {opportunity.createdAt && (
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Posted</p>
                      <p className="text-lg font-semibold">
                        {opportunity.createdAt
                          ? new Date(opportunity.createdAt).toLocaleDateString()
                          : 'N/A'}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {canApply && (
                <Button
                  className="w-full mt-6"
                  onClick={() => setShowApplyModal(true)}
                >
                  Apply Now
                </Button>
              )}

              {hasApplied && (
                <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2 text-green-700">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-medium">You have applied to this opportunity</span>
                  </div>
                  <Link
                    to="/applications"
                    className="text-sm text-green-600 hover:text-green-700 mt-2 inline-block"
                  >
                    View your application →
                  </Link>
                </div>
              )}

              {!isStudent && (
                <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  <p className="text-sm text-gray-600">
                    Students can apply to this opportunity. <Link to="/login" className="text-primary-600 hover:text-primary-700">Sign in</Link> as a student to apply.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Apply Modal */}
      <Modal
        isOpen={showApplyModal}
        onClose={() => setShowApplyModal(false)}
        title="Apply to Opportunity"
        size="lg"
      >
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">{opportunity.title}</h3>
            <p className="text-sm text-gray-600 mb-4">{opportunity.description?.substring(0, 200)}...</p>
          </div>

          <Textarea
            label="Why are you interested in this opportunity? (Required)"
            placeholder="Tell us about your interest, relevant experience, and what you hope to gain..."
            rows={6}
            value={applicationData.description}
            onChange={(e) => setApplicationData({ ...applicationData, description: e.target.value })}
            required
          />

          <Input
            label="Google Drive Links (comma-separated, optional)"
            placeholder="https://drive.google.com/..., https://drive.google.com/..."
            value={applicationData.driveLinks}
            onChange={(e) => setApplicationData({ ...applicationData, driveLinks: e.target.value })}
            helperText="Upload your CV, proposal, or other documents to Google Drive and paste the links here"
          />

          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleApply}
              disabled={applying || !applicationData.description.trim()}
              className="flex-1"
            >
              {applying ? 'Submitting...' : 'Submit Application'}
            </Button>
            <Button
              variant="ghost"
              onClick={() => setShowApplyModal(false)}
              disabled={applying}
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}


