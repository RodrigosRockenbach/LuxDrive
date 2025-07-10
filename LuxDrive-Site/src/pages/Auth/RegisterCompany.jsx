import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { registerUser } from '../../services/authService';
import '../../styles/RegisterCompany.css';

export default function RegisterCompany() {
  const [step, setStep] = useState(1);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [buscando, setBuscando] = useState(false);
  const navigate = useNavigate();

  const [nome, setNome] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [cep, setCep] = useState('');
  const [rua, setRua] = useState('');
  const [numero, setNumero] = useState('');
  const [bairro, setBairro] = useState('');
  const [cidade, setCidade] = useState('');
  const [estado, setEstado] = useState('');

  useEffect(() => {
    document.body.classList.add('auth-page');
    return () => document.body.classList.remove('auth-page');
  }, []);

  // Validação de CNPJ
  const validateCNPJ = (cnpj) => {
    const cleaned = cnpj.replace(/\D/g, '');
    if (cleaned.length !== 14) return false;
    // Elimina CNPJs inválidos (todos dígitos iguais)
    if (/^(\d)\1+$/.test(cleaned)) return false;
    const calcCheckDigit = (numbers) => {
      let sum = 0;
      let pos = numbers.length - 7;
      for (let i = numbers.length; i >= 1; i--) {
        sum += numbers.charAt(numbers.length - i) * pos--;
        if (pos < 2) pos = 9;
      }
      const result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
      return result;
    };
    const numbers = cleaned.substring(0, 12);
    const digits = cleaned.substring(12);
    const firstCheck = calcCheckDigit(numbers);
    if (firstCheck !== parseInt(digits.charAt(0), 10)) return false;
    const secondCheck = calcCheckDigit(numbers + firstCheck);
    if (secondCheck !== parseInt(digits.charAt(1), 10)) return false;
    return true;
  };

  const handleNextStep = (e) => {
    e.preventDefault();
    // Validação etapa 1
    if (!nome || !email || !password || !confirmPassword) {
      setError('Preencha todos os campos obrigatórios.');
      return;
    }
    if (password !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }
    if (cnpj && !validateCNPJ(cnpj)) {
      setError('CNPJ inválido.');
      return;
    }
    setError('');
    setStep(2);
  };

  const handleCepBlur = async () => {
    const raw = cep.replace(/\D/g, '');
    if (raw.length === 8) {
      setBuscando(true);
      try {
        const resp = await axios.get(`https://viacep.com.br/ws/${raw}/json/`);
        const { logradouro, bairro, localidade, uf } = resp.data;
        setRua(logradouro || '');
        setBairro(bairro || '');
        setCidade(localidade || '');
        setEstado(uf || '');
      } catch {
        setError('Erro ao buscar CEP.');
      } finally {
        setBuscando(false);
      }
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    // Validação etapa 2
    if (!cep || !rua || !numero || !bairro || !cidade || !estado) {
      setError('Preencha todos os campos de endereço.');
      return;
    }
    setError('');
    setIsLoading(true);
    try {
      await registerUser(email, password, 'company', {
        nome,
        ...(cnpj && { cnpj }),
        endereco: { cep, rua, numero, bairro, cidade, estado }
      });
      // Após cadastro, mandar para verificação de e-mail
      navigate('/verify-email');
    } catch (err) {
      setError(err.message || 'Erro ao registrar a empresa.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="register-company-page d-flex justify-content-center align-items-center"
      style={{ minHeight: '100vh', padding: '60px 0' }}
    >
      <div
        className="container p-5 rounded-4 shadow-lg bg-white"
        style={{ width: '100%', maxWidth: '600px', minHeight: '60vh' }}
      >
        <h5 className="text-center mb-4">Cadastro da Empresa</h5>
        <form onSubmit={step === 1 ? handleNextStep : handleRegister}>
          {step === 1 && (
            <>
              <input
                className="form-control border-bottom mb-3"
                type="text"
                placeholder="Nome da Empresa"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
              />
              <input
                className="form-control border-bottom mb-3"
                type="text"
                placeholder="CNPJ (opcional)"
                value={cnpj}
                onChange={(e) => setCnpj(e.target.value)}
              />
              <input
                className="form-control border-bottom mb-3"
                type="email"
                placeholder="E-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <input
                className="form-control border-bottom mb-3"
                type="password"
                placeholder="Senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <input
                className="form-control border-bottom mb-4"
                type="password"
                placeholder="Confirmar Senha"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </>
          )}

          {step === 2 && (
            <>
              <h6 className="mb-3 fw-bold">Endereço da Empresa</h6>
              <input
                className="form-control border-bottom mb-3"
                type="text"
                placeholder="CEP"
                value={cep}
                onChange={(e) => setCep(e.target.value)}
                onBlur={handleCepBlur}
                required
              />
              {buscando && <p>Buscando endereço...</p>}
              <input
                className="form-control border-bottom mb-3"
                type="text"
                placeholder="Rua"
                value={rua}
                onChange={(e) => setRua(e.target.value)}
                required
              />
              <input
                className="form-control border-bottom mb-3"
                type="text"
                placeholder="Número"
                value={numero}
                onChange={(e) => setNumero(e.target.value)}
                required
              />
              <input
                className="form-control border-bottom mb-3"
                type="text"
                placeholder="Bairro"
                value={bairro}
                onChange={(e) => setBairro(e.target.value)}
                required
              />
              <input
                className="form-control border-bottom mb-3"
                type="text"
                placeholder="Cidade"
                value={cidade}
                onChange={(e) => setCidade(e.target.value)}
                required
              />
              <input
                className="form-control border-bottom mb-4"
                type="text"
                placeholder="Estado"
                value={estado}
                onChange={(e) => setEstado(e.target.value)}
                required
              />
            </>
          )}

          {error && <p className="text-danger mt-2">{error}</p>}

          <button
            className="botaoCadastrar mt-3 mb-3"
            type="submit"
            disabled={isLoading}
          >
            {isLoading
              ? 'Cadastrando...'
              : step === 1
              ? 'Continuar'
              : 'Cadastrar'}
          </button>

          <Link
            to="/company/login"
            className="d-block text-center text-decoration-none mt-2"
          >
            Já tem conta? Entrar
          </Link>
        </form>
      </div>
    </div>
  );
}
