import React from 'react';
import CompanyNavbar from '../components/common/CompanyNavbar';
import Footer from '../components/common/Footer';
import { Outlet } from 'react-router-dom';

export default function CompanyLayout() {
  return (
    <div className="d-flex flex-column min-vh-100">
      <CompanyNavbar />
      <main className="flex-grow-1 bg-light pt-5">
        <div className="container-fluid">
          <Outlet />
        </div>
      </main>
      <Footer />
    </div>
  );
}
