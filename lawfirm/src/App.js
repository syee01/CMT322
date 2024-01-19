import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { getAuth, onAuthStateChanged, signOut} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from './firebase';
import Home from './pages/homePage';
import NavbarBefore from './components/navigationBarBefore.js';
import NavbarAfter from './components/navigationBarAfter.js';
import NavbarAdmin from './components/navigationBarAdmin.js';
import NavbarLawyer from './components/navigationBarLawyer.js';
import Signup from './pages/signup';
import Login from './pages/login';
import LawyerPage from './pages/lawyerPage.jsx';
import ContactUs from './pages/contactUs.jsx';
import UserInfoPage from './pages/userInfoPage.jsx';
import SubmitCase from './pages/client/submit_case.jsx'
import ViewCases from './pages/client/view_cases.jsx'
import ViewSpecificCase from './pages/client/view_specific_case.jsx'
import AdminDashboard from './pages/admin/admin_dashboard.jsx';
import AdminViewAllCases from './pages/admin/admin_view_all_cases.jsx';
import AdminViewSpecificRejectedCase from './pages/admin/admin_view_specific_rejected_case.jsx';
import AdminCaseApplication from './pages/admin/admin_case_application.jsx';
import AdminViewSpecificCase from './pages/admin/admin_view_specific_case.jsx';
import ForgotPassword from './pages/forgotPassword.jsx';
import LawyerViewCases from './pages/lawyer/lawyer_view_cases.jsx';
import LawyerViewSpecificCase from './pages/lawyer/lawyer_view_specific_case.jsx';
import LawyerUpdateCase from './pages/lawyer/lawyer_update_case.jsx';

function App() {
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId, setUserId] = useState(null); // Now stateful
  const [userRole, setUserRole] = useState(null);
  const [isEmailVerified, setIsEmailVerified] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const auth = getAuth();
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        if (user) {
          setIsLoggedIn(true);
          setUserId(user.uid);
          await user.reload();
          setIsEmailVerified(user.emailVerified);
        } else {
          setIsLoggedIn(false);
          setUserId(null);
          setIsEmailVerified(false); // Reset email verified status when logged out
        }
      });

      if (isLoggedIn && userId) {
        try {
          const docRef = doc(db, 'users', userId);
          const docSnap = await getDoc(docRef);
          setUserRole(docSnap.data().role);
        } catch (error) {
          console.error("Error fetching user data: ", error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }

      const handleVisibilityChange = async () => {
        if (document.visibilityState === 'hidden') {
          // Set a flag that the window is expected to close
          localStorage.setItem('isWindowExpectedToClose', 'true');
        }
      };
  
      const handleWindowClose = async () => {
        // Check the flag to determine if it was a reload or a close
        if (localStorage.getItem('isWindowExpectedToClose') === 'true' && isLoggedIn) {
          await signOut(auth);
        }
        // Clear the flag on the unload event
        localStorage.removeItem('isWindowExpectedToClose');
      };
  
      window.addEventListener('visibilitychange', handleVisibilityChange);
      window.addEventListener('unload', handleWindowClose);
  
      return () => {
        unsubscribe(); // Cleanup subscription on unmount
        window.removeEventListener('visibilitychange', handleVisibilityChange);
        window.removeEventListener('unload', handleWindowClose);
      };
    };
  
    fetchData();
  }, [isLoggedIn, userId]); // Dependencies: isLoggedIn and userId

  function SetNavBarBasedOnRole(){
    if (!isLoggedIn||!isEmailVerified && userRole==='client') {
      return (
        <NavbarBefore />
      )
    }
    else {
      if (userRole === "client"){
        return (
          <NavbarAfter />
        )
      }
      else if (userRole === 'admin'){
        return (
          <NavbarAdmin />
        )
      }
      else if (userRole === "lawyer"){
        return (
          <NavbarLawyer />
        )
      }
      else {
        console.log("error")
        return (
          <NavbarAfter />
        )
      }
    }
  }

  if (loading) {
    return <div></div>;
  }

  return (
    <Router>
      <div>
        {SetNavBarBasedOnRole()}
        <section>
          <Routes>
            <Route path="/" element={<Home />} />
            {userId && <Route path="/admin" element={<AdminDashboard userId={userId}/>} />}
            {userId &&<Route path="/admin/ViewAllCases" element={<AdminViewAllCases userId={userId}/>} />}
            {userId &&<Route path="/admin/ViewRejectedCases/:case_id" element={<AdminViewSpecificRejectedCase userId={userId} />} />}
            {userId &&<Route path="/admin/ViewCaseApplication/:case_id" element={<AdminCaseApplication userId={userId}/>} />}
            {userId &&<Route path="/admin/ViewSpecificCase/:case_id" element={<AdminViewSpecificCase userId={userId}/>} />}
            {userId && <Route path="/profile" element={<UserInfoPage userId={userId} />} />}
            <Route path="/SignUp" element={<Signup />} />
            <Route path="/Login" element={<Login />} />
            <Route path="/Home" element={<Home />} />
            <Route path="/Lawyer" element={<LawyerPage />} />
            {userId && <Route path="/Profile" element={<UserInfoPage userId={userId} />} />}
            <Route path="/ForgotPassword" element={<ForgotPassword />} />
            <Route path='/ContactUs' element={<ContactUs />}/>
            {userId && <Route path='/SubmitCase' element={<SubmitCase userId={userId} />}/>}
            {userId && <Route path="/ViewCases" element={<ViewCases userId={userId} />}/>}
            {userId && <Route path="/ViewSpecificCase/:case_id" element={<ViewSpecificCase userId={userId} />}/>}
            {userId && <Route path="/LawyerViewCases" element={<LawyerViewCases  userId={userId}/>}/>}
            <Route path="/LawyerViewSpecificCase/:case_id" element={<LawyerViewSpecificCase userId={userId}/>}/>
            <Route path='/LawyerUpdateCase/:case_id' element={<LawyerUpdateCase userId={userId}/>}/>
          </Routes>
        </section>
      </div>
    </Router>
  );
}

export default App;
