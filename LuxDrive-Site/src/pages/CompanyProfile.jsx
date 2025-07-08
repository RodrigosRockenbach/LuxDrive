import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import ScheduleModal from '../components/scheduling/ScheduleModal';
import { FaInstagram, FaFacebook } from 'react-icons/fa';
import perfilImage from '../assets/images/perfilImage.png';

export default function CompanyProfile() {
  const { id } = useParams();
  const [company, setCompany] = useState(null);
  const [selectedService, setSelectedService] = useState(null);

  useEffect(() => {
    const fetchCompany = async () => {
      try {
        const refDoc = doc(db, 'users', id);
        const snapshot = await getDoc(refDoc);
        if (snapshot.exists()) {
          setCompany(snapshot.data());
        }
      } catch (error) {
        console.error('Erro ao buscar empresa:', error);
      }
    };
    fetchCompany();
  }, [id]);

  if (!company) {
    return <div className="text-center mt-5">Carregando...</div>;
  }

  const {
    photoURL,
    nome,
    description,
    endereco,
    instagram,
    facebook,
    services = []
  } = company;

  const instagramLink = instagram
    ? instagram.startsWith('http')
      ? instagram
      : `https://instagram.com/${instagram.replace(/^@/, '')}`
    : null;
  const facebookLink = facebook
    ? facebook.startsWith('http')
      ? facebook
      : `https://facebook.com/${facebook.replace(/^@/, '')}`
    : null;

  return (
    <div className="company-profile container mt-5 pt-5">
      <div className="text-center mb-5">
        <img
          src={photoURL || perfilImage}
          alt="Logo da empresa"
          className="rounded-circle mb-3"
          style={{ width: '120px', height: '120px', objectFit: 'cover' }}
        />
        <h2 className="fw-bold">{nome}</h2>
        {description && <p className="text-muted">{description}</p>}
        {endereco?.rua && endereco?.numero && (
          <p className="mb-1">
            {endereco.rua}, {endereco.numero} - {endereco.bairro}
          </p>
        )}
        {endereco?.cidade && endereco?.estado && (
          <p className="mb-3">
            {endereco.cidade}/{endereco.estado}
          </p>
        )}
        <div className="d-flex justify-content-center gap-4">
          {instagramLink && (
            <a href={instagramLink} target="_blank" rel="noopener noreferrer" className="text-decoration-none">
              <FaInstagram size={24} />
            </a>
          )}
          {facebookLink && (
            <a href={facebookLink} target="_blank" rel="noopener noreferrer" className="text-decoration-none">
              <FaFacebook size={24} />
            </a>
          )}
        </div>
      </div>

      <hr />

      <h4 className="fw-bold mb-4">Serviços oferecidos</h4>
      <div className="row g-4">
        {services.map((s, i) => (
          <div key={i} className="col-md-4">
            <div className="border p-3 rounded bg-white shadow-sm h-100 d-flex flex-column justify-content-between">
              <div>
                <h6 className="fw-bold">{s.name}</h6>
                {s.description && <p>{s.description}</p>}
                <p>
                  <strong>Valor:</strong> R${' '}
                  {parseFloat(s.price).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
                <p>
                  <strong>Tempo Estimado:</strong> {s.estimatedTime}
                </p>
              </div>
              <button className="btn btn-primary mt-3" onClick={() => setSelectedService(s)}>
                Agendar
              </button>
            </div>
          </div>
        ))}
      </div>

      {selectedService && (
        <ScheduleModal
          company={company}
          service={selectedService}
          companyId={id}
          onClose={() => setSelectedService(null)}
        />
      )}
    </div>
  );
}
