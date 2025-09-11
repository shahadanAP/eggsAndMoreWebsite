import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import logo from './assets/eggsandmoreRajasCuisine.svg';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [showOrderOptions, setShowOrderOptions] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setScrollPosition(window.scrollY);
    };
    
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (!mobile) {
        setIsMenuOpen(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleResize);
    
    // Initial check
    handleResize();
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleOrderOptions = () => {
    setShowOrderOptions(!showOrderOptions);
  };

  return (
    <nav className={`navbar ${scrollPosition > 50 ? 'scrolled' : ''}`} style={{ backgroundColor: '#004d22' }}>
      <div className="nav-container">
        <div className="nav-left">
          <img 
            src={logo} 
            alt="Eggs & More Logo" 
            className="logo" 
            onClick={() => {
              navigate('/');
              setIsMenuOpen(false);
            }} 
            style={{ cursor: 'pointer' }} 
          />
        </div>
        
        {isMobile && (
          <button className="mobile-menu-button" onClick={toggleMenu} aria-label="Toggle menu">
            <span className={`bar ${isMenuOpen ? 'open' : ''}`}></span>
            <span className={`bar ${isMenuOpen ? 'open' : ''}`}></span>
            <span className={`bar ${isMenuOpen ? 'open' : ''}`}></span>
          </button>
        )}
        
        <ul className={`nav-links ${isMobile ? (isMenuOpen ? 'open' : '') : 'desktop'}`}>
          <li>
            <Link to="/" className="active" style={{ fontWeight: '700' }} onClick={() => setIsMenuOpen(false)}>
              Home
            </Link>
          </li>
          <li>
            <Link to="/menu" style={{ fontWeight: '700' }} onClick={() => setIsMenuOpen(false)}>
              Menu
            </Link>
          </li>
          <li>
            <Link to="/about" style={{ fontWeight: '700' }} onClick={() => setIsMenuOpen(false)}>
              About
            </Link>
          </li>
          <li>
            <Link to="/contact" style={{ fontWeight: '700' }} onClick={() => setIsMenuOpen(false)}>
              Contact
            </Link>
          </li>
          <li className="order-online-container">
            <button 
              onClick={toggleOrderOptions}
              className="nav-button" 
              style={{ fontWeight: '700' }}
            >
              Order Online {showOrderOptions ? '↑' : '↓'}
            </button>
            {showOrderOptions && (
              <div className="delivery-options">
                <a 
                  href="https://www.ubereats.com/ca/store/eggs-%26-more/Yta4G5n1WfKs53vmkG6lyg?srsltid=AfmBOoqbBM4bcVZycCDq-zExacLzZnKpFWtjvW72cfVn1HIE0SkbSZny" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Uber Eats
                </a>
                <a 
                  href="https://www.skipthedishes.com/eggs-and-more-falsbridge" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  onClick={() => setIsMenuOpen(false)}
                >
                  SkipTheDishes
                </a>
                <a 
                  href="https://www.doordash.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  onClick={() => setIsMenuOpen(false)}
                >
                  DoorDash
                </a>
                <a 
                  href="https://orders.iorders.online/rajas-cuisine-calgary" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  onClick={() => setIsMenuOpen(false)}
                >
                  iOrders
                </a>
              </div>
            )}
          </li>
        </ul>
      </div>
    </nav>
  );
}
