import { useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../../../services/firebase";
import { getAppointmentsByCompany, cancelAppointment } from "../../../services/appointmentService";
import ptBrLocale from "@fullcalendar/core/locales/pt-br";
import { format, parseISO, addMinutes } from "date-fns";
import './CompanyAppointments.css';

function parseDuration(str) {
  const [h, m] = str.split(":").map(Number);
  return h * 60 + m;
}

export default function CompanyAppointments() {
  const [user] = useAuthState(auth);
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (user) fetchAppointments();
  }, [user]);

  const fetchAppointments = async () => {
    try {
      const data = await getAppointmentsByCompany(user.uid);

      const items = data.map(item => {
        const start = parseISO(item.date);
        const duration = parseDuration(item.estimatedTime);
        const end = addMinutes(start, duration);

        return {
          id: item.id,
          title: item.serviceName,
          start,
          end,
          extendedProps: item,
        };
      });

      setEvents(items);
    } catch (err) {
      setMessage(err.message || "Erro ao carregar a agenda.");
    }
  };

  const handleEventClick = (info) => {
    setSelectedEvent(info.event);
    setMessage("");
  };

  const closeDetails = () => {
    setSelectedEvent(null);
    setMessage("");
  };

  const handleCancelAppointment = async () => {
    try {
      await cancelAppointment(selectedEvent.id, selectedEvent.start, 60);
      setEvents(prev => prev.filter(e => e.id !== selectedEvent.id));
      setSelectedEvent(null);
    } catch (err) {
      setMessage(err.message || "Erro ao cancelar agendamento.");
    }
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

            <button className="btn btn-danger mt-2 w-100" onClick={handleCancelAppointment}>
              Cancelar Agendamento
            </button>
          </div>
        </div>
      )}
    </div>
  );
}