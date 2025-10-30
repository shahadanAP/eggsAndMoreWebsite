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
  const [isCarouselAutoRotating, setIsCarouselAutoRotating] = useState(true);
  const dishes = [
    {
      id: 1,
      name: "Eggs Benedict",
      description: "Perfectly poached eggs with rich hollandaise sauce",
      image: eggsBenedictImage,
      thumbnail: eggsBenedictImage
    },
    {
      id: 2,
      name: "Steak & Eggs",
      description: "Premium steak paired with farm-fresh eggs",
      image: pancakesImage,
      thumbnail: pancakesImage
    },
    {
      id: 3,
      name: "Steak Strips & Eggs",
      description: "Tender steak strips served with fluffy eggs",
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

  useEffect(() => {
    if (isCarouselAutoRotating) {
      const reviewInterval = setInterval(() => {
        setCurrentReviewIndex(prev => (prev + 1) % imagePaths.reviews.length);
      }, 4000);
      return () => clearInterval(reviewInterval);
    }
  }, [isCarouselAutoRotating]);

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
    setIsCarouselAutoRotating(false);
    setTimeout(() => setIsCarouselAutoRotating(true), 10000);
  };

  const handleCarouselNavigation = (direction) => {
    setIsCarouselAutoRotating(false);
    if (direction === 'next') {
      setCurrentReviewIndex((prev) => (prev + 1) % imagePaths.reviews.length);
    } else {
      setCurrentReviewIndex((prev) => (prev - 1 + imagePaths.reviews.length) % imagePaths.reviews.length);
    }
    setTimeout(() => setIsCarouselAutoRotating(true), 10000);
  };

  // Touch swipe support for carousel (mobile/tablet)
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const touchDeltaX = useRef(0);
  const isSwiping = useRef(false);

  const onCarouselTouchStart = (e) => {
    if (!e.touches || e.touches.length === 0) return;
    const t = e.touches[0];
    touchStartX.current = t.clientX;
    touchStartY.current = t.clientY;
    touchDeltaX.current = 0;
    isSwiping.current = false;
    // pause auto-rotate while user interacts
    setIsCarouselAutoRotating(false);
  };

  const onCarouselTouchMove = (e) => {
    if (!e.touches || e.touches.length === 0) return;
    const t = e.touches[0];
    const dx = t.clientX - touchStartX.current;
    const dy = t.clientY - touchStartY.current;
    // Only consider horizontal swipes and ignore small jitters
    if (!isSwiping.current) {
      if (Math.abs(dx) > 10 && Math.abs(dx) > Math.abs(dy)) {
        isSwiping.current = true;
        // Prevent the page from horizontally panning on some browsers
        e.preventDefault();
      } else {
        return;
      }
    }
    touchDeltaX.current = dx;
  };

  const onCarouselTouchEnd = () => {
    const threshold = 40; // minimum pixels to trigger a swipe
    const dx = touchDeltaX.current;
    let navigated = false;
    if (isSwiping.current) {
      if (dx <= -threshold) {
        // swipe left -> next
        handleCarouselNavigation('next');
        navigated = true;
      } else if (dx >= threshold) {
        // swipe right -> prev
        handleCarouselNavigation('prev');
        navigated = true;
      }
    }
    // if no navigation happened, resume auto-rotate shortly
    if (!navigated) {
      setTimeout(() => setIsCarouselAutoRotating(true), 5000);
    }
    isSwiping.current = false;
    touchDeltaX.current = 0;
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
          <p>Fresh ingredients, homemade recipes, served with love.</p>
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
          <h2>Our Culinary Creations</h2>
          <p>
            Each dish is carefully crafted to deliver an unforgettable dining experience. 
            Our talented chefs combine traditional techniques with innovative flair to create 
            visually stunning and deliciously flavorful masterpieces.
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
            <h2>Introducing Our High Tea Platter</h2>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '400', marginTop: '0.5rem', color: '#666' }}>Coming Soon</h3>
            <p>
              Experience our exquisite High Tea Platter featuring a delightful selection of finger sandwiches, 
              freshly baked scones with clotted cream and jam, and an assortment of delicate pastries and cakes. 
              Perfect for special occasions or an indulgent afternoon treat.
            </p>
          </div>
        </div>
        
        <div className="high-tea-image-container">
          <div className="high-tea-description">
            <h3>What's Included</h3>
            <ul>
              <li>Assorted finger sandwiches: cucumber, egg salad, and smoked salmon</li>
              <li>Freshly baked scones with Devonshire cream and preserves</li>
              <li>Selection of French pastries and mini desserts</li>
              <li>Your choice of premium loose-leaf tea or freshly brewed coffee</li>
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

      {/* Reviews Slider Section - 3D Carousel */}
      <section className="reviews-section">
        <h2>What Our Guests Say</h2>
        
        <div 
          className="carousel-3d-container"
          onTouchStart={onCarouselTouchStart}
          onTouchMove={onCarouselTouchMove}
          onTouchEnd={onCarouselTouchEnd}
          onTouchCancel={onCarouselTouchEnd}
        >
          <div className="carousel-3d">
            {imagePaths.reviews.map((review, index) => {
              // Calculate circular offset for seamless looping
              let offset = index - currentReviewIndex;
              const totalItems = imagePaths.reviews.length;
              
              // Adjust offset for circular loop (shortest path)
              if (offset > totalItems / 2) {
                offset -= totalItems;
              } else if (offset < -totalItems / 2) {
                offset += totalItems;
              }
              
              const absOffset = Math.abs(offset);
              
              // Adjust distances based on screen size
              const isMobile = window.innerWidth <= 576;
              const isSmallMobile = window.innerWidth <= 400;
              
              const distances = isSmallMobile 
                ? { center: 150, side: 110, far: 70 }
                : isMobile 
                  ? { center: 170, side: 125, far: 85 }
                  : { center: 350, side: 250, far: 150 };
              
              const scales = isSmallMobile || isMobile
                ? { center: 1, side: 0.55, far: 0.3 }
                : { center: 1, side: 0.75, far: 0.5 };
              
              return (
                <div 
                  key={index}
                  className={`carousel-3d-item ${index === currentReviewIndex ? 'active' : ''}`}
                  style={{
                    transform: `
                      rotateY(${offset * 60}deg) 
                      translateZ(${absOffset === 0 ? distances.center : absOffset === 1 ? distances.side : distances.far}px)
                      scale(${absOffset === 0 ? scales.center : absOffset === 1 ? scales.side : scales.far})
                      translate(-50%, -50%)
                    `,
                    opacity: absOffset > 2 ? 0 : 1,
                    zIndex: absOffset === 0 ? 10 : 10 - absOffset,
                  }}
                  onClick={(e) => {
                    // if a swipe just occurred, ignore the click to avoid accidental navigation
                    if (isSwiping.current || Math.abs(touchDeltaX.current) > 10) {
                      e.preventDefault();
                      e.stopPropagation();
                      return;
                    }
                    handleDotClick(index);
                  }}
                >
                  <img 
                    src={review} 
                    alt={`Customer Review ${index + 1}`}
                    onError={(e) => e.target.style.display = 'none'}
                  />
                </div>
              );
            })}
          </div>
          
          <button 
            className="carousel-3d-nav carousel-3d-prev" 
            onClick={() => handleCarouselNavigation('prev')}
            aria-label="Previous review"
          >
            ‹
          </button>
          <button 
            className="carousel-3d-nav carousel-3d-next" 
            onClick={() => handleCarouselNavigation('next')}
            aria-label="Next review"
          >
            ›
          </button>
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