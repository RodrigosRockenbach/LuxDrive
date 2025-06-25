import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../services/firebase';

export const registerUser = async (email, password, accountType, extraData = {}) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    await setDoc(doc(db, 'users', user.uid), {
      type: accountType,
      email,
      ...extraData,
    });

    return userCredential;
  } catch (err) {
    if (err.code === 'auth/email-already-in-use') {
      throw new Error('Este e-mail já está em uso.');
    } else if (err.code === 'auth/weak-password') {
      throw new Error('A senha deve conter pelo menos 6 caracteres.');
    } else {
      throw new Error('Erro ao criar conta. Tente novamente mais tarde.');
    }
  }
};

export const loginUser = async (email, password) => {
  try {
    return await signInWithEmailAndPassword(auth, email, password);
  } catch (err) {
    if (
      err.code === 'auth/user-not-found' ||
      err.code === 'auth/wrong-password' ||
      err.code === 'auth/invalid-credential'
    ) {
      throw new Error('E-mail ou senha incorretos.');
    } else {
      throw new Error('Erro ao fazer login. Tente novamente mais tarde.');
    }
  }
};

export const logoutUser = async () => {
  try {
    await signOut(auth);
  } catch (err) {
    throw new Error('Erro ao fazer logout. Tente novamente.');
  }
};