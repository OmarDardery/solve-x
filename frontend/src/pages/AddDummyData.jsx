import { useState } from 'react'
import { collection, addDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore'
import { useAuth } from '../context/AuthContext'
import { db, auth } from '../lib/firebase'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import toast from 'react-hot-toast'
import { Loader2, CheckCircle, XCircle } from 'lucide-react'

export function AddDummyData() {
  const { currentUser, userRole } = useAuth()
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState(null)
  const [addedItems, setAddedItems] = useState([])
  const [preview, setPreview] = useState(false)

  const addDummyData = async () => {
    if (!currentUser) {
      toast.error('Please log in first')
      return
    }

    if (!userRole) {
      toast.error('Please select a role first')
      return
    }

    const isProfessor = userRole === 'professor'
    const isTA = userRole === 'ta'
    const isOrg = userRole === 'organization_representative'

    if (!isProfessor && !isTA && !isOrg) {
      toast.error('You must be logged in as Professor, TA, or Organization to add dummy data')
      return
    }

    setLoading(true)
    setStatus(null)
    setAddedItems([])

    try {
      const items = []

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
          {
            title: 'Natural Language Processing for Sentiment Analysis',
            description: 'Build advanced NLP models to analyze sentiment in social media posts, reviews, and customer feedback. This project involves working with transformer models, fine-tuning BERT, and deploying models to production.',
            skills: ['NLP', 'Python', 'Transformers', 'BERT', 'Hugging Face'],
            timeline: '5 months, Starting Spring 2024',
            positions: 2,
            published: true,
            createdBy: currentUser.uid,
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
            createdBy: currentUser.uid,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            proposalLink: 'https://drive.google.com/file/d/example9',
          },
        ]

        for (const project of dummyProjects) {
          try {
            const docRef = await addDoc(collection(db, 'projects'), project)
            items.push({ type: 'project', title: project.title, id: docRef.id })
          } catch (error) {
            console.error('Error adding project:', error)
            toast.error(`Failed to add project: ${project.title}`)
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
          {
            title: 'Hackathon 2024: Innovation Challenge',
            description: 'Participate in our annual hackathon! Build innovative solutions, compete for prizes, and network with industry leaders. Teams of 2-4 members welcome. Categories include AI/ML, Web Development, Mobile Apps, and IoT.',
            type: 'competition',
            skills: ['Programming', 'Innovation', 'Teamwork'],
            timeline: '48 hours, April 15-17, 2024',
            positions: 100,
            published: true,
            organizationId: currentUser.uid,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            materialLink: 'https://drive.google.com/file/d/example12',
          },
        ]

        for (const opportunity of dummyOpportunities) {
          try {
            const docRef = await addDoc(collection(db, 'opportunities'), opportunity)
            items.push({ type: 'opportunity', title: opportunity.title, id: docRef.id })
          } catch (error) {
            console.error('Error adding opportunity:', error)
            toast.error(`Failed to add opportunity: ${opportunity.title}`)
          }
        }
      }

      setAddedItems(items)
      setStatus('success')
      toast.success(`Successfully added ${items.length} items!`)
    } catch (error) {
      console.error('Error adding dummy data:', error)
      setStatus('error')
      toast.error('Failed to add dummy data: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  // Dummy data for preview (kept in sync with the add logic)
  const dummyProjects = [
    {
      title: 'Machine Learning for Climate Prediction',
      description:
        'Join our research team to develop advanced machine learning models for climate prediction. This project involves working with large datasets, implementing neural networks, and collaborating with climate scientists. Students will gain hands-on experience in deep learning, data analysis, and scientific computing.',
      skills: ['Python', 'Machine Learning', 'TensorFlow', 'Data Analysis', 'Statistics'],
      timeline: '6 months, Starting Spring 2024',
      positions: 3,
      published: true,
    },
    {
      title: 'Blockchain-Based Voting System',
      description:
        'Research and develop a secure, transparent voting system using blockchain technology. This project explores cryptographic protocols, smart contracts, and decentralized systems. Ideal for students interested in cybersecurity, distributed systems, and democratic technology.',
      skills: ['Blockchain', 'Solidity', 'JavaScript', 'Cryptography', 'Web3'],
      timeline: '4 months, Starting Fall 2024',
      positions: 2,
      published: true,
    },
    {
      title: 'Computer Vision for Medical Imaging',
      description:
        'Develop AI models to assist in medical image analysis. Work with radiologists to create tools that can detect anomalies in X-rays, MRIs, and CT scans. This project combines computer vision, deep learning, and healthcare applications.',
      skills: ['Python', 'Computer Vision', 'PyTorch', 'Medical Imaging', 'Deep Learning'],
      timeline: '8 months, Starting Summer 2024',
      positions: 4,
      published: true,
    },
  ]

  const dummyOpportunities = [
    {
      title: 'Summer Internship Program 2024',
      description:
        'Join our prestigious summer internship program! Work on real-world projects, learn from industry experts, and build your professional network. Open to students in computer science, engineering, and related fields.',
      type: 'training',
      skills: ['Software Development', 'Teamwork', 'Problem Solving'],
      timeline: '3 months, June - August 2024',
      positions: 20,
      published: true,
    },
    {
      title: 'Data Science Workshop Series',
      description:
        'Learn data science from scratch! This comprehensive workshop covers Python, pandas, matplotlib, machine learning basics, and data visualization. Perfect for beginners and intermediate learners.',
      type: 'workshop',
      skills: ['Python', 'Data Science', 'Pandas', 'Matplotlib'],
      timeline: '6 weeks, Starting March 2024',
      positions: 30,
      published: true,
    },
  ]

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <p className="text-gray-600">Please log in to add dummy data</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!userRole || (userRole !== 'professor' && userRole !== 'ta' && userRole !== 'organization_representative')) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <p className="text-gray-600">
              You must be logged in as Professor, TA, or Organization to add dummy data
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full">
        <CardHeader>
          <CardTitle>Add Dummy Data</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-600">
            This will add sample {userRole === 'organization_representative' ? 'opportunities' : 'research projects'} to your account.
            These will be visible to students and can be used to test the platform.
          </p>

          <div className="flex gap-3">
            <Button
              onClick={addDummyData}
              disabled={loading}
              className="flex-1"
              size="lg"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Adding dummy data...
                </>
              ) : (
                'Add Dummy Data'
              )}
            </Button>

            <Button
              variant={preview ? 'secondary' : 'ghost'}
              onClick={() => setPreview((p) => !p)}
              className="w-48"
            >
              {preview ? 'Hide Preview' : 'Preview Dummy Data'}
            </Button>
          </div>

          {status === 'success' && addedItems.length > 0 && (
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <h3 className="font-semibold text-green-900">Successfully Added {addedItems.length} Items</h3>
              </div>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {addedItems.map((item, idx) => (
                  <div key={idx} className="text-sm text-green-800">
                    • {item.type === 'project' ? 'Project' : 'Opportunity'}: {item.title}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Preview display (presentation only) */}
          {preview && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-3">Preview</h3>
              { (userRole === 'professor' || userRole === 'ta') && (
                <div className="mb-4">
                  <h4 className="font-medium mb-2">Research Projects</h4>
                  <div className="space-y-3">
                    {dummyProjects.map((p, i) => (
                      <div key={i} className="p-3 border rounded-md bg-white">
                        <div className="flex justify-between items-start">
                          <div>
                            <h5 className="font-semibold">{p.title}</h5>
                            <p className="text-sm text-gray-600 line-clamp-2">{p.description}</p>
                            <div className="flex gap-2 mt-2">
                              {p.skills.slice(0,3).map((s, idx) => (
                                <span key={idx} className="text-xs bg-gray-100 px-2 py-1 rounded">{s}</span>
                              ))}
                            </div>
                          </div>
                          <div className="text-sm text-gray-500">{p.positions} positions</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              { userRole === 'organization_representative' && (
                <div>
                  <h4 className="font-medium mb-2">Organization Opportunities</h4>
                  <div className="space-y-3">
                    {dummyOpportunities.map((o, i) => (
                      <div key={i} className="p-3 border rounded-md bg-white">
                        <div className="flex justify-between items-start">
                          <div>
                            <h5 className="font-semibold">{o.title}</h5>
                            <p className="text-sm text-gray-600 line-clamp-2">{o.description}</p>
                            <div className="flex gap-2 mt-2">
                              {o.skills.slice(0,3).map((s, idx) => (
                                <span key={idx} className="text-xs bg-gray-100 px-2 py-1 rounded">{s}</span>
                              ))}
                            </div>
                          </div>
                          <div className="text-sm text-gray-500">{o.positions} positions</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {status === 'error' && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2">
                <XCircle className="w-5 h-5 text-red-600" />
                <p className="text-red-800">Failed to add dummy data. Please check the console for details.</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}



