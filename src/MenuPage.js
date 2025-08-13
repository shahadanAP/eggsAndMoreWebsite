import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './App.css';

export default function MenuPage() {
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState('breakfast');
  const [activeCategory, setActiveCategory] = useState('');
  const [dishRatings, setDishRatings] = useState({});
  const [loadingRatings, setLoadingRatings] = useState(true);

  // Fetch all ratings from backend
  useEffect(() => {
    const fetchRatings = async () => {
      try {
        setLoadingRatings(true);
        const response = await axios.get('http://localhost:5000/api/ratings');
        
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

  

  // Menu data (same as before)
   const menuData = {
    breakfast: {
    'Eggs Eggs Eggs': [
      { name: '2 Eggs Combo', description: '', price: '14.99' },
      { name: 'Touch and Go', description: '1 egg with choice of 2 beef strips or 2 beef sausage', price: '14.99' },
      { name: 'Scram & Beef Strips or Beef Sausage', description: '3 eggs scrambled with diced beef. Add Cheese = +2.95', price: '17.99' },
      { name: 'Southern Gents', description: '3 eggs, 3 beef strips, 3 beef sausage, 2 chicken wieners', price: '19.99' },
      { name: 'Beef Burger Steak and Eggs', description: '9 oz hamburger steak with caramelized onions and 2 eggs', price: '19.99' },
      { name: 'Steak and Eggs', description: '8 oz AAA Sirloin with 2 eggs', price: '24.99' },
    ],

    'Eggs Benedict': [
      { name: 'Classic Benedict', description: 'Grilled beef, English muffin, hollandaise sauce', price: '17.99' },
      { name: 'Smoked Salmon Benedict', description: 'Slices of smoked salmon, spinach, English muffin, spicy tomato hollandaise', price: '18.99' },
      { name: 'Veggie Benedict', description: 'Tomatoes, mushrooms, onions, broccoli, English muffin, hollandaise sauce', price: '16.99' },
      { name: 'Meat Lovers Benedict', description: 'Beef chunks, beef sausage slices, beef strips, English muffin, hollandaise, topped with beef bits', price: '19.99' },
      { name: 'Crab Cake Benedict', description: 'Crab cakes, asparagus, hollandaise sauce (no muffin)', price: '19.99' },
      { name: 'Smashed Avo-Benedict', description: 'Smashed avocado, feta, diced tomatoes, basil pesto, and poached egg', price: '16.99' }
    ],

    'Omelettes': [
      { name: 'Chicken Florentine Omelette', description: 'Diced chicken, spinach, tomatoes, and feta cheese', price: '19.99' },
      { name: 'Veggie Omelette', description: 'Tomatoes, green pepper, mushrooms, onions, spinach, broccoli, cheddar cheese', price: '17.99' },
      { name: 'Steak Omelette', description: 'Steak, mushroom, white onions, and mozzarella cheese', price: '19.99' },
      { name: 'EM Omelette', description: 'Diced beef strips, diced sausages, diced bologna, green pepper, onions, spinach, mushrooms, tomatoes, cheddar cheese', price: '19.99' }
    ],

    'Pancakes & French Toast': [
      { name: 'Buttermilk Pancakes (4)', price: '12.99' },
      { name: 'Salted Caramel Banana Pancakes (4)', description: 'Bananas, pecan, salted caramel sauce, whipped topping, powdered sugar', price: '18.99' },
      { name: 'French Toast (3)', description: 'Served with cinnamon', price: '12.99' },
      { name: 'French Toast Plus (3)', description: 'Includes cinnamon, +2 beef strips or sausages', price: '17.99' },
      { name: 'Salted Caramel Banana French Toast (3)', description: 'Bananas, pecan, salted caramel sauce, whipped topping, powdered sugar', price: '18.99' }
    ],

    'Skillets and Bowls': [
      { name: 'Philly Steak Skillet', description: 'Steak strips, bell peppers, onions, mushrooms, mozzarella, kalbi sauce, tomatoes', price: '19.99' },
      { name: 'Beef Skillet', description: 'Beef sausages, bell peppers, mushrooms, cheddar, green onions, kalbi sauce, tomatoes', price: '19.99' },
      { name: 'Chicken Skillet', description: 'Diced chicken, spinach, bell peppers, mushrooms, feta, green onions, kalbi sauce, tomatoes', price: '19.99' },
      { name: 'Veggie Skillet', description: 'Mushrooms, tomatoes, bell peppers, onions, broccoli, spinach, cheddar, kalbi sauce', price: '17.99' },
      { name: "EM's Breakfast Poutine", description: 'Beef chunks, diced bologna, beef strips, mushrooms, green peppers, white onions, cheese curds, hollandaise, tomatoes, green onions', price: '19.99' }
    ],

    'Waffles': [
      { name: 'Belgian Waffle', description: '', price: '14.99' },
      { name: 'Waffle Plus', description: 'Choice of 4 beef strips, 4 beef sausage, or 4 chicken wieners + Add 2 eggs ($3.50)', price: '16.99' },
      { name: 'Salted Caramel Banana Waffle', description: 'Bananas, pecans, salted caramel, whipped topping, powdered sugar', price: '18.95' }
    ],

    'Specials': [
      { name: 'Creamy Garlic Mushroom Toast', description: 'Mushrooms in creamy garlic sauce, basil pesto & baby spinach on toast', price: '12.99' },
      { name: 'Mince on Toast', description: 'Ground beef or chicken strips, savoury mince with toast and poached egg', price: '16.99' },
      { name: 'Chia Pudding Delight', description: 'Chia pudding with coconut milk & cream, maple syrup, berry compote, seasonal fruits', price: '12.99' },
      { name: 'Breakfast Wrap', description: '2 eggs, cheddar, peppers, onions, tomatoes, potatoes, choice of beef strips, sausage or chicken wieners. Served with salsa & fruit/perogies.', price: '17.99' }
    ],

    'Breakfast Side Items': [
      { name: '(4) Beef Strips', description: '', price: '5.99' },
      { name: '(4) Chicken Wieners', description: '', price: '7.99' },
      { name: 'Beef Sausage', description: '', price: '7.99' },
      { name: '(1) Egg', description: '', price: '1.99' },
      { name: 'Hollandaise Sauce', description: '', price: '1.99' },
      { name: 'Cup Of Fresh Fruit', description: '', price: '5.99' },
      { name: '(4) Chicken Strips', description: '', price: '5.99' },
      { name: 'Sliced Chicken Strips', description: '', price: '6.99' },
      { name: 'Roasted Potatoes', description: '', price: '4.99' },
      { name: 'Shredded Hashbrowns', description: '', price: '5.99' },
      { name: 'Tator Tots', description: '', price: '6.99' },
      { name: 'Toast', description: 'Rye +3.95', price: '2.99' },
      { name: '(1) Pancake', description: '', price: '3.99' },
      { name: '(1) French Toast', description: 'With cinnamon', price: '4.99' },
      { name: '(3) Perogies', description: 'With grilled onions and beef bits', price: '3.99' }
    ]

    },


    main: {
    'Appetizers': [
    { name: 'Cheesy Garlic Toast (2 Slices)', description: '', price: '7.99' },
    { name: 'Samosa (4 Pieces)', description: 'Potato and peas, served with ketchup and green chutney', price: '6.99' },
    { name: '1 Pound Chicken Wings', description: 'Salt & pepper, seasoning salt, BBQ, hot, teriyaki, honey garlic, honey hot, or lemon pepper', price: '15.99' },
    { name: 'The Works', description: 'Fries, beef chunks, green onions, cheddar cheese, gravy, sour cream', price: '13.99' },
    { name: 'Poutine', description: 'Fries, cheese curds, gravy', price: '9.99' },
    { name: 'Chicken Strips', description: 'Served with choice of fries, onion rings, soup, or salad', price: '13.99' },
    { name: 'Nachos', description: 'Cheddar & mozzarella, tomatoes, green peppers, onions, black olives, jalapeños, salsa and sour cream', price: '19.99' },
    { name: 'Perogies Supreme', description: 'Cheddar cheese, beef chunks, fried onions, sour cream', price: '17.99' }
  ],

    'Soups & Salads': [
      { name: 'Bowl of Soup', description: '', price: '6.55' },
      { name: 'Starter Salad', description: 'Tomatoes, cucumber, cheddar cheese, and choice of dressing', price: '9.99' },
      { name: 'Caesar Salad', description: 'Romaine, beef chunks, croutons, parmesan cheese, garlic toast (Add grilled or crispy chicken +$8)', price: '14.99' },
      { name: 'Taco Salad', description: 'Tortilla, olives, tomatoes, red onions, cheddar & mozzarella, beef or grilled/crispy chicken, garlic toast, sour cream, salsa', price: '22.99' },
      { name: 'Chef Salad', description: 'Beef strips/sausage, beef chunks, bologna, diced chicken, vegetables, hard boiled egg, cheddar & mozzarella, garlic toast, dressing', price: '24.99' }
    ],

    'Sandwiches': [
      { name: 'Toasted Club House', description: 'Sliced turkey, beef strips, tomato, lettuce, cheddar cheese, mayo', price: '18.99' },
      { name: 'Monte Cristo', description: 'Triple decker dipped in egg batter, beef, turkey, mozzarella cheese', price: '18.99' },
      { name: 'Toasted BLT', description: 'Beef strips, lettuce, tomato, mayo', price: '16.99' },
      { name: 'Toasted Chicken Club Sandwich', description: 'Grilled chicken, chicken strips, lettuce, tomato, cheddar, mayo, beef strips', price: '18.99' },
      { name: 'Open-Face Hamburger Sandwich', description: 'Burger patty, Texas toast, sautéed onions, mushrooms, gravy', price: '17.99' }
    ],

    'Pasta': [
      { name: 'Spaghetti and Meatballs', description: 'Tomato basil sauce, parmesan cheese, garlic toast', price: '19.99' },
      { name: 'Chicken Alfredo', description: 'Diced chicken, choice of noodle, parmesan cheese, garlic toast', price: '20.99' },
      { name: 'Chicken Beef Alfredo', description: 'Spinach, beef chunks, choice of noodle, parmesan cheese, garlic toast', price: '21.99' }
    ],

    'Entrees': [
      { name: 'Steak and Shrimp', description: '8oz AAA Sirloin steak, five garlic butter shrimp', price: '31.99' },
      { name: 'Steak and Mushroom', description: '8oz AAA Sirloin steak with sautéed mushrooms', price: '25.99' },
      { name: 'Breaded Liver and Onions', description: 'Sautéed onions, beef chunks, gravy', price: '20.99' },
      { name: 'Salisbury Steak', description: '9oz hamburger steak, onions, mushrooms, gravy', price: '22.99' },
      { name: 'Chicken and Mushrooms', description: 'Grilled chicken, mushrooms, tomatoes, mushroom gravy', price: '20.99' },
      { name: 'Breaded Veal Cutlets', description: 'Mushrooms, gravy', price: '20.99' },
      { name: 'Grilled Atlantic Salmon', description: 'Salt & pepper, lemon pepper, cajun, honey garlic, or teriyaki', price: '27.99' },
      { name: 'Battered Cod', description: 'Served with tartar sauce', price: '21.99' }
    ],

    'Wraps': [
      { name: 'Veggie Wrap', description: 'Tomato, lettuce, onion, spinach, shredded potatoes, cheddar cheese, mayo', price: '15.99' },
      { name: 'Buffalo Crispy Chicken Wrap', description: '', price: '18.99' },
      { name: 'Club Wrap', description: 'Tomatoes, lettuce, cheddar cheese, mayo, chicken strips & beef strips', price: '19.99' },
      { name: 'Quesadilla', description: 'Choice of diced chicken or beef, cheddar cheese, onions, tomatoes, green peppers', price: '18.99' }
    ],

    'Beef Burgers': [
      { name: 'EM Burger', description: 'Fried egg, onions, sautéed mushrooms, beef strips, cheddar cheese, lettuce, tomato, pickles, burger sauce', price: '17.99' },
      { name: 'Mushroom Swiss Cheese Burger', description: 'Lettuce, tomato, onions, pickles, burger sauce, mushrooms', price: '16.99' },
      { name: 'Cheese Burger', description: 'Choice of cheese, lettuce, tomato, onions, pickles, burger sauce', price: '16.99' },
      { name: 'Beef Cheddar Cheese Burger', description: 'Lettuce, tomato, onions, pickles, burger sauce, beef strips', price: '16.99' }
    ],

    'Chicken Burgers': [
      { name: 'EM Chicken Burger', description: 'Grilled chicken, fried egg, onions, beef strip, sautéed mushrooms, cheddar cheese, lettuce, tomato, mayo', price: '17.99' },
      { name: 'Spicy Crispy Chicken Burger', description: 'Spicy crispy chicken, lettuce, tomato, onions, mayo', price: '17.99' },
      { name: 'Grilled Chicken Cheddar Cheese Burger', description: 'Lettuce, tomato, caramelized onions, mayo, beef strips', price: '17.99' },
      { name: 'Grilled Chicken Mushroom Swiss Cheese Burger', description: 'Lettuce, tomato, caramelized onions, mayo', price: '17.99' }
    ],

    'Desserts': [
      { name: 'Warm Apple Crumble', description: 'Cinnamon, nutmeg oatmeal cookie crust and topping, vanilla ice cream', price: '9.99' },
      { name: 'Lemoniscious Lemon Bar', description: 'Real lemon curd, butter shortbread crust, white chocolate ganache', price: '9.99' },
      { name: 'Peanut Butter Stacked Chocolate Brownie', description: 'Crispy peanut butter chocolate brownie, whipped topping', price: '9.99' },
      { name: 'Sticky Toffee Cake', description: 'Warm cake in toffee sauce with vanilla ice cream', price: '11.99' }
    ],

    'Mid Afternoon Side Items': [
      { name: 'French Fries', description: '', price: '6.99' },
      { name: 'Onion Rings', description: '', price: '7.99' },
      { name: 'Gravy', description: '', price: '2.50' },
      { name: 'Garlic Toast (2 slices)', description: '', price: '4.99' },
      { name: 'Mashed Potatoes', description: '', price: '6.99' },
      { name: 'Mixed Vegetables', description: '', price: '6.99' },
      { name: 'Grilled Chicken Breast', description: '', price: '8.99' },
      { name: 'Grilled Beef Strips', description: '', price: '7.99' },
      { name: 'Sliced Chicken Strips', description: '', price: '6.99' }
    ]
    },

    drinks: {
    'Drinks': [
      { name: 'Coffee (bottomless)', description: '', price: '3.99' },
      { name: 'Hot Tea', description: '', price: '3.99' },
      { name: 'Soft Drinks (bottomless)', description: '', price: '4.99' },
      { name: 'Juice Large', description: 'Apple, Orange, Cranberry, or Clamato', price: '5.99' },
      { name: 'Juice Small', description: '', price: '4.99' },
      { name: 'Milk Large', description: '2% White or Chocolate', price: '4.99' },
      { name: 'Milk Small', description: '', price: '4.55' }
    ],

    'Specialty Coffee (No Refills)': [
      { name: 'Flavored Latte', description: '', price: '6.99' },
      { name: 'Flavored Cappuccino', description: '', price: '6.99' },
      { name: 'Flavored Iced Coffee', description: '', price: '7.25' },
      { name: 'Iced Frappuccino with whipped cream', description: '', price: '8.55' },
      { name: 'Hot Mocha with whipped cream', description: '', price: '6.99' },
      { name: 'Hot Chocolate with whipped cream', description: '', price: '5.99' },
      { name: '1 Extra Flavor Pump', description: '', price: '1.50' },
      { name: '1 Extra Expresso Shot', description: '', price: '2.50' }
    ],

    'Smoothies & Milkshakes': [
      { name: 'Milkshakes (topped with whipped cream)', description: 'Strawberry | Banana | Oreo | Chocolate | Chocolate Peanut Butter', price: '7.99' },
      { name: 'Smoothies', description: 'Strawberry', price: '7.99' }
    ]
  },

   eastern: {
        'Combos (available till 3:00 pm)': [
            { name: 'Haiwapuri', description: '3 Puri, channa, Potatos curry', price: '12.99' },
            { name: 'Cholie bhature', description: '2 bhaturay with channa, pickle & salad', price: '12.99' }
        ],

        'Curries': [
            { name: 'Channa massala', description: '', price: '12.99' },
            { name: 'Potato curry', description: '', price: '11.99' },
            { name: 'Haiwa', description: '', price: '11.99' },
            { name: 'Dum Geema', description: '', price: '16.99' },
            { name: 'Beef Paya', description: '', price: '18.99' },
            { name: 'Beef Nihari', description: '', price: '19.99' }
        ],

        'Desi Omlettes': [
            { name: 'Half Fry/ sunny Side (2 eggs)', description: '', price: '4.99' },
            { name: 'Scrambled eggs', description: '', price: '6.99' },
            { name: 'Desi Veggie Omlette', description: '', price: '9.99' },
            { name: 'Cheese Omellete', description: '', price: '9.99' },
            { name: 'Cheese and Veggie Omlette', description: '', price: '10.99' }
        ],

        'Stuffed Parathas': [
            { name: 'Meetha Paratha', description: '', price: '7.99' },
            { name: 'Nutella Paratha', description: '', price: '7.99' },
            { name: 'Sweet Ice Special Paratha with nuts', description: '', price: '10.99' },
            { name: 'Adu paratha', description: '', price: '9.99' },
            { name: 'Mull Paratha', description: '', price: '9.99' },
            { name: 'Mix veg + panser Paratha', description: '', price: '12.99' },
            { name: 'Panser paratha', description: '', price: '10.99' },
            { name: 'Chicken Tikka Paratha', description: '', price: '11.99' },
            { name: 'Malai Chicken Partha', description: '', price: '11.99' },
            { name: 'Beef Geema Paratha', description: '', price: '11.99' }
        ],


        'Naan': [
            { name: 'Plain Naan', description: '', price: '2.49' },
            { name: 'Garlic Naan', description: '', price: '3.99' },
            { name: 'Butter Naaan', description: '', price: '3.49' },
            { name: 'Sesame Naan', description: '', price: '3.99' },
            { name: 'Kalonji naan', description: '', price: '3.99' }
        ],

        'Extras': [
            { name: 'Puri', description: '', price: '2.49' },
            { name: 'Bhatura', description: '', price: '4.49' },
            { name: 'Extra Channa', description: '', price: '3.99' },
            { name: 'Extra Haiwa', description: '', price: '3.99' },
            { name: 'Extra potatoes', description: '', price: '3.99' }
        ],

        'Parathas': [
            { name: 'Tawa Paratha', description: '', price: '5.99' },
            { name: 'Tanduri Paratha', description: '', price: '4.99' },
            { name: 'Lacha Paratha', description: '', price: '6.99' }
        ],


        'Lassis': [
            { name: 'Salty Lassi', description: '', price: '6.99' },
            { name: 'Sweet Lassi', description: '', price: '6.99' },
            { name: 'Mango Lassi', description: '', price: '7.99' }
        ],

        'Shakes': [
            { name: 'Strawberry Shake', description: '', price: '7.99' }
        ],

        'Hot Drinks': [
            { name: 'Pakistani Chai', description: '', price: '4.99' },
            { name: 'Pakistani Coffee', description: '', price: '5.99' }
        ],

        'Summer Blast Drinks': [
            { name: 'Berry Blast', description: '', price: '8.99' },
            { name: 'Virgin Caesar', description: '', price: '8.99' },
            { name: 'Lemonade', description: '', price: '8.99' },
            { name: 'Blue Lagoon', description: '', price: '8.99' },
            { name: 'Strawberry Mojito', description: '', price: '8.99' },
            { name: 'Mint Margarita', description: '', price: '8.99' },
            { name: 'Aurora Sea', description: '', price: '8.99' }
        ]
    }
  };


  return (
    <div className="menu-page">
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
            </div>
          ) : (
            Object.keys(menuData[activeMenu]).map(category => (
              <div key={category} className="menu-category">
                <h2>{category}</h2>
                <div className="items-grid">
                  {menuData[activeMenu][category].map((item, index) => (
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
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}