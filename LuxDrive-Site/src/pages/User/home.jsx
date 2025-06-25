import { useEffect } from 'react';
import lavagemSimples from '../../assets/images/lavagemSimples.jpg';
import lavagemCompleta from '../../assets/images/lavagemCompleta.jpg';
import Polimento from '../../assets/images/Polimento.jpg';
import '../../styles/Home.css'; 

export default function Home() {
  useEffect(() => {
    document.body.classList.remove('auth-page');
  }, []);

  const services = [
    { title: 'Lavagem Simples', img: lavagemSimples },
    { title: 'Lavagem Completa', img: lavagemCompleta },
    { title: 'Polimento', img: Polimento },
    { title: 'Higienização', img: '' },
  ];

  return (
    <div className="home-page bg-light mt-5 pt-5">
      <div className="container">
        <h5 className="mb-4 fw-bold text-start">Serviços</h5>

        {/* Celular*/}
        <div className="service-carousel d-md-none mb-4">
          {services.map((service, index) => (
            <div className="carousel-card" key={index}>
              {service.img ? (
                <img src={service.img} alt={service.title} className="service-img mb-2" />
              ) : (
                <div className="service-img bg-secondary d-flex align-items-center justify-content-center text-white fw-bold">
                  {service.title.charAt(0)}
                </div>
              )}
              <p className="fw-medium text-center">{service.title}</p>
            </div>
          ))}
        </div>

        {/* Desktop*/}
        <div className="row g-4 d-none d-md-flex">
          {services.map((service, index) => (
            <div className="col-md-3 text-center" key={index}>
              {service.img ? (
                <img src={service.img} alt={service.title} className="service-img mb-2" />
              ) : (
                <div className="service-img bg-secondary d-flex align-items-center justify-content-center text-white fw-bold">
                  {service.title.charAt(0)}
                </div>
              )}
              <p className="fw-medium">{service.title}</p>
            </div>
          ))}
        </div>

        <h5 className="mb-4 fw-bold mt-5 text-start">Empresas</h5>
        <div className="row g-4">
          {[1, 2, 3, 4].map((_, i) => (
            <div className="col-md-6" key={i}>
              <div className="border p-3 rounded bg-white shadow-sm">
                <h6 className="fw-bold">Nome da Empresa {i + 1}</h6>
                <p className="mb-1">Endereço da empresa</p>
                <p className="mb-0">Serviços oferecidos: Lavagem, Polimento...</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}