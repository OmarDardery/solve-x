import { initializeApp } from 'firebase/app'
import { getAnalytics } from 'firebase/analytics'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBnr0ZN9A-n1uDKp_w0JUcRwDm9MWhjr-I",
  authDomain: "solvex-c9bc7.firebaseapp.com",
  projectId: "solvex-c9bc7",
  storageBucket: "solvex-c9bc7.firebasestorage.app",
  messagingSenderId: "667905967772",
  appId: "1:667905967772:web:798c4086d5c008c1ce8f59",
  measurementId: "G-2NYD9PC95H"
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize Analytics (only in browser environment)
let analytics = null
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app)
}

// Initialize Firebase services
export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)
export const googleProvider = new GoogleAuthProvider()

export { analytics }
export default app

