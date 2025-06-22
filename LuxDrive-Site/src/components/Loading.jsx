import React from 'react';
import '../assets/styles/Loading.css';
import carregandoImg from '../assets/images/carregando.png';

export default function Loading() {
  return (
    <div className="loading-overlay">
      <img src={carregandoImg} alt="Carregando" className="loading-img" />
      <h3 className="loading-text">
        Carregando<span className="dot-1">.</span>
        <span className="dot-2">.</span>
        <span className="dot-3">.</span>
      </h3>
    </div>
  );
}
