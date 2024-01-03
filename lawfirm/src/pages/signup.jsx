import React, {useState} from 'react';
import { useNavigate } from 'react-router-dom';
import {  createUserWithEmailAndPassword  } from 'firebase/auth';
import { auth } from '../firebase';
import "../cssFolder/signup.css"
import { db } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';

const Signup = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('');
    const [fullname, setName] = useState('');
    const [phoneNumber, setPhoneNum] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
 
    const onSubmit = async (e) => {
      e.preventDefault()
     
      await createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            // Signed in
            const user = userCredential.user;
            console.log(user);
            navigate("/login")
         
            // Use the user's UID as the document ID in Firestore
            const userDocRef = doc(db, 'users', user.uid);
            setDoc(userDocRef, {
                userID: user.uid,
                fullname: fullname,
                email: email,
                phoneNumber: phoneNumber,
                role: "client",
                })
                  .then(() => {
                    alert("Create Account Successfully");
                  })
                  .catch((error) => {
                    alert(error.message);
            });
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            console.log(errorCode, errorMessage);
            if (error.code === 'auth/email-already-in-use') {
                setErrorMessage('This email address is already in use.');
            } else {
                setErrorMessage('An error occurred. Please try again.');
            }
        });

    }
 
  return (
    <div className="signup-container">
    <div className="signuppanel">   
        <div className='form'>   
        <h2 className='h2tag'>Welcome to L.A Law Firm</h2>       
        <p className='h3tag'>Create your Own Account</p>                                      
            <form> 
                <div className="input-container">
                    <label htmlFor="fullname">
                    Full Name
                    </label>
                    <input
                    id="fullname"
                    name="fullname"
                    type="text"
                    required
                    placeholder="Full Name"
                    onChange={(e) => setName(e.target.value)}
                    />
                </div>
                                                      
                <div className = "input-container">
                    <label htmlFor="email-address">
                        Email Address
                    </label>
                    <input
                        id="email-address"
                        name="email"
                        type="email"                                    
                        required                                                                                
                        placeholder="Email address"
                        onChange={(e)=>setEmail(e.target.value)}
                    />
                    {errorMessage && <div className="error-message">{errorMessage}</div>}
                </div>

                <div className='input-container'>
                    <label htmlFor="password">
                        Password
                    </label>
                    <input
                        id="password"
                        name="password"
                        type="password"                                    
                        required                                                                                
                        placeholder="Password"
                        onChange={(e)=>setPassword(e.target.value)}
                    />
                </div>

                <div className="input-container">
                    <label htmlFor="phoneNumber">
                    Phone Number
                    </label>
                    <input
                    id="phoneNumber"
                    name="phoneNumber"
                    type="text"
                    required
                    placeholder="Phone Number"
                    onChange={(e) => setPhoneNum(e.target.value)}
                    />
                </div>
                    <button className='createbutton'                                    
                        onClick={onSubmit}                                        
                    >      
                        Confirm                                                                
                    </button>
            </form>                          
        </div>
    </div>
    </div>
  )
}
 
export default Signup