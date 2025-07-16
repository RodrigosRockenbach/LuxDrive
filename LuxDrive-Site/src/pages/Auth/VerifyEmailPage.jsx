import React, { useEffect, useState } from 'react';
import { getAuth, applyActionCode } from 'firebase/auth';
import { useLocation, useNavigate } from 'react-router-dom';

export default function VerifyEmailPage() {
  const auth = getAuth();
  const navigate = useNavigate();
  const { search } = useLocation();
  const [status, setStatus] = useState({
    loading: true,
    success: false,
    message: '',
  });

  useEffect(() => {
    const params = new URLSearchParams(search);
    const oobCode = params.get('oobCode');
    const mode = params.get('mode');

    if (mode !== 'verifyEmail' || !oobCode) {
      setStatus({
        loading: false,
        success: false,
        message: 'Link inválido ou incompleto.',
      });
      return;
    }

    applyActionCode(auth, oobCode)
      .then(() => {
        setStatus({
          loading: false,
          success: true,
          message: 'E‑mail verificado com sucesso! Você já pode fazer login.',
        });
      })
      .catch((error) => {
        console.error('Erro ao aplicar o código:', error);
        setStatus({
          loading: false,
          success: false,
          message:
            'Não foi possível verificar o e‑mail (talvez o link tenha expirado).',
        });
      });
  }, [search, auth]);

  const handleGoLogin = () => {
    navigate('/login');
  };

  return (
    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh', padding: '1rem' }}>
      <div className="card shadow-sm" style={{ maxWidth: '400px', width: '100%' }}>
        <div className="card-body text-center">
          {status.loading ? (
            <>
              <div className="spinner-border mb-3" role="status" />
              <p>Verificando seu e‑mail...</p>
            </>
          ) : (
            <>
              <h5 className={`card-title ${status.success ? 'text-success' : 'text-danger'}`}>
                {status.success ? 'Verificação concluída' : 'Falha na verificação'}
              </h5>
              <p className="card-text">{status.message}</p>
              <button className="btn btn-primary" onClick={handleGoLogin}>
                Ir para Login
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
