import React from 'react';
import './App.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFacebookF, faInstagram } from '@fortawesome/free-brands-svg-icons';

export default function ContactPage() {
  return (
    <main className="main-content" style={{ paddingTop: '90px' }}>
      {/* Contact Hero Section */}
      <section className="contact-hero">
        <div className="contact-hero-content">
          <h1>Contact Us</h1>
          <p className="hero-description">
            Start your day right — and if you have any questions, we’re just a message away! Whether you're
            planning a family breakfast, curious about our menu, or want to leave a review, we’d love to hear from
            you. At Eggs & More, we believe in warm food and warmer conversations. Let’s stay connected!
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
            <p>contact@tech.com</p>
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
            <form className="contact-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="name">Your Name</label>
                  <input type="text" id="name" />
                </div>
                <div className="form-group">
                  <label htmlFor="email">Your Email</label>
                  <input type="email" id="email" />
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="subject">Subject</label>
                <input type="text" id="subject" />
              </div>
              <div className="form-group">
                <label htmlFor="message">Message</label>
                <textarea id="message" rows="4"></textarea>
              </div>
              <button type="submit" className="submit-button">Send Message</button>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}