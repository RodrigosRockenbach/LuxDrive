import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../firebase";
import "../../assets/styles/RegisterCompany.css";

export default function RegisterCompany() {
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [celular, setCelular] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [cep, setCep] = useState("");
  const [estado, setEstado] = useState("");
  const [rua, setRua] = useState("");
  const [numero, setNumero] = useState("");
  const [bairro, setBairro] = useState("");

  const [step, setStep] = useState(1);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleNextStep = (e) => {
    e.preventDefault();
    if (!email || !celular || !nome || !cnpj || !password || !confirmPassword) {
      setError("Preencha todos os campos obrigatórios.");
      return;
    }
    setError("");
    setStep(2);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }

    if (!cep || !estado || !rua || !numero || !bairro) {
      setError("Preencha todos os campos de endereço.");
      return;
    }

    setIsLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      // Futuro: salvar dados no Firestore
      navigate("/company/login");
    } catch (err) {
      setError("Erro ao criar conta. " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="register-company-page d-flex justify-content-center align-items-center" style={{ minHeight: "100vh", padding: "60px 0" }}>
      <div className="container p-5 rounded-4 shadow-lg bg-white" style={{ width: "100%", maxWidth: "600px", minHeight: "60vh" }}>
        <h5 className="text-center mb-4"><dt>Cadastro da Empresa</dt></h5>

        <form onSubmit={step === 1 ? handleNextStep : handleRegister}>
          {step === 1 && (
            <>
              <input className="bg-transparent form-control-plaintext border-bottom mb-3" type="text" placeholder="Nome da Empresa" value={nome} onChange={(e) => setNome(e.target.value)} required />
              <input className="bg-transparent form-control-plaintext border-bottom mb-3" type="text" placeholder="CNPJ" value={cnpj} onChange={(e) => setCnpj(e.target.value)} required />
              <input className="bg-transparent form-control-plaintext border-bottom mb-3" type="tel" placeholder="Celular" value={celular} onChange={(e) => setCelular(e.target.value)} required />
              <input className="bg-transparent form-control-plaintext border-bottom mb-3" type="email" placeholder="E-mail" value={email} onChange={(e) => setEmail(e.target.value)} required />
              <input className="bg-transparent form-control-plaintext border-bottom mb-3" type="password" placeholder="Senha" value={password} onChange={(e) => setPassword(e.target.value)} required />
              <input className="bg-transparent form-control-plaintext border-bottom mb-4" type="password" placeholder="Confirmar senha" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
            </>
          )}

          {step === 2 && (
            <>
              <h6 className="mb-3 fw-bold">Endereço da Empresa</h6>
              <input className="bg-transparent form-control-plaintext border-bottom mb-3" type="text" placeholder="CEP" value={cep} onChange={(e) => setCep(e.target.value)} required />
              <input className="bg-transparent form-control-plaintext border-bottom mb-3" type="text" placeholder="Estado" value={estado} onChange={(e) => setEstado(e.target.value)} required />
              <input className="bg-transparent form-control-plaintext border-bottom mb-3" type="text" placeholder="Rua" value={rua} onChange={(e) => setRua(e.target.value)} required />
              <input className="bg-transparent form-control-plaintext border-bottom mb-3" type="text" placeholder="Número" value={numero} onChange={(e) => setNumero(e.target.value)} required />
              <input className="bg-transparent form-control-plaintext border-bottom mb-4" type="text" placeholder="Bairro" value={bairro} onChange={(e) => setBairro(e.target.value)} required />
            </>
          )}

          {error && <p className="text-danger mt-2">{error}</p>}

          <button className="botaoCadastrar mt-3 mb-3" type="submit" disabled={isLoading}>
            {isLoading ? "Cadastrando..." : step === 1 ? "Continuar" : "Cadastrar"}
          </button>

          <Link to="/company/login" className="d-block text-center text-decoration-none mt-2">
            Já tem conta? Entrar
          </Link>
        </form>
      </div>
    </div>
  );
}