import { Routes, Route } from 'react-router-dom';
import Layout from './Layout';
import HomePage from './HomePage';
import MenuPage from './MenuPage';
import ContactPage from './ContactPage';
import AboutPage from './AboutPage';
import RatingPage from './RatingPage';          // ← Restored
import NotFoundPage from './NotFoundPage';     // ← Restored

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        {/* Index route (home page) */}
        <Route index element={<HomePage />} />
        
        {/* Main pages */}
        <Route path="menu" element={<MenuPage />} />
        <Route path="about" element={<AboutPage />} />
        <Route path="contact" element={<ContactPage />} />
        
        {/* Nested rating route (restored!) */}
        <Route 
          path="menu/rate/:menuType/:category/:itemName" 
          element={<RatingPage />} 
        />
        
        {/* Catch-all 404 route (restored!) */}
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}

export default App;