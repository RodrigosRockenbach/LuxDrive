import React, { useState, useEffect } from 'react';
import { getAuth, sendEmailVerification } from 'firebase/auth';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useNavigate } from 'react-router-dom';
import { Button, Alert } from 'react-bootstrap';

export default function VerifyEmailPage() {
  const auth = getAuth();
  const [user, loading] = useAuthState(auth);
  const [sent, setSent] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user && user.emailVerified) {
      navigate('/home');
    }
  }, [user, loading, navigate]);

  const handleResend = async () => {
    if (user) {
      await sendEmailVerification(user);
      setSent(true);
    }
  };

  if (loading || !user) {
    return null; // 
  }

  return (
    <div className="container mt-5 text-center">
      <h4>Verifique seu e-mail</h4>
      <p>
        Enviamos um link de verificação para <strong>{user.email}</strong>.
        <br />
        Clique no link na sua caixa de entrada para ativar sua conta.
      </p>

      {sent && <Alert variant="success">Link reenviado com sucesso!</Alert>}

      <Button onClick={handleResend} disabled={sent} className="mt-3">
        {sent ? 'Enviado' : 'Reenviar link'}
      </Button>
    </div>
  );
}
