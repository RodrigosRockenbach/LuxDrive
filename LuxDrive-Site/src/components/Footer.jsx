import React from 'react';
import '../assets/styles/Footer.css';
import LogoPreto from '../assets/images/LogoPreto.png';

export default function Footer() {
  return (
    <footer className="lux-footer text-muted">
      <hr className="linhaFooter" />
      <div className="container d-flex justify-content-between align-items-center py-2 flex-wrap">
        <div className="footer-spacer" />

        <div className="footer-text text-center mx-auto">
          <div>
            © Copyright 2025 - <span className="fw-bold text-dark">LuxDrive</span>
          </div>
          <div><p>Todos os direitos reservados</p></div>
        </div>

        <img src={LogoPreto} alt="Logo LuxDrive" className="footer-logo" />
      </div>
    </footer>
  );
}
