import { useEffect, useState } from "react";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { auth, db } from "../../services/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import Loading from "../../components/common/Loading";

export default function UserAppointments() {
  const [user] = useAuthState(auth);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAppointments = async () => {
      if (!user) return;

      try {
        const q = query(
          collection(db, "appointments"),
          where("userId", "==", user.uid),
          orderBy("start", "asc")
        );
        const querySnapshot = await getDocs(q);
        const data = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setAppointments(data);
      } catch (err) {
        console.error("Erro ao buscar agendamentos:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [user]);

  if (loading) return <Loading />;

  const now = new Date();
  const upcoming = appointments.find(app => new Date(app.start.toDate()) > now);
  const pastAppointments = appointments
    .filter(app => new Date(app.start.toDate()) <= now)
    .reverse();

  return (
    <div className="container mt-5 pt-5">
      <h4 className="mb-4 fw-bold">Agendamentos</h4>

      <section className="mb-5">
        <h6 className="fw-bold">Próximo Serviço</h6>
        {upcoming ? (
          <div className="border rounded p-3 bg-white shadow-sm">
            <p><strong>Data:</strong> {new Date(upcoming.start.toDate()).toLocaleDateString()}</p>
            <p><strong>Horário:</strong> {new Date(upcoming.start.toDate()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
            <p><strong>Empresa:</strong> {upcoming.companyName}</p>
            <p><strong>Tipo de serviço:</strong> {upcoming.serviceType}</p>
            <p><strong>Valor:</strong> R$ {upcoming.price}</p>
            <p><strong>Forma de pagamento:</strong> {upcoming.paymentMethod}</p>
          </div>
        ) : (
          <p className="text-muted">Nenhum serviço futuro agendado.</p>
        )}
      </section>

      <section>
        <h6 className="fw-bold">Serviços anteriores</h6>
        {pastAppointments.length > 0 ? (
          <div className="row g-4">
            {pastAppointments.map(app => (
              <div key={app.id} className="col-md-6">
                <div className="border rounded p-3 bg-white shadow-sm">
                  <p><strong>Data:</strong> {new Date(app.start.toDate()).toLocaleDateString()}</p>
                  <p><strong>Horário:</strong> {new Date(app.start.toDate()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                  <p><strong>Empresa:</strong> {app.companyName}</p>
                  <p><strong>Tipo de serviço:</strong> {app.serviceType}</p>
                  <p><strong>Valor:</strong> R$ {app.price}</p>
                  <p><strong>Forma de pagamento:</strong> {app.paymentMethod}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted">Nenhum serviço realizado ainda.</p>
        )}
      </section>
    </div>
  );
}
