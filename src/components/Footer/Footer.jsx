import { useContent } from '../../contexts/ContentContext';
import './Footer.css';

function Footer() {
  const { content } = useContent();
  const { contact } = content;
  const currentYear = new Date().getFullYear();

  // Check if any contact info exists
  const hasEmail = contact.email;
  const hasPhone = contact.phone;
  const hasInstagram = contact.instagram;
  const hasFacebook = contact.facebook;
  const hasTwitter = contact.twitter;
  const hasLinkedin = contact.linkedin;
  const hasLocation = contact.locationName;

  const hasAnyLinks = hasEmail || hasPhone || hasInstagram || hasFacebook || 
    hasTwitter || hasLinkedin || hasLocation;

  return (
    <footer className="footer">
      <div className="footer-container">
        {hasAnyLinks && (
          <div className="footer-links">
            {hasEmail && (
              <a href={`mailto:${contact.email}`} className="footer-link">
                <svg className="footer-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span>{contact.email}</span>
              </a>
            )}

            {hasPhone && (
              <a href={`tel:${contact.phone}`} className="footer-link">
                <svg className="footer-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span>{contact.phone}</span>
              </a>
            )}

            {hasInstagram && (
              <a href={contact.instagram} target="_blank" rel="noopener noreferrer" className="footer-link">
                <svg className="footer-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
                <span>Instagram</span>
              </a>
            )}

            {hasFacebook && (
              <a href={contact.facebook} target="_blank" rel="noopener noreferrer" className="footer-link">
                <svg className="footer-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
                </svg>
                <span>Facebook</span>
              </a>
            )}

            {hasTwitter && (
              <a href={contact.twitter} target="_blank" rel="noopener noreferrer" className="footer-link">
                <svg className="footer-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M4 4l11.733 16h4.267l-11.733-16zM4 20l6.4-6.4M20 4l-6.4 6.4" />
                </svg>
                <span>X / Twitter</span>
              </a>
            )}

            {hasLinkedin && (
              <a href={contact.linkedin} target="_blank" rel="noopener noreferrer" className="footer-link">
                <svg className="footer-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6z" />
                  <rect x="2" y="9" width="4" height="12" />
                  <circle cx="4" cy="4" r="2" />
                </svg>
                <span>LinkedIn</span>
              </a>
            )}

            {hasLocation && (
              <a 
                href={contact.locationUrl || '#'} 
                target={contact.locationUrl ? "_blank" : undefined}
                rel={contact.locationUrl ? "noopener noreferrer" : undefined}
                className="footer-link"
              >
                <svg className="footer-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                <span>{contact.locationName}</span>
              </a>
            )}
          </div>
        )}

        <p className="footer-copyright">© {currentYear} All rights reserved.</p>
      </div>
    </footer>
  );
}

export default Footer;
