import React, { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../../services/firebase";
import { createAppointment, getAvailableSlots } from "../../services/appointmentService";
import { format } from "date-fns";
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
  const [error, setError] = useState("");

  useEffect(() => {
    if (selectedDate) {
      loadAvailableTimes();
    }
  }, [selectedDate]);

  const loadAvailableTimes = async () => {
    setError("");
    try {
      const slots = await getAvailableSlots({ ...company, id: companyId }, service, selectedDate);
      setAvailableTimes(slots);
    } catch (err) {
      setError(err.message || "Erro ao buscar horários disponíveis.");
      setAvailableTimes([]);
    }
  };

  const handleSubmit = async () => {
    if (!selectedDate || !selectedTime) return;

    const fullDate = format(selectedDate, "yyyy-MM-dd") + "T" + selectedTime;

    try {
      await createAppointment({
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
    } catch (err) {
      setError(err.message || "Erro ao confirmar agendamento.");
    }
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

            {error && <div className="alert alert-danger mt-2">{error}</div>}

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
              selectedDate && !error && <p className="text-danger mt-3">Sem horários disponíveis para este dia.</p>
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