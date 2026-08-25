
import React, { useState, useEffect, useRef } from 'react';
import { auth, db, storage } from '../../services/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { ref as storageRef, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { useAuthState } from 'react-firebase-hooks/auth';
import axios from 'axios';
import '../../styles/UserProfile.css';
import perfilImage from '../../assets/images/perfilImage.png';
import { FaPaperclip } from 'react-icons/fa';

export default function UserProfile() {
  const [user] = useAuthState(auth);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    cep: '',
    rua: '',
    numero: '',
    bairro: '',
    cidade: '',
    estado: '',
    photoURL: '',
  });
  const [isEditing, setIsEditing] = useState(false);
  const [newPhotoFile, setNewPhotoFile] = useState(null);
  const fileInputRef = useRef();

  useEffect(() => {
    if (user) {
      (async () => {
        const ref = doc(db, 'users', user.uid);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          const data = snap.data();
          setFormData(prev => ({ ...prev, ...data }));
        }
      })();
    }
  }, [user]);

  useEffect(() => {
    return () => {
      if (formData.photoURL?.startsWith('blob:')) {
        URL.revokeObjectURL(formData.photoURL);
      }
    };
  }, [formData.photoURL]);

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCepBlur = async () => {
    const cep = formData.cep.replace(/\D/g, '');
    if (cep.length === 8) {
      try {
        const res = await axios.get(`https://viacep.com.br/ws/${cep}/json/`);
        if (!res.data.erro) {
          setFormData(prev => ({
            ...prev,
            rua: res.data.logradouro,
            bairro: res.data.bairro,
            cidade: res.data.localidade,
            estado: res.data.uf,
          }));
        }
      } catch (err) {
        console.error('Erro ao buscar CEP:', err);
      }
    }
  };

  const handleFileChange = e => {
    if (e.target.files[0]) {
      const file = e.target.files[0];
      setNewPhotoFile(file);
      const previewUrl = URL.createObjectURL(file);
      setFormData(prev => ({ ...prev, photoURL: previewUrl }));
    }
  };

  const handleSave = async () => {
    if (!user) return;

    console.log("Usuário autenticado:", user?.uid); // 🧪 Verificação do UID

    const ref = doc(db, 'users', user.uid);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      alert('Usuário não encontrado no banco de dados.');
      return;
    }

    const updates = {
      cep: formData.cep,
      rua: formData.rua,
      numero: formData.numero,
      bairro: formData.bairro,
      cidade: formData.cidade,
      estado: formData.estado,
    };

    if (newPhotoFile) {
      const fileRef = storageRef(storage, `profileImages/${user.uid}`);
      const task = uploadBytesResumable(fileRef, newPhotoFile);
      await new Promise((res, rej) => task.on('state_changed', null, rej, res));
      const url = await getDownloadURL(fileRef);
      updates.photoURL = url;
      setFormData(prev => ({ ...prev, photoURL: url }));
      setNewPhotoFile(null);
    }

    await updateDoc(ref, updates);
    setIsEditing(false);
  };

  return (
    <div className="container">
      <h4 className="text-center my-4">Perfil de {formData.name}</h4>

      <div className="d-flex justify-content-center my-3">
        <img
          src={formData.photoURL || perfilImage}
          alt="Foto de Perfil"
          className="rounded-circle profile-image"
        />
      </div>

      <div className="d-flex justify-content-center mb-3">
        <button
          className="btn btn-outline-secondary"
          onClick={() => fileInputRef.current.click()}
          disabled={!isEditing}
        >
          <FaPaperclip />
        </button>
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          className="file-input"
          onChange={handleFileChange}
          disabled={!isEditing}
        />
      </div>

      <form>
        <div className="mb-3">
          <label className="form-label">Nome</label>
          <input type="text" className="form-control" value={formData.name} disabled />
        </div>

        <div className="mb-3">
          <label className="form-label">Email</label>
          <input type="email" className="form-control" value={formData.email} disabled />
        </div>

        <h5>Endereço</h5>
        {['cep', 'rua', 'numero', 'bairro', 'cidade', 'estado'].map(field => (
          <div className="mb-3" key={field}>
            <label className="form-label">
              {field.charAt(0).toUpperCase() + field.slice(1)}
            </label>
            <input
              type="text"
              name={field}
              className="form-control"
              value={formData[field]}
              onChange={handleChange}
              onBlur={field === 'cep' ? handleCepBlur : undefined}
              disabled={!isEditing}
            />
          </div>
        ))}

        <div className="d-flex justify-content-end">
          {!isEditing ? (
            <button type="button" className="btn btn-primary" onClick={() => setIsEditing(true)}>
              Editar
            </button>
          ) : (
            <>
              <button
                type="button"
                className="btn btn-secondary me-2"
                onClick={() => setIsEditing(false)}
              >
                Cancelar
              </button>
              <button type="button" className="btn btn-success" onClick={handleSave}>
                Salvar
              </button>
            </>
          )}
        </div>
      </form>
    </div>
  );
}
