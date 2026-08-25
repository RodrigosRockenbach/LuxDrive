import React, { useState, useEffect, useRef } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../../../services/firebase';
import { getUserProfile, updateUserProfile, uploadProfilePhoto } from '../../../services/userService';
import axios from 'axios';
import perfilImage from '../../../assets/images/perfilImage.png';
import { FaPaperclip } from 'react-icons/fa';
import './UserProfile.css';

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
  const [error, setError] = useState('');
  const fileInputRef = useRef();

  useEffect(() => {
    if (user) {
      (async () => {
        try {
          const data = await getUserProfile(user.uid);
          if (data) {
            setFormData(prev => ({ ...prev, ...data }));
          }
        } catch (err) {
          setError(err.message || 'Erro ao carregar perfil.');
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
    setError('');

    try {
      const updates = {
        cep: formData.cep,
        rua: formData.rua,
        numero: formData.numero,
        bairro: formData.bairro,
        cidade: formData.cidade,
        estado: formData.estado,
      };

      if (newPhotoFile) {
        const url = await uploadProfilePhoto(user.uid, newPhotoFile);
        setFormData(prev => ({ ...prev, photoURL: url }));
        setNewPhotoFile(null);
      }

      await updateUserProfile(user.uid, updates);
      setIsEditing(false);
    } catch (err) {
      setError(err.message || 'Erro ao salvar perfil.');
    }
  };

  return (
    <div className="container">
      <h4 className="text-center my-4">Perfil de {formData.name}</h4>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="d-flex justify-content-center my-3">
        <img
          src={formData.photoURL || perfilImage}
          alt="Foto de Perfil"
          className="rounded-circle profile-image"
        />
      </div>

      {isEditing && (
        <div className="d-flex justify-content-center mb-3">
          <button
            className="btn btn-outline-secondary"
            onClick={() => fileInputRef.current.click()}
          >
            <FaPaperclip />
          </button>
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            className="file-input"
            onChange={handleFileChange}
          />
        </div>
      )}

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