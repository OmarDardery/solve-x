/**
 * Browser-friendly script to add dummy data
 * 
 * Usage: Copy and paste this entire script into your browser console while logged in
 * Make sure you're logged in as a Professor, TA, or Organization first
 */

import { collection, addDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore'
import { db } from '../lib/firebase'

export async function addDummyDataFromBrowser() {
  try {
    console.log('🚀 Starting to add dummy data...')
    
    // Get current user ID from auth (you'll need to import auth)
    const { auth } = await import('../lib/firebase')
    const currentUser = auth.currentUser
    
    if (!currentUser) {
      throw new Error('Please log in first before adding dummy data')
    }
    
    console.log('✅ User authenticated:', currentUser.email)
    
    // Get user role
    const { doc, getDoc } = await import('firebase/firestore')
    const userDoc = await getDoc(doc(db, 'users', currentUser.uid))
    const userData = userDoc.data()
    const userRole = userData?.role
    
    console.log('👤 User role:', userRole)
    
    if (!userRole) {
      throw new Error('User role not found. Please select a role first.')
    }
    
    const isProfessor = userRole === 'professor'
    const isTA = userRole === 'ta'
    const isOrg = userRole === 'organization_representative'
    
    if (!isProfessor && !isTA && !isOrg) {
      throw new Error('You must be logged in as Professor, TA, or Organization to add dummy data')
    }
    
    // Add projects if Professor or TA
    if (isProfessor || isTA) {
      const dummyProjects = [
        {
          title: 'Machine Learning for Climate Prediction',
          description: 'Join our research team to develop advanced machine learning models for climate prediction. This project involves working with large datasets, implementing neural networks, and collaborating with climate scientists. Students will gain hands-on experience in deep learning, data analysis, and scientific computing.',
          skills: ['Python', 'Machine Learning', 'TensorFlow', 'Data Analysis', 'Statistics'],
          timeline: '6 months, Starting Spring 2024',
          positions: 3,
          published: true,
          createdBy: currentUser.uid,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          cvLink: 'https://drive.google.com/file/d/example1',
          proposalLink: 'https://drive.google.com/file/d/example2',
          datasetLink: 'https://drive.google.com/file/d/example3',
        },
        {
          title: 'Blockchain-Based Voting System',
          description: 'Research and develop a secure, transparent voting system using blockchain technology. This project explores cryptographic protocols, smart contracts, and decentralized systems. Ideal for students interested in cybersecurity, distributed systems, and democratic technology.',
          skills: ['Blockchain', 'Solidity', 'JavaScript', 'Cryptography', 'Web3'],
          timeline: '4 months, Starting Fall 2024',
          positions: 2,
          published: true,
          createdBy: currentUser.uid,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          cvLink: 'https://drive.google.com/file/d/example4',
          proposalLink: 'https://drive.google.com/file/d/example5',
        },
        {
          title: 'Computer Vision for Medical Imaging',
          description: 'Develop AI models to assist in medical image analysis. Work with radiologists to create tools that can detect anomalies in X-rays, MRIs, and CT scans. This project combines computer vision, deep learning, and healthcare applications.',
          skills: ['Python', 'Computer Vision', 'PyTorch', 'Medical Imaging', 'Deep Learning'],
          timeline: '8 months, Starting Summer 2024',
          positions: 4,
          published: true,
          createdBy: currentUser.uid,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          cvLink: 'https://drive.google.com/file/d/example6',
          datasetLink: 'https://drive.google.com/file/d/example7',
        },
      ]
      
      console.log('📝 Adding projects...')
      for (const project of dummyProjects) {
        try {
          const docRef = await addDoc(collection(db, 'projects'), project)
          console.log('✅ Added project:', docRef.id, project.title)
        } catch (error) {
          console.error('❌ Error adding project:', error)
        }
      }
    }
    
    // Add opportunities if Organization
    if (isOrg) {
      const dummyOpportunities = [
        {
          title: 'Summer Internship Program 2024',
          description: 'Join our prestigious summer internship program! Work on real-world projects, learn from industry experts, and build your professional network. Open to students in computer science, engineering, and related fields.',
          type: 'training',
          skills: ['Software Development', 'Teamwork', 'Problem Solving'],
          timeline: '3 months, June - August 2024',
          positions: 20,
          published: true,
          organizationId: currentUser.uid,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          materialLink: 'https://drive.google.com/file/d/example10',
        },
        {
          title: 'Data Science Workshop Series',
          description: 'Learn data science from scratch! This comprehensive workshop covers Python, pandas, matplotlib, machine learning basics, and data visualization. Perfect for beginners and intermediate learners.',
          type: 'workshop',
          skills: ['Python', 'Data Science', 'Pandas', 'Matplotlib'],
          timeline: '6 weeks, Starting March 2024',
          positions: 30,
          published: true,
          organizationId: currentUser.uid,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          materialLink: 'https://drive.google.com/file/d/example11',
        },
      ]
      
      console.log('📝 Adding opportunities...')
      for (const opportunity of dummyOpportunities) {
        try {
          const docRef = await addDoc(collection(db, 'opportunities'), opportunity)
          console.log('✅ Added opportunity:', docRef.id, opportunity.title)
        } catch (error) {
          console.error('❌ Error adding opportunity:', error)
        }
      }
    }
    
    console.log('🎉 Dummy data added successfully!')
    alert('Dummy data added successfully! Check the console for details.')
    return { success: true }
  } catch (error) {
    console.error('❌ Error adding dummy data:', error)
    alert('Error: ' + error.message)
    return { success: false, error: error.message }
  }
}

// Make it available globally for browser console
if (typeof window !== 'undefined') {
  window.addDummyData = addDummyDataFromBrowser
}



