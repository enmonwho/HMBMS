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
  const [counterVisible, setCounterVisible] = useState(false)
  const totalRef = useRef<HTMLSpanElement>(null)
  const animatedTotal = useAnimatedCounter(785, 1800, counterVisible)

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

  return (
    <>
      {/* ══ HERO ══ */}
      <section className="hero" id="home" aria-label="Hero">
        <div className="hero-bg">
          <div className="hero-img hero-img-1" style={{ backgroundImage: 'url(/images/milk.png)' }} />
          <div className="hero-img hero-img-2" style={{ backgroundImage: 'url(/images/center.png)' }} />
          <div className="hero-img hero-img-3" style={{ backgroundImage: 'url(/images/patient.png)' }} />
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
    </>
  )
}