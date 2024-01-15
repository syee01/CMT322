import React, { useState, useEffect } from 'react';
import { Link, useMatch, useResolvedPath } from "react-router-dom";
import { signOut } from 'firebase/auth';
import 'firebase/auth';
import firmlogo from "../images/logo1.png";
import { getAuth,onAuthStateChanged } from 'firebase/auth';
import { storage } from '../firebase';
import { ref as storageRef, getDownloadURL } from 'firebase/storage';
import profile from '../images/profile.png'

export default function Navbar() {
    const [userId, setUserId] = useState(null);
    const auth = getAuth();
  
    useEffect(() => {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        if (user) {
          setUserId(user.uid); // Set the user ID here
        } else {
          setUserId(null); // Reset user ID if not logged in
        }
      });
  
      // Cleanup subscription
      return () => unsubscribe();
    }, []);

    const fetchImage = async (userId) => {
        try {
            try{
                const imagePath = `profileImages/${userId}/profile.png`;
                const imageRef = storageRef(storage, imagePath);
                const url = await getDownloadURL(imageRef);
                return url;
            }catch(error){
                const imagePath = `profileImages/${userId}/profile.jpg`;
                const imageRef = storageRef(storage, imagePath);
                const url = await getDownloadURL(imageRef);
                return url;
            }
        } catch (error) {
          console.error('Error fetching image: ', error);
          return profile;
        }
      };

      const [imageUrl, setImageUrl] = useState(null);

    useEffect(() => {
        if (userId) {
        fetchImage(userId).then(url => {
            setImageUrl(url);
        });
        }
    }, [userId]);

  const handleSignOut = () => {
    signOut(auth).then(() => {
      console.log('User signed out successfully');
    }).catch((error) => {
      console.error('Error signing out: ', error);
    });
  };

  return (
    <nav className="nav">
      <Link to="/home" className="site-title">
        <div className="logo-image">
          <img src={firmlogo} alt="logo" width={180} height={50}></img>
        </div>
      </Link>
      <ul>
        <li><CustomLink to="/admin">DASHBOARD</CustomLink></li>
        <li><CustomLink to="/admin/ViewAllCases">VIEW ALL CASES</CustomLink></li>
        <li onClick={handleSignOut}><CustomLink to="/">SIGN OUT</CustomLink></li>
        <li><CustomLink to="/ContactUs">CONTACT US</CustomLink></li>
        <li className="profile-icon">
          <Link to="/profile">
            <img src={imageUrl} alt="Profile" width={50} height={50} />
          </Link>
        </li>
      </ul>
    </nav>
  );
}

function CustomLink({ to, children, ...props }) {
  const resolvedPath = useResolvedPath(to);
  const isActive = useMatch({ path: resolvedPath.pathname, end: true });

  return (
    <li className={isActive ? "active" : ""}>
      <Link to={to} {...props}>
        {children}
      </Link>
    </li>
  );
}