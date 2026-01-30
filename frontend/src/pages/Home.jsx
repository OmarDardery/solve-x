import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Button } from '../components/ui/Button'
import { Layout } from '../components/layout/Layout'
import { Search, BookOpen, Users, TrendingUp, ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'

export function Home() {
  const { currentUser } = useAuth()

  return (
    <Layout>
      <div className="space-y-16">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-16"
        >
          <div className="flex justify-center mb-6">
            <img 
              src="/logo.png" 
              alt="SolveX Logo" 
              className="h-24 w-24 object-contain"
            />
          </div>
          <h1 className="text-5xl md:text-6xl font-display font-bold text-gray-900 mb-6">
            Welcome to{' '}
            <span className="bg-gradient-to-r from-primary-500 to-primary-700 bg-clip-text text-transparent">
              SolveX
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            The premium platform for student research, academic collaboration, and skill development
          </p>
          {!currentUser ? (
            <div className="flex gap-4 justify-center">
              <Button size="lg" as={Link} to="/signup">
                Get Started
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button variant="secondary" size="lg" as={Link} to="/login">
                Sign In
              </Button>
            </div>
          ) : (
            <Button size="lg" as={Link} to="/opportunities">
              Browse Opportunities
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          )}
        </motion.div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: Search,
              title: 'Research Opportunities',
              description: 'Discover and apply to research projects from professors, TAs, and fellow students',
            },
            {
              icon: BookOpen,
              title: 'Skill Development',
              description: 'Access courses, workshops, and training programs from student organizations',
            },
            {
              icon: Users,
              title: 'Collaboration',
              description: 'Connect with peers, professors, and organizations to advance your academic journey',
            },
            {
              icon: TrendingUp,
              title: 'Progress Tracking',
              description: 'Submit weekly reports and track your progress on accepted projects',
            },
          ].map((feature, index) => {
            const Icon = feature.icon
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="card text-center"
              >
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Icon className="w-6 h-6 text-primary-500" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            )
          })}
        </div>
      </div>
    </Layout>
  )
}

