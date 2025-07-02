import { useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import { collection, query, where, getDocs, doc, deleteDoc, getDoc } from "firebase/firestore";
import { db, auth } from "../../services/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import ptBrLocale from "@fullcalendar/core/locales/pt-br";
import { format, parseISO, isBefore, subHours, addMinutes } from "date-fns";
import "../../styles/CompanyAppointments.css";

export default function CompanyAppointments() {
  const [user] = useAuthState(auth);
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (user) fetchAppointments();
  }, [user]);

  const fetchAppointments = async () => {
    const ref = collection(db, "appointments");
    const q = query(ref, where("companyId", "==", user.uid));
    const snapshot = await getDocs(q);

    const items = await Promise.all(snapshot.docs.map(async docSnap => {
      const data = docSnap.data();
      const start = parseISO(data.date);
      const duration = parseDuration(data.estimatedTime);
      const end = addMinutes(start, duration);

      let clientName = "Cliente";
      try {
        const userDoc = await getDoc(doc(db, "users", data.clientId));
        if (userDoc.exists()) {
          clientName = userDoc.data().name || "Cliente";
        }
      } catch (err) {
        console.error("Erro ao buscar cliente:", err);
      }

      return {
        id: docSnap.id,
        title: data.serviceName,
        start,
        end,
        extendedProps: {
          ...data,
          clientName,
        },
      };
    }));

    setEvents(items);
  };

  const parseDuration = (str) => {
    const [h, m] = str.split(":").map(Number);
    return h * 60 + m;
  };

  const handleEventClick = (info) => {
    setSelectedEvent(info.event);
    setMessage("");
  };

  const closeDetails = () => {
    setSelectedEvent(null);
    setMessage("");
  };

  const cancelAppointment = async () => {
    const now = new Date();
    const eventStart = new Date(selectedEvent.start);

    if (isBefore(eventStart, addMinutes(now, 60))) {
      setMessage("Cancelamento não permitido com menos de 1 hora de antecedência.");
      return;
    }

    await deleteDoc(doc(db, "appointments", selectedEvent.id));

    // Envio de e-mail ao cliente (exemplo, adapte com seu sistema de envio):
    // await sendCancellationEmail(selectedEvent.extendedProps.clientEmail, selectedEvent.extendedProps);

    setEvents(prev => prev.filter(e => e.id !== selectedEvent.id));
    setSelectedEvent(null);
  };

  return (
    <div className="container-fluid mt-4 mb-5">
      <h4 className="mb-4 fw-bold">Agenda da Empresa</h4>

      <FullCalendar
        plugins={[timeGridPlugin]}
        initialView="timeGridWeek"
        allDaySlot={false}
        locale={ptBrLocale}
        events={events}
        slotMinTime="07:00:00"
        slotMaxTime="20:00:00"
        eventClick={handleEventClick}
        height="auto"
        nowIndicator={true}
        eventClassNames="fc-event-custom"
      />

      {selectedEvent && (
        <div className="appointment-details-overlay">
          <div className="appointment-details p-4 rounded shadow">
            <button className="btn-close float-end" onClick={closeDetails}></button>
            <h5 className="fw-bold mb-3">Detalhes do Agendamento</h5>
            <p><strong>Cliente:</strong> {selectedEvent.extendedProps.clientName}</p>
            <p><strong>Serviço:</strong> {selectedEvent.extendedProps.serviceName}</p>
            <p><strong>Duração:</strong> {selectedEvent.extendedProps.estimatedTime}</p>
            <p><strong>Data:</strong> {format(selectedEvent.start, "dd/MM/yyyy")}</p>
            <p><strong>Horário:</strong> {format(selectedEvent.start, "HH:mm")} às {format(selectedEvent.end, "HH:mm")}</p>

            {message && <div className="alert alert-warning mt-2">{message}</div>}

            {isBefore(new Date(), subHours(new Date(selectedEvent.start), 1)) ? (
              <button className="btn btn-danger mt-2 w-100" onClick={cancelAppointment}>
                Cancelar Agendamento
              </button>
            ) : (
              <p className="text-muted mt-2">Não é possível cancelar com menos de 1 hora de antecedência.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
