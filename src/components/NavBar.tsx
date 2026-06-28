import { useState, useEffect } from 'react';

function NavBar() {
  const [scrolled, setScrolled] = useState(false);
  const [programsOpen, setProgramsOpen] = useState(false);
  const [donateOpen, setDonateOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const [mobileProgramsOpen, setMobileProgramsOpen] = useState(false);
  const [mobileDonateOpen, setMobileDonateOpen] = useState(false);

  const closeMobileMenu = () => {
    setMenuOpen(false);
    setMobileProgramsOpen(false);
    setMobileDonateOpen(false);
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`navbar${scrolled ? ' scrolled' : ''}`} id="navbar">
      <div className="nav-inner">
        <a href="/" className="nav-logo" aria-label="Makati Human Milk Bank home">
          <img src="/images/mhmb-logo.png" alt="Makati Human Milk Bank" className="nav-logo-img" />
        </a>

        <nav className="nav-links" aria-label="Main navigation">
          <a href="/about">About Us</a>
          <a href="/who">Who We Help</a>

          {/* Desktop Programs dropdown */}
          <div
            className="nav-dropdown"
            onMouseEnter={() => setProgramsOpen(true)}
            onMouseLeave={() => setProgramsOpen(false)}
          >
            <button
              className="nav-drop-btn"
              aria-expanded={programsOpen}
              aria-haspopup="true"
              onKeyDown={e => e.key === 'Escape' && setProgramsOpen(false)}
            >
              Programs <span className="caret">▾</span>
            </button>
            <div className={`dropdown-menu ${programsOpen ? 'show' : ''}`} role="menu">
              <a href="/milky-way" role="menuitem">Milky Way</a>
              <a href="/supsup-todo" role="menuitem">Supsup Todo</a>
              <a href="/moms-act" role="menuitem">Mom's Act</a>
            </div>
          </div>

          {/* ── DESKTOP "HOW TO DONATE" DROPDOWN ── */}
          <div
            className="nav-dropdown"
            onMouseEnter={() => setDonateOpen(true)}
            onMouseLeave={() => setDonateOpen(false)}
          >
            <button
              className="nav-drop-btn"
              aria-expanded={donateOpen}
              aria-haspopup="true"
              onKeyDown={e => e.key === 'Escape' && setDonateOpen(false)}
            >
              HOW TO DONATE <span className="caret">▾</span>
            </button>
            <div className={`dropdown-menu ${donateOpen ? 'show' : ''}`} role="menu">
              <a href="/procedure" role="menuitem">Procedure</a>
              <a href="/process" role="menuitem">Process</a>
              <a href="/safety" role="menuitem">Safety</a>
            </div>
          </div>
        </nav>

        <a href="/donate" className="btn-nav-donate">Donate</a>

        <button
          className={`hamburger${menuOpen ? ' open' : ''}`}
          id="hamburger"
          aria-label="Open menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(v => !v)}
        >
          <span></span><span></span><span></span>
        </button>
      </div>

      <div
        className={`mobile-menu${menuOpen ? ' open' : ''}`}
        id="mobileMenu"
        aria-hidden={!menuOpen}
      >
        <a href="/about" onClick={closeMobileMenu}>About Us</a>
        <a href="/who" onClick={closeMobileMenu}>Who We Help</a>

        {/* Mobile Programs Accordion */}
        <a 
          href="#" 
          onClick={(e) => { 
            e.preventDefault();
            setMobileProgramsOpen(!mobileProgramsOpen); 
          }}
        >
          Programs <span className="caret" style={{ float: 'right' }}>{mobileProgramsOpen ? '▴' : '▾'}</span>
        </a>
        {mobileProgramsOpen && (
          <div className="mobile-submenu">
            <a href="/milky-way" onClick={closeMobileMenu}>Milky Way</a>
            <a href="/supsup-todo" onClick={closeMobileMenu}>Supsup Todo</a>
            <a href="/moms-act" onClick={closeMobileMenu}>Mom's Act</a>
          </div>
        )}

        {/* Mobile How to Donate Accordion */}
        <a 
          href="#" 
          onClick={(e) => { 
            e.preventDefault();
            setMobileDonateOpen(!mobileDonateOpen); 
          }}
        >
          How to Donate <span className="caret" style={{ float: 'right' }}>{mobileDonateOpen ? '▴' : '▾'}</span>
        </a>
        {mobileDonateOpen && (
          <div className="mobile-submenu">
            <a href="procedure" onClick={closeMobileMenu}>Procedure</a>
            <a href="process" onClick={closeMobileMenu}>Process</a>
            <a href="safety" onClick={closeMobileMenu}>Safety</a>
          </div>
        )}

        <a href="/donate" className="mobile-donate-link" onClick={closeMobileMenu}>
          Donate Now
        </a>
      </div>
    </header>
  );
}

export default NavBar;