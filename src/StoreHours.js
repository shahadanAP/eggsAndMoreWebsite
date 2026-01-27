import React from 'react';
import './App.css';

const storeHours = [
  { day: 'Monday', hours: '7 AM – 3 PM', isOpen: true },
  { day: 'Tuesday', hours: '7 AM – 3 PM', isOpen: true },
  { day: 'Wednesday', hours: '7 AM – 3 PM', isOpen: true },
  { day: 'Thursday', hours: '7 AM – 3 PM', isOpen: true },
  { day: 'Friday', hours: '7 AM – 3 PM', isOpen: true },
  { day: 'Saturday', hours: '7 AM – 3 PM', isOpen: true },
  { day: 'Sunday', hours: '7 AM – 3 PM', isOpen: true },
];

export default function StoreHours({ variant = 'default' }) {
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  
  // Check if currently open
  const getCurrentStatus = () => {
    const now = new Date();
    const currentHour = now.getHours();
    const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' });
    const todayData = storeHours.find(h => h.day === currentDay);
    
    if (todayData && todayData.isOpen) {
      // Open from 7 AM to 3 PM
      if (currentHour >= 7 && currentHour < 15) {
        return { isOpen: true, message: 'Open Now', closesAt: '3 PM' };
      } else if (currentHour < 7) {
        return { isOpen: false, message: 'Opens at 7 AM', closesAt: null };
      }
    }
    return { isOpen: false, message: 'Closed', closesAt: null };
  };

  const status = getCurrentStatus();

  if (variant === 'compact') {
    return (
      <div className="store-hours-compact" role="complementary" aria-label="Store hours">
        <div className={`status-badge ${status.isOpen ? 'open' : 'closed'}`}>
          <span className="status-dot" aria-hidden="true"></span>
          <span>{status.message}</span>
          {status.isOpen && <span className="closes-at">• Closes {status.closesAt}</span>}
        </div>
        <div className="hours-quick">
          <span className="clock-icon" aria-hidden="true">🕐</span>
          <span>Daily 7 AM – 3 PM</span>
        </div>
      </div>
    );
  }

  return (
    <section className="store-hours-section" aria-labelledby="hours-heading">
      <div className="hours-card">
        <div className="hours-header">
          <h2 id="hours-heading">
            <span className="clock-icon" aria-hidden="true">🕐</span>
            Hours of Operation
          </h2>
          <div className={`status-badge large ${status.isOpen ? 'open' : 'closed'}`}>
            <span className="status-dot" aria-hidden="true"></span>
            <span>{status.message}</span>
          </div>
        </div>
        
        <ul className="hours-list" role="list">
          {storeHours.map(({ day, hours, isOpen }) => (
            <li 
              key={day} 
              className={`hours-row ${day === today ? 'today' : ''} ${!isOpen ? 'closed' : ''}`}
              aria-current={day === today ? 'date' : undefined}
            >
              <span className="day-name">{day}</span>
              <span className="day-hours">{isOpen ? hours : 'Closed'}</span>
              {day === today && <span className="today-badge">Today</span>}
            </li>
          ))}
        </ul>
        
        <div className="hours-footer">
          <p>
            <span aria-hidden="true">📞</span> 
            <a href="tel:+14032809488" aria-label="Call us at 403-280-9488">+1 (403) 280-9488</a>
          </p>
          <p>
            <span aria-hidden="true">📍</span> 
            5441 Falsbridge Dr NE, Calgary
          </p>
        </div>
      </div>
    </section>
  );
}

export { storeHours };



