import React, { useState, useEffect } from 'react';
import { db, storage } from '../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import profile from  '../images/profile.png';
import '../cssFolder/userInfoPage.css'

const UserInfoPage = ({ userId }) => {
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!userId) {
        setError('No user ID provided');
        setLoading(false);
        return;
      }

      try {
        const docRef = doc(db, 'users', userId); // Adjust if your collection name is different
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setUserInfo(docSnap.data());
        } else {
          setError("User data not found");
        }
      } catch (error) {
        console.error("Error fetching user data: ", error);
        setError("Error fetching user data");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userId]);

  const handleImageUpload = async () => {
    if (!selectedFile) {
      console.error('No file selected');
      return;
    }

   const fileType = selectedFile.type;
    let fileExtension = '';
    if (fileType === "image/png") {
      fileExtension = '.png';
    } else if (fileType === "image/jpeg") {
      fileExtension = '.jpg';
    } else {
      console.error('File type not allowed. Only PNG and JPG files are accepted.');
      return;
    }

    const imageRef = storageRef(storage, `profileImages/${userId}/profile${fileExtension}`);
    try {
      await uploadBytes(imageRef, selectedFile);
      const imageUrl = await getDownloadURL(imageRef);
      await updateProfileImageInFirestore(imageUrl);
    } catch (error) {
      console.error('Error uploading image: ', error);
    }
  };

  const updateProfileImageInFirestore = async (imageUrl) => {
    const userDocRef = doc(db, 'users', userId);
    try {
      await updateDoc(userDocRef, { profileImageUrl: imageUrl });
      setUserInfo({ ...userInfo, profileImageUrl: imageUrl }); // Update local state
      window.location.reload();
    } catch (error) {
      console.error('Error updating profile image URL: ', error);
    }
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  return (
    <div className="background-colour">
    <div className="user-info-container">
      <h1 className="user-info-header">Manage Profile</h1>
        {userInfo && (<div className="user-info-details">
            { (
                <img src={userInfo.profileImageUrl || profile} alt="Profile" style={{ width: '100px', height: '100px'}} className='profileImg' />
            )}
            <div className='detail'>
            <p>Name: {userInfo.fullname}</p>
            <p>Email: {userInfo.email}</p>
            <p>Contact Number: {userInfo.phoneNumber}</p>
            </div>
        </div>
      )}

     <div className='filesection'>
      <div className='left'>
      {/* File input for selecting an image */}
      <input type="file" 
        accept=".png, .jpg, .jpeg"
        onChange={(e) => setSelectedFile(e.target.files[0])} 
      />
      </div>
      <div className='right'>
      <button onClick={handleImageUpload} className='uploadbtn'>Upload</button>
      </div>
      </div>
      </div>
    </div>
  );
};

export default UserInfoPage;
