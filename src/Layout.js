import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import './App.css';

export default function Layout() {
  return (
    <div className="app">
      <Navbar />
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}