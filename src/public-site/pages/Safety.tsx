import { useEffect } from 'react';
export default function Safety() {
  useEffect(() => {
    document.title = "Makati Human Milk Bank - Safety";
  }, []);

  return (
    <div
      className="donate-info-wrapper"
      style={{ backgroundImage: `url(/images/image2.png)` }}
    >
      <div className="donate-info-card">
        <div className="donate-watermark"></div>

        <div className="donate-info-header">
          <h1>SAFETY <span className="text-xl lg:text-2xl font-medium normal-case block mt-2 text-slate-600"></span></h1>
        </div>

        <div className="donate-info-section mt-8">
          <p className="mb-6 leading-relaxed text-slate-700">
            The safety of every donor and every recipient infant is MHMB's highest priority. All donor mothers undergo health screening and laboratory testing — including screening for HIV, Hepatitis B, and syphilis — before their milk is accepted. Every batch of collected milk is pasteurized using DOH- and WHO-compliant equipment and protocols, then re-tested afterward to confirm it is free of harmful bacteria before release.
          </p>
          <br />
          <p className="leading-relaxed text-slate-700">
            Our facilities, equipment, and procedures follow the WHO Manual of Operations for Human Milk Banks, and our staff are trained by DOH-accredited institutions in lactation management and laboratory procedures. Donors can feel confident that their generosity is handled with care, and recipient families can trust that the milk their baby receives meets strict safety standards from collection to delivery.
          </p>
        </div>
      </div>
    </div>
  );
}