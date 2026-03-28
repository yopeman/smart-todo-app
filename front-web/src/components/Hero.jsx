import './Hero.css'

function Hero() {
  return (
    <section className="hero">
      <div className="hero-container">
        <div className="hero-badge">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M8 1l2 6h6l-5 4 2 6-5-4-5 4 2-6-5-4h6z" fill="currentColor" />
          </svg>
          <span>AI-Powered Task Management</span>
        </div>

        <h1 className="hero-title">
          Manage Tasks Smarter
          <br />
          <span className="gradient-text">With AI & Voice</span>
        </h1>

        <p className="hero-description">
          Create, update, and organize projects effortlessly using AI assistance and voice commands.
          Collaborate with your team in real-time and let AI handle the heavy lifting.
        </p>

        <div className="hero-actions">
          <button className="btn-hero-primary">
            Get Started Free
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 10h10M10 5l5 5-5 5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <button className="btn-hero-secondary">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <path d="M6.5 5.5l8 4.5-8 4.5V5.5z" />
            </svg>
            Watch Demo
          </button>
        </div>

        <div className="hero-stats">
          <div className="stat">
            <div className="stat-value">10K+</div>
            <div className="stat-label">Active Users</div>
          </div>
          <div className="stat-divider"></div>
          <div className="stat">
            <div className="stat-value">50K+</div>
            <div className="stat-label">Tasks Created</div>
          </div>
          <div className="stat-divider"></div>
          <div className="stat">
            <div className="stat-value">95%</div>
            <div className="stat-label">Satisfaction</div>
          </div>
        </div>

        <div className="hero-image">
          <div className="hero-image-placeholder">
            <svg width="100%" height="100%" viewBox="0 0 800 500" fill="none">
              <rect width="800" height="500" rx="12" fill="var(--bg-secondary)" />
              <rect x="40" y="40" width="720" height="60" rx="8" fill="var(--bg)" />
              <rect x="60" y="55" width="200" height="30" rx="4" fill="var(--primary)" opacity="0.2" />
              <rect x="40" y="120" width="340" height="340" rx="8" fill="var(--bg)" />
              <rect x="60" y="140" width="120" height="20" rx="4" fill="var(--text-light)" opacity="0.3" />
              <rect x="60" y="175" width="300" height="12" rx="4" fill="var(--border)" />
              <circle cx="75" cy="215" r="8" fill="var(--accent)" />
              <rect x="95" y="207" width="250" height="16" rx="4" fill="var(--text)" opacity="0.2" />
              <circle cx="75" cy="255" r="8" fill="var(--border)" />
              <rect x="95" y="247" width="220" height="16" rx="4" fill="var(--text)" opacity="0.2" />
              <circle cx="75" cy="295" r="8" fill="var(--border)" />
              <rect x="95" y="287" width="200" height="16" rx="4" fill="var(--text)" opacity="0.2" />
              <rect x="400" y="120" width="360" height="220" rx="8" fill="var(--bg)" />
              <rect x="420" y="140" width="140" height="20" rx="4" fill="var(--text-light)" opacity="0.3" />
              <rect x="420" y="175" width="320" height="40" rx="6" fill="var(--accent)" opacity="0.1" />
              <rect x="435" y="185" width="100" height="20" rx="4" fill="var(--accent)" opacity="0.4" />
              <rect x="420" y="230" width="320" height="40" rx="6" fill="var(--primary)" opacity="0.1" />
              <rect x="435" y="240" width="120" height="20" rx="4" fill="var(--primary)" opacity="0.4" />
              <rect x="420" y="285" width="320" height="40" rx="6" fill="var(--border)" opacity="0.3" />
              <rect x="400" y="360" width="360" height="100" rx="8" fill="var(--bg)" />
              <circle cx="560" cy="410" r="30" fill="url(#gradient)" />
              <path d="M555 410l5 5 10-10" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <defs>
                <linearGradient id="gradient" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="var(--gradient-start)" />
                  <stop offset="100%" stopColor="var(--gradient-end)" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero
