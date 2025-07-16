import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  verifyPasswordResetCode,
  confirmPasswordReset,
  applyActionCode
} from 'firebase/auth';
import { auth } from '../../services/firebase';
import 'bootstrap/dist/css/bootstrap.min.css';

export default function AuthAction() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [mode, setMode] = useState('');
  const [oobCode, setOobCode] = useState('');
  const [error, setError] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [codeValid, setCodeValid] = useState(false);

  useEffect(() => {
    const modeParam = searchParams.get('mode');
    const codeParam = searchParams.get('oobCode');
    setMode(modeParam);
    setOobCode(codeParam);
  }, [searchParams]);

  useEffect(() => {
    async function validateResetCode() {
      if (mode === 'resetPassword' && oobCode) {
        try {
          await verifyPasswordResetCode(auth, oobCode);
          setCodeValid(true);
        } catch (err) {
          setError('O código de redefinição é inválido ou expirou.');
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    }

    async function handleEmailVerification() {
      try {
        await applyActionCode(auth, oobCode);
        setSuccessMessage('E‑mail verificado com sucesso! Redirecionando...');
        setTimeout(() => navigate('/login'), 3000);
      } catch (err) {
        setError('O link de verificação é inválido ou expirou.');
      } finally {
        setLoading(false);
      }
    }

    if (mode === 'verifyEmail' && oobCode) {
      handleEmailVerification();
    } else if (mode === 'resetPassword') {
      validateResetCode();
    }
  }, [mode, oobCode, navigate]);

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    setError('');
    if (newPassword.length < 6) {
      setError('A senha deve ter no mínimo 6 caracteres.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }
    try {
      await confirmPasswordReset(auth, oobCode, newPassword);
      setSuccessMessage('Senha redefinida com sucesso! Redirecionando...');
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError('Erro ao redefinir senha.');
    }
  };

  return (
    <div className="container mt-5" style={{ maxWidth: '500px' }}>
      {loading ? (
        <div>Carregando...</div>
      ) : mode === 'resetPassword' ? (
        <>
          <h2 className="mb-4">Redefinir Senha</h2>
          {error && <div className="alert alert-danger">{error}</div>}
          {successMessage && <div className="alert alert-success">{successMessage}</div>}
          {codeValid && !successMessage && (
            <form onSubmit={handlePasswordReset}>
              <div className="mb-3">
                <label className="form-label">Nova Senha</label>
                <input
                  type="password"
                  className="form-control"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Confirmar Nova Senha</label>
                <input
                  type="password"
                  className="form-control"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
              <button type="submit" className="btn btn-primary w-100">Redefinir Senha</button>
            </form>
          )}
        </>
      ) : mode === 'verifyEmail' ? (
        <>
          <h2 className="mb-4">Verificando e‑mail...</h2>
          {error && <div className="alert alert-danger">{error}</div>}
          {successMessage && <div className="alert alert-success">{successMessage}</div>}
        </>
      ) : (
        <div className="text-danger">Parâmetro inválido na URL.</div>
      )}
    </div>
  );
}
