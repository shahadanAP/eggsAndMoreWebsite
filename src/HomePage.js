import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './App.css';
import VideoPlayer from './VideoPlayer';
import DroppingImage from './DroppingImage'; // Import the new component

import logo from './assets/eggsandmore.svg';
import heroImage from './assets/hero.png';
import eggsBenedictImage from './assets/classicBennedictPic.png';
import pancakesImage from './assets/steakOmeletPic.png';
import omeletteImage from './assets/steakStripsAndOmlete.png';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFacebookF, faInstagram } from '@fortawesome/free-brands-svg-icons';

// Image paths for new sections
import emReview1 from './assets/emReview1.png';
import emReview2 from './assets/emReview2.png';
import emReview3 from './assets/emReview3.png';
import emReview4 from './assets/emReview4.png';
import emReview5 from './assets/emReview5.png';
import emReview6 from './assets/emReview6.png';

// Import dropping images
import dish1 from './assets/dish1.png';
import dish2 from './assets/dish2.png';
import dish3 from './assets/dish3.png';
import dish4 from './assets/dish4.png';
import highTeaPlatter from './assets/highTeaPlatter.png';

const imagePaths = {
  reviews: [
    emReview1,
    emReview2,
    emReview3,
    emReview4,
    emReview5,
    emReview6
  ],
  droppingImages: [
    dish1,
    dish2,
    dish3,
    dish4
  ],
};

export default function HomePage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [currentHeroImage, setCurrentHeroImage] = useState(heroImage);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [currentReviewIndex, setCurrentReviewIndex] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate();
  const [isDroppingVisible, setIsDroppingVisible] = useState(false);
  const [isHighTeaVisible, setIsHighTeaVisible] = useState(false);
  const droppingSectionRef = useRef(null);
  const highTeaSectionRef = useRef(null);
  const reviewIntervalRef = useRef(null); // Add this ref
  const dishes = [
    {
      id: 1,
      name: "EGGS BENEDICT",
      description: "Poached eggs with hollandaise sauce",
      image: eggsBenedictImage,
      thumbnail: eggsBenedictImage
    },
    {
      id: 2,
      name: "STEAK & EGGS",
      description: "Fluffy pancakes with syrup & berries",
      image: pancakesImage,
      thumbnail: pancakesImage
    },
    {
      id: 3,
      name: "STEAK STRIPS & EGGS",
      description: "Three-egg omelette with fillings",
      image: omeletteImage,
      thumbnail: omeletteImage
    }
  ];

  useEffect(() => {
  const handleScroll = () => {
    const position = window.scrollY;
    setScrollPosition(position);
    setIsScrolled(position > 50);

    // Check dropping section visibility
    if (droppingSectionRef.current) {
      const droppingRect = droppingSectionRef.current.getBoundingClientRect();
      setIsDroppingVisible(droppingRect.top < window.innerHeight * 0.8);
    }

    // Check high tea section visibility
    if (highTeaSectionRef.current) {
      const highTeaRect = highTeaSectionRef.current.getBoundingClientRect();
      setIsHighTeaVisible(highTeaRect.top < window.innerHeight * 0.8);
    }
  };

  window.addEventListener('scroll', handleScroll);
  // Initial check
  handleScroll();
  
  return () => window.removeEventListener('scroll', handleScroll);
}, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        const nextIndex = dishes.findIndex(dish => dish.image === currentHeroImage) + 1;
        const nextImage = nextIndex < dishes.length ? dishes[nextIndex].image : heroImage;
        setCurrentHeroImage(nextImage);
        setIsTransitioning(false);
      }, 500);
    }, 5000);

    return () => clearInterval(interval);
  }, [currentHeroImage]);

 // Unified 10-second interval for ALL devices
