import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../assets/styles/Navbar.css';
import logoBranco from '../assets/images/LogoBranco.png';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);

  const closeMenu = () => setIsOpen(false);

  return (
    <>
      <nav className="navbar navbar-expand-lg navbar-dark lux-navbar fixed-top">
        <div className="container-fluid px-4 d-flex align-items-center justify-content-between">
          <Link className="navbar-brand d-flex align-items-center" to="/dashboard" onClick={closeMenu}>
            <img src={logoBranco} alt="LuxDrive" className="logo-navbar" />
          </Link>

          <button
            className="navbar-toggler"
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            aria-controls="navbarNav"
            aria-expanded={isOpen}
            aria-label="Toggle navigation"
          >
            <span className={`navbar-toggler-icon ${isOpen ? 'open' : ''}`}></span>
          </button>

          <div className={`collapse navbar-collapse ${isOpen ? 'show' : ''}`} id="navbarNav">
            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
              <li className="nav-item">
                <Link className="nav-link" to="/dashboard" onClick={closeMenu}>Início</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="#" onClick={closeMenu}>Agendamentos</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="#" onClick={closeMenu}>Serviços</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="#" onClick={closeMenu}>Sobre nós</Link>
              </li>
            </ul>

            <form className="d-flex my-2 my-lg-0 flex-grow-1 mx-2">
              <input
                className="form-control form-control-sm"
                type="search"
                placeholder="Buscar por lavagens..."
                aria-label="Search"
              />
            </form>

            <button
              className="btn btn-light rounded-circle ms-3"
              onClick={() => setShowSidebar(true)}
              type="button"
            >
              <i className="bi bi-person"></i>
            </button>
          </div>
        </div>
      </nav>

      {/* Sidebar */}
      {showSidebar && (
        <div className="sidebar-overlay" onClick={() => setShowSidebar(false)}>
          <div className="sidebar" onClick={(e) => e.stopPropagation()}>
            <div className="sidebar-header d-flex justify-content-between align-items-center">
              <div className="text-center w-100">
                <div className="rounded-circle bg-secondary mx-auto mb-2" style={{ width: '70px', height: '70px' }}></div>
                <strong>Seu Nome</strong>
              </div>
              <button className="btn-close ms-auto" onClick={() => setShowSidebar(false)}></button>
            </div>

            <ul className="list-group list-group-flush mt-3">
              <li className="list-group-item sidebar-item">Perfil</li>
              <li className="list-group-item sidebar-item">Agendamentos</li>
              <li className="list-group-item sidebar-item">Serviços</li>
              <li className="list-group-item sidebar-item">Dados cadastro</li>
              <li className="list-group-item sidebar-item">Cartões</li>
              <li className="list-group-item sidebar-item">Trabalhe Conosco</li>
            </ul>

            <div className="text-center mt-4 small">
              <div className="text-danger">Sair</div>
              <div className="text-muted">Versão 0.1</div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}