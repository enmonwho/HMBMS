import { useState, useEffect, useRef } from 'react'

// ── Animated counter hook ──
function useAnimatedCounter(target: number, duration = 1800, trigger: boolean) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    if (!trigger) return
    let start = 0
    const step = target / (duration / 16)
    const timer = setInterval(() => {
      start += step
      if (start >= target) {
        setCount(target)
        clearInterval(timer)
        return
      }
      setCount(Math.floor(start))
    }, 16)
    return () => clearInterval(timer)
  }, [trigger, target, duration])
  return count
}

export default function HomePage() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [programsOpen, setProgramsOpen] = useState(false)
  const [donateOpen, setDonateOpen] = useState(false)
  const [counterVisible, setCounterVisible] = useState(false)
  const totalRef = useRef<HTMLSpanElement>(null)
  const animatedTotal = useAnimatedCounter(785, 1800, counterVisible)

  // Navbar scroll shadow
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Intersection observer for the counter
  useEffect(() => {
    const el = totalRef.current
    if (!el) return
    const obs = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting) {
          setCounterVisible(true)
          obs.disconnect()
        }
      },
      { threshold: 0.5 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  // Scroll reveal for cards
  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>(
      '.who-card, .service-card, .sidebar-card, .report-card'
    )
    const obs = new IntersectionObserver(
      entries => {
        entries.forEach((entry, i) => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              const el = entry.target as HTMLElement
              el.style.opacity = '1'
              el.style.transform = 'translateY(0)'
            }, i * 80)
            obs.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.1 }
    )
    els.forEach(el => {
      el.style.opacity = '0'
      el.style.transform = 'translateY(20px)'
      el.style.transition = 'opacity 0.5s ease, transform 0.5s ease'
      obs.observe(el)
    })
    return () => obs.disconnect()
  }, [])

  const closeMobileMenu = () => {
    setMenuOpen(false)
  }

  return (
    <>
      {/* ══ NAVBAR ══ */}
      <header className={`navbar${scrolled ? ' scrolled' : ''}`} id="navbar">
        <div className="nav-inner">
          <a href="#" className="nav-logo" aria-label="Makati Human Milk Bank home">
            <img src="/images/mhmb-logo.png" alt="Makati Human Milk Bank" className="nav-logo-img" />
          </a>

          <nav className="nav-links" aria-label="Main navigation">
            <a href="#about">About Us</a>
            <a href="#who">Who We Help</a>

            {/* Programs dropdown */}
            <div
              className="nav-dropdown"
              onMouseEnter={() => setProgramsOpen(true)}
              onMouseLeave={() => setProgramsOpen(false)}
            >
              <button
                className="nav-drop-btn"
                aria-expanded={programsOpen}
                aria-haspopup="true"
                onClick={() => setProgramsOpen(v => !v)}
                onKeyDown={e => e.key === 'Escape' && setProgramsOpen(false)}
              >
                Programs <span className="caret">▾</span>
              </button>
              <div className="dropdown-menu" role="menu">
                <a href="#services" role="menuitem">Milky Way</a>
                <a href="#services" role="menuitem">Supsup Todo</a>
                <a href="#services" role="menuitem">Mom's Act</a>
              </div>
            </div>

            {/* How to Donate dropdown */}
            <div
              className="nav-dropdown"
              onMouseEnter={() => setDonateOpen(true)}
              onMouseLeave={() => setDonateOpen(false)}
            >
              <button
                className="nav-drop-btn"
                aria-expanded={donateOpen}
                aria-haspopup="true"
                onClick={() => setDonateOpen(v => !v)}
                onKeyDown={e => e.key === 'Escape' && setDonateOpen(false)}
              >
                How to Donate <span className="caret">▾</span>
              </button>
              <div className="dropdown-menu" role="menu">
                <a href="#" role="menuitem">Financial Donation</a>
                <a href="/donate" role="menuitem">Donate Breast Milk</a>
                <a href="#" role="menuitem">Volunteer</a>
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
          <a href="#about" onClick={closeMobileMenu}>About Us</a>
          <a href="#who" onClick={closeMobileMenu}>Who We Help</a>
          <a href="#services" onClick={closeMobileMenu}>Programs</a>
          <a href="#" onClick={closeMobileMenu}>How to Donate</a>
          <a href="/donate" className="mobile-donate-link" onClick={closeMobileMenu}>
            Donate Now
          </a>
        </div>
      </header>

      {/* ══ HERO ══ */}
      <section className="hero" id="home" aria-label="Hero">
        <div className="hero-bg">
          <div className="hero-img hero-img-1" style={{ backgroundImage: 'url(/images/Milk.png)' }} />
          <div className="hero-img hero-img-2" style={{ backgroundImage: 'url(/images/Center.png)' }} />
          <div className="hero-img hero-img-3" style={{ backgroundImage: 'url(/images/Patient.png)' }} />
          <div className="hero-overlay" />
        </div>
        <div className="hero-content">
          <h1>Makati Human Milk Bank</h1>
          <p>The country's first local government-operated human milk bank</p>
        </div>
      </section>

      {/* ══ MAIN CONTENT: Report + Sidebar ══ */}
      <section className="main-section">
        <div className="main-layout">

          {/* LEFT: Donation Report Card */}
          <div className="report-card" aria-label="Monthly Donation Report">
            <div className="report-header">
              <div className="report-line" aria-hidden="true" />
              <p className="report-title">MONTHLY DONATION REPORT</p>
            </div>

            <div className="report-total">
              <span className="total-num" id="totalNum" ref={totalRef}>
                {animatedTotal.toLocaleString()}
              </span>
              <span className="total-label">Total Donations</span>
            </div>

            <div className="report-divider" aria-hidden="true" />

            <div className="report-sub-stats">
              <div className="sub-stat">
                <span className="sub-num">90+</span>
                <span className="sub-label">Supsup Todo<br />Donations</span>
              </div>
              <div className="sub-sep" aria-hidden="true" />
              <div className="sub-stat">
                <span className="sub-num">67+</span>
                <span className="sub-label">Milky Way<br />Donations</span>
              </div>
              <div className="sub-sep" aria-hidden="true" />
              <div className="sub-stat">
                <span className="sub-num">65+</span>
                <span className="sub-label">Mom's Act<br />Donations</span>
              </div>
            </div>
          </div>

          {/* RIGHT: Sidebar */}
          <aside className="sidebar" aria-label="Contact information">
            <div className="sidebar-card">
              <div className="sidebar-icon" aria-hidden="true">
                <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="8" y="24" width="48" height="36" rx="2" stroke="#1C6FAB" strokeWidth="2.5" fill="none" />
                  <rect x="20" y="36" width="8" height="12" rx="1" stroke="#1C6FAB" strokeWidth="2" fill="none" />
                  <rect x="36" y="36" width="8" height="12" rx="1" stroke="#1C6FAB" strokeWidth="2" fill="none" />
                  <rect x="22" y="8" width="20" height="20" rx="2" stroke="#1C6FAB" strokeWidth="2.5" fill="none" />
                  <line x1="32" y1="13" x2="32" y2="23" stroke="#1C6FAB" strokeWidth="2.5" strokeLinecap="round" />
                  <line x1="27" y1="18" x2="37" y2="18" stroke="#1C6FAB" strokeWidth="2.5" strokeLinecap="round" />
                  <line x1="8" y1="60" x2="56" y2="60" stroke="#1C6FAB" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
              </div>
              <h3 className="sidebar-name">Ospital ng Makati</h3>
              <p className="sidebar-address">Sampaquita St, Taguig,<br />1218 Metro Manila</p>
              <p className="sidebar-hours">8AM to 5PM</p>
              <a
                href="https://maps.google.com/?q=Ospital+ng+Makati"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-map"
              >
                VIEW LOCATION MAP
              </a>
            </div>

            <div className="sidebar-card">
              <div className="sidebar-icon" aria-hidden="true">
                <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 8 C18 8 16 10 16 12 L16 52 C16 54 18 56 20 56 L44 56 C46 56 48 54 48 52 L48 12 C48 10 46 8 44 8 Z" stroke="#1C6FAB" strokeWidth="2.5" fill="none" />
                  <line x1="24" y1="48" x2="40" y2="48" stroke="#1C6FAB" strokeWidth="2.5" strokeLinecap="round" />
                  <path d="M36 28 Q42 22 36 16" stroke="#1C6FAB" strokeWidth="2.2" strokeLinecap="round" fill="none" />
                  <path d="M36 32 Q47 22 36 12" stroke="#1C6FAB" strokeWidth="2.2" strokeLinecap="round" fill="none" />
                  <circle cx="30" cy="28" r="3" fill="#1C6FAB" />
                </svg>
              </div>
              <h3 className="sidebar-name">Hotline</h3>
              <p className="sidebar-phone">(02) 8882 6316</p>
            </div>
          </aside>
        </div>
      </section>

      {/* ══ DONATION SERVICES ══ */}
      <section className="services" id="services" aria-labelledby="services-heading">
        <div className="services-inner">
          <div className="services-header">
            <h2 id="services-heading">Donation Services</h2>
            <div className="services-rule" aria-hidden="true" />
          </div>

          <div className="services-grid">
            <div className="service-card" tabIndex={0} aria-label="Milky Way — Hospital-Based Collection">
              <div className="service-icon" aria-hidden="true">
                <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="40" cy="40" r="30" stroke="white" strokeWidth="3" fill="none" />
                  <line x1="40" y1="24" x2="40" y2="56" stroke="white" strokeWidth="5" strokeLinecap="round" />
                  <line x1="24" y1="40" x2="56" y2="40" stroke="white" strokeWidth="5" strokeLinecap="round" />
                </svg>
              </div>
              <h3>MILKY WAY</h3>
              <p>Hospital-Based Collection</p>
            </div>

            <div className="service-card" tabIndex={0} aria-label="Supsup Todo — Community-Based Collection">
              <div className="service-icon" aria-hidden="true">
                <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="28" cy="22" r="9" stroke="white" strokeWidth="3" fill="none" />
                  <path d="M12 55 Q12 40 28 40 Q44 40 44 55" stroke="white" strokeWidth="3" strokeLinecap="round" fill="none" />
                  <circle cx="52" cy="22" r="9" stroke="white" strokeWidth="3" fill="none" />
                  <path d="M36 55 Q36 40 52 40 Q68 40 68 55" stroke="white" strokeWidth="3" strokeLinecap="round" fill="none" />
                </svg>
              </div>
              <h3>SUPSUP TODO</h3>
              <p>Community-Based Collection</p>
            </div>

            <div className="service-card" tabIndex={0} aria-label="Mom's Act — Home-Pickup-Based Collection">
              <div className="service-icon" aria-hidden="true">
                <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 38 L40 12 L68 38" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                  <path d="M18 34 L18 66 L62 66 L62 34" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                  <path d="M32 44 Q34 40 40 44 Q46 40 48 44 Q48 50 40 56 Q32 50 32 44Z" stroke="white" strokeWidth="2.5" fill="none" />
                </svg>
              </div>
              <h3>MOM'S ACT</h3>
              <p>Home-Pickup-Based Collection</p>
            </div>
          </div>
        </div>
      </section>

      {/* ══ QUOTE / CTA BLOCK ══ */}
      <section className="quote-block">
        <div className="quote-inner">
          <div className="quote-bar" aria-hidden="true" />
          <div className="quote-content">
            <h2>A single donation can help change a life.</h2>
            <p>
              Our work is made possible through the compassion of people like you. Your generosity
              allows us to continue delivering meaningful support to individuals and families in need.
              Every donation counts and brings hope where it is needed most.
            </p>
          </div>
        </div>
      </section>

      {/* ══ FOOTER ══ */}
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
    </>
  )
}