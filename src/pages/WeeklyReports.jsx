import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { dummyDataService } from '../services/dummyDataService'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input, Textarea, Select } from '../components/ui/Input'
import { Badge } from '../components/ui/Badge'
import { Modal } from '../components/ui/Modal'
import { validateDriveLink, formatDriveLink } from '../utils/validateDriveLink'
import { Calendar, FileText, Plus, ExternalLink } from 'lucide-react'
import toast from 'react-hot-toast'
import { APPLICATION_STATUS } from '../types'

export function WeeklyReports() {
  const { currentUser, userRole } = useAuth()
  const [reports, setReports] = useState([])
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [showSubmitModal, setShowSubmitModal] = useState(false)
  const [selectedProject, setSelectedProject] = useState('')
  const [selectedRecipient, setSelectedRecipient] = useState('')
  const [recipientType, setRecipientType] = useState('professor') // 'professor' or 'ta'
  const [professorsAndTAs, setProfessorsAndTAs] = useState([])
  const [formData, setFormData] = useState({
    accomplishments: '',
    challenges: '',
    nextGoals: '',
    supportNeeded: '',
    driveLink: '',
  })

  useEffect(() => {
    if (userRole === 'student') {
      fetchStudentProjects()
      fetchProfessorsAndTAs()
    } else {
      fetchReports()
    }
  }, [userRole, currentUser])

  const fetchProfessorsAndTAs = async () => {
    try {
      const recipients = dummyDataService.getProfessorsAndTAs()
      setProfessorsAndTAs(recipients)
    } catch (error) {
      console.error('Error fetching professors/TAs:', error)
    }
  }

  const fetchStudentProjects = async () => {
    try {
      if (!currentUser) {
        setLoading(false)
        return
      }

      // Fetch projects where student is accepted
      const applications = dummyDataService.getApplications({
        studentId: currentUser.uid,
        status: APPLICATION_STATUS.ACCEPTED,
      })
      
      const projectIds = applications.map(app => app.opportunityId).filter(Boolean)
      
      if (projectIds.length > 0) {
        // Fetch project details
        const projectsData = projectIds
          .map(id => dummyDataService.getOpportunityById(id))
          .filter(Boolean)
        setProjects(projectsData)
      }
      
      // Fetch existing reports
      const reportsData = dummyDataService.getReports({ studentId: currentUser.uid })
      setReports(reportsData)
    } catch (error) {
      toast.error('Failed to fetch data')
    } finally {
      setLoading(false)
    }
  }

  const fetchReports = async () => {
    try {
      if (!currentUser) {
        setLoading(false)
        return
      }
      // For professors/TAs, fetch reports sent to them
      const reportsData = dummyDataService.getReports({ recipientId: currentUser.uid })
      setReports(reportsData)
    } catch (error) {
      toast.error('Failed to fetch reports')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitReport = async (e) => {
    e.preventDefault()
    
    if (!selectedRecipient) {
      toast.error('Please select a professor or TA')
      return
    }

    if (!formData.driveLink) {
      toast.error('Please provide a Google Drive link')
      return
    }

    // Validate Drive link
    const formattedLink = formatDriveLink(formData.driveLink.trim())
    if (!validateDriveLink(formattedLink)) {
      toast.error('Please provide a valid Google Drive link')
      return
    }

    try {
      // Get current week number
      const now = new Date()
      const startOfYear = new Date(now.getFullYear(), 0, 1)
      const week = Math.ceil((now - startOfYear) / (7 * 24 * 60 * 60 * 1000))

      // Get student name
      const studentName = currentUser.displayName || 
                         `${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim() ||
                         currentUser.email ||
                         'Student'

      // Get recipient info
      const recipient = professorsAndTAs.find(r => r.uid === selectedRecipient)
      const recipientName = recipient?.displayName || 'Professor/TA'

      const reportData = {
        studentId: currentUser.uid,
        studentName: studentName,
        recipientId: selectedRecipient,
        recipientName: recipientName,
        recipientType: recipientType,
        professorId: recipientType === 'professor' ? selectedRecipient : null,
        taId: recipientType === 'ta' ? selectedRecipient : null,
        week,
        year: now.getFullYear(),
        accomplishments: formData.accomplishments,
        challenges: formData.challenges,
        nextGoals: formData.nextGoals,
        supportNeeded: formData.supportNeeded,
        driveLink: formattedLink,
        submittedAt: new Date(),
      }

      dummyDataService.createReport(reportData)
      toast.success('Report submitted successfully!')
      setShowSubmitModal(false)
      setSelectedRecipient('')
      setRecipientType('professor')
      setFormData({
        accomplishments: '',
        challenges: '',
        nextGoals: '',
        supportNeeded: '',
        driveLink: '',
      })
      fetchStudentProjects()
    } catch (error) {
      console.error('Error submitting report:', error)
      toast.error('Failed to submit report')
    }
  }

  if (userRole === 'student') {
    return (
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-display font-bold text-gray-900">Weekly Reports</h1>
            <p className="text-gray-600 mt-1">Submit your weekly progress reports</p>
          </div>
          <Button onClick={() => setShowSubmitModal(true)}>
            <Plus className="w-5 h-5 mr-2" />
            Submit Report
          </Button>
        </div>

        {professorsAndTAs.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Loading professors and TAs...</p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>My Reports</CardTitle>
            </CardHeader>
            <CardContent>
              {reports.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-600">No reports submitted yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {reports.map((report) => (
                    <div key={report.id} className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-5 h-5 text-gray-400" />
                          <span className="font-semibold">
                            Week {report.week}, {report.year}
                          </span>
                          {report.recipientName && (
                            <span className="text-gray-500 text-sm">
                              • To: {report.recipientName}
                            </span>
                          )}
                        </div>
                        <Badge variant="success">Submitted</Badge>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="font-medium">Accomplishments:</span>
                          <p className="text-gray-600">{report.accomplishments}</p>
                        </div>
                        {report.challenges && (
                          <div>
                            <span className="font-medium">Challenges:</span>
                            <p className="text-gray-600">{report.challenges}</p>
                          </div>
                        )}
                        {report.nextGoals && (
                          <div>
                            <span className="font-medium">Next Goals:</span>
                            <p className="text-gray-600">{report.nextGoals}</p>
                          </div>
                        )}
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
        )}

        <Modal
          isOpen={showSubmitModal}
          onClose={() => setShowSubmitModal(false)}
          title="Submit Weekly Report"
          size="lg"
        >
          <form onSubmit={handleSubmitReport} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Recipient Type
              </label>
              <div className="flex gap-4 mb-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="recipientType"
                    value="professor"
                    checked={recipientType === 'professor'}
                    onChange={(e) => {
                      setRecipientType(e.target.value)
                      setSelectedRecipient('')
                    }}
                    className="mr-2"
                  />
                  Professor
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="recipientType"
                    value="ta"
                    checked={recipientType === 'ta'}
                    onChange={(e) => {
                      setRecipientType(e.target.value)
                      setSelectedRecipient('')
                    }}
                    className="mr-2"
                  />
                  Teaching Assistant
                </label>
              </div>
            </div>
            <Select
              label={`Select ${recipientType === 'professor' ? 'Professor' : 'TA'}`}
              value={selectedRecipient}
              onChange={(e) => setSelectedRecipient(e.target.value)}
              required
            >
              <option value="">Select a {recipientType === 'professor' ? 'professor' : 'TA'}</option>
              {professorsAndTAs
                .filter(r => r.role === (recipientType === 'professor' ? 'professor' : 'ta'))
                .map((recipient) => (
                  <option key={recipient.uid} value={recipient.uid}>
                    {recipient.displayName}
                  </option>
                ))}
            </Select>
            <Textarea
              label="What did you accomplish this week?"
              rows={4}
              value={formData.accomplishments}
              onChange={(e) => setFormData({ ...formData, accomplishments: e.target.value })}
              required
            />
            <Textarea
              label="Challenges faced?"
              rows={3}
              value={formData.challenges}
              onChange={(e) => setFormData({ ...formData, challenges: e.target.value })}
            />
            <Textarea
              label="Goals for next week?"
              rows={3}
              value={formData.nextGoals}
              onChange={(e) => setFormData({ ...formData, nextGoals: e.target.value })}
            />
            <Textarea
              label="Any support needed?"
              rows={2}
              value={formData.supportNeeded}
              onChange={(e) => setFormData({ ...formData, supportNeeded: e.target.value })}
            />
            <Input
              label="Report Document (Google Drive Link)"
              type="url"
              placeholder="https://drive.google.com/file/d/..."
              value={formData.driveLink}
              onChange={(e) => setFormData({ ...formData, driveLink: e.target.value })}
              required
            />
            <div className="flex gap-3 pt-4">
              <Button type="submit" className="flex-1">
                Submit Report
              </Button>
              <Button type="button" variant="ghost" onClick={() => setShowSubmitModal(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    )
  }

  // Professor/TA view
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-display font-bold text-gray-900">Student Reports</h1>
        <p className="text-gray-600 mt-1">View and track student weekly progress reports</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Reports</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto"></div>
            </div>
          ) : reports.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No reports submitted yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reports.map((report) => (
                <div key={report.id} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
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
                      <p className="text-gray-600">{report.accomplishments}</p>
                    </div>
                    {report.challenges && (
                      <div>
                        <span className="font-medium">Challenges:</span>
                        <p className="text-gray-600">{report.challenges}</p>
                      </div>
                    )}
                    {report.nextGoals && (
                      <div>
                        <span className="font-medium">Next Goals:</span>
                        <p className="text-gray-600">{report.nextGoals}</p>
                      </div>
                    )}
                    {report.supportNeeded && (
                      <div>
                        <span className="font-medium">Support Needed:</span>
                        <p className="text-gray-600">{report.supportNeeded}</p>
                      </div>
                    )}
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
                    {report.driveLinks && report.driveLinks.length > 0 && (
                      <div>
                        <span className="font-medium">Attachments:</span>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {report.driveLinks.map((link, idx) => (
                            <a
                              key={idx}
                              href={link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary-500 hover:text-primary-600 text-sm flex items-center gap-1"
                            >
                              Document {idx + 1}
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          ))}
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
    </div>
  )
}


