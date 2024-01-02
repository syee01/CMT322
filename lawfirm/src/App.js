import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import Home from './pages/homePage';
import NavbarBefore from './components/navigationBarBefore.js';
import NavbarAfter from './components/navigationBarAfter.js';
import Signup from './pages/signup';
import Login from './pages/login';
import LawyerPage from './pages/lawyer.jsx';
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
  const [userId, setUserId] = useState(null); // Now stateful

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsLoggedIn(true);
        setUserId(user.uid); // Set the user ID from the authenticated user
      } else {
        setIsLoggedIn(false);
        setUserId(null); // Reset the user ID when logged out
      }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);
  return (
    <Router>
      <div>
        {isLoggedIn ? <NavbarAfter /> : <NavbarBefore />}
        <section>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/login" element={<Login />} />
            <Route path="/home" element={<Home />} />
            <Route path="/lawyer" element={<LawyerPage />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/ViewAllCases" element={<AdminViewAllCases />} />
            <Route path="/admin/ViewRejectedCases/:case_id" element={<AdminViewSpecificRejectedCase />} />
            <Route path="/admin/ViewCaseApplication/:case_id" element={<AdminCaseApplication />} />
            {userId && <Route path="/profile" element={<UserInfoPage userId={userId} />} />}
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
