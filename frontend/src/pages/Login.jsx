import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card'
import { USER_ROLES } from '../types'
import toast from 'react-hot-toast'

export function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const { login, loginWithGoogle, currentUser, userRole, loading: authLoading } = useAuth()
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
    if (currentUser && !authLoading && !loading) {
      // Small delay to ensure Firestore data is loaded
      const timer = setTimeout(() => {
        if (userRole) {
          const dashboardPath = getDashboardPath(userRole)
          if (!from || from === '/login' || from === '/') {
            navigate(dashboardPath, { replace: true })
          } else {
            navigate(from, { replace: true })
          }
        } else {
          // User logged in but no role selected - only redirect if not already on select-role
          if (location.pathname !== '/select-role') {
            navigate('/select-role', { replace: true })
          }
        }
      }, 500)

      return () => clearTimeout(timer)
    }
  }, [currentUser, userRole, authLoading, loading, navigate, from, location.pathname])

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

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      toast.error('Please fix the errors in the form')
      return
    }

    setLoading(true)
    setErrors({})

    try {
      await login(email, password)
      toast.success('Logged in successfully!')
      // Navigation will happen via useEffect when userRole is set
    } catch (error) {
      let errorMsg = 'Failed to log in'
      if (error.code === 'auth/user-not-found') {
        errorMsg = 'No account found with this email. Please sign up first.'
      } else if (error.code === 'auth/wrong-password') {
        errorMsg = 'Incorrect password. Please try again.'
        setErrors({ password: 'Incorrect password' })
      } else if (error.code === 'auth/invalid-email') {
        errorMsg = 'Invalid email address. Please check your email and try again.'
        setErrors({ email: 'Invalid email address' })
      } else if (error.code === 'auth/too-many-requests') {
        errorMsg = 'Too many failed attempts. Please try again later.'
      } else if (error.message) {
        errorMsg = error.message
      }
      toast.error(errorMsg)
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setLoading(true)
    setErrors({})
    try {
      await loginWithGoogle()
      toast.success('Logged in successfully!')
      // Navigation will happen via useEffect when userRole is set
    } catch (error) {
      toast.error(error.message || 'Failed to log in with Google')
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

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>

            <Button
              type="button"
              variant="secondary"
              className="w-full mt-4"
              onClick={handleGoogleLogin}
              disabled={loading}
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Sign in with Google
            </Button>
          </div>

          <p className="mt-6 text-center text-sm text-gray-600">
            Don't have an account?{' '}
            <Link to="/signup" className="text-primary-500 hover:text-primary-600 font-medium">
              Sign up
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

