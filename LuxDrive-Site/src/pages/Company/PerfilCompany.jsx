import React, { useEffect, useState } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { db, auth } from '../../services/firebase';
import axios from 'axios';
import { Spinner } from 'react-bootstrap';

export default function PerfilCompany() {
  const [user] = useAuthState(auth);
  const [form, setForm] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [buscando, setBuscando] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      const refDoc = doc(db, 'users', user.uid);
      const snapshot = await getDoc(refDoc);
      if (snapshot.exists()) {
        const data = snapshot.data();
        setForm({
          ownerName: data.ownerName || '',
          companyName: data.nome || data.name || '',
          instagram: data.instagram || '',
          whatsapp: data.whatsapp || '',
          facebook: data.facebook || '',
          endereco: {
            cep: data.endereco?.cep || '',
            rua: data.endereco?.rua || '',
            numero: data.endereco?.numero || '',
            bairro: data.endereco?.bairro || '',
            cidade: data.endereco?.cidade || '',
            estado: data.endereco?.estado || '',
          },
        });
      }
    };
    fetchData();
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('endereco.')) {
      const field = name.split('.')[1];
      setForm((prev) => ({
        ...prev,
        endereco: { ...prev.endereco, [field]: value },
      }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleCepBlur = async () => {
    const cep = form.endereco.cep.replace(/\D/g, '');
    if (cep.length === 8) {
      setBuscando(true);
      try {
        const resp = await axios.get(`https://viacep.com.br/ws/${cep}/json/`);
        const { logradouro, bairro, localidade, uf } = resp.data;
        setForm((prev) => ({
          ...prev,
          endereco: {
            ...prev.endereco,
            rua: logradouro || '',
            bairro: bairro || '',
            cidade: localidade || '',
            estado: uf || '',
          },
        }));
      } catch (error) {
        console.error('Erro ao buscar CEP:', error);
      } finally {
        setBuscando(false);
      }
    }
  };

  const handleSave = async () => {
    if (!user || !form) return;
    const refDoc = doc(db, 'users', user.uid);
    const updateData = {
      ownerName: form.ownerName,
      nome: form.companyName,
      instagram: form.instagram,
      whatsapp: form.whatsapp,
      facebook: form.facebook,
      endereco: form.endereco,
    };
    await updateDoc(refDoc, updateData);
    setIsEditing(false);
    setSuccessMsg('Perfil atualizado com sucesso!');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  if (!form) return <div className="text-center mt-5">Carregando perfil...</div>;

  return (
    <div className="container mt-5 mb-5">
      <div className="bg-white shadow-sm p-4 rounded">
        <h4 className="fw-bold mb-4">Perfil da Empresa</h4>

        {successMsg && <div className="alert alert-success">{successMsg}</div>}

        <div className="row g-3">
          <div className="col-md-6">
            <label>Nome do Dono</label>
            <input
              type="text"
              className="form-control"
              name="ownerName"
              value={form.ownerName}
              onChange={handleChange}
              disabled={!isEditing}
            />
          </div>

          <div className="col-md-6">
            <label>Nome da Empresa</label>
            <input
              type="text"
              className="form-control"
              name="companyName"
              value={form.companyName}
              onChange={handleChange}
              disabled={!isEditing}
            />
          </div>

          <div className="col-md-6">
            <label>Email</label>
            <input
              type="email"
              className="form-control"
              value={user?.email || ''}
              readOnly
            />
          </div>

          <div className="col-md-4">
            <label>Instagram</label>
            <input
              type="text"
              className="form-control"
              name="instagram"
              value={form.instagram}
              onChange={handleChange}
              disabled={!isEditing}
            />
          </div>

          <div className="col-md-4">
            <label>WhatsApp</label>
            <input
              type="text"
              className="form-control"
              name="whatsapp"
              value={form.whatsapp}
              onChange={handleChange}
              disabled={!isEditing}
            />
          </div>

          <div className="col-md-4">
            <label>Facebook</label>
            <input
              type="text"
              className="form-control"
              name="facebook"
              value={form.facebook}
              onChange={handleChange}
              disabled={!isEditing}
            />
          </div>

          <hr className="my-4" />

          <h6 className="fw-bold">Endereço</h6>

          <div className="col-md-4">
            <label>CEP</label>
            <input
              type="text"
              className="form-control"
              name="endereco.cep"
              value={form.endereco.cep}
              onChange={handleChange}
              onBlur={isEditing ? handleCepBlur : undefined}
              disabled={!isEditing}
            />
            {buscando && <Spinner size="sm" animation="border" />}
          </div>

          <div className="col-md-4">
            <label>Rua</label>
            <input
              type="text"
              className="form-control"
              name="endereco.rua"
              value={form.endereco.rua}
              onChange={handleChange}
              disabled={!isEditing}
            />
          </div>

          <div className="col-md-2">
            <label>Número</label>
            <input
              type="text"
              className="form-control"
              name="endereco.numero"
              value={form.endereco.numero}
              onChange={handleChange}
              disabled={!isEditing}
            />
          </div>

          <div className="col-md-2">
            <label>Bairro</label>
            <input
              type="text"
              className="form-control"
              name="endereco.bairro"
              value={form.endereco.bairro}
              onChange={handleChange}
              disabled={!isEditing}
            />
          </div>

          <div className="col-md-3">
            <label>Cidade</label>
            <input
              type="text"
              className="form-control"
              name="endereco.cidade"
              value={form.endereco.cidade}
              onChange={handleChange}
              disabled={!isEditing}
            />
          </div>

          <div className="col-md-3">
            <label>Estado</label>
            <input
              type="text"
              className="form-control"
              name="endereco.estado"
              value={form.endereco.estado}
              onChange={handleChange}
              disabled={!isEditing}
            />
          </div>
        </div>

        <div className="text-end mt-4">
          {isEditing ? (
            <button className="btn btn-success" onClick={handleSave}>
              Salvar
            </button>
          ) : (
            <button className="btn btn-primary" onClick={() => setIsEditing(true)}>
              Editar Perfil
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
