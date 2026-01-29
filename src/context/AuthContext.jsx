import React, { createContext, useContext, useEffect, useState } from 'react'
import { dummyDataService } from '../services/dummyDataService'
import { USER_ROLES } from '../types'

const AuthContext = createContext()

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null)
  const [userRole, setUserRole] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check localStorage for existing session
    const storedUser = localStorage.getItem('dummyAuth_user')
    const storedRole = localStorage.getItem('dummyAuth_role')
    
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser)
        setCurrentUser(user)
        setUserRole(storedRole || null)
      } catch (error) {
        console.error('Error parsing stored user:', error)
        localStorage.removeItem('dummyAuth_user')
        localStorage.removeItem('dummyAuth_role')
      }
    }
    
    setLoading(false)
  }, [])

  async function signup(email, password, role, additionalData = {}) {
    try {
      // Check if email already exists
      const users = JSON.parse(localStorage.getItem('dummyAuth_users') || '{}')
      if (users[email]) {
        throw new Error('This email is already registered. Please sign in instead.')
      }

      // Validate password
      if (!password || password.length < 6) {
        throw new Error('Password must be at least 6 characters')
      }

      // Validate email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email)) {
        throw new Error('Invalid email address.')
      }

      // Create user object
      const uid = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      const user = {
        uid,
        email,
        ...additionalData,
      }

      // Store user in localStorage
      users[email] = {
        uid,
        email,
        role,
        password, // In real app, this would be hashed
        ...additionalData,
        createdAt: new Date().toISOString(),
      }
      localStorage.setItem('dummyAuth_users', JSON.stringify(users))

      // Create user in dummy data service
      dummyDataService.createUser(uid, {
        email,
        role,
        ...additionalData,
      })

      // Set current session
      localStorage.setItem('dummyAuth_user', JSON.stringify(user))
      localStorage.setItem('dummyAuth_role', role)

      setCurrentUser(user)
      setUserRole(role)

      return { user }
    } catch (error) {
      console.error('Signup error:', error)
      throw error
    }
  }

  async function login(email, password) {
    try {
      const users = JSON.parse(localStorage.getItem('dummyAuth_users') || '{}')
      const userData = users[email]

      if (!userData) {
        throw new Error('No account found with this email. Please sign up first.')
      }

      if (userData.password !== password) {
        throw new Error('Incorrect password. Please try again.')
      }

      const user = {
        uid: userData.uid,
        email: userData.email,
        displayName: userData.displayName,
        firstName: userData.firstName,
        lastName: userData.lastName,
      }

      // Set current session
      localStorage.setItem('dummyAuth_user', JSON.stringify(user))
      localStorage.setItem('dummyAuth_role', userData.role)

      setCurrentUser(user)
      setUserRole(userData.role)

      return { user }
    } catch (error) {
      console.error('Login error:', error)
      throw error
    }
  }

  async function loginWithGoogle() {
    // For demo purposes, create a temporary user
    const uid = `google_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const user = {
      uid,
      email: 'google.user@example.com',
      displayName: 'Google User',
    }

    // Check if user exists
    const users = JSON.parse(localStorage.getItem('dummyAuth_users') || '{}')
    const existingUser = Object.values(users).find(u => u.email === user.email)

    if (existingUser) {
      const userObj = {
        uid: existingUser.uid,
        email: existingUser.email,
        displayName: existingUser.displayName,
      }
      localStorage.setItem('dummyAuth_user', JSON.stringify(userObj))
      localStorage.setItem('dummyAuth_role', existingUser.role || null)
      setCurrentUser(userObj)
      setUserRole(existingUser.role || null)
    } else {
      // First time Google login - need to set role
      localStorage.setItem('dummyAuth_user', JSON.stringify(user))
      localStorage.setItem('dummyAuth_role', '')
      setCurrentUser(user)
      setUserRole(null)
    }

    return { user }
  }

  async function logout() {
    localStorage.removeItem('dummyAuth_user')
    localStorage.removeItem('dummyAuth_role')
    setCurrentUser(null)
    setUserRole(null)
  }

  const refreshUserRole = async () => {
    if (currentUser) {
      const storedRole = localStorage.getItem('dummyAuth_role')
      setUserRole(storedRole || null)
      return storedRole
    }
    return null
  }

  const value = {
    currentUser,
    userRole,
    signup,
    login,
    loginWithGoogle,
    logout,
    loading,
    refreshUserRole,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

