import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registerUser } from "../../services/authService";
import '../../styles/RegisterUser.css';
import logoAzul from '../../assets/images/LogoAzul.png';
import Loading from "../../components/common/Loading";

export default function RegisterUser() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    document.body.classList.add('auth-page');
    return () => document.body.classList.remove('auth-page');
  }, []);

  const handleRegister = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      await registerUser(email, password, "user", {
        name,
        email
      });

      navigate("/login");
    } catch (err) {
      console.error("Erro ao criar conta:", err);
      setError(err.message || "Erro ao criar conta. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="register-page">
      {isLoading && <Loading />}
      <div className="container shadow-lg rounded-4 overflow-hidden">
        <div className="row">
          <div className="col-md-6 d-flex align-items-center justify-content-center p-4">
            <img src={logoAzul} alt="Logo da empresa" className="imgLogo img-fluid" style={{ maxHeight: '300px' }} />
          </div>

          <div className="col-md-6 p-5">
            <h3 className="text-center mb-4 text-dark">Cadastro de Usuário</h3>

            {error && <div className="alert alert-danger">{error}</div>}

            <form onSubmit={handleRegister}>
              <div className="mb-4">
                <input
                  type="text"
                  className="form-control border-bottom rounded-0"
                  placeholder="Nome completo"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="mb-4">
                <input
                  type="email"
                  className="form-control border-bottom rounded-0"
                  placeholder="E-mail"
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

              <div className="mb-4">
                <input
                  type="password"
                  className="form-control border-bottom rounded-0"
                  placeholder="Confirmar senha"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>

              <div className="d-grid">
                <button
                  type="submit"
                  className="botao"
                  disabled={isLoading}
                >
                  {isLoading ? 'Cadastrando...' : 'Cadastrar'}
                </button>
              </div>

              <div className="text-center mt-3">
                <span>Já tem uma conta? </span>
                <Link to="/login" className="text-decoration-none" style={{ color: '#3437C9' }}>
                  Entrar
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}