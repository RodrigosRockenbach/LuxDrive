import React from 'react';
import Navbar from './Navbar';
import { Outlet } from 'react-router-dom';

export default function Layout() {
  return (
    <>
      <Navbar />
      <main className="pt-5" style={{ paddingTop: '80px', minHeight: '100vh', backgroundColor: '#F9F9F9' }}>
        <div className="container-fluid">
          <Outlet />
        </div>
      </main>
    </>
  );
}