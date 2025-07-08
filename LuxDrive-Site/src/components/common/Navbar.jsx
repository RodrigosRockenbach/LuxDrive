import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth, db } from '../../services/firebase';
import { signOut } from 'firebase/auth';
import { useAuthState } from 'react-firebase-hooks/auth';
import { doc, getDoc } from 'firebase/firestore';
import { FaBars } from 'react-icons/fa';

import '../../styles/Navbar.css';
import logoBranco from '../../assets/images/LogoBranco.png';
import perfilImage from '../../assets/images/perfilImage.png';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [user] = useAuthState(auth);
  const [userName, setUserName] = useState('Seu Nome');
  const [userPhoto, setUserPhoto] = useState(null);

  const navigate = useNavigate();

  // Busca nome e foto do usuário no Firestore
  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        const ref = doc(db, 'users', user.uid);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          const data = snap.data();
          setUserName(data.name || 'Usuário');
          setUserPhoto(data.photoURL || null);
        }
      }
    };
    fetchUserData();
  }, [user]);

  const handleSearch = e => {
    e.preventDefault();
    if (searchTerm.trim() !== '') {
      navigate(`/home?q=${encodeURIComponent(searchTerm.trim())}`);
      setSearchTerm('');
      setIsOpen(false);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/login');
  };

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  return (
    <>
      <nav className="navbar navbar-expand-lg navbar-dark lux-navbar fixed-top">
        <div className="container-fluid px-4 d-flex align-items-center justify-content-between">
          <Link className="navbar-brand d-flex align-items-center" to="/home" onClick={closeMenu}>
            <img src={logoBranco} alt="LuxDrive" className="logo-navbar me-2" />
          </Link>

          <button
            className="navbar-toggler"
            type="button"
            onClick={toggleMenu}
            aria-controls="navbarNav"
            aria-expanded={isOpen}
            aria-label="Toggle navigation"
          >
            {isOpen ? <span>&times;</span> : <span className="navbar-toggler-icon"></span>}
          </button>

          <div className={`collapse navbar-collapse ${isOpen ? 'show' : ''}`} id="navbarNav">
            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
              <li className="nav-item">
                <Link className="nav-link" to="/home" onClick={closeMenu}>Início</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/meus-agendamentos" onClick={closeMenu}>Agendamentos</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/erro" onClick={closeMenu}>Sobre nós</Link>
              </li>
            </ul>

            <form className="d-flex my-2 my-lg-0 w-100 w-lg-auto" onSubmit={handleSearch}>
              <input
                className="form-control"
                type="search"
                placeholder="Buscar por lavagens..."
                aria-label="Search"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </form>

            <button
              className="btn btn-brand-circle rounded-circle ms-3 d-none d-lg-inline"
              onClick={() => setShowSidebar(true)}
              type="button"
            >
              <FaBars className="icon-light-bars" size={26}  />
            </button>
          </div>
        </div>
      </nav>

      {/* Sidebar */}
      {showSidebar && (
        <div className="sidebar-overlay" onClick={() => setShowSidebar(false)}>
          <div className="sidebar" onClick={e => e.stopPropagation()}>
            <div className="sidebar-header position-relative d-flex flex-column align-items-center p-4" style={{ minHeight: '150px' }}>
              <button
                className="btn-close position-absolute top-0 end-0 m-2"
                onClick={() => setShowSidebar(false)}
              />

              <img
                src={userPhoto || perfilImage}
                alt="Foto de perfil"
                className="rounded-circle mb-3"
                style={{ width: '80px', height: '80px', objectFit: 'cover' }}
              />

              <strong>{userName}</strong>
            </div>

            <ul className="list-group list-group-flush mt-3">
              <li className="list-group-item sidebar-item">
                <Link to="/home" onClick={() => setShowSidebar(false)}>Início</Link>
              </li>
              <li className="list-group-item sidebar-item">
                <Link to="/meus-agendamentos" onClick={() => setShowSidebar(false)}>Agendamentos</Link>
              </li>
              <li className="list-group-item sidebar-item">
                <Link to="/perfil" onClick={() => setShowSidebar(false)}>Perfil</Link>
              </li>
              <li className="list-group-item sidebar-item">
                <Link to="/erro" onClick={() => setShowSidebar(false)}>Sobre nós</Link>
              </li>
              <li className="list-group-item sidebar-item">
                <Link to="/company/register" onClick={() => setShowSidebar(false)}>Trabalhe Conosco</Link>
              </li>
              <li className="list-group-item sidebar-item text-danger" onClick={handleLogout} style={{ cursor: 'pointer' }}>
                Sair
              </li>
            </ul>

            <div className="text-center mt-4 small text-muted">Versão 0.1</div>
          </div>
        </div>
      )}
    </>
  );
}
