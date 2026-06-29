import { useEffect } from 'react';
export default function Procedure() {
  useEffect(() => {
    document.title = "Makati Human Milk Bank - Procedure";
  }, []);

  return (
    <div 
      className="donate-info-wrapper" 
      style={{ backgroundImage: `url(/images/image4.png)` }}
    >
      <div className="donate-info-card">
        <div className="donate-watermark"></div>

        <div className="donate-info-header">
          <h1>PROCEDURE</h1>
        </div>

        <div className="donate-info-section">
          <h2>MILKY WAY</h2>
          <ol>
            <li>1. Inquiry and registration – Interested donor mothers register with MHMB staff at the hospital, either through a referral or a walk-in request.</li>
            <li>2. Health screening – Donors undergo an interview and basic physical/health assessment to confirm eligibility (e.g., good health, no disqualifying medications or conditions).</li>
            <li>3. Laboratory testing – Blood samples are taken to screen for infections such as HIV, Hepatitis B, and syphilis before donation is approved.</li>
            <li>4. Milk collection – Approved donors express milk on-site using sterile equipment, guided by MHMB staff.</li>
            <li>5. Pasteurization and re-testing – Collected milk is pasteurized and re-tested to confirm it's safe before being released for use.</li>
            <li>6. Storage and distribution – Pasteurized milk is properly labeled, stored, and distributed to qualified recipient infants.</li>
          </ol>
        </div>

        <div className="donate-info-section">
          <h2>SUPSUP TODO</h2>
          <ol>
            <li>1. Community scheduling – MHMB coordinates with barangay health centers to schedule mobile milk-letting activities.</li>
            <li>2. On-site registration – Donor mothers register and are briefed on the donation process at the community venue.</li>
            <li>3. Health screening – Basic health interviews and assessments are conducted on-site to confirm donor eligibility.</li>
            <li>4. Laboratory testing – Samples are collected for required infection screening, processed through MHMB's lab partners.</li>
            <li>5. Milk collection – Donors express milk under hygienic, supervised conditions at the mobile collection site.</li>
            <li>6. Transport, pasteurization, and distribution – Collected milk is transported to MHMB for pasteurization, testing, and eventual distribution to recipient infants.</li>
          </ol>
        </div>

        <div className="donate-info-section">
          <h2>MOM'S ACT</h2>
          <ol>
            <li>1. Donor application – Interested mothers contact MHMB to request a home collection visit.</li>
            <li>2. Initial screening – MHMB conducts a phone or in-person interview to assess basic eligibility.</li>
            <li>3. Home visit scheduling – A visit is scheduled at the donor's convenience for collection and/or sample-taking.</li>
            <li>4. Health and laboratory screening – Required health checks and blood tests are completed to confirm donor eligibility.</li>
            <li>5. Milk pickup – MHMB staff collect properly stored, frozen breast milk directly from the donor's home.</li>
          </ol>
        </div>
      </div>
    </div>
  );
}