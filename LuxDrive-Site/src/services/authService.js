// src/services/authService.js
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendEmailVerification,
  sendPasswordResetEmail
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../services/firebase";

// Configurações usadas tanto na verificação de e‑mail quanto no reset de senha,
// apontando para /verify-email e /login no seu domínio de produção.
const actionCodeSettings = {
  // Em produção: luxdrive-wash.vercel.app
  url: `${window.location.origin}/login`,
  handleCodeInApp: false
};

/**
 * Cria novo usuário, salva perfil no Firestore e envia e‑mail de verificação.
 */
export async function registerUser(email, password, accountType, extraData = {}) {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Grava dados da conta no Firestore
    await setDoc(doc(db, "users", user.uid), {
      type: accountType,
      email,
      ...extraData
    });

    // Envia e‑mail de verificação apontando para /login
    await sendEmailVerification(user, actionCodeSettings);
    return userCredential;

  } catch (err) {
    if (err.code === "auth/email-already-in-use") {
      throw new Error("Este e‑mail já está em uso.");
    } else if (err.code === "auth/weak-password") {
      throw new Error("A senha deve conter pelo menos 6 caracteres.");
    } else {
      throw new Error("Erro ao criar conta. Tente novamente mais tarde.");
    }
  }
}

/**
 * Faz login de um usuário existente.
 */
export async function loginUser(email, password) {
  try {
    return await signInWithEmailAndPassword(auth, email, password);
  } catch (err) {
    if (
      err.code === "auth/user-not-found" ||
      err.code === "auth/wrong-password" ||
      err.code === "auth/invalid-credential"
    ) {
      throw new Error("E‑mail ou senha incorretos.");
    } else {
      throw new Error("Erro ao fazer login. Tente novamente mais tarde.");
    }
  }
}

/**
 * Encerra a sessão do usuário atual.
 */
export async function logoutUser() {
  try {
    await signOut(auth);
  } catch (err) {
    throw new Error("Erro ao fazer logout. Tente novamente.");
  }
}

/**
 * Solicita envio de e‑mail para redefinição de senha.
 * O link recebido levará de volta para /login.
 */
export async function requestPasswordReset(email) {
  try {
    await sendPasswordResetEmail(auth, email, actionCodeSettings);
  } catch (err) {
    console.error("Erro ao solicitar reset de senha:", err);
    throw new Error("Não foi possível enviar e‑mail de redefinição.");
  }
}
