import React from 'react';
import '../cssFolder/contactUs.css'; // Make sure to import the CSS file

const ContactUs = () => {
  return (
    <div className="contact-background">   
    <div className="contact-card">
      <h1>Contact Us</h1>
      <ul>
        <li><strong>Email:</strong> <br></br> LAlawfirm@gmail.com</li>
        <li><strong>Phone:</strong>  <br></br>04-1234567</li>
        <li><strong>Address:</strong>  <br></br>12, Jalan Conlay, 50450, Kuala Lumpur, Malaysia</li>
      </ul>
    </div>
    </div>
  );
}

export default ContactUs;