import { useEffect } from 'react';
function SupsupTodo() {
  useEffect(() => {
    document.title = "Makati Human Milk Bank - Supsup Todo";
  }, []);

  return (
    <div className="supsup-page-wrapper">

      <section className="supsup-hero">
        <h1 className="supsup-hero-title">SUPSUP TODO</h1>
        <h2 className="supsup-hero-subtitle">
          A COMMUNITY BASED MOBILE<br />HUMAN MILK COLLECTION<br />PROGRAM
        </h2>
      </section>

      <section className="supsup-content-area">
        <div className="supsup-text-card">
          <p>
            Supsup Todo brings the milk bank directly to the community. Through scheduled "milk-letting" activities at barangay health centers and mobile collection visits, our team reaches donor mothers who may not be able to travel to the milk bank, making donation more accessible across Makati's barangays.

          </p>
        </div>
      </section>

    </div>
  );
}

export default SupsupTodo;