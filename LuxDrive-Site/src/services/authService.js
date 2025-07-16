import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendEmailVerification,
  sendPasswordResetEmail
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../services/firebase";

// Configurações para e-mail de verificação
const verificationEmailSettings = {
  url: `${window.location.origin}/login`,
  handleCodeInApp: false
};

// Configurações para redefinição de senha
const passwordResetSettings = {
  url: `${window.location.origin}/reset-password`,
  handleCodeInApp: false
};

export async function registerUser(email, password, accountType, extraData = {}) {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    await setDoc(doc(db, "users", user.uid), {
      type: accountType,
      email,
      ...extraData
    });

    await sendEmailVerification(user, verificationEmailSettings);
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

export async function logoutUser() {
  try {
    await signOut(auth);
  } catch (err) {
    throw new Error("Erro ao fazer logout. Tente novamente.");
  }
}

export async function requestPasswordReset(email) {
  try {
    await sendPasswordResetEmail(auth, email, passwordResetSettings);
  } catch (err) {
    console.error('Erro ao solicitar reset de senha:', err);
    throw new Error('Não foi possível enviar e‑mail de redefinição.');
  }
}
