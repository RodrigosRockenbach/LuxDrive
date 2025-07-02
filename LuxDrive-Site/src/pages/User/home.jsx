import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { useNavigate, useLocation } from 'react-router-dom';

import lavagemSimples from '../../assets/images/lavagemSimples.jpg';
import lavagemCompleta from '../../assets/images/lavagemCompleta.jpg';
import Polimento from '../../assets/images/Polimento.jpg';
import Higienizacao from '../../assets/images/Higienizaçao.jpg';

import '../../styles/Home.css';

export default function Home() {
  const [empresas, setEmpresas] = useState([]);
  const [loading, setLoading] = useState(true);

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
    fetchEmpresas();
  }, [query]);

  const fetchEmpresas = async () => {
    const snapshot = await getDocs(collection(db, 'users'));
    const listaEmpresas = snapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter(item => item.type === 'company');

    const filtradas = query
      ? listaEmpresas.filter(empresa =>
          empresa.name?.toLowerCase().includes(query)
        )
      : listaEmpresas;

    setEmpresas(filtradas);
    setLoading(false);
  };

  const limparBusca = () => {
    navigate('/home');
  };

  return (
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

        {loading ? (
          <p>Carregando...</p>
        ) : empresas.length > 0 ? (
          <div className="row g-4">
            {empresas.map(empresa => (
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
                  <div>
                    <h6 className="fw-bold">{empresa.name || 'Empresa sem nome'}</h6>
                    <p className="mb-1">{empresa.description || 'Sem descrição disponível'}</p>
                    <p className="mb-0 text-muted">{empresa.address || 'Endereço não informado'}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted">Nenhuma empresa encontrada com esse nome.</p>
        )}
      </div>
    </div>
  );
}
