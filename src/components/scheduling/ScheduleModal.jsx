import { useEffect, useState } from "react";
import { addDoc, collection, getDocs, query, where } from "firebase/firestore";
import { db, auth } from "../../services/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { format, addMinutes } from "date-fns";
import ptBR from "date-fns/locale/pt-BR";
import DatePicker, { registerLocale } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

registerLocale("pt-BR", ptBR);

export default function ScheduleModal({ service, company, companyId, onClose }) {
  const [user] = useAuthState(auth);
  const [selectedDate, setSelectedDate] = useState(null);
  const [availableTimes, setAvailableTimes] = useState([]);
  const [selectedTime, setSelectedTime] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (selectedDate) {
      generateAvailableTimes();
    }
  }, [selectedDate]);

  const mapDias = {
    "domingo": "domingo",
    "segunda-feira": "segunda",
    "terça-feira": "terca",
    "quarta-feira": "quarta",
    "quinta-feira": "quinta",
    "sexta-feira": "sexta",
    "sábado": "sabado"
  };

  const parseDuration = (str) => {
    const [h, m] = str.split(":").map(Number);
    return h * 60 + m;
  };

  const generateAvailableTimes = async () => {
    const weekday = format(selectedDate, "EEEE", { locale: ptBR }).toLowerCase();
    const dayKey = mapDias[weekday];
    const config = company.workingHours?.[dayKey];

    if (!config || config.fechado) {
      setAvailableTimes([]);
      return;
    }

    const startOfDay = format(selectedDate, "yyyy-MM-dd");
    const appointmentsRef = collection(db, "appointments");
    const q = query(appointmentsRef, where("companyId", "==", companyId));
    const snapshot = await getDocs(q);

    const bookedTimes = snapshot.docs
      .map(doc => doc.data())
      .filter(appt => appt.date.startsWith(startOfDay))
      .map(appt => appt.date.slice(11, 16));

    const slots = [];
    const duration = parseDuration(service.estimatedTime);
    const now = new Date();

    const addSlots = (start, end) => {
      let startTime = new Date(`${startOfDay}T${start}`);
      const endTime = new Date(`${startOfDay}T${end}`);

      while (addMinutes(startTime, duration) <= endTime) {
        const slot = format(startTime, "HH:mm");

        const isFutureSlot = selectedDate.toDateString() !== now.toDateString() || startTime > now;

        if (!bookedTimes.includes(slot) && isFutureSlot) {
          slots.push(slot);
        }

        startTime = addMinutes(startTime, duration);
      }
    };

    if (config.manhaInicio && config.manhaFim) addSlots(config.manhaInicio, config.manhaFim);
    if (config.tardeInicio && config.tardeFim) addSlots(config.tardeInicio, config.tardeFim);

    setAvailableTimes(slots);
  };

  const handleSubmit = async () => {
    if (!selectedDate || !selectedTime) return;

    const fullDate = format(selectedDate, "yyyy-MM-dd") + "T" + selectedTime;

    await addDoc(collection(db, "appointments"), {
      companyId,
      companyName: company.name,
      clientId: user.uid,
      clientName: user.displayName || "Cliente",
      serviceName: service.name,
      estimatedTime: service.estimatedTime,
      date: fullDate
    });

    setSuccessMessage("Agendamento realizado com sucesso!");
    setSelectedTime("");
    setSelectedDate(null);

    setTimeout(() => {
      setSuccessMessage("");
      onClose();
    }, 2000);
  };

  return (
    <div className="modal d-block bg-dark bg-opacity-50">
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Agendar: {service.name}</h5>
            <button className="btn-close" onClick={onClose}></button>
          </div>

          <div className="modal-body">
            <label className="form-label">Selecione uma data:</label>
            <DatePicker
              selected={selectedDate}
              onChange={setSelectedDate}
              dateFormat="dd/MM/yyyy"
              locale="pt-BR"
              minDate={new Date()}
              className="form-control mb-3"
              placeholderText="Clique para escolher uma data"
              inline
            />

            {availableTimes.length > 0 ? (
              <>
                <label className="form-label mt-2">Horários disponíveis:</label>
                <div className="d-flex flex-wrap gap-2">
                  {availableTimes.map((time, i) => (
                    <button
                      key={i}
                      className={`btn btn-sm ${selectedTime === time ? "btn-success" : "btn-outline-primary"}`}
                      onClick={() => setSelectedTime(time)}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </>
            ) : (
              selectedDate && <p className="text-danger mt-3">Sem horários disponíveis para este dia.</p>
            )}

            {successMessage && (
              <div className="alert alert-success mt-4 text-center">
                {successMessage}
              </div>
            )}
          </div>

          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={onClose}>Cancelar</button>
            <button
              className="btn btn-primary"
              onClick={handleSubmit}
              disabled={!selectedTime}
            >
              Confirmar Agendamento
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
