import React, { useState } from 'react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../firebase';
import '../cssFolder/resetPassword.css'; 

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const onSubmit = (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    // sent reset password email to the user
    sendPasswordResetEmail(auth, email)
      .then(() => {
        setMessage('Password reset email sent. Check your inbox.');
      })
      .catch((error) => {
        // if the email is not registered
        if (error.code === 'auth/user-not-found') {
          setError('The email is not registered.');
        } else {
          setError('Failed to send password reset email. Please try again.');
        }
        console.error('Password reset error', error);
      });
  };

  return (
    <div className="login-container"> 
      <div className="panel1"> 
        <div className='form'> 
          <h2 className='h2resettag'>Reset Password</h2>
          <form onSubmit={onSubmit}>
            <div className="input-container"> 
              <label htmlFor="email">Email Address</label>
              <input
                id="email"
                type="email"
                required
                placeholder="Enter your email address"
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            {message && <p className="message">{message}</p>} 
            {error && <p className="error-message">{error}</p>} 
            {/* if the submit button is clicked */}
            <button className='loginbutton' type="submit">Send Reset Link</button> 
          </form>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
