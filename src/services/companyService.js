import { doc, getDoc, updateDoc, deleteDoc, collection, getDocs, query, where } from "firebase/firestore";
import { ref, uploadBytes, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { deleteUser } from "firebase/auth";
import { auth, db, storage } from "./firebase";

const normalize = str =>
  str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

export async function getCompanyProfile(companyId) {
  try {
    const snap = await getDoc(doc(db, "users", companyId));
    if (!snap.exists()) return null;
    return { id: snap.id, ...snap.data() };
  } catch (err) {
    console.error("Erro ao buscar perfil da empresa:", err);
    throw new Error("Não foi possível carregar os dados da empresa.");
  }
}

export async function updateCompanyProfile(companyId, data) {
  try {
    await updateDoc(doc(db, "users", companyId), data);
  } catch (err) {
    console.error("Erro ao atualizar perfil da empresa:", err);
    throw new Error("Não foi possível salvar as alterações do perfil.");
  }
}

export async function uploadCompanyPhoto(companyId, file) {
  try {
    const storageRef = ref(storage, `profileImages/${companyId}`);
    const task = uploadBytesResumable(storageRef, file);
    await new Promise((resolve, reject) => task.on("state_changed", null, reject, resolve));
    const url = await getDownloadURL(storageRef);
    await updateDoc(doc(db, "users", companyId), { photoURL: url });
    return url;
  } catch (err) {
    console.error("Erro ao fazer upload da imagem:", err);
    throw new Error("Não foi possível atualizar a foto de perfil.");
  }
}

export async function updateServices(companyId, services) {
  try {
    await updateDoc(doc(db, "users", companyId), { services });
  } catch (err) {
    console.error("Erro ao atualizar serviços:", err);
    throw new Error("Não foi possível salvar os serviços.");
  }
}

export async function addService(companyId, currentServices, newService) {
  const name = newService.name.trim();
  if (!name) throw new Error("Informe o nome do serviço.");
  if (!newService.price) throw new Error("Informe o preço.");

  const serviceToAdd = {
    name,
    description: newService.description,
    price: newService.price,
    estimatedTime: newService.estimatedTime,
    isCustom: newService.isCustom
  };

  const updatedServices = [...currentServices, serviceToAdd];
  await updateServices(companyId, updatedServices);
  return updatedServices;
}

export async function removeService(companyId, currentServices, index) {
  const updatedServices = currentServices.filter((_, i) => i !== index);
  await updateServices(companyId, updatedServices);
  return updatedServices;
}

export async function updateWorkingHours(companyId, currentWorkingHours, day, horario) {
  const updated = { ...currentWorkingHours, [day]: horario };
  try {
    await updateDoc(doc(db, "users", companyId), { workingHours: updated });
    return updated;
  } catch (err) {
    console.error("Erro ao atualizar horário de funcionamento:", err);
    throw new Error("Não foi possível salvar o horário de funcionamento.");
  }
}

export async function searchCompanies({ searchText = "", serviceFilter = "" } = {}) {
  try {
    const q = query(collection(db, "users"), where("type", "==", "company"));
    const snap = await getDocs(q);
    let list = snap.docs.map(d => ({ id: d.id, ...d.data() }));

    if (searchText) {
      const qNorm = normalize(searchText);
      list = list.filter(e => normalize(e.name || "").includes(qNorm));
    }
    if (serviceFilter) {
      list = list.filter(e => (e.services || []).some(s => s.name === serviceFilter));
    }

    return list;
  } catch (err) {
    console.error("Erro ao buscar empresas:", err);
    throw new Error("Não foi possível carregar a lista de empresas.");
  }
}

export async function deleteCompanyAccount(companyId) {
  try {
    await deleteDoc(doc(db, "users", companyId));

    if (auth.currentUser) {
      await deleteUser(auth.currentUser);
    }
  } catch (err) {
    console.error("Erro ao excluir conta da empresa:", err);
    if (err.code === "auth/requires-recent-login") {
      throw new Error("Por segurança, faça login novamente antes de excluir sua conta.");
    }
    throw new Error("Não foi possível excluir a conta da empresa. Tente novamente.");
  }
}