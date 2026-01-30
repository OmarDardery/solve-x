import { Navbar } from './Navbar'
import { Toaster } from 'react-hot-toast'

export function Layout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#fff',
            color: '#1f2937',
            boxShadow: '0 10px 40px -10px rgba(0, 70, 173, 0.15)',
          },
          success: {
            iconTheme: {
              primary: '#0046ad',
              secondary: '#fff',
            },
          },
        }}
      />
    </div>
  )
}


