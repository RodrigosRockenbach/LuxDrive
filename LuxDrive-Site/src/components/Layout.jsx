import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import { Outlet } from 'react-router-dom';

export default function Layout() {
  return (
    <div className="d-flex flex-column min-vh-100">
      <Navbar />
      <main className="flex-grow-1 bg-light pt-5">
        <div className="container-fluid">
          <Outlet />
        </div>
      </main>
      <Footer />
    </div>
  );
}
