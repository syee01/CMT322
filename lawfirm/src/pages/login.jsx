import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import { useNavigate, NavLink } from 'react-router-dom';
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

       // check the email and paswword input in the database
       signInWithEmailAndPassword(auth, email, password)
       .then(() => {
           // Signed in
           // Redirect the user to the home page
           navigate("/home"); 
       })
       .catch((error) => {
        console.error("Login error:", error.code, error.message);
    
        // Reset previous errors first
        setEmailError('');
        setPasswordError('');
    
        // Match the error code and set the state
        switch (error.code) {
            case 'auth/wrong-password':
                setPasswordError('Incorrect password. Please try again.');
                break;
            case 'auth/user-not-found':
                setEmailError('No user found with this email. Please sign up.');
                break;
            case 'auth/invalid-email':
                setEmailError('The email address is not valid.');
                break;
            case 'auth/invalid-api-key':
                setEmailError('An error occurred with the app configuration. Please contact support.');
                break;
            default:
                setEmailError('Failed to sign in. Please try again.');
                break;
        }
    });
   };;

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
                               // Clear email error when user types
                               setEmailError(''); 
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
                          // Clear password error when user types
                          setPasswordError(''); 
                      }}
                  />
                  {/* Link to forgot password page to reset the password */}
                  <div className="password-actions">
                      {passwordError && <div className="error-message">{passwordError}</div>}
                      <NavLink to="/ForgotPassword" className='forgot'>Forgot password?</NavLink>
                      </div>
                  </div>                
                   <button className='loginbutton' type="submit">Login</button>
                   {/* link to sign up page */}
                   <div className="links-container">
                       <NavLink to="/signup">Sign up for an account</NavLink>
                   </div>
               </form>                          
           </div>
       </div>
     </div>
   );
};

export default Login;