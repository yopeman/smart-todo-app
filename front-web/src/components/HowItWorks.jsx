
function HowItWorks() {
  const steps = [
    {
      number: '01',
      title: 'Sign Up with Google',
      description: 'Get started in seconds with secure Google OAuth authentication.'
    },
    {
      number: '02',
      title: 'Create Your Project',
      description: 'Use AI or voice commands to create projects and tasks effortlessly.'
    },
    {
      number: '03',
      title: 'Invite Your Team',
      description: 'Collaborate with team members and manage permissions easily.'
    },
    {
      number: '04',
      title: 'Let AI Do the Work',
      description: 'Sit back as AI organizes, updates, and generates reports for you.'
    }
  ]

  return (
    <section id="how-it-works" className="py-24 bg-[#0F172A]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-20 text-balance">
          <h2 className="text-5xl font-black text-white mb-6 tracking-tight">Streamlined Workflow</h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">Master your tasks in four simple steps</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
          {steps.map((step, index) => (
            <div key={index} className="relative group p-8 rounded-3xl hover:bg-white/5 transition-colors duration-500">
              <div className="text-center relative z-10">
                <div className="w-20 h-20 bg-blue-600 text-white rounded-3xl flex items-center justify-center text-3xl font-black mx-auto mb-8 shadow-2xl shadow-blue-600/30 rotate-3 group-hover:rotate-0 transition-transform duration-500">
                  {step.number}
                </div>
                <div className="space-y-4">
                  <h3 className="text-2xl font-bold text-white">{step.title}</h3>
                  <p className="text-gray-400 leading-relaxed text-lg">{step.description}</p>
                </div>
              </div>
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-12 left-2/3 w-full opacity-20">
                  <div className="w-full h-px bg-gradient-to-r from-blue-500 to-transparent"></div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default HowItWorks
