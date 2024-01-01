import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import { useNavigate } from 'react-router-dom';
import "../cssFolder/login.css";

const Login = () => {
   const navigate = useNavigate();
   const [email, setEmail] = useState('');
   const [password, setPassword] = useState('');
   const [emailError, setEmailError] = useState('');
   const [passwordError, setPasswordError] = useState('');
      
   const onLogin = (e) => {
       e.preventDefault();
       setEmailError('');
       setPasswordError('');

       signInWithEmailAndPassword(auth, email, password)
       .then((userCredential) => {
           // Signed in
           navigate("/home"); // Redirect the user to the home page
       })
       .catch((error) => {
           console.error("Login error:", error.code, error.message); // Log the error for debugging
         
           // Reset previous errors first
           setEmailError('');
           setPasswordError('');
         
           // Match the error code and set the state
           if (error.code === 'auth/wrong-password') {
             setPasswordError('Incorrect password.');
           } else if (error.code === 'auth/user-not-found') {
             setEmailError('No user found with this email.');
           } else {
             // Set a generic error for any other issues
             setEmailError('Failed to sign in. Please try again.');
           }
         });
   };

   return (
     <div className="login-container">
       <div className="panel">   
           <div className='form'>   
           <h2 className='h2tag'>Welcome Back</h2>       
           <p className='h3tag'>Log into your Account</p>                                      
               <form onSubmit={onLogin}> 
                   <div className="input-container">
                       <label htmlFor="email-address">Email Address</label>
                       <input
                           id="email-address"
                           name="email"
                           type="email"
                           required
                           placeholder="Email address"
                           onChange={(e) => {
                               setEmail(e.target.value);
                               setEmailError(''); // Clear email error when user types
                             }}
                       />
                       {emailError && <div className="error-message">{emailError}</div>}
                   </div>

                   <div className='input-container'>
                       <label htmlFor="password">Password</label>
                       <input
                           id="password"
                           name="password"
                           type="password"
                           required
                           placeholder="Password"
                           onChange={(e) => {
                               setPassword(e.target.value);
                               setPasswordError(''); // Clear password error when user types
                             }}
                       />
                       {passwordError && <div className="error-message">{passwordError}</div>}
                   </div>
                                   
                   <button className='loginbutton' type="submit">Login</button>
                   {/* Uncomment and update links as needed */}
                   {/* <div className="links-container">
                       <NavLink to="/signup">Sign up for an account</NavLink>
                       <NavLink to="/forgot-password">Forgot password?</NavLink>
                   </div> */}
               </form>                          
           </div>
       </div>
     </div>
   );
};

export default Login;