import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../services/firebase';

import lavagemSimples from '../../assets/images/lavagemSimples.jpg';
import lavagemCompleta from '../../assets/images/lavagemCompleta.jpg';
import Polimento from '../../assets/images/Polimento.jpg';
import Higienizacao from '../../assets/images/Higienizaçao.jpg';

import { useNavigate } from 'react-router-dom';
import '../../styles/Home.css';

export default function Home() {
  const [empresas, setEmpresas] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    document.body.classList.remove('auth-page');
    fetchEmpresas();
  }, []);

  const fetchEmpresas = async () => {
    const querySnapshot = await getDocs(collection(db, 'users'));
    const listaEmpresas = querySnapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter(item => item.type === 'company'); // garante que são empresas
    setEmpresas(listaEmpresas);
  };

  const services = [
    { title: 'Lavagem Simples', img: lavagemSimples },
    { title: 'Lavagem Completa', img: lavagemCompleta },
    { title: 'Polimento', img: Polimento },
    { title: 'Higienização', img: Higienizacao },
  ];

  return (
    <div className="home-page bg-light mt-5 pt-5">
      <div className="container">
        <h5 className="mb-4 fw-bold text-start">Serviços</h5>

        {/* Celular */}
        <div className="service-carousel d-md-none mb-4">
          {services.map((service, index) => (
            <div className="carousel-card" key={index}>
              <img src={service.img} alt={service.title} className="service-img mb-2" />
              <p className="fw-medium text-center">{service.title}</p>
            </div>
          ))}
        </div>

        {/* Desktop */}
        <div className="row g-4 d-none d-md-flex">
          {services.map((service, index) => (
            <div className="col-md-3 text-center" key={index}>
              <img src={service.img} alt={service.title} className="service-img mb-2" />
              <p className="fw-medium">{service.title}</p>
            </div>
          ))}
        </div>

        <h5 className="mb-4 fw-bold mt-5 text-start">Empresas</h5>
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

      </div>
    </div>
  );
}