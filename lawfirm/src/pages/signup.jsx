import React, {useState} from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import {  createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
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
    const [passMessage, setPassMessage] = useState('');
    const [emailVerificationMessage, setEmailVerificationMessage] = useState('');
 
    const onSubmit = async (e) => {
      e.preventDefault()

      setErrorMessage('');
      setPassMessage('');

      await createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            // Signed in
            const user = userCredential.user;
            // console.log(user);
            // navigate("/login")
            sendEmailVerification(user)
            .then(() => {
                // Email verification sent!
                setEmailVerificationMessage("Verification email sent. Please check your inbox.");
                navigate("/Home"); // Or you might want to keep them on the same page until they verify
            });
         
            // Use the user's UID as the document ID in Firestore
            const userDocRef = doc(db, 'users', user.uid);
            setDoc(userDocRef, {
                fullname: fullname,
                email: email,
                phoneNumber: phoneNumber,
                role: "client",
                })
                  .then(() => {
                    alert("Account created successfully and the verification email sent. Please check your inbox.");
                    
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
            } else if(error.code ==='auth/invalid-email'){
                setErrorMessage('This email address is invalid.');
            }
            else if(error.code ==='auth/weak-password'){
                setPassMessage('Password should be at least 6 characters')
            }else {
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
                        minLength="5" 
                        onChange={(e)=>setPassword(e.target.value)}
                    />
                    {passMessage && <div className="error-message">{passMessage}</div>}
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
                
                    <button className='createbutton' onClick={onSubmit}>Confirm</button>
                    <div className="links-container">
                       <NavLink to="/Login">Login Here</NavLink>
                   </div>
            </form>                          
        </div>
    </div>
    </div>
  )
}
 
export default Signup