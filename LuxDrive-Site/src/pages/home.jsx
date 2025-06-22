import { useEffect } from 'react';
import lavagemSimples from '../assets/images/lavagemSimples.jpg';
import lavagemCompleta from '../assets/images/lavagemCompleta.jpg';
import Polimento from '../assets/images/Polimento.jpg';
import '../assets/styles/Home.css'; // Certifique-se de ter criado esse CSS

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
        {/* Celular */}
        <div className="service-carousel d-md-none mb-4">
          {services.map((service, index) => (
            <div className="carousel-card" key={index}>
              {service.img ? (
                <img src={service.img} alt={service.title} className="service-img mb-2" />
              ) : (
                <div className="service-img bg-secondary d-flex align-items-center justify-content-center text-white">
                  H
                </div>
              )}
              <p className="fw-medium text-center">{service.title}</p>
            </div>
          ))}
        </div>
        {/* Computador */}
        <div className="row g-4 d-none d-md-flex">
          {services.map((service, index) => (
            <div className="col-md-3 text-center" key={index}>
              {service.img ? (
                <img src={service.img} alt={service.title} className="service-img mb-2" />
              ) : (
                <div className="service-img bg-secondary d-flex align-items-center justify-content-center text-white">
                  H
                </div>
              )}
              <p className="fw-medium">{service.title}</p>
            </div>
          ))}
        </div>

        <h5 className="mb-4 fw-bold mt-5 text-start">Empresas</h5>
        <div class="row">
          <div class="col border p-3"> aqui aparecer uma empresa</div>
          <div class="col border p-3"> aqui aparecer uma empresa</div>
        </div>
        <div class="row">
          <div class="col border p-3"> aqui aparecer uma empresa</div>
          <div class="col border p-3"> aqui aparecer uma empresa</div>
        </div>
      </div>
    </div>
  );
}
