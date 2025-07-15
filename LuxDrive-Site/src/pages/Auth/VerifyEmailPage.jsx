import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { applyActionCode } from 'firebase/auth';
import { auth } from '../../services/firebase';
import { Spinner, Alert, Button, Container } from 'react-bootstrap';

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    const mode = searchParams.get('mode');
    const oobCode = searchParams.get('oobCode');

    if (mode === 'verifyEmail' && oobCode) {
      applyActionCode(auth, oobCode)
        .then(() => setStatus('success'))
        .catch(() => setStatus('error'));
    } else {
      setStatus('invalid');
    }
  }, [searchParams]);

  const goToLogin = () => navigate('/login', { replace: true });

  return (
    <Container className="mt-5">
      {status === 'loading' && (
        <div className="text-center">
          <Spinner animation="border" role="status" />
          <p className="mt-3">Validando e‑mail, por favor aguarde...</p>
        </div>
      )}

      {status === 'success' && (
        <Alert variant="success" className="text-center">
          <Alert.Heading>E‑mail verificado com sucesso!</Alert.Heading>
          <p>Agora você pode fazer login.</p>
          <Button onClick={goToLogin}>Ir para Login</Button>
        </Alert>
      )}

      {status === 'error' && (
        <Alert variant="danger" className="text-center">
          <Alert.Heading>Falha na verificação</Alert.Heading>
          <p>Este link é inválido ou expirou. Peça um novo e‑mail de verificação.</p>
          <Button onClick={goToLogin}>Ir para Login</Button>
        </Alert>
      )}

      {status === 'invalid' && (
        <Alert variant="warning" className="text-center">
          <Alert.Heading>Parâmetros Inválidos</Alert.Heading>
          <p>Não foi possível processar a verificação de e‑mail.</p>
          <Button onClick={goToLogin}>Ir para Login</Button>
        </Alert>
      )}
    </Container>
  );
}
