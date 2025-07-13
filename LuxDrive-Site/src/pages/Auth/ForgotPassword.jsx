import React, { useState } from 'react';
import { requestPasswordReset } from '../../services/authService';
import { Form, Button, Alert } from 'react-bootstrap';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState(null); 

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus(null);
    try {
      await requestPasswordReset(email);
      setStatus('sent');
    } catch {
      setStatus('error');
    }
  };

  return (
    <div className="forgot-password-page d-flex justify-content-center align-items-center" style={{ minHeight: '100vh', padding: '60px 0' }}>
      <div className="container p-5 rounded-4 shadow-lg bg-white" style={{ maxWidth: '500px' }}>
        <h4 className="text-center mb-4">Recuperar Senha</h4>

        {status === 'sent' && (
          <Alert variant="success">
            E-mail de redefinição enviado! Verifique sua caixa de entrada.
          </Alert>
        )}
        {status === 'error' && (
          <Alert variant="danger">
            Erro ao enviar e-mail. Tente novamente mais tarde.
          </Alert>
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
            <Button variant="primary" type="submit">
              Enviar Link de Redefinição
            </Button>
          </div>
        </Form>

        <div className="text-center mt-3">
          <Alert variant="link" className="p-0">
            <a href="/login">Voltar ao Login</a>
          </Alert>
        </div>
      </div>
    </div>
  );
}
