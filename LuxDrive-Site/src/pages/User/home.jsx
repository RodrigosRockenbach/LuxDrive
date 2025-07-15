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

const normalize = str =>
  str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

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
  const params = new URLSearchParams(location.search);
  const searchText = params.get('q') || '';
  const serviceFilter = params.get('service') || '';

  const services = [
    { title: 'Lavagem Simples', img: lavagemSimples },
    { title: 'Lavagem Completa', img: lavagemCompleta },
    { title: 'Polimento', img: Polimento },
    { title: 'Higienização', img: Higienizacao }
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
  }, [searchText, serviceFilter]);

  const checkLocation = async () => {
    try {
      const refUser = doc(db, 'users', user.uid);
      const snap = await getDoc(refUser);
      if (snap.exists() && !snap.data().cep) {
        setShowModal(true);
      }
    } finally {
      setLoadingLoc(false);
    }
  };

  const handleCepBlur = async () => {
    const cep = locData.cep.replace(/\D/g, '');
    if (cep.length === 8) {
      setBuscando(true);
      try {
        const resp = await axios.get(`https://viacep.com.br/ws/${cep}/json/`);
        const { logradouro, bairro, localidade, uf } = resp.data;
        setLocData(prev => ({
          ...prev,
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

  const handleSubmitLocation = async e => {
    e.preventDefault();
    const refUser = doc(db, 'users', user.uid);
    await updateDoc(refUser, locData);
    setShowModal(false);
  };

  const fetchEmpresas = async () => {
    setLoadingEmpresas(true);
    const snap = await getDocs(collection(db, 'users'));
    let list = snap.docs
      .map(d => ({ id: d.id, ...d.data() }))
      .filter(i => i.type === 'company');

    if (searchText) {
      const qNorm = normalize(searchText);
      list = list.filter(e =>
        normalize(e.name || '').includes(qNorm)
      );
    }
    if (serviceFilter) {
      list = list.filter(e =>
        (e.services || []).some(s => s.name === serviceFilter)
      );
    }

    setEmpresas(list);
    setLoadingEmpresas(false);
  };

  const clearFilters = () => navigate('/home');

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

          {/* Filtros ativos */}
          {(searchText || serviceFilter) && (
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6 className="fw-bold">
                {serviceFilter
                  ? `Serviço: ${serviceFilter}`
                  : `Resultados para: "${searchText}"`}
              </h6>
              <button className="btn btn-outline-secondary btn-sm" onClick={clearFilters}>
                Limpar filtros
              </button>
            </div>
          )}

          {/* Seleção de serviços */}
          {!searchText && !serviceFilter && (
            <>
              <h5 className="mb-4 fw-bold text-start">Serviços</h5>
              {/* Mobile carousel */}
              <div className="service-carousel d-md-none mb-4">
                {services.map((s, idx) => (
                  <div
                    key={idx}
                    className="carousel-card"
                    onClick={() => navigate(`/home?service=${encodeURIComponent(s.title)}`)}
                  >
                    <img src={s.img} alt={s.title} className="service-img mb-2" />
                    <p className="fw-medium text-center">{s.title}</p>
                  </div>
                ))}
              </div>
              {/* Desktop grid */}
              <div className="row g-4 d-none d-md-flex">
                {services.map((s, idx) => (
                  <div
                    key={idx}
                    className="col-md-3 text-center"
                    onClick={() => navigate(`/home?service=${encodeURIComponent(s.title)}`)}
                  >
                    <img src={s.img} alt={s.title} className="service-img mb-2" />
                    <p className="fw-medium">{s.title}</p>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Lista de empresas */}
          <h5 className="mb-4 fw-bold mt-5 text-start">Empresas</h5>
          {empresas.length > 0 ? (
            <div className="row g-4">
              {empresas.map(e => (
                <div
                  key={e.id}
                  className="col-md-6"
                  onClick={() => navigate(`/empresa/${e.id}`)}
                >
                  <div className="border p-3 rounded bg-white shadow-sm d-flex">
                    <div className="me-3">
                      {e.photoURL ? (
                        <img
                          src={e.photoURL}
                          alt="Logo"
                          className="rounded"
                          style={{ width: '90px', height: '90px', objectFit: 'cover' }}
                        />
                      ) : (
                        <div className="bg-secondary rounded" style={{ width: '90px', height: '90px' }} />
                      )}
                    </div>
                    <div className="flex-grow-1">
                      <h6 className="fw-bold">{e.name}</h6>
                      <p className="mb-1 empresa-desc">
                        {e.description || 'Sem descrição disponível'}
                      </p>
                      {e.endereco?.rua && (
                        <p className="mb-1 text-muted">
                          {e.endereco.rua}, {e.endereco.numero} - {e.endereco.bairro}
                        </p>
                      )}
                      {e.endereco?.cidade && e.endereco?.estado && (
                        <p className="mb-1 text-muted">
                          {e.endereco.cidade}/{e.endereco.estado}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted">Nenhuma empresa encontrada com esse filtro.</p>
          )}
        </div>
      </div>

      {/* Modal de CEP */}
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
            <Button variant="primary" type="submit">Salvar</Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </>
  );
}
