import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Select } from '../components/ui/Input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card'
import { Modal } from '../components/ui/Modal'
import { USER_ROLES } from '../types'
import toast from 'react-hot-toast'
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react'

// Email validation regex
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function Signup() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    role: '',
    firstName: '',
    lastName: '',
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [showErrorModal, setShowErrorModal] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const { signup } = useAuth()
  const navigate = useNavigate()

  const validateEmail = (email) => {
    if (!email) {
      return 'Email is required'
    }
    if (!emailRegex.test(email)) {
      return 'Please enter a valid email address'
    }
    return null
  }

  const validateForm = () => {
    const newErrors = {}

    // First name validation
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required'
    }

    // Last name validation
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required'
    }

    // Email validation
    const emailError = validateEmail(formData.email)
    if (emailError) {
      newErrors.email = emailError
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password'
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    // Role validation
    if (!formData.role) {
      newErrors.role = 'Please select a role'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' })
    }
  }

  const handleBlur = (e) => {
    const { name, value } = e.target
    if (name === 'email') {
      const emailError = validateEmail(value)
      if (emailError) {
        setErrors({ ...errors, email: emailError })
      }
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      toast.error('Please fix the errors in the form')
      return
    }

    setLoading(true)

    try {
      await signup(formData.email, formData.password, formData.role, {
        firstName: formData.firstName,
        lastName: formData.lastName,
        displayName: `${formData.firstName} ${formData.lastName}`,
      })
      
      setShowSuccessModal(true)
      // Wait a bit longer to ensure Firestore write completes
      setTimeout(() => {
        const dashboardPaths = {
          [USER_ROLES.PROFESSOR]: '/dashboard/professor',
          [USER_ROLES.TEACHING_ASSISTANT]: '/dashboard/ta',
          [USER_ROLES.STUDENT]: '/dashboard/student',
          [USER_ROLES.ORGANIZATION]: '/dashboard/organization',
        }
        // Use window.location to force a full page reload and refresh AuthContext
        window.location.href = dashboardPaths[formData.role] || '/dashboard'
      }, 2000)
    } catch (error) {
      let errorMsg = 'Failed to create account'
      if (error.code === 'auth/email-already-in-use') {
        errorMsg = 'This email is already registered. Please use a different email or sign in.'
      } else if (error.code === 'auth/invalid-email') {
        errorMsg = 'Invalid email address. Please check your email and try again.'
      } else if (error.code === 'auth/weak-password') {
        errorMsg = 'Password is too weak. Please use a stronger password.'
      } else if (error.message) {
        errorMsg = error.message
      }
      setErrorMessage(errorMsg)
      setShowErrorModal(true)
      toast.error(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-primary-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <img 
              src="/logo.png" 
              alt="SolveX Logo" 
              className="h-20 w-20 object-contain"
            />
          </div>
          <CardTitle className="text-center">Create an Account</CardTitle>
          <CardDescription className="text-center">
            Join SolveX to start your research journey
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                type="text"
                name="firstName"
                label="First Name"
                placeholder="John"
                value={formData.firstName}
                onChange={handleChange}
                error={errors.firstName}
                required
              />
              <Input
                type="text"
                name="lastName"
                label="Last Name"
                placeholder="Doe"
                value={formData.lastName}
                onChange={handleChange}
                error={errors.lastName}
                required
              />
            </div>
            <Input
              type="email"
              name="email"
              label="Email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.email}
              required
            />
            <Select
              name="role"
              label="Role"
              value={formData.role}
              onChange={handleChange}
              error={errors.role}
              required
            >
              <option value="">Select a role</option>
              <option value={USER_ROLES.PROFESSOR}>Professor</option>
              <option value={USER_ROLES.TEACHING_ASSISTANT}>Teaching Assistant</option>
              <option value={USER_ROLES.STUDENT}>Student</option>
              <option value={USER_ROLES.ORGANIZATION}>Organization Representative</option>
            </Select>
            <Input
              type="password"
              name="password"
              label="Password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
              required
            />
            <Input
              type="password"
              name="confirmPassword"
              label="Confirm Password"
              placeholder="••••••••"
              value={formData.confirmPassword}
              onChange={handleChange}
              error={errors.confirmPassword}
              required
            />
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Creating account...' : 'Create Account'}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-500 hover:text-primary-600 font-medium">
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>

      {/* Success Modal */}
      <Modal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title=""
        size="sm"
      >
        <div className="text-center py-6">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Account Created Successfully!</h3>
          <p className="text-gray-600 mb-4">
            Your account has been created. You will be redirected to your dashboard shortly.
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-500"></div>
            <span>Redirecting...</span>
          </div>
        </div>
      </Modal>

      {/* Error Modal */}
      <Modal
        isOpen={showErrorModal}
        onClose={() => setShowErrorModal(false)}
        title=""
        size="sm"
      >
        <div className="text-center py-6">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <XCircle className="w-10 h-10 text-red-600" />
            </div>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Sign Up Failed</h3>
          <p className="text-gray-600 mb-4">{errorMessage}</p>
          <Button onClick={() => setShowErrorModal(false)} className="w-full">
            Try Again
          </Button>
        </div>
      </Modal>
    </div>
  )
}

