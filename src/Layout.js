// Layout.js
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import './App.css'; // Make sure your styles are imported

export default function Layout() {
  return (
    <div className="app">
      <Navbar />
      <main className="main-content">
        <Outlet /> {/* This renders the current page */}
      </main>
    </div>
  );
}