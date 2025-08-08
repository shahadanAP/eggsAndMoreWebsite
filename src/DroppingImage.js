import React, { useState, useEffect, useRef } from 'react';
import './DroppingImage.css'; // Make sure this import exists

const DroppingImage = ({ src, alt, delay = 0, duration = 0.8, distance = 100, className = '' }) => {
  const [isVisible, setIsVisible] = useState(false);
  const imageRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
      }
    );

    if (imageRef.current) {
      observer.observe(imageRef.current);
    }

    return () => {
      if (imageRef.current) {
        observer.unobserve(imageRef.current);
      }
    };
  }, []);

  return (
    <div 
      ref={imageRef}
      className={`dropping-image-wrapper ${className}`}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : `translateY(-${distance}px)`,
        transition: `opacity ${duration}s ease-out ${delay}s, transform ${duration}s ease-out ${delay}s`
      }}
    >
      <img 
        src={src} 
        alt={alt}
        className="dropping-image"
        onError={(e) => e.target.style.display = 'none'}
        loading="lazy"
      />
    </div>
  );
};

export default DroppingImage;