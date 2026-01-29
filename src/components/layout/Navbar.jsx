import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Button } from '../ui/Button'
import { NotificationsPanel } from '../NotificationsPanel'
import { LogOut, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export function Navbar() {
  const { currentUser, userRole, logout } = useAuth()
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const getDashboardPath = () => {
    switch (userRole) {
      case 'professor':
        return '/dashboard/professor'
      case 'ta':
        return '/dashboard/ta'
      case 'student':
        return '/dashboard/student'
      case 'organization_representative':
        return '/dashboard/organization'
      default:
        return '/dashboard'
    }
  }

  return (
    <nav className="bg-white shadow-soft border-b border-gray-200 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <img 
              src="/logo.png" 
              alt="SolveX Logo" 
              className="h-10 w-10 object-contain"
            />
            <span className="text-2xl font-display font-bold text-gray-900">SolveX</span>
          </Link>

          {/* Desktop Navigation */}
          {currentUser && (
            <div className="hidden md:flex items-center space-x-6">
              <Link
                to={getDashboardPath()}
                className="text-gray-700 hover:text-primary-500 font-medium transition-colors"
              >
                Dashboard
              </Link>
              <Link
                to="/opportunities"
                className="text-gray-700 hover:text-primary-500 font-medium transition-colors"
              >
                Opportunities
              </Link>
              <Link
                to="/applications"
                className="text-gray-700 hover:text-primary-500 font-medium transition-colors"
              >
                My Applications
              </Link>
              <div className="flex items-center space-x-4">
                <NotificationsPanel />
                <span className="text-sm text-gray-600">
                  {currentUser.email}
                </span>
                <Button variant="ghost" size="sm" onClick={handleLogout}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </div>
            </div>
          )}

          {/* Mobile menu button */}
          {currentUser && (
            <button
              className="md:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          )}

          {/* Mobile Navigation */}
          <AnimatePresence>
            {mobileMenuOpen && currentUser && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="md:hidden absolute top-16 left-0 right-0 bg-white border-b border-gray-200 shadow-medium"
              >
                <div className="px-4 py-4 space-y-3">
                  <Link
                    to={getDashboardPath()}
                    className="block text-gray-700 hover:text-primary-500 font-medium"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/opportunities"
                    className="block text-gray-700 hover:text-primary-500 font-medium"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Opportunities
                  </Link>
                  <Link
                    to="/applications"
                    className="block text-gray-700 hover:text-primary-500 font-medium"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    My Applications
                  </Link>
                  <div className="pt-3 border-t border-gray-200">
                    <p className="text-sm text-gray-600 mb-2">{currentUser.email}</p>
                    <Button variant="ghost" size="sm" onClick={handleLogout} className="w-full">
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </nav>
  )
}

