import { useEffect, useState } from 'react';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase'; // Ensure that this is the correctly initialized Firestore instance
import '../cssFolder/lawyerPage.css'
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

          // Directly fetch the lawyer document using the Firestore generated ID
          const lawyerDocRef = doc(db, 'lawyer', userId);
          const lawyerDocSnap = await getDoc(lawyerDocRef);

          if (!lawyerDocSnap.exists()) {
            console.error(`No lawyer details found for document ID: ${userId}`);
            return null;
          }

          const lawyerData = lawyerDocSnap.data();

          // Fetch the case type using the specialty ID
          const caseTypeDocRef = doc(db, 'case_type', lawyerData.speciality);
          const caseTypeDocSnap = await getDoc(caseTypeDocRef);

          if (!caseTypeDocSnap.exists()) {
            console.error(`No case type found for specialty ID: ${lawyerData.speciality}`);
            return null;
          }
      
          const caseTypeData = caseTypeDocSnap.data();
      
          return {
            userId,
            name: userData.fullname,
            email: userData.email,
            gender: lawyerData.gender,
            specialty: caseTypeData.case_type_name, // Assuming 'name' is the field in the case_type document
            imageUrl: userData.profileImageUrl,
            description: lawyerData.description
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
const LawyerPage = () => {
  const { lawyers, loading } = useLoadLawyers();

  if (loading) return <div></div>;

  return (
    <div>
    <h1 className='lawyerPageHeader'>LA Law Firm Lawyers</h1>
    <div className="lawyer-container">
      {lawyers.map((lawyer) => (
        <div key={lawyer.userId} className="lawyer-profile">
          <div className="lawyer-info">
          <h1 className="lawyer-name">{lawyer.name}</h1>
          <div className="lawyer-contact">
            <FaEnvelope className="icon email-icon" />
            <span className="email">{lawyer.email}</span>
          </div>
            <p className='lawyer-specialty'>Specialty: {lawyer.specialty}</p>
            <p className="lawyer-description">{lawyer.description}</p>
        </div>
        <div className="lawyer-image-container">
        <img src={lawyer.imageUrl} alt={'Profile of ${lawyer.name}'} className="lawyer-image" />
        </div>
      </div>
      ))}
      </div>
      </div>
    );
  };

  
  export default LawyerPage;