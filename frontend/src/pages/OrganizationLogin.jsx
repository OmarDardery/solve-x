import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card'
import { Modal } from '../components/ui/Modal'
import toast from 'react-hot-toast'
import { XCircle, Building2 } from 'lucide-react'

export function OrganizationLogin() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [showErrorModal, setShowErrorModal] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const { login } = useAuth()
  const navigate = useNavigate()

  const validate = () => {
    const newErrors = {}
    if (!formData.email) newErrors.email = 'Email is required'
    if (!formData.password) newErrors.password = 'Password is required'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    
    setLoading(true)
    try {
      await login('organization', formData.email, formData.password)
      toast.success('Welcome back!')
      navigate('/dashboard/organization', { replace: true })
    } catch (error) {
      setErrorMessage(error.message || 'Invalid email or password')
      setShowErrorModal(true)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }))
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-indigo-50 px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
            <Building2 className="w-6 h-6 text-purple-600" />
          </div>
          <CardTitle className="text-2xl">Organization Sign In</CardTitle>
          <CardDescription>
            Welcome back! Sign in to your organization account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="contact@organization.com"
              error={errors.email}
            />
            
            <Input
              label="Password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              error={errors.password}
            />
            
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
            
            <p className="text-center text-sm text-gray-600">
              Don't have an account?{' '}
              <Link to="/signup/organization" className="text-purple-600 hover:text-purple-700 font-medium">
                Sign up
              </Link>
            </p>
            <p className="text-center text-sm text-gray-600">
              Not an organization?{' '}
              <Link to="/login" className="text-blue-600 hover:text-blue-700 font-medium">
                Sign in as Student/Professor
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>

      {/* Error Modal */}
      <Modal
        isOpen={showErrorModal}
        onClose={() => setShowErrorModal(false)}
        title="Sign In Failed"
        size="sm"
      >
        <div className="text-center py-4">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">{errorMessage}</p>
          <Button onClick={() => setShowErrorModal(false)}>Try Again</Button>
        </div>
      </Modal>
    </div>
  )
}
