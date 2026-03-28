import { useState } from 'react'
import { API_BASE_URL } from '../config/constant'


function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 bg-[#0F172A]/80 border-b border-white/10 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center gap-3 font-bold text-xl text-white">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <rect width="32" height="32" rx="8" fill="#3B82F6" />
              <path d="M9 16l4 4 10-10" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="hidden sm:inline tracking-tight">Smart To Do</span>
          </div>

          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-gray-400 hover:text-white transition-colors font-medium">Features</a>
            <a href="#how-it-works" className="text-gray-400 hover:text-white transition-colors font-medium">How It Works</a>
            <a href="#pricing" className="text-gray-400 hover:text-white transition-colors font-medium">Pricing</a>
          </nav>

          <div className="hidden md:flex items-center gap-4">
            <a 
              href={`${API_BASE_URL}/auth/google`}
              className="px-5 py-2 text-gray-300 hover:text-white transition-colors font-medium"
            >
              Sign In
            </a>
            <a 
              href={`${API_BASE_URL}/auth/google`}
              className="px-5 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-semibold shadow-lg shadow-blue-500/20"
            >
              Get Started
            </a>
          </div>

          <button
            className="md:hidden p-2 text-gray-400 hover:text-white"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            )}
          </button>
        </div>
        
        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-6 border-t border-white/10 bg-[#0F172A] absolute left-0 right-0 px-6 shadow-2xl">
            <nav className="flex flex-col gap-5">
              <a href="#features" onClick={() => setMobileMenuOpen(false)} className="text-gray-400 hover:text-white transition-colors text-lg font-medium">Features</a>
              <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)} className="text-gray-400 hover:text-white transition-colors text-lg font-medium">How It Works</a>
              <a href="#pricing" onClick={() => setMobileMenuOpen(false)} className="text-gray-400 hover:text-white transition-colors text-lg font-medium">Pricing</a>
              <div className="flex flex-col gap-3 pt-6 border-t border-white/10 text-center">
                <a 
                  href={`${API_BASE_URL}/auth/google`}
                  className="px-4 py-3 text-gray-300 border border-white/20 rounded-xl hover:bg-white/5 transition-colors font-medium"
                >
                  Sign In
                </a>
                <a 
                  href={`${API_BASE_URL}/auth/google`}
                  className="px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-bold"
                >
                  Get Started
                </a>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}

export default Header
