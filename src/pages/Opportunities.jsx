import { useState, useEffect } from 'react'
import { dummyDataService } from '../services/dummyDataService'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { Input } from '../components/ui/Input'
import { Select } from '../components/ui/Input'
import { Search, Filter, ExternalLink } from 'lucide-react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'

export function Opportunities() {
  const [opportunities, setOpportunities] = useState([])
  const [filteredOpportunities, setFilteredOpportunities] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [skillFilter, setSkillFilter] = useState('')

  useEffect(() => {
    fetchOpportunities()
  }, [])

  useEffect(() => {
    filterOpportunities()
  }, [searchTerm, typeFilter, skillFilter, opportunities])

  const fetchOpportunities = async () => {
    setLoading(true)
    try {
      const all = dummyDataService.getAllPublishedOpportunities()
      setOpportunities(all)
      setFilteredOpportunities(all)
    } catch (error) {
      console.error('Unexpected error fetching opportunities:', error)
      toast.error('Failed to fetch opportunities')
    } finally {
      setLoading(false)
    }
  }

  const filterOpportunities = () => {
    let filtered = [...opportunities]

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (opp) =>
          opp.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          opp.description?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter((opp) => opp.type === typeFilter)
    }

    // Skill filter
    if (skillFilter) {
      filtered = filtered.filter((opp) => {
        const skills = opp.skills || []
        return skills.some((skill) =>
          skill.toLowerCase().includes(skillFilter.toLowerCase())
        )
      })
    }

    setFilteredOpportunities(filtered)
  }

  const getTypeLabel = (type) => {
    const labels = {
      project: 'Research Project',
      student_project: 'Student Project',
      opportunity: 'Organization Opportunity',
    }
    return labels[type] || type
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-display font-bold text-gray-900">Research Opportunities</h1>
        <p className="text-gray-600 mt-1">Browse and apply to research projects and opportunities</p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Search opportunities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
              <option value="all">All Types</option>
              <option value="project">Research Projects</option>
              <option value="student_project">Student Projects</option>
              <option value="opportunity">Organization Opportunities</option>
            </Select>
            <Input
              placeholder="Filter by skill..."
              value={skillFilter}
              onChange={(e) => setSkillFilter(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Opportunities List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
        </div>
      ) : filteredOpportunities.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-gray-600">No opportunities found. Try adjusting your filters.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOpportunities.map((opportunity) => (
            <Card key={opportunity.id} hover>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <Badge variant="primary">{getTypeLabel(opportunity.type)}</Badge>
                  {opportunity.type === 'opportunity' && (
                    <Badge>{opportunity.type}</Badge>
                  )}
                </div>
                <h3 className="text-xl font-semibold mb-2 line-clamp-2">{opportunity.title}</h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">{opportunity.description}</p>
                
                {opportunity.skills && opportunity.skills.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {opportunity.skills.slice(0, 3).map((skill, idx) => (
                      <Badge key={idx} variant="default" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                    {opportunity.skills.length > 3 && (
                      <Badge variant="default" className="text-xs">
                        +{opportunity.skills.length - 3}
                      </Badge>
                    )}
                  </div>
                )}
                
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="text-sm text-gray-500">
                    {opportunity.positions ? `${opportunity.positions} positions` : 'Open'}
                  </div>
                  <Button size="sm" as={Link} to={`/opportunities/${opportunity.id}`}>
                    View Details
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}


