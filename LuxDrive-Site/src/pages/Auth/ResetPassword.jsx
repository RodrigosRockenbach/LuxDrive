import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { getAuth, verifyPasswordResetCode, confirmPasswordReset } from 'firebase/auth';
import { Container, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';

export default function ResetPasswordPage() {
  const [search] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('verifying'); 
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const oobCode = search.get('oobCode');
  const mode = search.get('mode');

  useEffect(() => {
    if (mode !== 'resetPassword' || !oobCode) {
      setStatus('error');
      return;
    }
    const auth = getAuth();
    verifyPasswordResetCode(auth, oobCode)
      .then(email => {
        setEmail(email);
        setStatus('ready');
      })
      .catch(() => {
        setStatus('error');
      });
  }, [mode, oobCode]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    if (newPassword.length < 6) {
      setErrorMsg('A senha precisa ter pelo menos 6 caracteres.');
      return;
    }
    setStatus('verifying');
    try {
      const auth = getAuth();
      await confirmPasswordReset(auth, oobCode, newPassword);
      setStatus('success');
    } catch (err) {
      console.error(err);
      setErrorMsg('Não foi possível redefinir a senha. Tente novamente.');
      setStatus('ready');
    }
  };

  const renderContent = () => {
    if (status === 'verifying') {
      return <Spinner animation="border" />;
    }
    if (status === 'error') {
      return (
        <Alert variant="danger">
          Link inválido ou expirado.<br/>
          <Button variant="primary" onClick={() => navigate('/forgot-password')}>
            Solicitar novo link
          </Button>
        </Alert>
      );
    }
    if (status === 'success') {
      return (
        <Alert variant="success">
          Sua senha foi alterada com sucesso!<br/>
          <Button variant="primary" onClick={() => navigate('/login')}>
            Ir para Login
          </Button>
        </Alert>
      );
    }

    return (
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>E‑mail</Form.Label>
          <Form.Control type="email" value={email} readOnly />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Nova Senha</Form.Label>
          <Form.Control
            type="password"
            value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
            placeholder="Digite sua nova senha"
            required
          />
        </Form.Group>
        {errorMsg && <Alert variant="danger">{errorMsg}</Alert>}
        <Button type="submit" className="w-100">
          Salvar nova senha
        </Button>
      </Form>
    );
  };

  return (
    <Container className="d-flex vh-100">
      <Card className="m-auto p-4" style={{ minWidth: '320px', maxWidth: '400px', width: '100%' }}>
        <h5 className="text-center mb-3">Redefinir Senha</h5>
        {renderContent()}
      </Card>
    </Container>
  );
}
