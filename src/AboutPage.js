import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import EMAboutImage from './assets/EMAbout.png';

const AboutPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('story');
  const [playVideo, setPlayVideo] = useState(false);

  // Sample team data - replace with your actual team members

  const handleVideoPlay = () => {
    setPlayVideo(true);
  };

  return (
    <div className="about-page">
      {/* Hero Section */}
      <section className="about-hero">
        <div className="about-hero-content">
          <h1>Our Story</h1>
          <p className="hero-subtitle"></p>
        </div>
      </section>

      {/* Navigation Tabs */}
      <div className="about-tabs">
        <button 
          className={`tab-button ${activeTab === 'story' ? 'active' : ''}`}
          onClick={() => setActiveTab('story')}
        >
          Our Story
        </button>
        <button 
          className={`tab-button ${activeTab === 'video' ? 'active' : ''}`}
          onClick={() => setActiveTab('video')}
        >
          Our Kitchen
        </button>
      </div>
      {/* Content Sections */}
      <div className="about-content">
        {/* Our Story Section */}
        {activeTab === 'story' && (
          <section className="story-section">
            <div className="story-container">
              <div className="story-text">
                <h2>Our Vision</h2>
                <p>
                Our restaurant was founded with a bold vision: to bring diversity to the culinary world 
                by blending flavors from the East, South, and West. 
                From comforting Southern dishes to vibrant Eastern spices and classic Western favorites, 
                our menu offers a unique fusion that reflects a world united by food.
            </p>
            <p>
                We are passionate about creating an inclusive, welcoming space where both children 
                and seniors can enjoy a wonderful meal together. 
                This restaurant is more than just a place to eat — it's a celebration of cultures, 
                community, and connection, bringing together both sides of the world around the table.
            </p>

              </div>
              <div className="story-image">
                <img src={EMAboutImage} alt="Our Story" />
              </div>
            </div>
          </section>
        )}

        {/* Video Section */}
        {activeTab === 'video' && (
          <section className="video-section">
            <h2>Behind the Scenes</h2>
            <p className="video-subtitle">
              Take a peek inside our kitchen and see where the magic happens
            </p>
            
            <div className="video-container">
              {playVideo ? (
                <div className="video-wrapper">
                  <video 
                    controls 
                    autoPlay 
                    className="custom-video"
                  >
                    <source 
                      src={require("./assets/eggsAndMoreBS.mp4")} 
                      type="video/mp4" 
                    />
                    Your browser does not support the video tag.
                  </video>
                </div>
              ) : (
                <div className="video-placeholder" onClick={handleVideoPlay}>
                  <img 
                    src={require("./assets/dish1.webp")} // Add your thumbnail image
                    alt="Play our kitchen video" 
                    className="video-thumbnail"
                  />
                  <button className="play-button">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
            <div className="video-features">
              <div className="feature">
                <div className="feature-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.31-8.86c-1.77-.45-2.34-.94-2.34-1.67 0-.84.79-1.43 2.1-1.43 1.38 0 1.9.66 1.94 1.64h1.71c-.05-1.34-.87-2.57-2.49-2.97V5H10.9v1.69c-1.51.32-2.72 1.3-2.72 2.81 0 1.79 1.49 2.69 3.66 3.21 1.95.46 2.34 1.15 2.34 1.87 0 .53-.39 1.39-2.1 1.39-1.6 0-2.23-.72-2.32-1.64H8.04c.1 1.7 1.36 2.66 2.86 2.97V19h2.34v-1.67c1.52-.29 2.72-1.16 2.73-2.77-.01-2.2-1.9-2.96-3.66-3.42z" />
                  </svg>
                </div>
                <h3>Locally Sourced</h3>
                <p></p>
              </div>
              <div className="feature">
                <div className="feature-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.06 22.99h1.66c.84 0 1.53-.64 1.63-1.46L23 5.05h-5V1h-1.97v4.05h-4.97l.3 2.34c1.71.47 3.31 1.32 4.27 2.26 1.44 1.42 2.43 2.89 2.43 5.29v8.05zM1 21.99V21h15.03v.99c0 .55-.45 1-1.01 1H2.01c-.56 0-1.01-.45-1.01-1zm15.03-7c0-8-15.03-8-15.03 0h15.03zM1.02 17h15v2h-15z" />
                  </svg>
                </div>
                <h3>Sustainable Practices</h3>
                <p></p>
              </div>
              <div className="feature">
                <div className="feature-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm4.59-12.42L10 14.17l-2.59-2.58L6 13l4 4 8-8z" />
                  </svg>
                </div>
                <h3>Quality Guaranteed</h3>
                <p></p>
              </div>
            </div>
          </section>
        )}
      </div>

      {/* Call to Action */}
      <section className="about-cta">
        <h2>Ready to Experience Our Cuisine?</h2>
        <div className="cta-buttons">
          <button 
            className="btn btn-primary"
            onClick={() => navigate('/menu')}
          >
            View Our Menu
          </button>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;