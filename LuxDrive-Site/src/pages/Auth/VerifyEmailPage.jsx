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

    // Se não vier código nem modo, mostrar prompt para verificar email
    if (!mode && !code) {
      setStatus('prompt');
      return;
    }

    // Se veio modo diferente ou sem código→ erro
    if (mode !== 'verifyEmail' || !code) {
      setStatus('error');
      return;
    }

    // Caso válido, tentar aplicar o código
    const auth = getAuth();
    applyActionCode(auth, code)
      .then(() => setStatus('success'))
      .catch(() => setStatus('error'));
  }, [search]);

  const renderContent = () => {
    if (status === 'loading') {
      return <Spinner animation="border" />;
    }

    if (status === 'prompt') {
      return (
        <Alert variant="info">
          Verifique seu e‑mail!<br/>
          Enviamos um link de confirmação para o seu endereço.
        </Alert>
      );
    }

    if (status === 'success') {
      return (
        <Alert variant="success">
          Seu e‑mail foi verificado com sucesso!<br/>
          <Button onClick={() => navigate('/login')}>Ir para Login</Button>
        </Alert>
      );
    }

    // status === 'error'
    return (
      <Alert variant="danger">
        Falha na verificação. Link inválido ou expirado.<br/>
        <Button onClick={() => navigate('/login')}>Ir para Login</Button>
      </Alert>
    );
  };

  return (
    <Container className="d-flex vh-100">
      <Card className="m-auto p-4" style={{ minWidth: '300px', maxWidth: '400px' }}>
        <h5 className="text-center mb-3">Verificação de E‑mail</h5>
        {renderContent()}
      </Card>
    </Container>
  );
}
