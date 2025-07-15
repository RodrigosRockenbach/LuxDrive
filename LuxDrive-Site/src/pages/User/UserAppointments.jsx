import { useEffect, useState } from "react";
import { collection, query, where, getDocs, orderBy, doc, deleteDoc, getDoc } from "firebase/firestore";
import { auth, db } from "../../services/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import Loading from "../../components/common/Loading";
import { format, isBefore, subMinutes } from "date-fns";

export default function UserAppointments() {
  const [user] = useAuthState(auth);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchAppointments = async () => {
      if (!user) return;

      try {
        const q = query(
          collection(db, "appointments"),
          where("clientId", "==", user.uid),
          orderBy("date", "asc")
        );
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({
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

  const now = new Date();
  const upcoming = appointments.filter(app => new Date(app.date) > now);
  const pastAppointments = appointments.filter(app => new Date(app.date) <= now).reverse();

  const cancelAppointment = async (appointment) => {
    const startTime = new Date(appointment.date);
    const cancelDeadline = subMinutes(startTime, 30);

    if (isBefore(now, cancelDeadline)) {
      await deleteDoc(doc(db, "appointments", appointment.id));

      const companyRef = doc(db, "users", appointment.companyId);
      const companySnap = await getDoc(companyRef);
      const companyEmail = companySnap.exists() ? companySnap.data().email : "empresa@example.com";

    
      console.log(`E-mail enviado para ${companyEmail}: o cliente ${appointment.clientName} cancelou o serviço.`);

      setAppointments(prev => prev.filter(a => a.id !== appointment.id));
      setMessage("Agendamento cancelado com sucesso.");
    } else {
      setMessage("Cancelamento permitido apenas até 30 minutos antes do horário marcado.");
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="container mt-5 pt-5">
      <h4 className="mb-4 fw-bold">Meus Agendamentos</h4>

      {message && <div className="alert alert-info">{message}</div>}

      <section className="mb-5">
        <h6 className="fw-bold">Próximos Serviços</h6>
        {upcoming.length > 0 ? (
          <div className="row g-3">
            {upcoming.map(app => (
              <div key={app.id} className="col-md-4">
                <div className="border rounded p-3 bg-white shadow-sm h-100">
                  <p><strong>Data:</strong> {format(new Date(app.date), "dd/MM/yyyy")}</p>
                  <p><strong>Horário:</strong> {format(new Date(app.date), "HH:mm")}</p>
                  <p><strong>Empresa:</strong> {app.companyName}</p>
                  <p><strong>Serviço:</strong> {app.serviceName}</p>
                  <p><strong>Duração:</strong> {app.estimatedTime}h</p>
                  {isBefore(now, subMinutes(new Date(app.date), 30)) && (
                    <button className="btn btn-danger mt-2 w-100" onClick={() => cancelAppointment(app)}>
                      Cancelar Agendamento
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted">Nenhum serviço futuro agendado.</p>
        )}
      </section>

      <section>
        <h6 className="fw-bold">Serviços Anteriores</h6>
        {pastAppointments.length > 0 ? (
          <div className="row g-3">
            {pastAppointments.map(app => (
              <div key={app.id} className="col-md-4">
                <div className="border rounded p-3 bg-white shadow-sm h-100">
                  <p><strong>Data:</strong> {format(new Date(app.date), "dd/MM/yyyy")}</p>
                  <p><strong>Horário:</strong> {format(new Date(app.date), "HH:mm")}</p>
                  <p><strong>Empresa:</strong> {app.companyName}</p>
                  <p><strong>Serviço:</strong> {app.serviceName}</p>
                  <p><strong>Duração:</strong> {app.estimatedTime}h</p>
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
