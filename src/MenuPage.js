import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './App.css';
import menuData from './menuData';

// Resolve API base URL from environment
const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export default function MenuPage() {
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState('breakfast');
  const [activeCategory, setActiveCategory] = useState('');
  const [dishRatings, setDishRatings] = useState({});
  const [loadingRatings, setLoadingRatings] = useState(true);
  const [scrollY, setScrollY] = useState(0);

  // Parallax scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch all ratings from backend
  useEffect(() => {
    const fetchRatings = async () => {
      try {
        setLoadingRatings(true);
        const response = await axios.get(`${API_BASE}/api/ratings`);
        
        const ratingsMap = {};
        response.data.forEach(rating => {
          if (!ratingsMap[rating.dishName]) {
            ratingsMap[rating.dishName] = {
              total: rating.rating,
              count: 1,
              average: rating.rating
            };
          } else {
            ratingsMap[rating.dishName].total += rating.rating;
            ratingsMap[rating.dishName].count += 1;
            ratingsMap[rating.dishName].average = 
              ratingsMap[rating.dishName].total / ratingsMap[rating.dishName].count;
          }
        });
        
        setDishRatings(ratingsMap);
      } catch (error) {
        console.error('Error fetching ratings:', error);
      } finally {
        setLoadingRatings(false);
      }
    };
    fetchRatings();
  }, []);

  // Rating display component
  const renderRating = (dishName) => {
    if (loadingRatings) {
      return <div className="loading-ratings">Loading ratings...</div>;
    }

    const ratingKey = Object.keys(dishRatings).find(
      key => key.toLowerCase() === dishName.toLowerCase()
    );

    const ratingData = ratingKey ? dishRatings[ratingKey] : null;
    
    if (!ratingData) {
      return <div className="no-ratings">No ratings yet</div>;
    }

    const avgRating = ratingData.average;
    const fullStars = Math.floor(avgRating);
    const hasHalfStar = avgRating % 1 >= 0.5;
    
    return (
      <div className="rating-display">
        {[...Array(5)].map((_, i) => {
          if (i < fullStars) {
            return <span key={i} className="star filled">★</span>;
          } else if (i === fullStars && hasHalfStar) {
            return <span key={i} className="star half">½</span>;
          } else {
            return <span key={i} className="star empty">★</span>;
          }
        })}
        <span className="rating-value">({avgRating.toFixed(1)})</span>
      </div>
    );
  };

  

  // Menu data imported from menuData.js

  return (
    <div className="menu-page">
      {/* Parallax Background Decorations */}
      <div className="menu-bg-decorations">
        <div 
          className="menu-bg-shape menu-bg-circle-1" 
          style={{ transform: `translateY(${scrollY * 0.05}px)` }}
        />
        <div 
          className="menu-bg-shape menu-bg-circle-2" 
          style={{ transform: `translateY(${scrollY * -0.03}px)` }}
        />
        <div 
          className="menu-bg-shape menu-bg-leaf-1" 
          style={{ transform: `translateY(${scrollY * 0.08}px) rotate(${scrollY * 0.02}deg)` }}
        />
        <div 
          className="menu-bg-shape menu-bg-leaf-2" 
          style={{ transform: `translateY(${scrollY * -0.06}px) rotate(${-scrollY * 0.015}deg)` }}
        />
        <div 
          className="menu-bg-shape menu-bg-dots" 
          style={{ transform: `translateY(${scrollY * 0.04}px)` }}
        />
        <div 
          className="menu-bg-shape menu-bg-ring" 
          style={{ transform: `translateY(${scrollY * -0.02}px)` }}
        />
      </div>

      <main className="menu-content">
        {/* Header Section */}
        <section className="menu-header">
          <div className="menu-title-border">
            <h3>OUR MENU</h3>
          </div>
        </section>

        {/* Menu Selection */}
        <section className="menu-selection">
          <div className="menu-options">
            <button 
              className={`menu-option ${activeMenu === 'breakfast' ? 'active' : ''}`}
              onClick={() => {
                setActiveMenu('breakfast');
                setActiveCategory('');
              }}
            >
              Breakfast & Brunch
            </button>
            <button 
              className={`menu-option ${activeMenu === 'main' ? 'active' : ''}`}
              onClick={() => {
                setActiveMenu('main');
                setActiveCategory('');
              }}
            >
              Main Menu
            </button>
            <button 
              className={`menu-option ${activeMenu === 'drinks' ? 'active' : ''}`}
              onClick={() => {
                setActiveMenu('drinks');
                setActiveCategory('');
              }}
            >
              Drinks
            </button>
            <button
              className={`menu-option ${activeMenu === 'eastern' ? 'active' : ''}`}
              onClick={() => {
                setActiveMenu('eastern');
                setActiveCategory('');
              }}
            >
              Eastern Menu
            </button>
          </div>
        </section>

        {/* Categories */}
        <div className="category-buttons">
          {Object.keys(menuData[activeMenu]).map(category => (
            <button
              key={category}
              className={`category-button ${activeCategory === category ? 'active' : ''}`}
              onClick={() => setActiveCategory(activeCategory === category ? '' : category)}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Menu Items */}
        <div className="menu-items-container">
          {activeCategory ? (
            <div className="menu-category">
              {/* Check if this is a special section */}
              {menuData[activeMenu][activeCategory]?.isSpecialSection ? (
                <div className="special-section">
                  <div className="special-section-header">
                    <div className="special-header-title">
                      <h2>{activeCategory}</h2>
                      <span className="header-price">${menuData[activeMenu][activeCategory].headerPrice}</span>
                    </div>
                    {menuData[activeMenu][activeCategory].headerNote && (
                      <p className="header-note">{menuData[activeMenu][activeCategory].headerNote}</p>
                    )}
                    {menuData[activeMenu][activeCategory].headerDescription && (
                      <p className="header-description">{menuData[activeMenu][activeCategory].headerDescription}</p>
                    )}
                  </div>
                  
                  {/* Side Options Grid */}
                  {menuData[activeMenu][activeCategory].sideOptions && (
                    <div className="side-options-grid">
                      {menuData[activeMenu][activeCategory].sideOptions.map((option, index) => (
                        <div key={index} className="side-option">
                          <span className="option-name">{option.name}</span>
                          {option.surcharge && <span className="option-surcharge">{option.surcharge}</span>}
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Special Items */}
                  {menuData[activeMenu][activeCategory].specialItems && (
                    <div className="items-grid special-items">
                      {menuData[activeMenu][activeCategory].specialItems.map((item, index) => (
                        <div 
                          key={index} 
                          className="menu-item special-item"
                          onClick={() => navigate(`/menu/rate/${activeMenu}/${activeCategory}/${encodeURIComponent(item.name)}`)}
                        >
                          <div className="special-item-header">
                            <h3>{item.name}</h3>
                            <div className="price">${item.price}</div>
                          </div>
                          {item.description && <p>{item.description}</p>}
                          {renderRating(item.name)}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <h2>{activeCategory}</h2>
                  <div className="items-grid">
                    {menuData[activeMenu][activeCategory].map((item, index) => (
                      <div 
                        key={index} 
                        className="menu-item"
                        onClick={() => navigate(`/menu/rate/${activeMenu}/${activeCategory}/${encodeURIComponent(item.name)}`)}
                      >
                        <div className="item-image-placeholder">
                          [Image]
                        </div>
                        <h3>{item.name}</h3>
                        {item.description && <p>{item.description}</p>}
                        <div className="price-rating-container">
                          <div className="price">${item.price}</div>
                          {renderRating(item.name)}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          ) : (
            Object.keys(menuData[activeMenu]).map(category => {
              const categoryData = menuData[activeMenu][category];
              const isSpecial = categoryData?.isSpecialSection;
              
              return (
                <div key={category} className="menu-category">
                  {isSpecial ? (
                    <div className="special-section">
                      <div className="special-section-header">
                        <div className="special-header-title">
                          <h2>{category}</h2>
                          <span className="header-price">${categoryData.headerPrice}</span>
                        </div>
                        {categoryData.headerNote && (
                          <p className="header-note">{categoryData.headerNote}</p>
                        )}
                        {categoryData.headerDescription && (
                          <p className="header-description">{categoryData.headerDescription}</p>
                        )}
                      </div>
                      
                      {/* Side Options Grid */}
                      {categoryData.sideOptions && (
                        <div className="side-options-grid">
                          {categoryData.sideOptions.map((option, index) => (
                            <div key={index} className="side-option">
                              <span className="option-name">{option.name}</span>
                              {option.surcharge && <span className="option-surcharge">{option.surcharge}</span>}
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {/* Special Items */}
                      {categoryData.specialItems && (
                        <div className="items-grid special-items">
                          {categoryData.specialItems.map((item, index) => (
                            <div 
                              key={index} 
                              className="menu-item special-item"
                              onClick={() => navigate(`/menu/rate/${activeMenu}/${category}/${encodeURIComponent(item.name)}`)}
                            >
                              <div className="special-item-header">
                                <h3>{item.name}</h3>
                                <div className="price">${item.price}</div>
                              </div>
                              {item.description && <p>{item.description}</p>}
                              {renderRating(item.name)}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <>
                      <h2>{category}</h2>
                      <div className="items-grid">
                        {categoryData.map((item, index) => (
                          <div 
                            key={index} 
                            className="menu-item"
                            onClick={() => navigate(`/menu/rate/${activeMenu}/${category}/${encodeURIComponent(item.name)}`)}
                          >
                            <div className="item-image-placeholder">
                              [Image]
                            </div>
                            <h3>{item.name}</h3>
                            {item.description && <p>{item.description}</p>}
                            <div className="price-rating-container">
                              <div className="price">${item.price}</div>
                              {renderRating(item.name)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              );
            })
          )}
        </div>
      </main>
    </div>
  );
}