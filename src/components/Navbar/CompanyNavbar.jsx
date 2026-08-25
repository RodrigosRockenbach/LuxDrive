import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../../services/firebase';
import LogoBranco from '../../assets/images/LogoBranco.png';
import { logoutUser } from '../../services/authService';
import { deleteCompanyAccount } from '../../services/companyService';
import './Navbar.css';

export default function CompanyNavbar() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [user] = useAuthState(auth);
  const navigate = useNavigate();
  const location = useLocation();

  const toggleSidebar = () => setIsSidebarOpen(prev => !prev);
  const closeSidebar = () => setIsSidebarOpen(false);

  const handleLogout = async () => {
    try {
      await logoutUser();
      navigate('/company/login', { replace: true });
    } catch (err) {
      console.error('Erro ao sair:', err);
    }
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      'Tem certeza que deseja excluir a conta da sua empresa? Essa ação é permanente e não pode ser desfeita.'
    );
    if (!confirmed) return;

    try {
      await deleteCompanyAccount(user.uid);
      navigate('/company/login', { replace: true });
    } catch (err) {
      alert(err.message || 'Erro ao excluir conta.');
    }
  };

  const isActive = (path) => location.pathname === path;

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
          <span className="navbar-toggler-icon" />
        </button>

        {/* Desktop menu */}
        <div className="collapse navbar-collapse d-none d-lg-flex justify-content-end">
          <ul className="navbar-nav align-items-center">
            <li className="nav-item">
              <Link to="/dashboard" className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}>
                Início
              </Link>
            </li>
            <li className="nav-item ms-3">
              <Link to="/sobre-nos" className={`nav-link ${isActive('/sobre-nos') ? 'active' : ''}`}>
                Sobre nós
              </Link>
            </li>
            <li className="nav-item ms-3">
              <Link to="/empresa/agendamentos" className={`nav-link ${isActive('/empresa/agendamentos') ? 'active' : ''}`}>
                Agenda
              </Link>
            </li>
            <li className="nav-item ms-3">
              <Link to="/empresa/perfil" className={`nav-link ${isActive('/empresa/perfil') ? 'active' : ''}`}>
                Perfil
              </Link>
            </li>
            <li className="nav-item ms-3">
              <button
                className="nav-link btn btn-link"
                onClick={handleLogout}
              >
                Sair
              </button>
            </li>
          </ul>
        </div>

        {/* Mobile sidebar */}
        {isSidebarOpen && (
          <div className="sidebar-overlay" onClick={closeSidebar}>
            <div className="sidebar" onClick={e => e.stopPropagation()}>
              <button
                className="btn-close mb-3"
                onClick={closeSidebar}
                aria-label="Fechar menu"
              />
              <div className="sidebar-item">
                <Link to="/dashboard" onClick={closeSidebar}>Início</Link>
              </div>
              <div className="sidebar-item">
                <Link to="/sobre-nos" onClick={closeSidebar}>Sobre nós</Link>
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
              <div className="sidebar-item mt-2">
                <button
                  className="btn btn-outline-danger w-100"
                  onClick={() => {
                    closeSidebar();
                    handleDeleteAccount();
                  }}
                >
                  Excluir conta
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}