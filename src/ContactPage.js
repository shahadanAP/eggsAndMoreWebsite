import React, { useRef, useState } from 'react';
import emailjs from '@emailjs/browser';
import './App.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFacebookF, faInstagram } from '@fortawesome/free-brands-svg-icons';
import StoreHours from './StoreHours';

export default function ContactPage() {
  const form = useRef();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const sendEmail = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);
    
    const serviceID = 'service_t2mb3oo';
    const templateID = 'template_lrk8jor';
    const publicKey = 'Z8IVXVM635Oad1yWX';
    
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
    <main className="main-content" style={{ paddingTop: '90px' }} role="main">
      {/* Contact Hero Section */}
      <section className="contact-hero" aria-labelledby="contact-heading">
        <div className="contact-hero-content">
          <h1 id="contact-heading">Contact Us</h1>
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
        <aside className="contact-info" aria-label="Contact information">
          <div className="contact-section">
            <h2 id="address-heading">ADDRESS</h2>
            <address>
              <a 
                href="https://www.google.com/maps/place/Eggs+%26+More/@51.097561,-113.9576114,17z" 
                target="_blank" 
                rel="noopener noreferrer"
                aria-describedby="address-heading"
              >
                5441 Falsbridge Dr NE, Calgary, AB T3J 3E9
              </a>
            </address>
          </div>

          <div className="contact-section">
            <h2 id="phone-heading">PHONE NUMBER</h2>
            <p>
              <a href="tel:+14032809488" aria-describedby="phone-heading">
                +1 (403) 280-9488
              </a>
            </p>
          </div>

          <div className="contact-section">
            <h2 id="email-heading">EMAIL ADDRESS</h2>
            <p>
              <a href="mailto:contact@eggsandmorerajascuisine.com" aria-describedby="email-heading">
                contact@eggsandmorerajascuisine.com
              </a>
            </p>
          </div>

          <div className="contact-section">
            <h2 id="social-heading">FOLLOW US</h2>
            <nav className="social-icons" aria-labelledby="social-heading">
              <a 
                href="https://www.facebook.com/EggsAndMoreCalgary/" 
                className="social-icon" 
                target="_blank" 
                rel="noopener noreferrer"
                aria-label="Visit our Facebook page"
              >
                <FontAwesomeIcon icon={faFacebookF} aria-hidden="true" />
              </a>
              <a 
                href="https://www.instagram.com/eggsandmorene/" 
                className="social-icon" 
                target="_blank" 
                rel="noopener noreferrer"
                aria-label="Visit our Instagram page"
              >
                <FontAwesomeIcon icon={faInstagram} aria-hidden="true" />
              </a>
            </nav>
          </div>
        </aside>

        {/* Right Column - Contact Form */}
        <div className="contact-right-column">
          {/* Contact Form Section */}
          <section className="contact-form-section" aria-labelledby="form-heading">
            <h2 id="form-heading">Send a Message</h2>
            
            {/* Status Messages */}
            {submitStatus === 'success' && (
              <div className="success-message" role="alert" aria-live="polite">
                <strong>Thank you for your message!</strong> We'll get back to you soon.
              </div>
            )}
            
            {submitStatus === 'error' && (
              <div className="error-message" role="alert" aria-live="assertive">
                <strong>Sorry, there was an error sending your message.</strong> Please try again later or contact us directly at +1 (403) 280-9488.
              </div>
            )}
            
            <form ref={form} className="contact-form" onSubmit={sendEmail} noValidate>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="name">Your Name <span aria-hidden="true">*</span><span className="sr-only">(required)</span></label>
                  <input 
                    type="text" 
                    id="name" 
                    name="from_name" 
                    required 
                    autoComplete="name"
                    aria-required="true"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="email">Your Email <span aria-hidden="true">*</span><span className="sr-only">(required)</span></label>
                  <input 
                    type="email" 
                    id="email" 
                    name="from_email" 
                    required 
                    autoComplete="email"
                    aria-required="true"
                  />
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="subject">Subject</label>
                <input type="text" id="subject" name="subject" autoComplete="off" />
              </div>
              <div className="form-group">
                <label htmlFor="message">Message <span aria-hidden="true">*</span><span className="sr-only">(required)</span></label>
                <textarea 
                  id="message" 
                  name="message" 
                  rows="4" 
                  required
                  aria-required="true"
                ></textarea>
              </div>
              <button 
                type="submit" 
                className="submit-button" 
                disabled={isSubmitting}
                aria-busy={isSubmitting}
              >
                {isSubmitting ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </section>
        </div>
      </div>

      {/* Store Hours Section */}
      <StoreHours />

      {/* Google Maps Section */}
      <section className="map-section" aria-labelledby="map-heading">
        <h2 id="map-heading" className="sr-only">Our Location</h2>
        <div className="map-container">
          <iframe 
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2504.8892441073!2d-113.9601863!3d51.097561!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x537163627dbea6af%3A0xf047c278705d91b3!2sEggs%20%26%20More!5e0!3m2!1sen!2sca!4v1704067200000!5m2!1sen!2sca"
            width="100%"
            height="450"
            style={{ border: 0 }}
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Eggs & More location on Google Maps - 5441 Falsbridge Dr NE, Calgary, AB"
            aria-label="Interactive map showing Eggs & More restaurant location"
          ></iframe>
        </div>
        <div className="map-overlay-info">
          <div className="map-info-card">
            <h3>Visit Us</h3>
            <p><strong>Eggs & More</strong></p>
            <address>5441 Falsbridge Dr NE<br />Calgary, AB T3J 3E9</address>
            <a 
              href="https://www.google.com/maps/dir//Eggs+%26+More,+5441+Falsbridge+Dr+NE,+Calgary,+AB+T3J+3E9" 
              className="directions-button"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Get directions to Eggs & More on Google Maps"
            >
              <span aria-hidden="true">📍</span> Get Directions
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
