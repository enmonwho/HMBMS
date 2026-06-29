import { useEffect } from 'react';
function MilkyWay() {
  useEffect(() => {
    document.title = "Makati Human Milk Bank - Milky Way";
  }, []);

  return (
    <div className="milky-page-wrapper">

      <section className="milky-hero">
        <h1 className="milky-hero-title">MILKY WAY</h1>
        <h2 className="milky-hero-subtitle">
          HOSPITAL-BASED MILK COLLECTION<br />PROGRAM
        </h2>
      </section>

      <section className="milky-content-area">
        <div className="milky-text-card">
          <p>
            Milky Way is MHMB's in-hospital donation program, where lactating mothers who are confined or visiting partner hospitals can donate their excess breast milk on-site. Trained MHMB staff guide each donor through screening and collection in a clean, supervised hospital setting, making it easy for new mothers to give back during their hospital stay.

          </p>
        </div>
      </section>

    </div>
  );
}

export default MilkyWay;