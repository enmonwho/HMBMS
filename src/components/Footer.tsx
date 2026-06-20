function Footer() {
  return (
    <footer className="footer" id="contact">
      <div className="footer-main">

        {/* Logo */}
        <div className="footer-logo-col">
          <img src="/images/mhmb-logo.png" alt="Makati Human Milk Bank" className="footer-logo-img" />
        </div>

        {/* Contact info */}
        <div className="footer-contact">
          <div className="footer-contact-item">
            <svg className="contact-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" stroke="white" strokeWidth="1.8" fill="none" />
              <circle cx="12" cy="9" r="2.5" stroke="white" strokeWidth="1.8" fill="none" />
            </svg>
            <div>
              <p className="contact-name">Ospital ng Makati</p>
              <p className="contact-detail">Sampaquita St, Taguig,<br />1218 Metro Manila</p>
            </div>
          </div>
          <div className="footer-contact-item">
            <svg className="contact-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1-9.4 0-17-7.6-17-17 0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z" stroke="white" strokeWidth="1.8" fill="none" />
              <path d="M16 3 Q21 3 21 8" stroke="white" strokeWidth="1.5" strokeLinecap="round" fill="none" />
              <path d="M16 6 Q18.5 6 18.5 8.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" fill="none" />
            </svg>
            <div>
              <p className="contact-detail">(02) 8882 6316</p>
              <p className="contact-detail">0960 446 3974</p>
            </div>
          </div>
          <div className="footer-contact-item">
            <svg className="contact-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <rect x="2" y="2" width="20" height="20" rx="5" stroke="white" strokeWidth="1.8" fill="none" />
              <path d="M13 21v-8h3l.5-3H13V8.5C13 7.7 13.4 7 14.5 7H17V4.3S15.9 4 14.7 4C12.1 4 11 5.7 11 7.9V10H8v3h3v8" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            </svg>
            <div>
              <p className="contact-detail">Makati Human Milk Bank</p>
            </div>
          </div>
        </div>

        {/* Nav links */}
        <div className="footer-nav-col">
          <a href="#about" className="footer-nav-main">About Us</a>
          <a href="#who" className="footer-nav-main">Who We Help</a>
          <a href="#services" className="footer-nav-main">Programs</a>
          <div className="footer-nav-sub-group">
            <a href="#services">Milky Way</a>
            <a href="#services">Supsup Todo</a>
            <a href="#services">Mom's Act</a>
          </div>
        </div>

        {/* How to donate links */}
        <div className="footer-nav-col">
          <a href="#" className="footer-nav-main">How to Donate</a>
          <div className="footer-nav-sub-group">
            <a href="#">Procedure</a>
            <a href="#">Process</a>
            <a href="#">Safety</a>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>Makati Human Milk Bank. Est. 2013. All rights reserved.</p>
      </div>
    </footer> 
  );
}

export default Footer;