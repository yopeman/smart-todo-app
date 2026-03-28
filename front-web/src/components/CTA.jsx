import './CTA.css'

function CTA() {
  return (
    <section className="cta">
      <div className="cta-container">
        <div className="cta-content">
          <h2>Ready to Transform Your Workflow?</h2>
          <p>
            Join thousands of teams already using Smart To Do to manage their projects
            smarter and faster with AI.
          </p>
          <div className="cta-actions">
            <button className="btn-cta-primary">
              Start Free Today
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 10h10M10 5l5 5-5 5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <p className="cta-note">No credit card required</p>
          </div>
        </div>
        <div className="cta-decoration">
          <div className="decoration-circle decoration-circle-1"></div>
          <div className="decoration-circle decoration-circle-2"></div>
          <div className="decoration-circle decoration-circle-3"></div>
        </div>
      </div>
    </section>
  )
}

export default CTA
