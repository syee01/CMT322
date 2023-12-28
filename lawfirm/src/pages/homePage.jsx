import React from 'react';
import '../cssFolder/home.css'; // Make sure to create this CSS file
import smallpic from "../images/smallMain.jpg"
import bigpic from "../images/bigMain.jpg"
import criminallaw from "../images/criminallaw.png"
import familylaw from "../images/familylaw.png"
import businesslaw from "../images/businesslaw.png"
import insurancelaw from "../images/insurancelaw.png"

const Home = () => {
  return (
    <div className="law-firm-page">
      <div class="header-section">
      <img src= {bigpic} alt="Law Firm Team" class="background-image"/>
      <div class="header-title">
        <h1>AFFORDABLE LEGAL HELP</h1>
      </div>
    </div>
      <div class="background-section">
      <div class="image-container">
        <img src= {smallpic} alt="firm" />
      </div>
      <div class="text-container">
        <h2>Law Firm</h2>
        <h1>BACKGROUND</h1>
        <p>Lee & Ali Law Firm is a business organization of law professionals that offers legal services to serve the needs of various types of clients. Law firms hire lawyers, attorneys, support staff and administrative employees to support legal cases for individuals and businesses.
           Lee & Ali law firm is established in 2023 December and it have a total of 5 lawyers that specialized in different areas include criminal law, business law, insurance law and family law. </p>
      </div>
    </div> 
        <section className="services">
          <h2>SERVICES</h2>
          <div className="service-items">
            <div className="service-item">
              <div className='iconLaw'>
              <img src={criminallaw} alt="criminallaw" width={100} height={100}></img>
              </div>
              <p className='lawtype'>Criminal Law</p>
            </div>
            <div className="service-item">
              <div className='iconLaw'>
              <img src={familylaw} alt="familylaw" width={100} height={100}></img>
              </div>
              <p className='lawtype'>Family Law</p>
            </div>
            <div className="service-item">
              <div className='iconLaw'>
              <img src={insurancelaw} alt="insurancelaw" width={100} height={100}></img>
              </div>
              <p className='lawtype'>Insurance Law</p>
            </div>
            <div className="service-item">
              <div className='iconLaw'>
              <img src={businesslaw} alt="businesslaw" width={100} height={100}></img>
              </div>
              <p className='lawtype'>Business Law</p>
            </div>
           
          </div>
        </section>

        <section className='lawyer'>
        <h2>LAWYER</h2>
        </section>
      
      <footer className="footer">
        <div className="address">
          <p>ADDRESS</p>
          <p>12. Jalan Conlay, 50450, Kuala Lumpur, Malaysia</p>
        </div>
        <div className="contact-number">
          <p>CONTACT</p>
          <p>04-1234567</p>
        </div>
        <div className="email">
          <p>EMAIL</p>
          <p>lawfirm@mail.com</p>
        </div>
      </footer>
    </div>
  );
}

export default Home;
