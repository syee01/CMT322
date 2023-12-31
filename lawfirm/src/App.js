import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { getAuth, onAuthStateChanged, signOut} from 'firebase/auth';
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

    const handleWindowClose = async (event) => {
      if (isLoggedIn) {
        await signOut(auth);
      }
    };

    window.addEventListener('beforeunload', handleWindowClose);

    // Cleanup subscription and event listener on unmount
    return () => {
      unsubscribe();
      window.removeEventListener('beforeunload', handleWindowClose);
    };
  }, [isLoggedIn]);

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
