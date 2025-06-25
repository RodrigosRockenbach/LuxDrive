import React, { useEffect, useState } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db, auth } from "../../services/firebase";
import { onAuthStateChanged } from "firebase/auth";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";

export default function CompanyAppointments() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCompanyAppointments = async (companyName) => {
      try {
        const q = query(
          collection(db, "agendamentos"),
          where("empresa", "==", companyName)
        );
        const snapshot = await getDocs(q);
        const eventData = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            title: `${data.cliente} - ${data.servico}`,
            start: `${data.data}T${data.hora}`,
            extendedProps: {
              status: data.status,
              valor: data.valor,
            },
          };
        });
        setEvents(eventData);
      } catch (err) {
        console.error("Erro ao buscar agendamentos:", err);
      } finally {
        setLoading(false);
      }
    };

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const docRef = doc(db, "users", user.uid);
        const userDoc = await getDocs(query(collection(db, "users"), where("__name__", "==", user.uid)));
        if (!userDoc.empty) {
          const empresaNome = userDoc.docs[0].data().nome;
          fetchCompanyAppointments(empresaNome);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="container mt-5 pt-5">
      <h3 className="mb-4">Agenda da Empresa</h3>

      {loading ? (
        <p>Carregando agendamentos...</p>
      ) : (
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,timeGridWeek,timeGridDay",
          }}
          locale="pt-br"
          events={events}
          height="auto"
        />
      )}
    </div>
  );
}