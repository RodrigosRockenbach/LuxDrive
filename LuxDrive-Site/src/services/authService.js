import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut
} from "firebase/auth";
import { auth } from "../firebase";

// Função para registrar o usuário
export const registerUser = async (email, password) => {
  try {
    return await createUserWithEmailAndPassword(auth, email, password);
  } catch (err) {
    throw new Error("Erro ao criar conta: " + err.message);
  }
};

// Função para login do usuário
export const loginUser = async (email, password) => {
  try {
    return await signInWithEmailAndPassword(auth, email, password);
  } catch (err) {
    throw new Error("Erro ao fazer login: " + err.message);
  }
};

// Função para logout do usuário
export const logoutUser = async () => {
  try {
    await signOut(auth);
  } catch (err) {
    throw new Error("Erro ao fazer logout: " + err.message);
  }
};
