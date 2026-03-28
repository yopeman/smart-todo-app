
import { API_BASE_URL } from '../config/constant'

function CTA() {

  return (
    <section className="py-24 bg-[#0F172A] relative overflow-hidden">
      <div className="absolute inset-0 bg-blue-600 opacity-10 blur-[100px] -z-10 rounded-full scale-150 -translate-y-1/2"></div>
      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-16 rounded-[4rem] text-center shadow-2xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
          <h2 className="text-5xl md:text-6xl font-black mb-8 tracking-tight text-white">
            Ready to Transform Your Workflow?
          </h2>
          <p className="text-xl md:text-2xl mb-12 text-blue-100 max-w-2xl mx-auto leading-relaxed">
            Join thousands of teams already using Smart To Do to manage their projects
            smarter and faster with AI.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <a 
              href={`${API_BASE_URL}/auth/google`}
              className="group inline-flex items-center gap-3 px-10 py-5 bg-white text-[#0F172A] font-black rounded-2xl hover:bg-blue-50 transition-all duration-300 shadow-2xl hover:scale-105"
            >
              Start Free Today
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="transition-transform duration-300 group-hover:translate-x-1">
                <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
            <p className="text-sm font-bold text-blue-200/80 uppercase tracking-widest whitespace-nowrap">No credit card required</p>
          </div>

        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-10 left-10 w-20 h-20 bg-blue-400 rounded-full opacity-20 blur-xl"></div>
        <div className="absolute top-20 right-20 w-32 h-32 bg-indigo-400 rounded-full opacity-20 blur-xl"></div>
        <div className="absolute bottom-10 left-1/4 w-24 h-24 bg-blue-300 rounded-full opacity-20 blur-xl"></div>
      </div>
    </section>
  )
}

export default CTA
