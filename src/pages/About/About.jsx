import { useContent } from '../../contexts/ContentContext';
import './About.css';

function About() {
  const { content } = useContent();

  return (
    <div className="about-page">
      <div className="about-container">
        <div className="about-image-section">
          <img
            src={content.about.profileImage}
            alt="Artist Portrait"
            className="about-profile-image"
          />
        </div>

        <div className="about-content-section">
          <h1 className="about-title">{content.about.bioTitle}</h1>
          <div className="about-text">
            {content.about.bioText.split('\n\n').map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>

          <div className="about-contact">
            <h3 className="contact-title">Contact</h3>
            <div className="contact-links">
              <a href={`mailto:${content.siteSettings.email}`} className="contact-link">
                <span className="contact-icon">✉</span>
                {content.siteSettings.email}
              </a>
              {content.siteSettings.instagram && (
                <a
                  href={content.siteSettings.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="contact-link"
                >
                  <span className="contact-icon">◎</span>
                  instagram
                </a>
              )}
              {content.siteSettings.facebook && (
                <a
                  href={content.siteSettings.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="contact-link"
                >
                  <span className="contact-icon">ƒ</span>
                  facebook
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default About;
