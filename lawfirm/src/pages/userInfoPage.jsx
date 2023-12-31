import React, { useState, useEffect } from 'react';
import { db, storage } from '../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import profile from  '../images/profile.png';
import '../cssFolder/userInfoPage.css'
import { FaEdit, FaTimes, FaCheck} from 'react-icons/fa';
import { deleteObject } from 'firebase/storage';

const UserInfoPage = ({ userId }) => {
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [showFileInput, setShowFileInput] = useState(false);
  const [editMode, setEditMode] = useState({ name: false, contactNumber: false });
  const [editedName, setEditedName] = useState('');
  const [editedContactNumber, setEditedContactNumber] = useState('');

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
  
    // Function to delete existing profile image
    const deleteExistingImage = async () => {
      try {
        const existingImageUrl = userInfo.profileImageUrl;
        if (existingImageUrl) {
          const imageRef = storageRef(storage, existingImageUrl);
          await deleteObject(imageRef);
        }
      } catch (error) {
        console.error('Error deleting existing image: ', error);
      }
    };
  
    try {
      await deleteExistingImage(); // Delete the existing image
      await updateDoc(userDocRef, { profileImageUrl: imageUrl });
      setUserInfo({ ...userInfo, profileImageUrl: imageUrl }); // Update local state
      window.location.reload();
    } catch (error) {
      console.error('Error updating profile image URL: ', error);
    }
  };

  const toggleEditMode = (field) => {
    setEditMode({ ...editMode, [field]: !editMode[field] });

    if (field === 'name') {
      setEditedName(userInfo.fullname);
    } else if (field === 'contactNumber') {
      setEditedContactNumber(userInfo.phoneNumber);
    }
  };

  const handleEditClick = () => {
    setShowFileInput(!showFileInput); // Toggle visibility of file input
  };

  const cancelEdit = (field) => {
    setEditMode({ ...editMode, [field]: false });
  };

  const handleCancel = () => {
    setShowFileInput(false);
  };
  
  const handleUpdate = async (field) => {
  const updateValue = field === 'name' ? editedName : editedContactNumber;
  const userDocRef = doc(db, 'users', userId);

    try {
      await updateDoc(userDocRef, { [field === 'name' ? 'fullname' : 'phoneNumber']: updateValue });
      setUserInfo({ ...userInfo, [field === 'name' ? 'fullname' : 'phoneNumber']: updateValue });
      toggleEditMode(field);
    } catch (error) {
      console.error('Error updating user information: ', error);
    }
  };

  return (
    <div className="background-colour">
     <h1 className="user-info-header">Manage Profile</h1>
      <div className="user-info-container">
        <div className="profileContainer">
          {userInfo && (
            <img src={userInfo.profileImageUrl || profile} alt="Profile" className='profileImg' />
          )}

          <div className='filesection'>

      {showFileInput ? (
          <div className='filesection'>
            <input type="file" className='file-input'
              accept=".png, .jpg, .jpeg"
              onChange={(e) => setSelectedFile(e.target.files[0])} 
            />
            <FaCheck onClick={handleImageUpload} className='tick' />
            <FaTimes onClick={handleCancel} className='cancel'/>
          </div>
          ):( <button onClick={handleEditClick} className='editbtn'>Edit Profile</button>)}
      </div>
      
        </div>
        {userInfo && (
        <div className="user-info-details">
          <div className='email-container'>
          <p className='label'>Email:</p>
          </div>
          <div className='email-container'>
          <p>{userInfo.email}</p>
          </div>
          <div className='name-container'>
              <p className='label'> <br></br>Name: </p>
              </div>
              {editMode.name ? (
                <>
                <div className='edit-box'>
                <div className='left'>
                  <input type="text" value={editedName} onChange={(e) => setEditedName(e.target.value)} />
                  </div>
                  <div className='right'>
                  <FaCheck onClick={() => handleUpdate('name')} className='tick' />
                  <FaTimes onClick={() => cancelEdit('name')} className='cancel'/>
                  </div>
                </div>
                </>
              ) : (
                <div className='name-container'>
                <p>{userInfo.fullname} <FaEdit className="edit-icon" onClick={() => toggleEditMode('name')} /></p>
                </div>
              )}

              <div className='contact-container'>
              <p className='label'> <br></br>Contact Number: </p>
              </div>
              {editMode.contactNumber ? (
                <>
                <div>
                <div className='edit-box'>
                <div className='left'>
                  <input type="text" value={editedContactNumber} onChange={(e) => setEditedContactNumber(e.target.value)} />
                  </div>
                  <div className='right'>
                  <FaCheck onClick={() => handleUpdate('contactNumber')} className='tick'/>
                  <FaTimes onClick={() => cancelEdit('contactNumber')} className='cancel'/>
                  </div>
                  </div>
                </div>
                </>
              ) : (
                <div className='contact-container'>
                <p>{userInfo.phoneNumber} <FaEdit className="edit-icon" onClick={() => toggleEditMode('contactNumber')} /></p>
                </div>
              )}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserInfoPage;
