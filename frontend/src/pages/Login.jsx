import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Select } from '../components/ui/Input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card'
import { ThemeToggle } from '../components/ui/ThemeToggle'
import { USER_ROLES } from '../types'
import toast from 'react-hot-toast'

export function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('')
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const { login, currentUser, userRole, loading: authLoading } = useAuth()
  const { getLogo } = useTheme()
  const navigate = useNavigate()
  const location = useLocation()

  const from = location.state?.from?.pathname

  // Helper function to get role-based dashboard path
  const getDashboardPath = (role) => {
    if (!role) return '/select-role'
    const paths = {
      [USER_ROLES.PROFESSOR]: '/dashboard/professor',
      [USER_ROLES.TEACHING_ASSISTANT]: '/dashboard/ta',
      [USER_ROLES.STUDENT]: '/dashboard/student',
      [USER_ROLES.ORGANIZATION]: '/dashboard/organization',
    }
    return paths[role] || '/select-role'
  }

  // Navigate after login when userRole is available
  useEffect(() => {
    if (currentUser && userRole && !authLoading) {
      // Immediately navigate to dashboard - no delay needed
      const dashboardPath = getDashboardPath(userRole)
      if (!from || from === '/login' || from === '/') {
        navigate(dashboardPath, { replace: true })
      } else {
        navigate(from, { replace: true })
      }
    }
  }, [currentUser, userRole, authLoading, navigate, from])

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!email) {
      return 'Email is required'
    }
    if (!emailRegex.test(email)) {
      return 'Please enter a valid email address'
    }
    return null
  }

  const handleBlur = (field) => {
    if (field === 'email') {
      const emailError = validateEmail(email)
      setErrors({ ...errors, email: emailError || '' })
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validate form
    const newErrors = {}
    const emailError = validateEmail(email)
    if (emailError) {
      newErrors.email = emailError
    }
    if (!password) {
      newErrors.password = 'Password is required'
    }
    if (!role) {
      newErrors.role = 'Please select your role'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      toast.error('Please fix the errors in the form')
      return
    }

    setLoading(true)
    setErrors({})

    try {
      await login(role, email, password)
      toast.success('Logged in successfully!')
      // Navigation will happen via useEffect when userRole is set
    } catch (error) {
      let errorMsg = 'Failed to log in'
      if (error.message) {
        errorMsg = error.message
      }
      toast.error(errorMsg)
      setLoading(false)
    }
  }

  return (
    <div className="auth-bg flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <img 
              src={getLogo()}
              alt="SolveX Logo" 
              className="h-16 sm:h-20 object-contain"
            />
          </div>
          <CardTitle className="text-center">Welcome to SolveX</CardTitle>
          <CardDescription className="text-center">
            Sign in to your account to continue
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="email"
              label="Email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                if (errors.email) {
                  setErrors({ ...errors, email: '' })
                }
              }}
              onBlur={() => handleBlur('email')}
              error={errors.email}
              required
            />
            <Select
              label="Role"
              value={role}
              onChange={(e) => {
                setRole(e.target.value)
                if (errors.role) {
                  setErrors({ ...errors, role: '' })
                }
              }}
              error={errors.role}
              required
            >
              <option value="">Select your role</option>
              <option value={USER_ROLES.PROFESSOR}>Professor</option>
              <option value={USER_ROLES.STUDENT}>Student</option>
            </Select>
            <Input
              type="password"
              label="Password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                if (errors.password) {
                  setErrors({ ...errors, password: '' })
                }
              }}
              error={errors.password}
              required
            />
            <Button type="submit" className="w-full" disabled={loading || authLoading}>
              {loading || authLoading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-body">
            Don't have an account?{' '}
            <Link to="/signup" className="text-brand font-medium">
              Sign up
            </Link>
          </p>
          <p className="mt-2 text-center text-sm text-body">
            Are you an organization?{' '}
            <Link to="/login/organization" className="text-brand font-medium">
              Sign in here
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

