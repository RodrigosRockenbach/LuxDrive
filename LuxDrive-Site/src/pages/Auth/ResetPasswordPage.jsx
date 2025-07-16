import { useSearchParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getAuth, verifyPasswordResetCode, confirmPasswordReset } from 'firebase/auth';
import { Container, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';

export default function ResetPasswordPage() {
  const [search] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading');
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const code = search.get('oobCode');
  const mode = search.get('mode');

  useEffect(() => {
    if (mode !== 'resetPassword' || !code) {
      setStatus('error');
      return;
    }

    const auth = getAuth();
    verifyPasswordResetCode(auth, code)
      .then(email => {
        setEmail(email);
        setStatus('ready');
      })
      .catch(() => setStatus('error'));
  }, [code, mode]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (newPassword.length < 6) {
      setError('A nova senha deve ter pelo menos 6 caracteres.');
      return;
    }

    setLoading(true);
    try {
      const auth = getAuth();
      await confirmPasswordReset(auth, code, newPassword);
      setStatus('success');
    } catch (err) {
      if (err.code === 'auth/weak-password') {
        setError('A senha é muito fraca.');
      } else if (err.code === 'auth/expired-action-code') {
        setError('O link de redefinição expirou.');
      } else {
        setError('Não foi possível redefinir a senha.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" />
      </div>
    );
  }

  if (status === 'error') {
    return (
      <Container className="d-flex min-vh-100 align-items-center">
        <Card className="m-auto p-4">
          <Alert variant="danger">Link inválido ou expirado.</Alert>
          <Button onClick={() => navigate('/login')}>Ir para Login</Button>
        </Card>
      </Container>
    );
  }

  if (status === 'success') {
    return (
      <Container className="d-flex min-vh-100 align-items-center">
        <Card className="m-auto p-4">
          <Alert variant="success">
            Sua senha foi redefinida com sucesso! Agora faça login.
          </Alert>
          <Button onClick={() => navigate('/login')}>Ir para Login</Button>
        </Card>
      </Container>
    );
  }

  return (
    <Container className="d-flex min-vh-100 align-items-center">
      <Card className="m-auto p-4" style={{ maxWidth: '400px', width: '100%' }}>
        <h5 className="mb-3">Redefinir senha para <strong>{email}</strong></h5>
        {error && <Alert variant="danger">{error}</Alert>}
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Nova senha</Form.Label>
            <Form.Control
              type="password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              required
            />
          </Form.Group>
          <Button type="submit" disabled={loading}>
            {loading ? <Spinner size="sm" animation="border" /> : 'Salvar senha'}
          </Button>
        </Form>
      </Card>
    </Container>
  );
}
