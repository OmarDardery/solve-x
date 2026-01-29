import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { dummyDataService } from '../../services/dummyDataService'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { Modal } from '../../components/ui/Modal'
import { OpportunityForm } from '../../components/forms/OpportunityForm'
import { Plus, BookOpen, Users, TrendingUp } from 'lucide-react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'

export function OrganizationDashboard() {
  const { currentUser } = useAuth()
  const [opportunities, setOpportunities] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)

  useEffect(() => {
    fetchOpportunities()
  }, [currentUser])

  const fetchOpportunities = async () => {
    setLoading(true)
    try {
      if (!currentUser) {
        setLoading(false)
        return
      }

      const opportunitiesData = dummyDataService.getOpportunities({ organizationId: currentUser.uid })
      setOpportunities(opportunitiesData)
    } catch (error) {
      console.error('Unexpected error fetching organization opportunities:', error)
      toast.error('Failed to fetch opportunities')
    } finally {
      setLoading(false)
    }
  }

  const stats = [
    {
      label: 'Total Opportunities',
      value: opportunities.length,
      icon: BookOpen,
      color: 'text-blue-500',
    },
    {
      label: 'Active Opportunities',
      value: opportunities.filter((o) => o.published).length,
      icon: TrendingUp,
      color: 'text-green-500',
    },
    {
      label: 'Total Applications',
      value: 0,
      icon: Users,
      color: 'text-purple-500',
    },
  ]

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-display font-bold text-gray-900">Organization Dashboard</h1>
          <p className="text-gray-600 mt-1">Manage your courses, workshops, and training programs</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="w-5 h-5 mr-2" />
          Create Opportunity
        </Button>
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

      {/* Opportunities List */}
      <Card>
        <CardHeader>
          <CardTitle>My Opportunities</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto"></div>
            </div>
          ) : opportunities.length === 0 ? (
            <div className="text-center py-8">
              <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No opportunities yet. Create your first opportunity!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {opportunities.map((opportunity) => (
                <div
                  key={opportunity.id}
                  className="p-4 border border-gray-200 rounded-lg hover:border-primary-300 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold">{opportunity.title}</h3>
                        <Badge variant={opportunity.published ? 'success' : 'default'}>
                          {opportunity.published ? 'Published' : 'Draft'}
                        </Badge>
                        <Badge variant="primary">{opportunity.type}</Badge>
                      </div>
                      <p className="text-gray-600 mb-3 line-clamp-2">{opportunity.description}</p>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button variant="ghost" size="sm" as={Link} to={`/opportunities/${opportunity.id}`}>
                        View
                      </Button>
                    </div>
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
        size="lg"
      >
        <OpportunityForm
          onSuccess={() => {
            setShowCreateModal(false)
            fetchOpportunities()
            toast.success('Opportunity created successfully!')
          }}
          onCancel={() => setShowCreateModal(false)}
        />
      </Modal>
    </div>
  )
}


