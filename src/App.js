import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './Layout';
import HomePage from './HomePage';
import MenuPage from './MenuPage';
import ContactPage from './ContactPage';
import AboutPage from './AboutPage';
import RatingPage from './RatingPage';
import NotFoundPage from './NotFoundPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          {/* Index route (home page) */}
          <Route index element={<HomePage />} />
          
          {/* Main pages */}
          <Route path="menu" element={<MenuPage />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="contact" element={<ContactPage />} />
          
          {/* Nested rating route with parameters */}
          <Route 
            path="menu/rate/:menuType/:category/:itemName" 
            element={<RatingPage />} 
          />
          
          {/* Catch-all route for 404 pages */}
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;