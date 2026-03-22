import { FaEnvelope, FaGithub, FaLinkedin } from "react-icons/fa";
import "./FooterStyles.css";

/**
 * Footer component - Contact information and social links
 * Fixed bottom navigation with clickable contact details
 */
export function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        {/* Left section - Contact text and buttons */}
        <div className="footer-left">
          <p className="footer-text">Let's connect</p>
          <div className="footer-buttons-group">
            {/* Email */}
            <a
              href="mailto:yali4343@gmail.com"
              className="footer-contact-button email"
              title="Send email"
              aria-label="Send email to yali4343@gmail.com"
            >
              <FaEnvelope className="footer-icon" />
            </a>

            {/* GitHub */}
            <a
              href="https://github.com/yali4343"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-contact-button github"
              title="Visit GitHub profile"
              aria-label="Visit GitHub profile - yali4343"
            >
              <FaGithub className="footer-icon" />
            </a>

            {/* LinkedIn */}
            <a
              href="https://www.linkedin.com/in/yali-katz"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-contact-button linkedin"
              title="Visit LinkedIn profile"
              aria-label="Visit LinkedIn profile - yali-katz"
            >
              <FaLinkedin className="footer-icon" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
