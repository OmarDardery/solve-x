/**
 * Script to add dummy data to Firestore
 * Run this in the browser console or create a page to execute it
 * 
 * Usage: Import this function and call it with your Firebase instance
 */

import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../lib/firebase'

export async function addDummyData() {
  try {
    console.log('Adding dummy data...')

    // Dummy projects (research opportunities)
    const dummyProjects = [
      {
        title: 'Machine Learning for Climate Prediction',
        description: 'Join our research team to develop advanced machine learning models for climate prediction. This project involves working with large datasets, implementing neural networks, and collaborating with climate scientists. Students will gain hands-on experience in deep learning, data analysis, and scientific computing.',
        skills: ['Python', 'Machine Learning', 'TensorFlow', 'Data Analysis', 'Statistics'],
        timeline: '6 months, Starting Spring 2024',
        positions: 3,
        published: true,
        createdBy: 'dummy-professor-id', // Replace with actual professor ID
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
        createdBy: 'dummy-professor-id',
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
        createdBy: 'dummy-professor-id',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        cvLink: 'https://drive.google.com/file/d/example6',
        datasetLink: 'https://drive.google.com/file/d/example7',
      },
      {
        title: 'Natural Language Processing for Sentiment Analysis',
        description: 'Build advanced NLP models to analyze sentiment in social media posts, reviews, and customer feedback. This project involves working with transformer models, fine-tuning BERT, and deploying models to production.',
        skills: ['NLP', 'Python', 'Transformers', 'BERT', 'Hugging Face'],
        timeline: '5 months, Starting Spring 2024',
        positions: 2,
        published: true,
        createdBy: 'dummy-ta-id', // Replace with actual TA ID
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        cvLink: 'https://drive.google.com/file/d/example8',
      },
      {
        title: 'IoT Sensor Network for Smart Agriculture',
        description: 'Design and implement an IoT system for monitoring soil conditions, weather patterns, and crop health. This interdisciplinary project combines hardware design, embedded systems, data analytics, and agricultural science.',
        skills: ['IoT', 'Arduino', 'Embedded Systems', 'Data Analytics', 'Python'],
        timeline: '6 months, Starting Fall 2024',
        positions: 3,
        published: true,
        createdBy: 'dummy-ta-id',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        proposalLink: 'https://drive.google.com/file/d/example9',
      },
    ]

    // Add projects
    console.log('Adding projects...')
    for (const project of dummyProjects) {
      try {
        const docRef = await addDoc(collection(db, 'projects'), project)
        console.log('Added project:', docRef.id, project.title)
      } catch (error) {
        console.error('Error adding project:', error)
      }
    }

    // Dummy opportunities (organization opportunities)
    const dummyOpportunities = [
      {
        title: 'Summer Internship Program 2024',
        description: 'Join our prestigious summer internship program! Work on real-world projects, learn from industry experts, and build your professional network. Open to students in computer science, engineering, and related fields.',
        type: 'training',
        skills: ['Software Development', 'Teamwork', 'Problem Solving'],
        timeline: '3 months, June - August 2024',
        positions: 20,
        published: true,
        organizationId: 'dummy-org-id', // Replace with actual org ID
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
        organizationId: 'dummy-org-id',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        materialLink: 'https://drive.google.com/file/d/example11',
      },
      {
        title: 'Hackathon 2024: Innovation Challenge',
        description: 'Participate in our annual hackathon! Build innovative solutions, compete for prizes, and network with industry leaders. Teams of 2-4 members welcome. Categories include AI/ML, Web Development, Mobile Apps, and IoT.',
        type: 'competition',
        skills: ['Programming', 'Innovation', 'Teamwork'],
        timeline: '48 hours, April 15-17, 2024',
        positions: 100,
        published: true,
        organizationId: 'dummy-org-id',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        materialLink: 'https://drive.google.com/file/d/example12',
      },
    ]

    // Add opportunities
    console.log('Adding opportunities...')
    for (const opportunity of dummyOpportunities) {
      try {
        const docRef = await addDoc(collection(db, 'opportunities'), opportunity)
        console.log('Added opportunity:', docRef.id, opportunity.title)
      } catch (error) {
        console.error('Error adding opportunity:', error)
      }
    }

    console.log('Dummy data added successfully!')
    return { success: true, message: 'Dummy data added successfully' }
  } catch (error) {
    console.error('Error adding dummy data:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Helper function to get a user ID by email
 * Call this first to get actual user IDs, then update the dummy data
 */
export async function getUserIdByEmail(email) {
  const { collection, query, where, getDocs } = await import('firebase/firestore')
  const { db } = await import('../lib/firebase')
  
  try {
    const q = query(collection(db, 'users'), where('email', '==', email))
    const snapshot = await getDocs(q)
    if (!snapshot.empty) {
      return snapshot.docs[0].id
    }
    return null
  } catch (error) {
    console.error('Error getting user ID:', error)
    return null
  }
}



