import { useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { db, auth } from "../../services/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { format } from "date-fns";

export default function CompanyAppointments() {
  const [user] = useAuthState(auth);
  const [events, setEvents] = useState([]);
  const [workingHours, setWorkingHours] = useState({});

  useEffect(() => {
    if (user) {
      fetchCompanyData();
      fetchAppointments();
    }
  }, [user]);

  const fetchCompanyData = async () => {
    const refDoc = doc(db, "users", user.uid);
    const snapshot = await getDoc(refDoc);
    if (snapshot.exists()) {
      const data = snapshot.data();
      setWorkingHours(data);
    }
  };

  const fetchAppointments = async () => {
    const appointmentsRef = collection(db, "appointments");
    const q = query(appointmentsRef, where("companyId", "==", user.uid));
    const querySnapshot = await getDocs(q);
    const fetchedEvents = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        title: `${data.serviceName} - ${data.clientName}`,
        start: data.date,
        end: calculateEndTime(data.date, data.estimatedTime || "01:00")
      };
    });
    setEvents(fetchedEvents);
  };

  const calculateEndTime = (start, duration) => {
    const [h, m] = duration.split(":").map(Number);
    const date = new Date(start);
    date.setHours(date.getHours() + h);
    date.setMinutes(date.getMinutes() + m);
    return format(date, "yyyy-MM-dd'T'HH:mm:ss");
  };

  return (
    <div className="container mt-5 pt-4">
      <h3 className="fw-bold mb-4">Agenda de Agendamentos</h3>
      <div className="bg-white p-3 rounded shadow-sm">
        <FullCalendar
          plugins={[timeGridPlugin, interactionPlugin]}
          initialView="timeGridWeek"
          locale="pt-br"
          slotMinTime="07:00:00"
          slotMaxTime="22:00:00"
          allDaySlot={false}
          nowIndicator={true}
          events={events}
          height="auto"
        />
      </div>
    </div>
  );
}
