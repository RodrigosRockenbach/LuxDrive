import { doc, getDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { deleteUser } from "firebase/auth";
import { auth, db, storage } from "./firebase";

export async function getUserProfile(userId) {
  try {
    const snap = await getDoc(doc(db, "users", userId));
    if (!snap.exists()) return null;
    return { id: snap.id, ...snap.data() };
  } catch (err) {
    console.error("Erro ao buscar perfil do usuário:", err);
    throw new Error("Não foi possível carregar os dados do usuário.");
  }
}

export async function updateUserProfile(userId, data) {
  try {
    await updateDoc(doc(db, "users", userId), data);
  } catch (err) {
    console.error("Erro ao atualizar perfil do usuário:", err);
    throw new Error("Não foi possível salvar as alterações do perfil.");
  }
}

export async function uploadProfilePhoto(userId, file) {
  try {
    const storageRef = ref(storage, `profileImages/${userId}`);
    const task = uploadBytesResumable(storageRef, file);
    await new Promise((resolve, reject) => task.on("state_changed", null, reject, resolve));
    const url = await getDownloadURL(storageRef);
    await updateDoc(doc(db, "users", userId), { photoURL: url });
    return url;
  } catch (err) {
    console.error("Erro ao fazer upload da foto de perfil:", err);
    throw new Error("Não foi possível atualizar a foto de perfil.");
  }
}

export async function deleteUserAccount(userId) {
  try {
    await deleteDoc(doc(db, "users", userId));

    if (auth.currentUser) {
      await deleteUser(auth.currentUser);
    }
  } catch (err) {
    console.error("Erro ao excluir conta:", err);
    if (err.code === "auth/requires-recent-login") {
      throw new Error("Por segurança, faça login novamente antes de excluir sua conta.");
    }
    throw new Error("Não foi possível excluir sua conta. Tente novamente.");
  }
}