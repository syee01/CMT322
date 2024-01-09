// ForgotPassword.jsx

import React, { useState } from 'react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../firebase';
import '../cssFolder/resetPassword.css'; // Make sure the path is correct

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const onSubmit = (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    sendPasswordResetEmail(auth, email)
      .then(() => {
        setMessage('Password reset email sent. Check your inbox.');
      })
      .catch((error) => {
        if (error.code === 'auth/user-not-found') {
          setError('The email is not registered.');
        } else {
          setError('Failed to send password reset email. Please try again.');
        }
        console.error('Password reset error', error);
      });
  };

  return (
    <div className="login-container"> {/* Use the same container class for styling */}
      <div className="panel"> {/* Use the same panel class for styling */}
        <div className='form'> {/* Use the same form class for styling */}
          <h2 className='h2resettag'>Reset Password</h2>
          <form onSubmit={onSubmit}>
            <div className="input-container"> {/* Use the same input container class for styling */}
              <label htmlFor="email">Email Address</label>
              <input
                id="email"
                type="email"
                required
                placeholder="Enter your email address"
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            {message && <p className="message">{message}</p>} {/* Add a class for messages */}
            {error && <p className="error-message">{error}</p>} {/* Use the same error message class for styling */}
            <button className='loginbutton' type="submit">Send Reset Link</button> {/* Reuse the login button class */}
          </form>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
