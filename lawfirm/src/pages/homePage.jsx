import React from 'react';
import '../cssFolder/home.css'; 
import smallpic from "../images/smallMain.jpg"
import bigpic from "../images/bigMain.jpg"
import criminallaw from "../images/criminallaw.png"
import familylaw from "../images/familylaw.png"
import businesslaw from "../images/businesslaw.png"
import insurancelaw from "../images/insurancelaw.png"
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { db } from '../firebase';
import { FaEnvelope} from 'react-icons/fa';

const useLoadLawyers = () => {
  const [lawyers, setLawyers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadLawyers = async () => {
      try {
        // Query users with the role 'lawyer'
        const usersRef = collection(db, 'users');
        const usersQuery = query(usersRef, where('role', '==', 'lawyer'));
        const usersSnapshot = await getDocs(usersQuery);

        // Map through the snapshot to get individual lawyer details
        const lawyersDataPromises = usersSnapshot.docs.map(async (userDoc) => {
          const userId = userDoc.id; // Firestore generated ID
          const userData = userDoc.data();
      
          return {
            userId,
            name: userData.fullname,
            email: userData.email,
            imageUrl: userData.profileImageUrl,
          };
        });

        // Resolve all promises and set lawyers state
        const lawyersData = (await Promise.all(lawyersDataPromises)).filter(Boolean);
        setLawyers(lawyersData);
      } catch (error) {
        console.error("Failed to load lawyers:", error);
      } finally {
        setLoading(false);
      }
    };

    loadLawyers();
  }, []);

  return { lawyers, loading };
};

const Home = () => {
  const { lawyers, loading } = useLoadLawyers();
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
        
        <div className="lawyerPage">
      <h2>LAWYER</h2>
      <div className="lawyerContainer">
        {lawyers.map((lawyer) => (
          <div key={lawyer.userId} className="lawyerProfile">
            <div className="imageContainer">
              <img src={lawyer.imageUrl} alt={`Profile of ${lawyer.name}`} className="lawyerImage" />
            </div>
            <div className="lawyerInfo">
              <h1 className="lawyerName">{lawyer.name}</h1>
              <div className="lawyerContact">
                <FaEnvelope className="icon emailIcon" />
                <span className="emailText">{lawyer.email}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      </div>
      
      <footer className="footer">
        <div className="address">
          <p>ADDRESS</p>
          <p>12, Jalan Conlay, 50450, Kuala Lumpur, Malaysia</p>
        </div>
        <div className="contact-number">
          <p>CONTACT</p>
          <p>04-1234567</p>
        </div>
        <div className="firm-email">
          <p>EMAIL</p>
          <p>LAlawfirm@gmail.com</p>
        </div>
      </footer>
    </div>
  );
}

export default Home;
