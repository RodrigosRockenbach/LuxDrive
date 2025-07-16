import React, { useState } from 'react';
import { requestPasswordReset } from '../../services/authService';
import { Form, Button, Alert, Spinner } from 'react-bootstrap';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus(null);

    // Validação simples de e-mail
    const isEmailValid = /\S+@\S+\.\S+/.test(email);
    if (!isEmailValid) {
      setStatus('invalidEmail');
      return;
    }

    setLoading(true);
    try {
      await requestPasswordReset(email);
      setStatus('sent');
    } catch {
      setStatus('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="forgot-password-page d-flex justify-content-center align-items-center"
      style={{ minHeight: '100vh', padding: '60px 0' }}
    >
      <div className="container p-5 rounded-4 shadow-lg bg-white" style={{ maxWidth: '500px' }}>
        <h4 className="text-center mb-4">Recuperar Senha</h4>

        {status === 'sent' && (
          <Alert variant="success">E-mail de redefinição enviado! Verifique sua caixa de entrada.</Alert>
        )}
        {status === 'error' && (
          <Alert variant="danger">Erro ao enviar e-mail. Tente novamente mais tarde.</Alert>
        )}
        {status === 'invalidEmail' && (
          <Alert variant="warning">Por favor, insira um e-mail válido.</Alert>
        )}

        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3" controlId="formBasicEmail">
            <Form.Label>E-mail</Form.Label>
            <Form.Control
              type="email"
              placeholder="Digite seu e-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </Form.Group>
          <div className="d-grid">
            <Button variant="primary" type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Enviando...
                </>
              ) : (
                'Enviar Link de Redefinição'
              )}
            </Button>
          </div>
        </Form>

        <div className="text-center mt-3">
          <a href="/login" className="text-decoration-none">
            Voltar ao Login
          </a>
        </div>
      </div>
    </div>
  );
}
