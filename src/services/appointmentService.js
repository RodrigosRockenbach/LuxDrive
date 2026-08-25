import {
    collection,
    addDoc,
    getDocs,
    query,
    where,
    orderBy,
    doc,
    deleteDoc,
    getDoc
  } from "firebase/firestore";
  import { db } from "./firebase";
  import { format, addMinutes, isBefore, subMinutes } from "date-fns";
  import ptBR from "date-fns/locale/pt-BR";
  
  const mapDias = {
    "domingo": "domingo",
    "segunda-feira": "segunda",
    "terça-feira": "terca",
    "quarta-feira": "quarta",
    "quinta-feira": "quinta",
    "sexta-feira": "sexta",
    "sábado": "sabado"
  };
  
  function parseDuration(str) {
    const [h, m] = str.split(":").map(Number);
    return h * 60 + m;
  }
  
  export async function createAppointment({ companyId, companyName, clientId, clientName, serviceName, estimatedTime, date }) {
    try {
      return await addDoc(collection(db, "appointments"), {
        companyId,
        companyName,
        clientId,
        clientName,
        serviceName,
        estimatedTime,
        date
      });
    } catch (err) {
      console.error("Erro ao criar agendamento:", err);
      throw new Error("Não foi possível confirmar o agendamento. Tente novamente.");
    }
  }
  
  export async function getAppointmentsByCompany(companyId) {
    try {
      const ref = collection(db, "appointments");
      const q = query(ref, where("companyId", "==", companyId));
      const snapshot = await getDocs(q);
  
      return await Promise.all(snapshot.docs.map(async docSnap => {
        const data = docSnap.data();
        let clientName = "Cliente";
        try {
          const userDoc = await getDoc(doc(db, "users", data.clientId));
          if (userDoc.exists()) {
            clientName = userDoc.data().name || "Cliente";
          }
        } catch (err) {
          console.error("Erro ao buscar cliente:", err);
        }
  
        return { id: docSnap.id, ...data, clientName };
      }));
    } catch (err) {
      console.error("Erro ao buscar agendamentos da empresa:", err);
      throw new Error("Não foi possível carregar a agenda.");
    }
  }
  
  export async function getAppointmentsByClient(clientId) {
    try {
      const q = query(
        collection(db, "appointments"),
        where("clientId", "==", clientId),
        orderBy("date", "asc")
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() }));
    } catch (err) {
      console.error("Erro ao buscar agendamentos do cliente:", err);
      throw new Error("Não foi possível carregar seus agendamentos.");
    }
  }
  
  // minutosMinimos: 60 para cancelamento pelo lado da empresa, 30 para o cliente
  export async function cancelAppointment(appointmentId, appointmentDate, minutosMinimos = 30) {
    const now = new Date();
    const eventStart = new Date(appointmentDate);
    const deadline = subMinutes(eventStart, minutosMinimos);
  
    if (!isBefore(now, deadline)) {
      throw new Error(`Cancelamento permitido apenas até ${minutosMinimos} minutos antes do horário marcado.`);
    }
  
    try {
      await deleteDoc(doc(db, "appointments", appointmentId));
    } catch (err) {
      console.error("Erro ao cancelar agendamento:", err);
      throw new Error("Não foi possível cancelar o agendamento. Tente novamente.");
    }
  }
  
  export async function getAvailableSlots(company, service, selectedDate) {
    const weekday = format(selectedDate, "EEEE", { locale: ptBR }).toLowerCase();
    const dayKey = mapDias[weekday];
    const config = company.workingHours?.[dayKey];
  
    if (!config || config.fechado) return [];
  
    const startOfDay = format(selectedDate, "yyyy-MM-dd");
    const q = query(collection(db, "appointments"), where("companyId", "==", company.id));
    const snapshot = await getDocs(q);
  
    const bookedTimes = snapshot.docs
      .map(docSnap => docSnap.data())
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
  
    return slots;
  }