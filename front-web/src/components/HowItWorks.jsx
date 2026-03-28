import './HowItWorks.css'

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
    <section id="how-it-works" className="how-it-works">
      <div className="how-it-works-container">
        <div className="section-header">
          <h2>How It Works</h2>
          <p>Get started in minutes and boost your productivity</p>
        </div>

        <div className="steps">
          {steps.map((step, index) => (
            <div key={index} className="step">
              <div className="step-number">{step.number}</div>
              <div className="step-content">
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </div>
              {index < steps.length - 1 && (
                <div className="step-connector">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
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
