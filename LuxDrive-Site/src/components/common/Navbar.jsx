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
  const [userName, setUserName] = useState('Usuário');
  const [userPhoto, setUserPhoto] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;
      const ref = doc(db, 'users', user.uid);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const data = snap.data();
        setUserName(data.name || data.nome || 'Usuário');
        setUserPhoto(data.photoURL || null);
      }
    };
    fetchUserData();
  }, [user]);

  const handleSearch = e => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/home?q=${encodeURIComponent(searchTerm.trim())}`);
      setSearchTerm('');
      setIsOpen(false);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/login', { replace: true });
  };

  const toggleMenu = () => setIsOpen(prev => !prev);
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
            aria-expanded={isOpen}
            aria-label="Toggle navigation"
          >
            {isOpen ? <span>&times;</span> : <span className="navbar-toggler-icon"></span>}
          </button>

          <div className={`collapse navbar-collapse ${isOpen ? 'show' : ''}`}>
            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
              <li className="nav-item">
                <Link className="nav-link" to="/home" onClick={closeMenu}>Início</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/meus-agendamentos" onClick={closeMenu}>Agendamentos</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/sobre-nos" onClick={closeMenu}>Sobre nós</Link>
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
              <FaBars className="icon-light-bars" size={26} />
            </button>
          </div>
        </div>
      </nav>

      {/* Sidebar Mobile */}
      {showSidebar && (
        <div className="sidebar-overlay" onClick={() => setShowSidebar(false)}>
          <div className="sidebar" onClick={e => e.stopPropagation()}>
            <div className="sidebar-header d-flex flex-column align-items-center p-4">
              <button
                className="btn-close position-absolute top-0 end-0 m-2"
                onClick={() => setShowSidebar(false)}
                aria-label="Fechar menu"
              />
              <img
                src={userPhoto || perfilImage}
                alt="Foto de perfil"
                className="rounded-circle mb-2"
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
                <Link to="/sobre-nos" onClick={() => setShowSidebar(false)}>Sobre nós</Link>
              </li>
              <li
                className="list-group-item sidebar-item text-danger"
                style={{ cursor: 'pointer' }}
                onClick={() => { handleLogout(); setShowSidebar(false); }}
              >
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
