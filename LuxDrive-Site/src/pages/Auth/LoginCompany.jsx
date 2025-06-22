import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { loginUser } from '../../services/authService';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import '../../assets/styles/LoginCompany.css';
import logoAzul from '../../assets/images/LogoAzul.png';
import Loading from '../../components/Loading';

export default function LoginCompany() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showLoader, setShowLoader] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    document.body.classList.add('auth-page');
    return () => document.body.classList.remove('auth-page');
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    setShowLoader(true);

    try {
      const userCredential = await loginUser(email, password);
      const user = userCredential.user;

      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (!userDoc.exists() || userDoc.data().type !== 'company') {
        setError('Esta conta não é de empresa.');
        return;
      }

      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Erro desconhecido ao fazer login.');
    } finally {
      setIsLoading(false);
      setShowLoader(false);
    }
  };

  return (
    <div className="login-company-page">
      {showLoader && <Loading />}
      <div className="container p-5 rounded-4 shadow-lg">
        <div className="row">
          <div className="col-sm-6 d-flex justify-content-center align-items-center">
            <img src={logoAzul} alt="Logo da empresa" className="img-fluid h-100" />
          </div>

          <div className="col-sm-6">
            <h3 className="text-center mb-4"><dt>Login da Empresa</dt></h3>

            <form onSubmit={handleLogin}>
              <input
                className="bg-transparent form-control-plaintext border-bottom mb-3"
                type="email"
                placeholder="E-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <input
                className="bg-transparent form-control-plaintext border-bottom mb-4"
                type="password"
                placeholder="Senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              {error && <p className="text-danger">{error}</p>}

              <button className="botaoEntrar mt-2 mb-3" type="submit" disabled={isLoading}>
                {isLoading ? 'Entrando...' : 'Entrar'}
              </button>

              <Link to="/company/register" className="d-block text-center text-decoration-none mt-3">
                Não tem conta? Cadastre sua empresa
              </Link>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
