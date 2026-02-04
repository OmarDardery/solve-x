import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Select } from '../components/ui/Input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card'
import { Modal } from '../components/ui/Modal'
import { USER_ROLES } from '../types'
import toast from 'react-hot-toast'
import { CheckCircle, XCircle, Mail } from 'lucide-react'

// Email validation regex
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function Signup() {
  const [step, setStep] = useState(1) // 1: email, 2: code + details
  const [formData, setFormData] = useState({
    email: '',
    verificationCode: '',
    password: '',
    confirmPassword: '',
    role: '',
    firstName: '',
    lastName: '',
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [codeSent, setCodeSent] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [showErrorModal, setShowErrorModal] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const { signup, sendVerificationCode, currentUser, userRole } = useAuth()
  const navigate = useNavigate()

  // Navigate after signup when auth state updates
  useEffect(() => {
    if (currentUser && userRole && showSuccessModal) {
      // Navigate after showing success modal briefly
      const timer = setTimeout(() => {
        const dashboardPaths = {
          [USER_ROLES.PROFESSOR]: '/dashboard/professor',
          [USER_ROLES.TEACHING_ASSISTANT]: '/dashboard/ta',
          [USER_ROLES.STUDENT]: '/dashboard/student',
          [USER_ROLES.ORGANIZATION]: '/dashboard/organization',
        }
        navigate(dashboardPaths[userRole] || '/dashboard', { replace: true })
      }, 2000)

      return () => clearTimeout(timer)
    }
  }, [currentUser, userRole, showSuccessModal, navigate])

  const validateEmail = (email) => {
    if (!email) {
      return 'Email is required'
    }
    if (!emailRegex.test(email)) {
      return 'Please enter a valid email address'
    }
    return null
  }

  const validateStep1 = () => {
    const newErrors = {}
    const emailError = validateEmail(formData.email)
    if (emailError) {
      newErrors.email = emailError
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateStep2 = () => {
    const newErrors = {}

    // Verification code validation
    if (!formData.verificationCode) {
      newErrors.verificationCode = 'Verification code is required'
    } else if (!/^\d{6}$/.test(formData.verificationCode)) {
      newErrors.verificationCode = 'Code must be 6 digits'
    }

    // First name validation
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required'
    }

    // Last name validation
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required'
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters'
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

  const handleSendCode = async (e) => {
    e.preventDefault()

    if (!validateStep1()) {
      toast.error('Please enter a valid email')
      return
    }

    setLoading(true)

    try {
      await sendVerificationCode(formData.email)
      toast.success('Verification code sent to your email!')
      setCodeSent(true)
      setStep(2)
    } catch (error) {
      let errorMsg = 'Failed to send verification code'
      if (error.message) {
        errorMsg = error.message
      }
      toast.error(errorMsg)
      setErrors({ email: errorMsg })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateStep2()) {
      toast.error('Please fix the errors in the form')
      return
    }

    setLoading(true)

    try {
      await signup(
        formData.role,
        formData.verificationCode,
        formData.email,
        formData.password,
        formData.firstName,
        formData.lastName
      )
      
      setShowSuccessModal(true)
      toast.success('Account created successfully!')
      // Navigation will happen via useEffect when currentUser and userRole are set
    } catch (error) {
      let errorMsg = 'Failed to create account'
      if (error.message) {
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
            {step === 1 ? 'Enter your email to get started' : 'Complete your registration'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Step 1: Email */}
          {step === 1 && (
            <form onSubmit={handleSendCode} className="space-y-4">
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
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Sending code...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <Mail className="w-4 h-4" />
                    Send Verification Code
                  </span>
                )}
              </Button>
            </form>
          )}

          {/* Step 2: Verification Code + Details */}
          {step === 2 && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-blue-800">
                  <Mail className="w-4 h-4 inline mr-1" />
                  A verification code has been sent to <strong>{formData.email}</strong>
                </p>
              </div>

              <Input
                type="text"
                name="verificationCode"
                label="Verification Code"
                placeholder="Enter 6-digit code"
                value={formData.verificationCode}
                onChange={handleChange}
                error={errors.verificationCode}
                maxLength={6}
                required
              />

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
                <option value={USER_ROLES.STUDENT}>Student</option>
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

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="w-1/3"
                  onClick={() => {
                    setStep(1)
                    setCodeSent(false)
                  }}
                  disabled={loading}
                >
                  Back
                </Button>
                <Button type="submit" className="w-2/3" disabled={loading}>
                  {loading ? 'Creating account...' : 'Create Account'}
                </Button>
              </div>

              <Button
                type="button"
                variant="ghost"
                className="w-full text-sm"
                onClick={handleSendCode}
                disabled={loading}
              >
                Resend verification code
              </Button>
            </form>
          )}

          <p className="mt-6 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-500 hover:text-primary-600 font-medium">
              Sign in
            </Link>
          </p>
          <p className="mt-2 text-center text-sm text-gray-600">
            Are you an organization?{' '}
            <Link to="/signup/organization" className="text-purple-600 hover:text-purple-700 font-medium">
              Sign up here
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

