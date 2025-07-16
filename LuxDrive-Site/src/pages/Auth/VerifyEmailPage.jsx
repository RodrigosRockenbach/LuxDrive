// src/pages/Auth/VerifyEmailPage.jsx
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getAuth, applyActionCode } from 'firebase/auth';
import { Button, Alert, Spinner, Container, Card } from 'react-bootstrap';

export default function VerifyEmailPage() {
  const [search] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading'); // 'loading' | 'prompt' | 'success' | 'error'

  useEffect(() => {
    const mode = search.get('mode');
    const code = search.get('oobCode');

    if (!mode && !code) {
      setStatus('prompt');
      return;
    }

    // Corrigido: usar "code" ao invés de "oobCode"
    if (mode !== 'verifyEmail' || !code) {
      setStatus('error');
      return;
    }

    const auth = getAuth();
    applyActionCode(auth, code)
      .then(() => setStatus('success'))
      .catch(() => setStatus('error'));
  }, [search]);

  const renderContent = () => {
    if (status === 'loading') {
      return (
        <div className="text-center">
          <Spinner animation="border" />
          <p className="mt-2">Verificando e‑mail...</p>
        </div>
      );
    }

    if (status === 'prompt') {
      return (
        <Alert variant="info">
          Verifique seu e‑mail!<br />
          Enviamos um link de confirmação para o seu endereço.
        </Alert>
      );
    }

    if (status === 'success') {
      return (
        <Alert variant="success">
          Seu e‑mail foi verificado com sucesso!
          <div className="text-center mt-3">
            <Button onClick={() => navigate('/login')}>Ir para Login</Button>
          </div>
        </Alert>
      );
    }

    return (
      <Alert variant="danger">
        Falha na verificação. Link inválido ou expirado.
        <div className="text-center mt-3">
          <Button onClick={() => navigate('/login')}>Ir para Login</Button>
        </div>
      </Alert>
    );
  };

  return (
    <Container className="d-flex vh-100 align-items-center justify-content-center">
      <Card className="p-4" style={{ minWidth: '300px', maxWidth: '400px' }}>
        <h5 className="text-center mb-3">Verificação de E‑mail</h5>
        {renderContent()}
      </Card>
    </Container>
  );
}
