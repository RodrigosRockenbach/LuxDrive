import React, { useEffect, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '../../services/firebase';
import { collection, getDocs, doc, getDoc, updateDoc } from 'firebase/firestore';
import { useNavigate, useLocation } from 'react-router-dom';
import { Modal, Button, Form, Spinner } from 'react-bootstrap';
import axios from 'axios';

import lavagemSimples from '../../assets/images/lavagemSimples.jpg';
import lavagemCompleta from '../../assets/images/lavagemCompleta.jpg';
import Polimento from '../../assets/images/Polimento.jpg';
import Higienizacao from '../../assets/images/Higienizaçao.jpg';

import '../../styles/Home.css';

export default function Home() {
  const [user, loadingUser] = useAuthState(auth);
  const [showModal, setShowModal] = useState(false);
  const [locData, setLocData] = useState({
    cep: '',
    rua: '',
    numero: '',
    bairro: '',
    cidade: '',
    estado: ''
  });
  const [loadingLoc, setLoadingLoc] = useState(true);
  const [buscando, setBuscando] = useState(false);

  const [empresas, setEmpresas] = useState([]);
  const [loadingEmpresas, setLoadingEmpresas] = useState(true);

  const navigate = useNavigate();
  const location = useLocation();
  const query = new URLSearchParams(location.search).get('q')?.toLowerCase() || '';

  const services = [
    { title: 'Lavagem Simples', img: lavagemSimples },
    { title: 'Lavagem Completa', img: lavagemCompleta },
    { title: 'Polimento', img: Polimento },
    { title: 'Higienização', img: Higienizacao },
  ];

  useEffect(() => {
    document.body.classList.remove('auth-page');
  }, []);

  useEffect(() => {
    if (!loadingUser && user) {
      checkLocation();
    }
  }, [loadingUser, user]);

  useEffect(() => {
    fetchEmpresas();
  }, [query]);

  const checkLocation = async () => {
    try {
      const userRef = doc(db, 'users', user.uid);
      const snap = await getDoc(userRef);
      if (snap.exists() && !snap.data().cep) {
        setShowModal(true);
      }
    } finally {
      setLoadingLoc(false);
    }
  };

  const handleCepBlur = async () => {
    const { cep } = locData;
    if (cep.length === 8) {
      setBuscando(true);
      try {
        const resp = await axios.get(`https://viacep.com.br/ws/${cep}/json/`);
        const { logradouro, bairro, localidade, uf } = resp.data;
        setLocData(data => ({
          ...data,
          rua: logradouro || '',
          bairro: bairro || '',
          cidade: localidade || '',
          estado: uf || ''
        }));
      } catch (error) {
        console.error('Erro ao buscar CEP:', error);
      } finally {
        setBuscando(false);
      }
    }
  };

  const handleSubmitLocation = async (e) => {
    e.preventDefault();
    const userRef = doc(db, 'users', user.uid);
    await updateDoc(userRef, locData);
    setShowModal(false);
  };

  const fetchEmpresas = async () => {
    setLoadingEmpresas(true);
    const snapshot = await getDocs(collection(db, 'users'));
    const listaEmpresas = snapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter(item => item.type === 'company');

    const filtradas = query
      ? listaEmpresas.filter(empresa =>
          (empresa.nome || '').toLowerCase().includes(query)
        )
      : listaEmpresas;

    setEmpresas(filtradas);
    setLoadingEmpresas(false);
  };

  const limparBusca = () => {
    navigate('/home');
  };

  if (loadingUser || loadingLoc || loadingEmpresas) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <Spinner animation="border" />
      </div>
    );
  }

  return (
    <>
      <div className="home-page bg-light mt-5 pt-5">
        <div className="container">
          {query && (
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6 className="fw-bold">
                Resultados para: <span className="text-primary">"{query}"</span>
              </h6>
              <button className="btn btn-outline-secondary btn-sm" onClick={limparBusca}>
                Limpar busca
              </button>
            </div>
          )}

          {!query && (
            <>
              <h5 className="mb-4 fw-bold text-start">Serviços</h5>

              {/* Mobile - carrossel */}
              <div className="service-carousel d-md-none mb-4">
                {services.map((service, index) => (
                  <div className="carousel-card" key={index}>
                    <img src={service.img} alt={service.title} className="service-img mb-2" />
                    <p className="fw-medium text-center">{service.title}</p>
                  </div>
                ))}
              </div>

              {/* Desktop - grid */}
              <div className="row g-4 d-none d-md-flex">
                {services.map((service, index) => (
                  <div className="col-md-3 text-center" key={index}>
                    <img src={service.img} alt={service.title} className="service-img mb-2" />
                    <p className="fw-medium">{service.title}</p>
                  </div>
                ))}
              </div>
            </>
          )}

          <h5 className="mb-4 fw-bold mt-5 text-start">Empresas</h5>

          {empresas.length > 0 ? (
            <div className="row g-4">
              {empresas.map(empresa => {
                const distance = empresa.distance; // placeholder para futuro cálculo de distância
                return (
                  <div
                    key={empresa.id}
                    className="col-md-6"
                    style={{ cursor: 'pointer' }}
                    onClick={() => navigate(`/empresa/${empresa.id}`)}
                  >
                    <div className="border p-3 rounded bg-white shadow-sm d-flex">
                      <div className="me-3">
                        {empresa.photoURL ? (
                          <img
                            src={empresa.photoURL}
                            alt="Logo"
                            className="rounded"
                            style={{ width: '90px', height: '90px', objectFit: 'cover' }}
                          />
                        ) : (
                          <div
                            className="bg-secondary rounded"
                            style={{ width: '90px', height: '90px' }}
                          />
                        )}
                      </div>
                      <div className="flex-grow-1">
                        <h6 className="fw-bold">{empresa.nome || 'Empresa sem nome'}</h6>
                        <p className="mb-1">{empresa.description || 'Sem descrição disponível'}</p>
                        {empresa.endereco?.rua && (
                          <p className="mb-1 text-muted">
                            {empresa.endereco.rua}, {empresa.endereco.numero} - {empresa.endereco.bairro}
                          </p>
                        )}
                        {empresa.endereco?.cidade && empresa.endereco?.estado && (
                          <p className="mb-1 text-muted">
                            {empresa.endereco.cidade}/{empresa.endereco.estado}
                          </p>
                        )}
                        {distance !== undefined && (
                          <p className="mb-0 text-secondary">
                            Distância: {distance} km
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-muted">Nenhuma empresa encontrada com esse nome.</p>
          )}
        </div>
      </div>

      <Modal show={showModal} backdrop="static" centered>
        <Modal.Header>
          <Modal.Title>Complete sua localização</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmitLocation}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>CEP</Form.Label>
              <Form.Control
                type="text"
                value={locData.cep}
                onChange={e => setLocData({ ...locData, cep: e.target.value })}
                onBlur={handleCepBlur}
                placeholder="Apenas números"
              />
            </Form.Group>
            {buscando && <Spinner size="sm" animation="border" />}
            <Form.Group className="mb-3">
              <Form.Label>Rua</Form.Label>
              <Form.Control
                type="text"
                value={locData.rua}
                onChange={e => setLocData({ ...locData, rua: e.target.value })}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Número</Form.Label>
              <Form.Control
                type="text"
                value={locData.numero}
                onChange={e => setLocData({ ...locData, numero: e.target.value })}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Bairro</Form.Label>
              <Form.Control
                type="text"
                value={locData.bairro}
                onChange={e => setLocData({ ...locData, bairro: e.target.value })}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Cidade</Form.Label>
              <Form.Control
                type="text"
                value={locData.cidade}
                onChange={e => setLocData({ ...locData, cidade: e.target.value })}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Estado</Form.Label>
              <Form.Control
                type="text"
                value={locData.estado}
                onChange={e => setLocData({ ...locData, estado: e.target.value })}
                required
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="primary" type="submit">
              Salvar
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </>
  );
}
