// src/pages/Auth/VerifyEmailPage.jsx
import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { applyActionCode } from 'firebase/auth';
import { auth } from '../../services/firebase';

export default function VerifyEmailPage() {
  const [message, setMessage] = useState('Validando...');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const mode = searchParams.get('mode');
    const oobCode = searchParams.get('oobCode');

    if (mode !== 'verifyEmail' || !oobCode) {
      setMessage('Link de verificação inválido.');
      return;
    }

    applyActionCode(auth, oobCode)
      .then(() => {
        setMessage('E‑mail verificado com sucesso! Você já pode fazer login.');
      })
      .catch((error) => {
        console.error('Erro applyActionCode:', error);
        setMessage('Não foi possível verificar seu e‑mail. O link pode estar expirado.');
      });
  }, [searchParams]);

  return (
    <div className="vh-100 d-flex justify-content-center align-items-center bg-primary">
      <div className="card shadow" style={{ maxWidth: 400, width: '90%' }}>
        <div className="card-body text-center">
          <h5 className="card-title mb-3">Verificação de E‑mail</h5>
          <p className="card-text">{message}</p>
          <button
            className="btn btn-primary"
            onClick={() => navigate('/login')}
          >
            Ir para Login
          </button>
        </div>
      </div>
    </div>
  );
}
