import React, { useState, useEffect } from 'react';
import { db, storage } from '../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import profile from  '../images/profile.png';
import '../cssFolder/userInfoPage.css'
import { FaEdit, FaTimes, FaCheck} from 'react-icons/fa';
import { deleteObject } from 'firebase/storage';;

const UserInfoPage = ({ userId }) => {
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [showFileInput, setShowFileInput] = useState(false);
  const [editMode, setEditMode] = useState({ name: false, contactNumber: false });
  const [editedName, setEditedName] = useState('');
  const [editedContactNumber, setEditedContactNumber] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [nameError, setNameError] = useState('');
  const [contactNumberError, setContactNumberError] = useState('');

  // check the current user by using the userID store in the database 
  useEffect(() => {
    const fetchUserData = async () => {
      if (!userId) {
        setError('No user ID provided');
        setLoading(false);
        return;
      }
      try {
        const docRef = doc(db, 'users', userId); 
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

  // check the image is uploaded by the user 
 const handleImageUpload = async () => {
  console.log('here')
    if (!selectedFile) {
      alert('No file selected');
      return;
    }

    // check the extension type pf the picture uploaded
   const fileType = selectedFile.type;
   console.log(fileType)
    let fileExtension = '';
    if (fileType === "image/png") {
      fileExtension = '.png';
    } else if (fileType === "image/jpg") {
      fileExtension = '.jpg';
    }else if (fileType === "image/jpeg") {
      fileExtension = '.jpg';
    }else {
      alert('File type not allowed. Only PNG and JPG files are accepted.');
      return;
    }

    // start uploading
    setIsUploading(true);

    // upload the picture to the database 
    const imageRef = storageRef(storage, `profileImages/${userId}/profile${fileExtension}`);
    try {
      await uploadBytes(imageRef, selectedFile);
      const imageUrl = await getDownloadURL(imageRef);
      await updateProfileImageInFirestore(imageUrl);
    } catch (error) {
      alert('Error uploading image: ', error);
    }
    finally {
      setIsUploading(false); // End uploading
    }
  };

  const updateProfileImageInFirestore = async (imageUrl) => {
    const userDocRef = doc(db, 'users', userId);
  
    // function to delete existing profile image in the database
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
      // wait until existing image is deleted and uploaded
      await deleteExistingImage(); 
      await updateDoc(userDocRef, { profileImageUrl: imageUrl });
      // update local state
      setUserInfo({ ...userInfo, profileImageUrl: imageUrl }); 
      alert('Profile updated Successfully')
      window.location.reload();
    } catch (error) {
      console.error('Error updating profile image URL: ', error);
    }
  };

  // check to edit the name or the contact number
  const toggleEditMode = (field) => {
    setEditMode({ ...editMode, [field]: !editMode[field] });

    if (field === 'name') {
      setEditedName(userInfo.fullname);
    } else if (field === 'contactNumber') {
      setEditedContactNumber(userInfo.phoneNumber);
    }
  };

  // toggle visibility of file input
  const handleEditClick = () => {
    setShowFileInput(!showFileInput); 
  };

  // if cancel to edit the information
  const cancelEdit = (field) => {
    setEditMode({ ...editMode, [field]: false });
    if (field === 'name') {
      setNameError('');
    } else if (field === 'contactNumber') {
      setContactNumberError('');
    }
  };
  
  const handleCancel = () => {
    setShowFileInput(false);
  };

  // update the name edited or the contact number edited in the database
  const handleUpdate = async (field) => {
    const updateValue = field === 'name' ? editedName : editedContactNumber;
  
    // Check if the input is empty and set error message
    if (!updateValue.trim()) {
      if (field === 'name') {
        setNameError('Name cannot be empty');
      } else if (field === 'contactNumber') {
        setContactNumberError('Contact number cannot be empty');
      }
      return;
    }
  
    // If input is not empty, clear the error messages
    setNameError('');
    setContactNumberError('');
  
    const userDocRef = doc(db, 'users', userId);
    try {
      await updateDoc(userDocRef, { [field === 'name' ? 'fullname' : 'phoneNumber']: updateValue });
      setUserInfo({ ...userInfo, [field === 'name' ? 'fullname' : 'phoneNumber']: updateValue });
      toggleEditMode(field);
      alert('Profile updated Successfully')
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

          {isUploading ? (
          <div className='uploadtext'>Uploading the image ....</div> // Replace this with your loading spinner or indicator
        ) : (
          <div className="filesection">
            {/* Only allow the file with png, jpg and jpeg in the user desktop to be uploaded*/}
              {showFileInput ? (
                  <div className='filesection1'>
                    <input type="file" className='file-input'
                      accept=".png, .jpg"
                      onChange={(e) => setSelectedFile(e.target.files[0])} 
                    />
                    <FaCheck onClick={handleImageUpload} className='tick' />
                    <FaTimes onClick={handleCancel} className='cancel'/>
                  </div>
                  ):( <button onClick={handleEditClick} className='editbtn'>Edit Profile</button>)}
          </div>
        )}
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
                  <input type="text"  className='input' value={editedName} onChange={(e) => setEditedName(e.target.value)} />
                  {nameError && <p className="error1">{nameError}</p>}
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
                  <input type="text" className='input' value={editedContactNumber} onChange={(e) => setEditedContactNumber(e.target.value)} />
                  {contactNumberError && <p className="error1">{contactNumberError}</p>}
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
