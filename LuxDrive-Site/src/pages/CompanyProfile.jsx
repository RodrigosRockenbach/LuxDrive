// CompanyProfile.jsx
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../services/firebase";

export default function CompanyProfile() {
  const { id } = useParams();
  const [company, setCompany] = useState(null);

  useEffect(() => {
    const fetchCompany = async () => {
      const ref = doc(db, "users", id);
      const snapshot = await getDoc(ref);
      if (snapshot.exists()) {
        setCompany(snapshot.data());
      }
    };
    fetchCompany();
  }, [id]);

  if (!company) return <div className="text-center mt-5">Carregando...</div>;

  return (
    <div className="container mt-5 pt-5">
      <h2 className="fw-bold">{company.name}</h2>
      <p>{company.description}</p>
      <hr />
      <h4>Serviços oferecidos:</h4>
      <div className="row g-4">
        {company.services?.map((s, i) => (
          <div key={i} className="col-md-4">
            <div className="border p-3 rounded bg-white shadow-sm">
              <h6 className="fw-bold">{s.name}</h6>
              <p>{s.description}</p>
              <p><strong>Valor:</strong> R$ {s.price}</p>
              <p><strong>Tempo Estimado:</strong> {s.estimatedTime}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
