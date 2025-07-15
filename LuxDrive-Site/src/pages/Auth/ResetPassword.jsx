import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { verifyPasswordResetCode, confirmPasswordReset } from 'firebase/auth';
import { auth } from '../../services/firebase';
import { Spinner, Alert, Form, Button, Container } from 'react-bootstrap';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const oobCode = searchParams.get('oobCode');

  const [status, setStatus] = useState('loading');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');

  // Verifica se o código é válido
  useEffect(() => {
    if (!oobCode) {
      setStatus('invalid');
      return;
    }
    verifyPasswordResetCode(auth, oobCode)
      .then(() => setStatus('ready'))
      .catch(() => setStatus('invalid'));
  }, [oobCode]);

  // Envia a nova senha
  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('submitting');
    try {
      await confirmPasswordReset(auth, oobCode, newPassword);
      setStatus('success');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.message);
      setStatus('error');
    }
  };

  return (
    <Container className="mt-5">
      {status === 'loading' && (
        <div className="text-center">
          <Spinner animation="border" role="status" />
          <p className="mt-3">Validando link...</p>
        </div>
      )}

      {status === 'invalid' && (
        <Alert variant="danger" className="text-center">
          Link inválido ou expirado.
        </Alert>
      )}

      {status === 'ready' && (
        <Form onSubmit={handleSubmit} className="mx-auto" style={{ maxWidth: 400 }}>
          <Form.Group controlId="newPassword">
            <Form.Label>Nova senha</Form.Label>
            <Form.Control
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </Form.Group>
          <Button type="submit" className="mt-3" disabled={status === 'submitting'}>
            {status === 'submitting' ? 'Enviando...' : 'Redefinir senha'}
          </Button>
        </Form>
      )}

      {status === 'success' && (
        <Alert variant="success" className="text-center">
          Senha redefinida com sucesso! Redirecionando ao login...
        </Alert>
      )}

      {status === 'error' && (
        <Alert variant="danger" className="text-center">
          {error}
        </Alert>
      )}
    </Container>
  );
}
