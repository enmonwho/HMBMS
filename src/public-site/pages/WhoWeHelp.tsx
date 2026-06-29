import { useEffect } from 'react';
function WhoWeHelp() {
  useEffect(() => {
    document.title = "Makati Human Milk Bank - Who We Help";
  }, []);

  return (
    <div className="who-page-wrapper">

      <section className="who-hero">
        <h1 className="who-hero-title">WHO WE HELP</h1>
        <p className="who-hero-subtitle">
          MHMB prioritizes the most medically vulnerable infants, particularly premature and sick babies admitted in partner hospitals whose mothers are unable to provide milk due to illness, low supply, or death. We also support mothers in our community through breastfeeding education, lactation counseling, and supplemental feeding programs, helping families build healthier feeding practices from day one.

          While our resources are focused on the neediest cases first, our mission extends beyond Makati. We welcome donors and serve recipient families from neighboring cities and provinces whenever we are able.


        </p>
      </section>

      <section className="who-gallery-section">
        <h2 className="who-gallery-title">The MHMB Gallery</h2>

        <div className="who-gallery-grid">
          <img src="/images/image7.png" alt="MHMB Event 1" className="who-gallery-img" />
          <img src="/images/image6.png" alt="MHMB Event 2" className="who-gallery-img" />
          <img src="/images/image5.png" alt="MHMB Event 3" className="who-gallery-img" />
        </div>
      </section>

    </div>
  );
}

export default WhoWeHelp;