import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import LogoBranco from '../../assets/images/LogoBranco.png';
import '../../styles/Navbar.css';

export default function CompanyNavbar() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <nav className="navbar navbar-expand-lg lux-navbar px-3 fixed-top">
      <div className="container-fluid">
        <Link to="/home" className="navbar-brand">
          <img src={LogoBranco} alt="LuxDrive" className="logo-navbar" />
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          onClick={toggleSidebar}
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse d-none d-lg-flex justify-content-end">
          <ul className="navbar-nav">
            <li className="nav-item">
              <Link to="/home" className="nav-link">Início</Link>
            </li>
            <li className="nav-item">
              <Link to="#" className="nav-link">Sobre nós</Link>
            </li>
            <li className="nav-item">
              <Link to="/agendamentos" className="nav-link">Agenda</Link>
            </li>
            <li className="nav-item">
              <Link to="#" className="nav-link">Perfil</Link>
            </li>
          </ul>
        </div>

        {isSidebarOpen && (
          <div className="sidebar-overlay" onClick={closeSidebar}>
            <div className="sidebar" onClick={e => e.stopPropagation()}>
              <button
                className="btn-close mb-3"
                onClick={closeSidebar}
                aria-label="Fechar menu"
              ></button>
              <div className="sidebar-item">
                <Link to="/home" onClick={closeSidebar}>Início</Link>
              </div>
              <div className="sidebar-item">
                <Link to="#" onClick={closeSidebar}>Sobre nós</Link>
              </div>
              <div className="sidebar-item">
                <Link to="/agendamentos" onClick={closeSidebar}>Agenda</Link>
              </div>
              <div className="sidebar-item">
                <Link to="#" onClick={closeSidebar}>Perfil</Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
