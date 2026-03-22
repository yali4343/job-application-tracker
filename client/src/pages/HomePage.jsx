import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./HomePageStyles.css";

/**
 * HomePage component - Application entry point and value proposition
 * Displays hero section, features, and call-to-action
 */
export function HomePage() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-container">
          <div className="hero-content">
            <h1 className="hero-headline">
              Track Your Job Applications with Precision
            </h1>
            <p className="hero-subheading">
              Organize, monitor, and optimize your job search journey in one
              clean, intuitive dashboard.
            </p>
            <p className="hero-body">
              Stay focused on what matters: landing the right role. Let Job
              Tracker handle the administrative overhead with intelligent
              tracking and insights.
            </p>

            {/* Call-to-Action */}
            <div className="hero-cta">
              {isAuthenticated ? (
                <Link to="/dashboard" className="cta-button primary">
                  Go to Dashboard
                </Link>
              ) : (
                <>
                  <Link to="/register" className="cta-button primary">
                    Get Started Free
                  </Link>
                  <Link to="/login" className="cta-button secondary">
                    Sign In
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="features-container">
          <h2 className="features-heading">Why Use Job Tracker?</h2>
          <div className="features-grid">
            {/* Feature 1: Organization */}
            <div className="feature-card">
              <div className="feature-icon">📋</div>
              <h3 className="feature-title">Centralized Organization</h3>
              <p className="feature-description">
                Keep all your job applications in one place. Never lose track of
                where you've applied or the details that matter.
              </p>
            </div>

            {/* Feature 2: Status Tracking */}
            <div className="feature-card">
              <div className="feature-icon">🎯</div>
              <h3 className="feature-title">Real-Time Status Updates</h3>
              <p className="feature-description">
                Monitor application progress from submission to interview
                stages. Stay informed about every opportunity.
              </p>
            </div>

            {/* Feature 3: Quick Notes */}
            <div className="feature-card">
              <div className="feature-icon">📝</div>
              <h3 className="feature-title">Detailed Notes & Insights</h3>
              <p className="feature-description">
                Add custom notes, interview details, and resume links. Capture
                everything you need to succeed in the process.
              </p>
            </div>

            {/* Feature 4: Analytics */}
            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <h3 className="feature-title">Smart Analytics</h3>
              <p className="feature-description">
                Understand your application pipeline at a glance. Identify
                patterns and optimize your job search strategy.
              </p>
            </div>

            {/* Feature 5: Security */}
            <div className="feature-card">
              <div className="feature-icon">🔒</div>
              <h3 className="feature-title">Secure & Private</h3>
              <p className="feature-description">
                Your data is protected with enterprise-grade security. Login
                securely and manage your career confidentially.
              </p>
            </div>

            {/* Feature 6: Simplicity */}
            <div className="feature-card">
              <div className="feature-icon">✨</div>
              <h3 className="feature-title">Clean & Minimal Design</h3>
              <p className="feature-description">
                Distraction-free interface designed for focus. Easy to use,
                powerful in functionality, beautiful to experience.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Value Proposition Section */}
      <section className="value-section">
        <div className="value-container">
          <h2 className="value-heading">Stay Ahead in Your Job Search</h2>
          <p className="value-text">
            Job applications can feel overwhelming. Job Tracker brings clarity
            and structure to your career path, giving you the confidence to
            pursue more opportunities and track them all effortlessly.
          </p>
          <p className="value-subtext"></p>

          {!isAuthenticated && (
            <div className="value-cta">
              <Link to="/register" className="cta-button primary">
                Start Tracking Your Applications
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
