
import { API_BASE_URL } from '../config/constant'

function Hero() {

  return (
    <section className="py-24 bg-[#0F172A] text-white relative overflow-hidden">
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] -z-10"></div>
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          <div className="flex-1 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 bg-blue-500/10 text-blue-400 px-4 py-2 rounded-full text-sm font-semibold mb-8 border border-blue-500/20 backdrop-blur-sm">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
              <span>AI-Powered Task Management</span>
            </div>

            <h1 className="text-6xl md:text-7xl font-extrabold text-white mb-8 leading-[1.1] tracking-tight">
              Manage Tasks
              <br />
              <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">Smarter with AI</span>
            </h1>

            <p className="text-xl text-gray-400 mb-12 max-w-2xl leading-relaxed">
              Experience the next generation of productivity. Orchestrate your workflow with AI-driven insights, voice precision, and effortless real-time collaboration.
            </p>

            <div className="flex flex-col sm:flex-row gap-5 justify-center lg:justify-start">
              <a 
                href={`${API_BASE_URL}/auth/google`}
                className="group inline-flex items-center gap-3 px-8 py-4 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition-all duration-300 shadow-xl shadow-blue-500/25"
              >
                Get Started Free
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.5" className="transition-transform duration-300 group-hover:translate-x-1">
                  <path d="M5 10h10M10 5l5 5-5 5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>

              <button className="group inline-flex items-center gap-3 px-8 py-4 bg-white/5 text-white font-bold rounded-2xl hover:bg-white/10 transition-all duration-300 border border-white/10 backdrop-blur-sm">
                Watch Demo
              </button>
            </div>

            <div className="flex flex-wrap justify-center lg:justify-start gap-10 mt-16">
              <div>
                <div className="text-4xl font-black text-white tracking-tighter">10K+</div>
                <div className="text-gray-500 font-medium mt-1">Active Users</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-black text-white tracking-tighter">50K+</div>
                <div className="text-gray-500 font-medium mt-1">Tasks Created</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-black text-white tracking-tighter">95%</div>
                <div className="text-gray-500 font-medium mt-1">Satisfaction</div>
              </div>
            </div>
          </div>

          <div className="flex-1 relative">
            <div className="bg-gradient-to-br from-blue-600/20 to-indigo-600/20 rounded-[3rem] p-1.5 backdrop-blur-3xl shadow-2xl">

              <div className="bg-[#0F172A] rounded-[2.8rem] p-10 border border-white/10">
                <div className="aspect-[4/3] bg-gradient-to-br from-blue-500/5 to-indigo-500/5 rounded-3xl flex items-center justify-center border border-white/5 relative overflow-hidden group">
                  <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                  <div className="text-center relative z-10">
                    <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-blue-500/40 rotate-3 group-hover:rotate-0 transition-transform duration-500">
                      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                        <line x1="9" y1="9" x2="15" y2="9" />
                        <line x1="9" y1="15" x2="15" y2="15" />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-3">Smart Dashboard</h3>
                    <p className="text-gray-400 px-4">Visualize your productivity with AI-powered insights</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero
