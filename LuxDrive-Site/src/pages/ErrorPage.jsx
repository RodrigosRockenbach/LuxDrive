import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/ErrorPage.css';
import carregando from '../assets/images/carregando.png'; 

export default function ErrorPage() {
  return (
    <div className="error-page d-flex flex-column justify-content-center align-items-center text-center">
      <img src={carregando} alt="Erro" className="error-img mb-5" />
      <h4 className="fw-bold text-dark mb-5">OOPS! ESSA PÁGINA <br /> NÃO FOI ENCONTRADA</h4>
      <p className="mt-5">Você pode voltar à tela inicial, clicando abaixo</p>
      <Link to="/home" className="error-link mt-3 fw-bold">Clique aqui!</Link>
    </div>
  );
}
