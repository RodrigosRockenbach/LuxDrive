import React from 'react';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import { Outlet } from 'react-router-dom';

export default function UserLayout() {
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
