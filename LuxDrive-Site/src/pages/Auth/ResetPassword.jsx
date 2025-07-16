
import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { verifyPasswordResetCode, confirmPasswordReset } from 'firebase/auth';
import { auth } from '../../services/firebase';
import 'bootstrap/dist/css/bootstrap.min.css';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [oobCodeValid, setOobCodeValid] = useState(false);
  const [loading, setLoading] = useState(true);
  const oobCode = searchParams.get('oobCode');

  useEffect(() => {
    async function validateCode() {
      try {
        await verifyPasswordResetCode(auth, oobCode);
        setOobCodeValid(true);
      } catch (err) {
        setError('Código de redefinição inválido ou expirado.');
      } finally {
        setLoading(false);
      }
    }

    if (oobCode) {
      validateCode();
    } else {
      setError('Código não encontrado na URL.');
      setLoading(false);
    }
  }, [oobCode]);

  const handleReset = async (e) => {
    e.preventDefault();
    setError('');
    if (newPassword.length < 6) {
      setError('A nova senha deve ter no mínimo 6 caracteres.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }
    try {
      await confirmPasswordReset(auth, oobCode, newPassword);
      setSuccess('Senha redefinida com sucesso! Redirecionando para login...');
      setTimeout(() => navigate('/login-user'), 3000);
    } catch (err) {
      setError('Erro ao redefinir senha. Tente novamente.');
    }
  };

  if (loading) return <div className="container mt-5">Carregando...</div>;

  if (!oobCodeValid) return <div className="container mt-5 text-danger">{error}</div>;

  return (
    <div className="container mt-5" style={{ maxWidth: '500px' }}>
      <h2 className="mb-4">Redefinir Senha</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}
      <form onSubmit={handleReset}>
        <div className="mb-3">
          <label className="form-label">Nova Senha</label>
          <input
            type="password"
            className="form-control"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Confirmar Nova Senha</label>
          <input
            type="password"
            className="form-control"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="btn btn-primary w-100">Redefinir Senha</button>
      </form>
    </div>
  );
}
