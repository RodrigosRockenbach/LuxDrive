import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../firebase";
import '../../assets/styles/RegisterUser.css';
import logoAzul from '../../assets/images/LogoAzul.png';

export default function RegisterUser() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }

    setIsLoading(true);

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      navigate("/login");
    } catch (err) {
      setError("Erro ao criar conta. " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="register-page">
      <div className="container p-5 rounded-4 shadow-lg">
        <div className="row">
          <div className="col-sm-6 d-flex justify-content-center align-items-center">
            <img src={logoAzul} alt="Logo da empresa" className="img-fluid h-100" />
          </div>

          <div className="col-sm-6">
            <h3 className="text-center mb-4"><dt>Cadastro de Usuário</dt></h3>

            <form onSubmit={handleRegister}>
              <input
                className="bg-transparent form-control-plaintext border-bottom mb-3"
                type="email"
                placeholder="E-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <input
                className="bg-transparent form-control-plaintext border-bottom mb-3"
                type="password"
                placeholder="Senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              <input
                className="bg-transparent form-control-plaintext border-bottom mb-4"
                type="password"
                placeholder="Confirmar senha"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />

              {error && <p className="text-danger">{error}</p>}

              <button className="botaoCadastrar mt-2 mb-3" type="submit" disabled={isLoading}>
                {isLoading ? 'Cadastrando...' : 'Cadastrar'}
              </button>

              <Link to="/login" className="d-block text-center text-decoration-none mt-3">
                Já tem uma conta? Entrar
              </Link>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
