import React, { useRef, useState } from 'react';
import emailjs from '@emailjs/browser';
import './App.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFacebookF, faInstagram } from '@fortawesome/free-brands-svg-icons';

export default function ContactPage() {
  const form = useRef();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const sendEmail = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);
    
    // Your EmailJS credentials - replace with your actual IDs
    const serviceID = 'service_t2mb3oo';
    const templateID = 'template_lrk8jor'; // Get this from EmailJS
    const publicKey = 'Z8IVXVM635Oad1yWX'; // Get this from EmailJS
    
    emailjs.sendForm(serviceID, templateID, form.current, publicKey)
      .then((result) => {
        console.log('Email successfully sent!', result.text);
        setSubmitStatus('success');
        form.current.reset();
      })
      .catch((error) => {
        console.error('Failed to send email:', error.text);
        setSubmitStatus('error');
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  return (
    <main className="main-content" style={{ paddingTop: '90px' }}>
      {/* Contact Hero Section */}
      <section className="contact-hero">
        <div className="contact-hero-content">
          <h1>Contact Us</h1>
          <p className="hero-description">
            Start your day right — and if you have any questions, we're just a message away! Whether you're
            planning a family breakfast, curious about our menu, or want to leave a review, we'd love to hear from
            you. At Eggs & More, we believe in warm food and warmer conversations. Let's stay connected!
          </p>
        </div>
      </section>

      {/* Contact Container */}
      <div className="contact-container">
        {/* Left Column - Contact Info */}
        <div className="contact-info">
          <div className="contact-section">
            <h2>ADDRESS</h2>
            <p>5441 Falsbridge Dr NE, Calgary, AB T3J 3E9</p>
          </div>

          <div className="contact-section">
            <h2>PHONE NUMBER</h2>
            <p>+1403-280-9488</p>
          </div>

          <div className="contact-section">
            <h2>EMAIL ADDRESS</h2>
            <p>contact@eggsandmorerajascuisine.com</p>
          </div>

          <div className="contact-section">
            <h2>FOLLOW US</h2>
            <div className="social-icons">
              <a href="https://www.facebook.com/EggsAndMoreCalgary/" className="social-icon" target="_blank" rel="noopener noreferrer">
                <FontAwesomeIcon icon={faFacebookF} />
              </a>
              <a href="https://www.instagram.com/eggsandmorene/" className="social-icon" target="_blank" rel="noopener noreferrer">
                <FontAwesomeIcon icon={faInstagram} />
              </a>
            </div>
          </div>
        </div>

        {/* Right Column - Contact Form and Booking */}
        <div className="contact-right-column">
          {/* Contact Form Section */}
          <div className="contact-form-section">
            <h2>Send a Message</h2>
            
            {/* Status Messages */}
            {submitStatus === 'success' && (
              <div className="success-message">
                <strong>Thank you for your message!</strong> We'll get back to you soon.
              </div>
            )}
            
            {submitStatus === 'error' && (
              <div className="error-message">
                <strong>Sorry, there was an error sending your message.</strong> Please try again later or contact us directly at +1403-280-9488.
              </div>
            )}
            
            <form ref={form} className="contact-form" onSubmit={sendEmail}>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="name">Your Name *</label>
                  <input type="text" id="name" name="from_name" required />
                </div>
                <div className="form-group">
                  <label htmlFor="email">Your Email *</label>
                  <input type="email" id="email" name="from_email" required />
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="subject">Subject</label>
                <input type="text" id="subject" name="subject" />
              </div>
              <div className="form-group">
                <label htmlFor="message">Message *</label>
                <textarea id="message" name="message" rows="4" required></textarea>
              </div>
              <button 
                type="submit" 
                className="submit-button" 
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}