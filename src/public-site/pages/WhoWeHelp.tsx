function WhoWeHelp() {
  return (
    <div className="who-page-wrapper">

      <section className="who-hero">
        <h1 className="who-hero-title">WHO WE HELP</h1>
        <p className="who-hero-subtitle">
          Lorem ipsum dolor sit amet consectetur adipiscing elit. Quisque faucibus ex sapien 
          vitae pellentesque sem placerat. In id cursus mi pretium tellus duis convallis. 
          Tempus leo eu aenean sed diam urna tempor. Pulvinar vivamus fringilla lacus nec 
          metus bibendum egestas. iaculis massa nisl malesuada lacinia integer nunc posuere. 
          Ut hendrerit semper vel class aptent taciti sociosqu. Ad litora torquent per 
          conubia nostra inceptos himenaeos.
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