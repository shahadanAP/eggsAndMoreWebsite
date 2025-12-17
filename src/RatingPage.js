import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import menuData from './menuData';
import axios from 'axios';
import './App.css';

// Resolve API base URL from environment, with a sensible local fallback for development
const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function RatingPage() {
  const { menuType, category, itemName } = useParams();
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [hasRated, setHasRated] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);
  const [averageRating, setAverageRating] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [existingRating, setExistingRating] = useState(null);
  const [feedbacks, setFeedbacks] = useState([]);
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [showAllFeedback, setShowAllFeedback] = useState(false);

  // Decode the item name from URL
  const decodedItemName = decodeURIComponent(itemName);
  
  // Generate or retrieve user identifier
  const getUserIdentifier = () => {
    let identifier = localStorage.getItem('userIdentifier');
    if (!identifier) {
      identifier = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      localStorage.setItem('userIdentifier', identifier);
    }
    return identifier;
  };

  // Find the menu item - handle both regular arrays and special sections
  const categoryItems = menuData[menuType]?.[category];
  let item = null;
  
  if (categoryItems?.isSpecialSection) {
    // Special section - search in specialItems array
    item = categoryItems.specialItems?.find(item => item.name === decodedItemName);
  } else if (Array.isArray(categoryItems)) {
    // Regular category array
    item = categoryItems.find(item => item.name === decodedItemName);
  }

  // Fetch average rating and check for existing rating
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Get average rating
        const avgResponse = await axios.get(
          `${API_BASE}/api/ratings/${encodeURIComponent(decodedItemName)}`
        );
        setAverageRating(avgResponse.data.average);
        
        // Check if user already rated
        const existingResponse = await axios.get(
          `${API_BASE}/api/ratings/${encodeURIComponent(decodedItemName)}/${getUserIdentifier()}`
        );
        
        if (existingResponse.data.exists) {
          setExistingRating(existingResponse.data.rating);
          setRating(existingResponse.data.rating.rating);
          setFeedback(existingResponse.data.rating.feedback);
          setHasRated(true); // Show thank you message if returning user
        }
        
        setError(null);
      } catch (err) {
        setError('Failed to load rating data');
        console.error('Error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [decodedItemName]);

  // Fetch recent/all feedback for this dish
  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setFeedbackLoading(true);
        const detailsRes = await axios.get(
          `${API_BASE}/api/ratings-details/${encodeURIComponent(decodedItemName)}`
        );
        // Already sorted by updatedAt desc on backend
        setFeedbacks(detailsRes.data.ratings || []);
      } catch (err) {
        console.error('Failed to load feedback list:', err);
      } finally {
        setFeedbackLoading(false);
      }
    };

    fetchDetails();
  }, [decodedItemName]);

  if (!item) {
    return (
      <div className="error-message" style={{ textAlign: 'center', padding: '2rem' }}>
        <h2>Item not found</h2>
        <Link to="/menu" className="back-to-menu">
          Back to Menu
        </Link>
      </div>
    );
  }

  const handleSubmitRating = async () => {
    try {
      setIsLoading(true);
      const response = await axios.post(`${API_BASE}/api/ratings`, {
        dishName: decodedItemName,
        rating,
        feedback,
        userIdentifier: getUserIdentifier()
      });
      
      setAverageRating(response.data.average);
      setHasRated(true);
      setExistingRating({ rating, feedback });
      setError(null);
      // Refresh feedbacks after submit/update
      try {
        const detailsRes = await axios.get(
          `${API_BASE}/api/ratings-details/${encodeURIComponent(decodedItemName)}`
        );
        setFeedbacks(detailsRes.data.ratings || []);
      } catch {}
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit rating. Please try again.');
      console.error('Error submitting rating:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditRating = () => {
    setHasRated(false); // Allow user to edit their rating
  };

  return (
    <main className="main-content" style={{ paddingTop: '90px' }}>
      <div className="rating-page">
        <div className="dish-header" style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h2 style={{ color: 'var(--accent-color)', marginBottom: '0.5rem' }}>{decodedItemName}</h2>
          {item.description && <p style={{ color: 'var(--text-color)', marginBottom: '1rem' }}>{item.description}</p>}
          <div className="price" style={{ 
            color: 'var(--primary-color)',
            fontWeight: 'bold',
            fontSize: '1.2rem',
            marginBottom: '1rem'
          }}>
            ${item.price}
          </div>
          
          <div className="item-image-placeholder" style={{
            width: '200px',
            height: '200px',
            margin: '0 auto',
            backgroundColor: '#e0e0e0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#999',
            borderRadius: '10px',
            marginBottom: '1.5rem'
          }}>
            [Dish Image]
          </div>
          
          {!isLoading && averageRating && (
            <div style={{ 
              marginBottom: '1.5rem',
              fontSize: '1.1rem',
              color: 'var(--accent-color)'
            }}>
              Average Rating: <strong>{averageRating.toFixed(1)}/5</strong>
              <span style={{ marginLeft: '1rem', color: 'var(--text-color)', fontSize: '0.9rem' }}>
                ({Math.round(averageRating * 2) / 2} stars)
              </span>
            </div>
          )}
        </div>

        {error && (
          <div style={{ 
            color: 'red',
            textAlign: 'center',
            marginBottom: '1rem',
            padding: '0.5rem',
            backgroundColor: '#ffeeee',
            borderRadius: '4px'
          }}>
            {error}
          </div>
        )}

        {/* Recent Feedback Section */}
        <div className="feedback-section" style={{ maxWidth: '800px', margin: '0 auto 2rem' }}>
          <h3 style={{ color: 'var(--accent-color)', marginBottom: '0.75rem', textAlign: 'center' }}>
            Recent customer feedback
          </h3>
          {feedbackLoading ? (
            <div style={{ textAlign: 'center', color: 'var(--text-color)' }}>Loading feedback…</div>
          ) : feedbacks.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--text-color)' }}>No feedback yet</div>
          ) : (
            <>
              {(() => {
                const nonEmpty = feedbacks.filter(f => (f.feedback || '').trim().length > 0);
                const toShow = (showAllFeedback ? feedbacks : (nonEmpty.length ? nonEmpty : feedbacks)).slice(0, showAllFeedback ? feedbacks.length : 3);
                const renderStars = (val) => (
                  <span>
                    {[1,2,3,4,5].map(i => (
                      <span key={i} style={{ color: i <= val ? 'goldenrod' : '#ccc' }}>★</span>
                    ))}
                  </span>
                );
                return (
                  <div>
                    {toShow.map((r, idx) => (
                      <div key={r._id || idx} style={{
                        background: 'white',
                        borderRadius: '8px',
                        padding: '1rem',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
                        marginBottom: '0.75rem'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div style={{ fontWeight: 600, color: 'var(--accent-color)' }}>
                            {renderStars(r.rating)} <span style={{ marginLeft: 8, color: 'var(--text-color)' }}>({r.rating}/5)</span>
                          </div>
                          <div style={{ color: '#777', fontSize: 12 }}>
                            {r.updatedAt ? new Date(r.updatedAt).toLocaleString() : ''}
                          </div>
                        </div>
                        <div style={{ marginTop: '0.5rem', color: 'var(--text-color)' }}>
                          {(r.feedback && r.feedback.trim()) ? r.feedback : <em>No comment provided</em>}
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
              <div style={{ textAlign: 'center', marginTop: '0.5rem' }}>
                <button
                  onClick={() => setShowAllFeedback(v => !v)}
                  style={{
                    padding: '0.6rem 1.2rem',
                    background: 'transparent',
                    border: '2px solid var(--accent-color)',
                    color: 'var(--accent-color)',
                    borderRadius: 6,
                    cursor: 'pointer',
                    fontWeight: 600
                  }}
                >
                  {showAllFeedback ? 'Show less' : 'View all feedback'}
                </button>
              </div>
            </>
          )}
        </div>

        {hasRated ? (
          <div className="thank-you-message" style={{ 
            textAlign: 'center',
            padding: '2rem',
            backgroundColor: 'white',
            borderRadius: '10px',
            boxShadow: '0 3px 10px rgba(0,0,0,0.1)',
            maxWidth: '600px',
            margin: '0 auto'
          }}>
            <h3 style={{ 
              color: 'var(--accent-color)',
              marginBottom: '1rem'
            }}>
              {existingRating ? 'Rating Updated!' : 'Thank you for your feedback!'}
            </h3>
            <p style={{ marginBottom: '0.5rem' }}>
              You rated this dish <strong>{rating}/5</strong>
            </p>
            {feedback && (
              <p style={{ marginBottom: '1.5rem', fontStyle: 'italic' }}>
                "{feedback}"
              </p>
            )}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
              <button 
                onClick={handleEditRating}
                style={{
                  padding: '0.8rem 1.5rem',
                  background: 'transparent',
                  color: 'var(--accent-color)',
                  border: '2px solid var(--accent-color)',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                Edit Rating
              </button>
              <Link 
                to="/menu" 
                className="back-to-menu"
                style={{
                  padding: '0.8rem 1.5rem',
                  background: 'var(--accent-color)',
                  color: 'white',
                  textDecoration: 'none',
                  borderRadius: '5px',
                  transition: 'background 0.2s ease'
                }}
              >
                Back to Menu
              </Link>
            </div>
          </div>
        ) : (
          <div className="rating-form" style={{ 
            maxWidth: '600px',
            margin: '0 auto',
            padding: '2rem',
            backgroundColor: 'white',
            borderRadius: '10px',
            boxShadow: '0 3px 10px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ 
              textAlign: 'center',
              color: 'var(--accent-color)',
              marginBottom: '1.5rem'
            }}>
              {existingRating ? 'Update Your Rating' : 'Rate this dish'}
            </h3>
            
            {existingRating && (
              <p style={{ textAlign: 'center', marginBottom: '1rem', color: 'var(--text-color)' }}>
                You previously rated this dish {existingRating.rating}/5
              </p>
            )}
            
            <div className="rating-stars" style={{ 
              display: 'flex',
              justifyContent: 'center',
              gap: '0.5rem',
              margin: '1.5rem 0'
            }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  className={`star ${rating >= star ? 'active' : ''}`}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  style={{
                    borderRadius: '50%',
                    border: '2px solid var(--accent-color)',
                    background: (hoverRating >= star || rating >= star) ? 'var(--accent-color)' : 'white',
                    color: (hoverRating >= star || rating >= star) ? 'white' : 'var(--accent-color)',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    fontSize: '1.2rem',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  {star}
                </button>
              ))}
            </div>
            
            <div className="rating-value" style={{ 
              textAlign: 'center',
              fontWeight: 'bold',
              margin: '1rem 0',
              color: 'var(--accent-color)'
            }}>
              Your rating: {rating}/5
            </div>
            
            <div className="feedback-section" style={{ margin: '2rem 0' }}>
              <label htmlFor="feedback" style={{
                display: 'block',
                marginBottom: '0.5rem',
                color: 'var(--text-color)'
              }}>
                Your feedback (optional):
              </label>
              <textarea
                id="feedback"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder={existingRating ? 'Update your feedback...' : 'What did you think of this dish?'}
                style={{
                  width: '100%',
                  minHeight: '100px',
                  padding: '0.8rem',
                  border: '1px solid #ddd',
                  borderRadius: '5px',
                  fontFamily: 'inherit'
                }}
              />
            </div>
            
            <button 
              className="submit-rating" 
              onClick={handleSubmitRating}
              disabled={rating === 0 || isLoading}
              style={{
                display: 'block',
                width: '100%',
                padding: '1rem',
                background: isLoading ? '#ccc' : 'var(--accent-color)',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                fontWeight: 'bold',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                transition: 'background 0.2s ease',
                marginTop: '1.5rem'
              }}
            >
              {isLoading ? 'Submitting...' : existingRating ? 'Update Rating' : 'Submit Rating'}
            </button>
          </div>
        )}
      </div>
    </main>
  );
}

export default RatingPage;