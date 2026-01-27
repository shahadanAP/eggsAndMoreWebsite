import React, { useState, useEffect, useMemo, useRef } from 'react';
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
  const [searchQuery, setSearchQuery] = useState('');
  const [priceFilter, setPriceFilter] = useState('all');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchInputRef = useRef(null);

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

  // Keyboard shortcut for search (Ctrl/Cmd + K)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      if (e.key === 'Escape' && isSearchFocused) {
        setSearchQuery('');
        searchInputRef.current?.blur();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchFocused]);

  useEffect(() => {
    if (searchQuery) {
      setActiveCategory('');
    }
  }, [searchQuery]);

  // Filter and search logic
  const filteredMenuData = useMemo(() => {
    const menuLabels = {
      breakfast: 'Breakfast & Brunch',
      main: 'Main Menu',
      drinks: 'Drinks',
      eastern: 'Eastern Menu',
      kids: 'Kids Menu',
      seniors: '55+ Seniors'
    };

    const query = searchQuery.toLowerCase().trim();
    const filtered = {};
    const menusToSearch = query
      ? Object.entries(menuData)
      : [[activeMenu, menuData[activeMenu]]];

    const matchesPriceFilter = (item) => {
      if (priceFilter === 'all' || !item.price) return true;
      const price = parseFloat(item.price);
      if (priceFilter === 'under10') return price < 10;
      if (priceFilter === '10to15') return price >= 10 && price <= 15;
      if (priceFilter === '15to20') return price > 15 && price <= 20;
      if (priceFilter === 'over20') return price > 20;
      return true;
    };

    menusToSearch.forEach(([menuKey, menu]) => {
      if (!menu) return;
      const menuLabel = menuLabels[menuKey] || menuKey;

      Object.entries(menu).forEach(([category, items]) => {
        const categoryLabel = query ? `${menuLabel} — ${category}` : category;
      if (Array.isArray(items)) {
        const filteredItems = items.filter(item => {
          // Search filter
          const matchesSearch = !query || 
            item.name.toLowerCase().includes(query) ||
            (item.description && item.description.toLowerCase().includes(query));
          
          // Price filter
          let matchesPrice = true;
          if (priceFilter !== 'all' && item.price) {
            const price = parseFloat(item.price);
            if (priceFilter === 'under10') matchesPrice = price < 10;
            else if (priceFilter === '10to15') matchesPrice = price >= 10 && price <= 15;
            else if (priceFilter === '15to20') matchesPrice = price > 15 && price <= 20;
            else if (priceFilter === 'over20') matchesPrice = price > 20;
          }
          
          return matchesSearch && matchesPrice;
        });
        
        if (filteredItems.length > 0) {
          filtered[categoryLabel] = filteredItems;
        }
      } else if (items && items.isSpecialSection) {
        const categoryMatches = query && category.toLowerCase().includes(query);
        const headerMatches = query && (
          (items.headerDescription && items.headerDescription.toLowerCase().includes(query)) ||
          (items.headerNote && items.headerNote.toLowerCase().includes(query))
        );

        const filteredSpecialItems = (items.specialItems || []).filter(item => {
          const matchesSearch = !query ||
            item.name.toLowerCase().includes(query) ||
            (item.description && item.description.toLowerCase().includes(query));
          return matchesSearch && matchesPriceFilter(item);
        });

        const filteredSideOptions = (items.sideOptions || []).filter(option =>
          !query || option.name.toLowerCase().includes(query)
        );

        const includeSection = query
          ? (categoryMatches || headerMatches || filteredSpecialItems.length > 0 || filteredSideOptions.length > 0)
          : (priceFilter === 'all' ? true : filteredSpecialItems.length > 0);

        if (includeSection) {
          if (!query) {
            filtered[categoryLabel] = priceFilter === 'all'
              ? items
              : { ...items, specialItems: filteredSpecialItems };
          } else if (categoryMatches || headerMatches) {
            filtered[categoryLabel] = priceFilter === 'all'
              ? items
              : { ...items, specialItems: filteredSpecialItems };
          } else {
            filtered[categoryLabel] = {
              ...items,
              ...(filteredSpecialItems.length > 0 ? { specialItems: filteredSpecialItems } : {}),
              ...(filteredSideOptions.length > 0 ? { sideOptions: filteredSideOptions } : {})
            };
          }
        }
      }
      });
    });

    return filtered;
  }, [activeMenu, searchQuery, priceFilter]);

  // Count total results
  const resultCount = useMemo(() => {
    let count = 0;
    Object.values(filteredMenuData).forEach(items => {
      if (Array.isArray(items)) {
        count += items.length;
      }
    });
    return count;
  }, [filteredMenuData]);

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery('');
    setPriceFilter('all');
    setActiveCategory('');
  };

  // Rating display component
  const renderRating = (dishName) => {
    if (loadingRatings) {
      return <div className="loading-ratings" aria-live="polite">Loading ratings...</div>;
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
      <div className="rating-display" role="img" aria-label={`Rating: ${avgRating.toFixed(1)} out of 5 stars`}>
        {[...Array(5)].map((_, i) => {
          if (i < fullStars) {
            return <span key={i} className="star filled" aria-hidden="true">★</span>;
          } else if (i === fullStars && hasHalfStar) {
            return <span key={i} className="star half" aria-hidden="true">½</span>;
          } else {
            return <span key={i} className="star empty" aria-hidden="true">★</span>;
          }
        })}
        <span className="rating-value">({avgRating.toFixed(1)})</span>
      </div>
    );
  };

  const highlightText = (text) => {
    if (!searchQuery || !text) return text;
    const escapedQuery = searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escapedQuery})`, 'ig');
    return text.split(regex).map((part, index) => {
      if (part.toLowerCase() === searchQuery.toLowerCase()) {
        return <mark key={`${part}-${index}`} className="search-highlight">{part}</mark>;
      }
      return part;
    });
  };

  // Check if filters are active
  const hasActiveFilters = searchQuery || priceFilter !== 'all';

  return (
    <div className="menu-page" role="main">
      {/* Skip to content link for accessibility */}
      <a href="#menu-items" className="skip-link">Skip to menu items</a>
      
      {/* Parallax Background Decorations */}
      <div className="menu-bg-decorations" aria-hidden="true">
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
        <section className="menu-header" aria-labelledby="menu-heading">
          <div className="menu-title-border">
            <h1 id="menu-heading" className="sr-only">Our Menu</h1>
            <h3 aria-hidden="true">OUR MENU</h3>
          </div>
        </section>

        {/* Search and Filter Section */}
        <section className="menu-search-section" aria-label="Search and filter menu">
          <div className="search-container">
            <div className={`search-input-wrapper ${isSearchFocused ? 'focused' : ''}`}>
              <span className="search-icon" aria-hidden="true">🔍</span>
              <input
                ref={searchInputRef}
                type="search"
                className="menu-search-input"
                placeholder="Search menu items... (Ctrl+K)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
                aria-label="Search menu items"
                aria-describedby="search-hint"
              />
              {searchQuery && (
                <button 
                  className="search-clear-btn"
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear search"
                >
                  ✕
                </button>
              )}
            </div>
            <span id="search-hint" className="sr-only">
              Press Ctrl+K to focus search. Press Escape to clear.
            </span>
          </div>
          
          <div className="filter-container">
            <label htmlFor="price-filter" className="filter-label">
              <span aria-hidden="true">💰</span> Price Range:
            </label>
            <select 
              id="price-filter"
              className="price-filter-select"
              value={priceFilter}
              onChange={(e) => setPriceFilter(e.target.value)}
              aria-label="Filter by price range"
            >
              <option value="all">All Prices</option>
              <option value="under10">Under $10</option>
              <option value="10to15">$10 - $15</option>
              <option value="15to20">$15 - $20</option>
              <option value="over20">Over $20</option>
            </select>
          </div>

          {hasActiveFilters && (
            <div className="filter-results">
              <span className="results-count" aria-live="polite">
                {resultCount} {resultCount === 1 ? 'item' : 'items'} found
              </span>
              <button 
                className="clear-filters-btn"
                onClick={clearFilters}
                aria-label="Clear all filters"
              >
                Clear Filters ✕
              </button>
            </div>
          )}
        </section>

        {/* Menu Selection */}
        <section className="menu-selection" aria-label="Menu categories">
          <nav className="menu-options" role="tablist" aria-label="Menu type selection">
            <button 
              className={`menu-option ${activeMenu === 'breakfast' ? 'active' : ''}`}
              onClick={() => {
                setActiveMenu('breakfast');
                setActiveCategory('');
                clearFilters();
              }}
              role="tab"
              aria-selected={activeMenu === 'breakfast'}
              aria-controls="menu-items"
            >
              Breakfast & Brunch
            </button>
            <button 
              className={`menu-option ${activeMenu === 'main' ? 'active' : ''}`}
              onClick={() => {
                setActiveMenu('main');
                setActiveCategory('');
                clearFilters();
              }}
              role="tab"
              aria-selected={activeMenu === 'main'}
              aria-controls="menu-items"
            >
              Main Menu
            </button>
            <button 
              className={`menu-option ${activeMenu === 'drinks' ? 'active' : ''}`}
              onClick={() => {
                setActiveMenu('drinks');
                setActiveCategory('');
                clearFilters();
              }}
              role="tab"
              aria-selected={activeMenu === 'drinks'}
              aria-controls="menu-items"
            >
              Drinks
            </button>
            <button
              className={`menu-option ${activeMenu === 'eastern' ? 'active' : ''}`}
              onClick={() => {
                setActiveMenu('eastern');
                setActiveCategory('');
                clearFilters();
              }}
              role="tab"
              aria-selected={activeMenu === 'eastern'}
              aria-controls="menu-items"
            >
              Eastern Menu
            </button>
            <button
              className={`menu-option ${activeMenu === 'kids' ? 'active' : ''}`}
              onClick={() => {
                setActiveMenu('kids');
                setActiveCategory('');
                clearFilters();
              }}
              role="tab"
              aria-selected={activeMenu === 'kids'}
              aria-controls="menu-items"
            >
              Kids Menu
            </button>
            <button
              className={`menu-option ${activeMenu === 'seniors' ? 'active' : ''}`}
              onClick={() => {
                setActiveMenu('seniors');
                setActiveCategory('');
                clearFilters();
              }}
              role="tab"
              aria-selected={activeMenu === 'seniors'}
              aria-controls="menu-items"
            >
              55+ Seniors
            </button>
          </nav>
        </section>

        {/* Categories */}
        <nav className="category-buttons" aria-label="Menu subcategories">
          {Object.keys(filteredMenuData).length > 0 ? (
            Object.keys(filteredMenuData).map(category => (
              <button
                key={category}
                className={`category-button ${activeCategory === category ? 'active' : ''}`}
                onClick={() => setActiveCategory(activeCategory === category ? '' : category)}
                aria-pressed={activeCategory === category}
              >
                {category}
              </button>
            ))
          ) : (
            <p className="no-results-message">No items match your search criteria.</p>
          )}
        </nav>

        {/* Menu Items */}
        <div className="menu-items-container" id="menu-items" role="tabpanel">
          {Object.keys(filteredMenuData).length === 0 && hasActiveFilters ? (
            <div className="no-results">
              <span className="no-results-icon" aria-hidden="true">🍳</span>
              <h3>No items found</h3>
              <p>Try adjusting your search or filters</p>
              <button className="clear-filters-btn large" onClick={clearFilters}>
                Clear All Filters
              </button>
            </div>
          ) : activeCategory ? (
            <div className="menu-category">
              {/* Check if this is a special section */}
              {filteredMenuData[activeCategory]?.isSpecialSection ? (
                <div className="special-section">
                  <div className="special-section-header">
                    <div className="special-header-title">
                      <h2>{highlightText(activeCategory)}</h2>
                      <span className="header-price">${filteredMenuData[activeCategory].headerPrice}</span>
                    </div>
                    {filteredMenuData[activeCategory].headerNote && (
                      <p className="header-note">{highlightText(filteredMenuData[activeCategory].headerNote)}</p>
                    )}
                    {filteredMenuData[activeCategory].headerDescription && (
                      <p className="header-description">{highlightText(filteredMenuData[activeCategory].headerDescription)}</p>
                    )}
                  </div>
                  
                  {/* Side Options Grid */}
                  {filteredMenuData[activeCategory].sideOptions && (
                    <div className="side-options-grid">
                      {filteredMenuData[activeCategory].sideOptions.map((option, index) => (
                        <div key={index} className="side-option">
                          <span className="option-name">{highlightText(option.name)}</span>
                          {option.surcharge && <span className="option-surcharge">{option.surcharge}</span>}
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Special Items */}
                  {filteredMenuData[activeCategory].specialItems && (
                    <div className="items-grid special-items">
                      {filteredMenuData[activeCategory].specialItems.map((item, index) => (
                        <div 
                          key={index} 
                          className="menu-item special-item"
                          onClick={() => navigate(`/menu/rate/${activeMenu}/${activeCategory}/${encodeURIComponent(item.name)}`)}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => e.key === 'Enter' && navigate(`/menu/rate/${activeMenu}/${activeCategory}/${encodeURIComponent(item.name)}`)}
                        >
                          <div className="special-item-header">
                            <h3>{highlightText(item.name)}</h3>
                            <div className="price">${item.price}</div>
                          </div>
                          {item.description && <p>{highlightText(item.description)}</p>}
                          {renderRating(item.name)}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : filteredMenuData[activeCategory] ? (
                <>
                  <h2>{highlightText(activeCategory)}</h2>
                  <div className="items-grid">
                    {filteredMenuData[activeCategory].map((item, index) => (
                      <div 
                        key={index} 
                        className="menu-item"
                        onClick={() => navigate(`/menu/rate/${activeMenu}/${activeCategory}/${encodeURIComponent(item.name)}`)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => e.key === 'Enter' && navigate(`/menu/rate/${activeMenu}/${activeCategory}/${encodeURIComponent(item.name)}`)}
                      >
                        <div className="item-image-placeholder" aria-hidden="true">
                          🍳
                        </div>
                        <h3>{highlightText(item.name)}</h3>
                        {item.description && <p>{highlightText(item.description)}</p>}
                        <div className="price-rating-container">
                          <div className="price">${item.price}</div>
                          {renderRating(item.name)}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : null}
            </div>
          ) : (
            Object.keys(filteredMenuData).map(category => {
              const categoryData = filteredMenuData[category];
              const isSpecial = categoryData?.isSpecialSection;
              
              return (
                <article key={category} className="menu-category" aria-labelledby={`category-${category.replace(/\s+/g, '-')}`}>
                  {isSpecial ? (
                    <div className="special-section">
                      <div className="special-section-header">
                        <div className="special-header-title">
                          <h2 id={`category-${category.replace(/\s+/g, '-')}`}>{highlightText(category)}</h2>
                          <span className="header-price">${categoryData.headerPrice}</span>
                        </div>
                        {categoryData.headerNote && (
                          <p className="header-note">{highlightText(categoryData.headerNote)}</p>
                        )}
                        {categoryData.headerDescription && (
                          <p className="header-description">{highlightText(categoryData.headerDescription)}</p>
                        )}
                      </div>
                      
                      {/* Side Options Grid */}
                      {categoryData.sideOptions && (
                        <div className="side-options-grid" role="list">
                          {categoryData.sideOptions.map((option, index) => (
                            <div key={index} className="side-option" role="listitem">
                              <span className="option-name">{highlightText(option.name)}</span>
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
                              role="button"
                              tabIndex={0}
                              onKeyDown={(e) => e.key === 'Enter' && navigate(`/menu/rate/${activeMenu}/${category}/${encodeURIComponent(item.name)}`)}
                            >
                              <div className="special-item-header">
                                <h3>{highlightText(item.name)}</h3>
                                <div className="price">${item.price}</div>
                              </div>
                              {item.description && <p>{highlightText(item.description)}</p>}
                              {renderRating(item.name)}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <>
                      <h2 id={`category-${category.replace(/\s+/g, '-')}`}>{highlightText(category)}</h2>
                      <div className="items-grid">
                        {categoryData.map((item, index) => (
                          <div 
                            key={index} 
                            className="menu-item"
                            onClick={() => navigate(`/menu/rate/${activeMenu}/${category}/${encodeURIComponent(item.name)}`)}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => e.key === 'Enter' && navigate(`/menu/rate/${activeMenu}/${category}/${encodeURIComponent(item.name)}`)}
                          >
                            <div className="item-image-placeholder" aria-hidden="true">
                              🍳
                            </div>
                            <h3>{highlightText(item.name)}</h3>
                            {item.description && <p>{highlightText(item.description)}</p>}
                            <div className="price-rating-container">
                              <div className="price">${item.price}</div>
                              {renderRating(item.name)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </article>
              );
            })
          )}
        </div>
      </main>
    </div>
  );
}