useEffect(() => {
  reviewIntervalRef.current = setInterval(() => {
    setCurrentReviewIndex(prev => (prev + 1) % imagePaths.reviews.length);
  }, 10000);

  return () => {
    if (reviewIntervalRef.current) {
      clearInterval(reviewIntervalRef.current);
    }
  };
}, [imagePaths.reviews.length]);

  useEffect(() => {
  if (typeof window === 'undefined' || window.innerWidth > 768) return;

  const slider = document.querySelector('.reviews-slider');
  if (!slider) return;

  let startX = 0;
  let currentX = 0;
  let isDragging = false;
  let currentTranslate = 0;
  let prevTranslate = 0;
  let animationID = 0;

  const handleTouchStart = (e) => {
    startX = e.touches[0].clientX;
    currentX = startX;
    isDragging = true;
    animationID = requestAnimationFrame(animation);
    slider.style.transition = 'none'; // Disable transition during drag
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    currentX = e.touches[0].clientX;
    currentTranslate = prevTranslate + currentX - startX;
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    isDragging = false;
    cancelAnimationFrame(animationID);
    
    const diff = currentX - startX;
    const threshold = slider.offsetWidth / 4;
    
    if (diff > threshold) {
      // Swipe right - go to previous slide
      goToSlide(currentReviewIndex > 0 ? currentReviewIndex - 1 : imagePaths.reviews.length - 1, 'right');
    } else if (diff < -threshold) {
      // Swipe left - go to next slide
      goToSlide(currentReviewIndex < imagePaths.reviews.length - 1 ? currentReviewIndex + 1 : 0, 'left');
    } else {
      // Return to current slide
      goToSlide(currentReviewIndex, diff > 0 ? 'right' : 'left');
    }
  };

  const animation = () => {
    slider.style.transform = `translateX(${currentTranslate}px)`;
    if (isDragging) {
      animationID = requestAnimationFrame(animation);
    }
  };

  const goToSlide = (index, direction) => {
    prevTranslate = -index * slider.offsetWidth;
    currentTranslate = prevTranslate;
    slider.style.transition = 'transform 0.5s ease-out';
    slider.style.transform = `translateX(${prevTranslate}px)`;
    setCurrentReviewIndex(index);
  };

  slider.addEventListener('touchstart', handleTouchStart, { passive: true });
  slider.addEventListener('touchmove', handleTouchMove, { passive: false });
  slider.addEventListener('touchend', handleTouchEnd);

  return () => {
    cancelAnimationFrame(animationID);
    slider.removeEventListener('touchstart', handleTouchStart);
    slider.removeEventListener('touchmove', handleTouchMove);
    slider.removeEventListener('touchend', handleTouchEnd);
  };
}, [currentReviewIndex, imagePaths.reviews.length]);


  const handleDishHover = (dishImage) => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentHeroImage(dishImage);
      setIsTransitioning(false);
    }, 500);
  };

  const handleDishLeave = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentHeroImage(heroImage);
      setIsTransitioning(false);
    }, 500);
  };

  const handleDotClick = (index) => {
    setCurrentReviewIndex(index);
  };

  return (
    <div className="app">
      {/* Hero Section */}
      <section className="hero-container">
        <div className="hero-text">
          <h1>
            <span className="title-line">Delicious</span>
            <span className="title-line">Breakfast</span>
            <span className="title-line">& Brunch</span>
          </h1>
          <p>Fresh ingredients, homemade recipes, served with love</p>
          <div className="hero-buttons">
            <button onClick={() => navigate('/menu')} className="nav-button" style={{ fontWeight: '700' }}> 
              View Menu
            </button>
          </div>
        </div>
        <div className="hero-image">
          <img 
            src={currentHeroImage} 
            alt="Delicious breakfast" 
            style={{ 
              opacity: isTransitioning ? 0 : 1,
              transition: 'opacity 0.5s ease-in-out'
            }} 
          />
        </div>
      </section>

      {/* Dropping Images Section */}
     <section 
      className={`dropping-images-section ${isDroppingVisible ? 'in-view' : ''}`}
      ref={droppingSectionRef}
    >
      <div className="dropping-content-wrapper">
        <div className="image-drop-text">
          <h2>Our Culinary Masterpieces</h2>
          <p>
            Each dish at our restaurant is carefully crafted to deliver an unforgettable dining experience. 
            Our chefs combine traditional techniques with innovative flair to create these visual and 
            flavorful masterpieces.
          </p>
        </div>
              
          <div className="image-drop-container">
            {/* First row with first 2 images */}
            <div className="image-drop-row">
              <DroppingImage 
                src={dish1} 
                alt="Featured dish 1" 
                delay={0.1}
                distance={100}
              />
              <DroppingImage 
                src={dish2} 
                alt="Featured dish 2" 
                delay={0.2}
                distance={100}
              />
            </div>
            
            {/* Second row with next 2 images */}
            <div className="image-drop-row">
              <DroppingImage 
                src={dish3} 
                alt="Featured dish 3" 
                delay={0.3}
                distance={100}
              />
              <DroppingImage 
                src={dish4} 
                alt="Featured dish 4" 
                delay={0.4}
                distance={100}
              />
            </div>
          </div>
        </div>
      </section>

      {/* High Tea Platter Section */}
      <section className="high-tea-section" ref={highTeaSectionRef}>
        <div className="high-tea-container">
          <div className="high-tea-video">
            <VideoPlayer />
          </div>
          <div className="high-tea-content">
            <h2>INTRODUCING OUR NEW HIGH TEA PLATTER!!</h2>
            <p>
              Experience our exquisite High Tea Platter featuring a delightful selection of finger sandwiches, 
              freshly baked scones with clotted cream and jam, and an assortment of delicate pastries and cakes. 
              Perfect for special occasions or an indulgent afternoon treat.
            </p>
          </div>
        </div>
        
        <div className="high-tea-image-container">
          <div className="high-tea-description">
            <h3>What's Included:</h3>
            <ul>
              <li>Assorted finger sandwiches (cucumber, egg salad, smoked salmon)</li>
              <li>Freshly baked scones with Devonshire cream and preserves</li>
              <li>Selection of French pastries and mini desserts</li>
              <li>Your choice of premium loose-leaf tea or coffee</li>
            </ul>
          </div>
          <DroppingImage 
            src={highTeaPlatter} 
            alt="High Tea Platter" 
            delay={0.2}
            distance={150}
            className="high-tea-featured-image"
          />
        </div>
      </section>

      {/* Featured Dishes Section */}
      <section className="section">
        <h2 className="section-title">Featured Dishes</h2>
        
        <div className="features">
          {dishes.map((dish) => (
            <div 
              key={dish.id}
              className="feature-card"
              onMouseEnter={() => handleDishHover(dish.image)}
              onMouseLeave={handleDishLeave}
              onClick={() => handleDishHover(dish.image)}
            >
              <img 
                src={dish.thumbnail} 
                alt={dish.name}
              />
              <h3>{dish.name}</h3>
              <p>{dish.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Reviews Slider Section */}
      <section className="reviews-section">
        <h2>What Our Guests Say</h2>
        
        <div className="reviews-slider">
          {imagePaths.reviews.map((review, index) => (
            <div 
              key={index}
              className={`review-slide ${index === currentReviewIndex ? 'active' : ''}`}
            >
              <img 
                src={review} 
                alt={`Customer Review ${index + 1}`}
                onError={(e) => e.target.style.display = 'none'}
              />
            </div>
          ))}
        </div>
        
        <div className="reviews-dots">
          {imagePaths.reviews.map((_, index) => (
            <div 
              key={index}
              className={`reviews-dot ${index === currentReviewIndex ? 'active' : ''}`}
              onClick={() => handleDotClick(index)}
            />
          ))}
        </div>
      </section>

      {/* Social Media Footer */}
      <section className="social-footer">
        <div className="social-footer-container">
          <h2 className="social-footer-title">Follow Us</h2>
          <p className="social-footer-text">
            Stay connected with us on social media for daily specials, events, and more!
          </p>
          <div className="social-icons">
            <a href="https://www.facebook.com/EggsAndMoreCalgary/" className="social-icon" target="_blank" rel="noopener noreferrer">
              <FontAwesomeIcon icon={faFacebookF} />
            </a>
            <a href="https://www.instagram.com/eggsandmorene/" className="social-icon" target="_blank" rel="noopener noreferrer">
              <FontAwesomeIcon icon={faInstagram} />
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}