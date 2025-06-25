import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { loginUser } from '../../services/authService';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';

import '../../styles/LoginUser.css';
import logoAzul from '../../assets/images/LogoAzul.png';
import Loading from '../../components/common/Loading';

export default function LoginUser() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    document.body.classList.add('auth-page');
    return () => document.body.classList.remove('auth-page');
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const userCredential = await loginUser(email, password);
      const user = userCredential.user;

      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (!userDoc.exists() || userDoc.data().type !== 'user') {
        setError('Esta conta não é de pessoa física.');
        setIsLoading(false);
        return;
      }

      navigate('/home');
    } catch (err) {
      if (
        err.code === 'auth/invalid-credential' ||
        err.code === 'auth/user-not-found' ||
        err.code === 'auth/wrong-password'
      ) {
        setError('E-mail ou senha incorretos. Verifique e tente novamente.');
      } else {
        setError('Erro ao fazer login. Tente novamente mais tarde.');
      }
      setIsLoading(false);
    }
  };

  if (isLoading) return <Loading />;

  return (
    <div className="register-page">
      <div className="container shadow-lg rounded-4 overflow-hidden">
        <div className="row">
          <div className="col-md-6 d-flex flex-column align-items-center justify-content-center p-5 border-end">
            <img
              src={logoAzul}
              alt="Logo da empresa"
              className="imgLogo img-fluid mb-3"
              style={{ maxHeight: '300px' }}
            />
          </div>

          <div className="col-md-6 p-5">
            <h3 className="text-center mb-4 text-dark">Entrar na conta</h3>

            {error && <div className="alert alert-danger">{error}</div>}

            <form onSubmit={handleLogin}>
              <div className="mb-4">
                <input
                  type="email"
                  className="form-control border-bottom rounded-0"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="mb-4">
                <input
                  type="password"
                  className="form-control border-bottom rounded-0"
                  placeholder="Senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <div className="d-grid mb-3">
                <button
                  type="submit"
                  className="botao"
                  disabled={isLoading}
                >
                  {isLoading ? 'Entrando...' : 'Entrar'}
                </button>
              </div>

              <div className="text-center">
                <Link to="/cadastro" className="d-block mb-1 text-decoration-none" style={{ color: '#3437C9' }}>
                  Cadastrar
                </Link>
                <Link to="/company/register" className="small text-decoration-none" style={{ color: '#3437C9' }}>
                  Empresa? Cadastrar
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}