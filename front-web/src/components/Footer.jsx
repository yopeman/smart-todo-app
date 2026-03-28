
function Footer() {
  return (
    <footer className="bg-[#0F172A] text-white border-t border-white/5">
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                <rect width="32" height="32" rx="8" fill="#3B82F6" />
                <path d="M9 16l4 4 10-10" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="text-2xl font-black tracking-tight">Smart To Do</span>
            </div>
            <p className="text-gray-400 text-lg">
              AI-powered task management for modern teams
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-6">Product</h4>
            <ul className="space-y-3">
              <li><a href="#features" className="text-gray-400 hover:text-white transition-colors">Features</a></li>
              <li><a href="#pricing" className="text-gray-400 hover:text-white transition-colors">Pricing</a></li>
              <li><a href="#security" className="text-gray-400 hover:text-white transition-colors">Security</a></li>
              <li><a href="#roadmap" className="text-gray-400 hover:text-white transition-colors">Roadmap</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-6">Company</h4>
            <ul className="space-y-3">
              <li><a href="#about" className="text-gray-400 hover:text-white transition-colors">About</a></li>
              <li><a href="#blog" className="text-gray-400 hover:text-white transition-colors">Blog</a></li>
              <li><a href="#careers" className="text-gray-400 hover:text-white transition-colors">Careers</a></li>
              <li><a href="#contact" className="text-gray-400 hover:text-white transition-colors">Contact</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-6">Resources</h4>
            <ul className="space-y-3">
              <li><a href="#docs" className="text-gray-400 hover:text-white transition-colors">Documentation</a></li>
              <li><a href="#api" className="text-gray-400 hover:text-white transition-colors">API Reference</a></li>
              <li><a href="#support" className="text-gray-400 hover:text-white transition-colors">Support</a></li>
              <li><a href="#status" className="text-gray-400 hover:text-white transition-colors">Status</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/5 mt-16 pt-8 flex flex-col md:flex-row justify-between items-center text-gray-500 font-medium">
          <p className="mb-4 md:mb-0">&copy; 2026 Smart To Do. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#twitter" aria-label="Twitter" className="text-gray-400 hover:text-white transition-colors">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" />
              </svg>
            </a>
            <a href="#github" aria-label="GitHub" className="text-gray-400 hover:text-white transition-colors">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
              </svg>
            </a>
            <a href="#linkedin" aria-label="LinkedIn" className="text-gray-400 hover:text-white transition-colors">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
