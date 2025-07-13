import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import LogoBranco from '../../assets/images/LogoBranco.png';
import { logoutUser } from '../../services/authService'; // import do serviço de logout
import '../../styles/Navbar.css';

export default function CompanyNavbar() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  const handleLogout = async () => {
    try {
      await logoutUser();
      navigate('/company/login', { replace: true });
    } catch (err) {
      console.error('Erro ao sair:', err);
      // opcional: exibir toast/alert de erro
    }
  };

  return (
    <nav className="navbar navbar-expand-lg lux-navbar px-3 fixed-top">
      <div className="container-fluid">
        <Link to="/dashboard" className="navbar-brand">
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

        {/* Menu desktop */}
        <div className="collapse navbar-collapse d-none d-lg-flex justify-content-end">
          <ul className="navbar-nav align-items-center">
            <li className="nav-item">
              <Link to="/dashboard" className="nav-link">Início</Link>
            </li>
            <li className="nav-item ms-3">
              <Link to="#" className="nav-link">Sobre nós</Link>
            </li>
            <li className="nav-item ms-3">
              <Link to="/empresa/agendamentos" className="nav-link">Agenda</Link>
            </li>
            <li className="nav-item ms-3">
              <Link to="/empresa/perfil" className="nav-link">Perfil</Link>
            </li>
            <li className="nav-item ms-3">
              <button
                className="nav-link bg-transparent border-0"
                onClick={handleLogout}
              >
                Sair
              </button>
            </li>
          </ul>
        </div>

        {/* Sidebar mobile */}
        {isSidebarOpen && (
          <div className="sidebar-overlay" onClick={closeSidebar}>
            <div className="sidebar" onClick={e => e.stopPropagation()}>
              <button
                className="btn-close mb-3"
                onClick={closeSidebar}
                aria-label="Fechar menu"
              ></button>
              <div className="sidebar-item">
                <Link to="/dashboard" onClick={closeSidebar}>Início</Link>
              </div>
              <div className="sidebar-item">
                <Link to="#" onClick={closeSidebar}>Sobre nós</Link>
              </div>
              <div className="sidebar-item">
                <Link to="/empresa/agendamentos" onClick={closeSidebar}>Agenda</Link>
              </div>
              <div className="sidebar-item">
                <Link to="/empresa/perfil" onClick={closeSidebar}>Perfil</Link>
              </div>
              <div className="sidebar-item mt-3">
                <button
                  className="btn btn-outline-secondary w-100"
                  onClick={() => {
                    closeSidebar();
                    handleLogout();
                  }}
                >
                  Sair
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
