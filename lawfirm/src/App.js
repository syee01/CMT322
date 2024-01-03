import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { getAuth, onAuthStateChanged, signOut} from 'firebase/auth';
import Home from './pages/homePage';
import NavbarBefore from './components/navigationBarBefore.js';
import NavbarAfter from './components/navigationBarAfter.js';
import Signup from './pages/signup';
import Login from './pages/login';
import LawyerPage from './pages/lawyer.jsx';
import ContactUs from './pages/contactUs.jsx';
import UserInfoPage from './pages/userInfoPage.jsx';
import SubmitCase from './pages/client/submit_case.jsx'
import ViewCases from './pages/client/view_cases.jsx'
import ViewSpecificCase from './pages/client/view_specific_case.jsx'
import AdminDashboard from './pages/admin/admin_dashboard.jsx';
import AdminViewAllCases from './pages/admin/admin_view_all_cases.jsx';
import AdminViewSpecificRejectedCase from './pages/admin/admin_view_specific_rejected_case.jsx';
import AdminCaseApplication from './pages/admin/admin_case_application.jsx';


function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const auth = getAuth();

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsLoggedIn(true);
        setUserId(user.uid);
      } else {
        setIsLoggedIn(false);
        setUserId(null);
      }
    });

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

    // Cleanup subscription and event listener on unmount
    return () => {
      unsubscribe();
      window.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('unload', handleWindowClose);
    };
  }, [isLoggedIn]);

  return (
    <Router>
      <div>
        {isLoggedIn ? <NavbarAfter /> : <NavbarBefore />}
        <section>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/ViewAllCases" element={<AdminViewAllCases />} />
            <Route path="/admin/ViewRejectedCases/:case_id" element={<AdminViewSpecificRejectedCase />} />
            <Route path="/admin/ViewCaseApplication/:case_id" element={<AdminCaseApplication />} />
            {userId && <Route path="/profile" element={<UserInfoPage userId={userId} />} />}
            <Route path="/SignUp" element={<Signup />} />
            <Route path="/Login" element={<Login />} />
            <Route path="/Home" element={<Home />} />
            <Route path="/Lawyer" element={<LawyerPage />} />
            {userId && <Route path="/Profile" element={<UserInfoPage userId={userId} />} />}
            <Route path='/ContactUs' element={<ContactUs />}/>
            <Route path='/SubmitCase' element={<SubmitCase />}/>
            <Route path="/ViewCases" element={<ViewCases />}/>
            <Route path="/ViewSpecificCase/:case_id" element={<ViewSpecificCase />}/>
          </Routes>
        </section>
      </div>
    </Router>
  );
}

export default App;
