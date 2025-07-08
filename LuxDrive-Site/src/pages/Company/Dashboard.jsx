import React, { useEffect, useRef, useState } from 'react';
import { auth, db, storage } from '../../services/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useAuthState } from 'react-firebase-hooks/auth';
import { FaEdit, FaTrash, FaPlus, FaCheck } from 'react-icons/fa';
import '../../styles/Dashboard.css';

export default function Dashboard() {
  const [user] = useAuthState(auth);
  const [company, setCompany] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({ description: '', photoURL: '' });
  const [services, setServices] = useState([]);
  const [newService, setNewService] = useState({ name: '', description: '', price: '', estimatedTime: '' });
  const [editingServiceIndex, setEditingServiceIndex] = useState(null);
  const [workingHours, setWorkingHours] = useState({});
  const [editingDay, setEditingDay] = useState(null);
  const fileInputRef = useRef();

  const weekDays = ['domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado'];

  useEffect(() => {
    document.body.classList.remove('auth-page');
  }, []);

  useEffect(() => {
    const fetchCompany = async () => {
      if (!user) return;
      const refDoc = doc(db, 'users', user.uid);
      const snapshot = await getDoc(refDoc);
      if (snapshot.exists()) {
        const data = snapshot.data();
        setCompany(data);
        setForm({ description: data.description || '', photoURL: data.photoURL || '' });
        setServices(data.services || []);
        setWorkingHours(data.workingHours || {});
      }
    };
    fetchCompany();
  }, [user]);

  const handleUpdateProfile = async () => {
    if (!company) return;
    try {
      const refDoc = doc(db, 'users', user.uid);
      await updateDoc(refDoc, { description: form.description });
      setIsEditing(false);
      setCompany(prev => ({ ...prev, description: form.description }));
    } catch (error) {
      console.error('Erro ao atualizar descrição:', error);
    }
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const storageRef = ref(storage, `profileImages/${user.uid}`);
      await uploadBytes(storageRef, file);
      const imageUrl = await getDownloadURL(storageRef);
      await updateDoc(doc(db, 'users', user.uid), { photoURL: imageUrl });
      setForm(prev => ({ ...prev, photoURL: imageUrl }));
      setCompany(prev => ({ ...prev, photoURL: imageUrl }));
    } catch (error) {
      console.error('Erro ao fazer upload da imagem:', error);
    }
  };

  const toggleClosedDay = async (day) => {
    const updated = { ...workingHours, [day]: { ...workingHours[day], fechado: true } };
    await updateDoc(doc(db, 'users', user.uid), { workingHours: updated });
    setWorkingHours(updated);
    setEditingDay(null);
  };

  const saveWorkingHours = async (day) => {
    const updated = { ...workingHours, [day]: { ...editingDay, fechado: false } };
    await updateDoc(doc(db, 'users', user.uid), { workingHours: updated });
    setWorkingHours(updated);
    setEditingDay(null);
  };

  const handleAddService = () => {
    if (!newService.name || !newService.price) return;
    const updatedServices = [...services, newService];
    setServices(updatedServices);
    updateDoc(doc(db, 'users', user.uid), { services: updatedServices });
    setNewService({ name: '', description: '', price: '', estimatedTime: '' });
  };

  const handleDeleteService = (index) => {
    const updated = services.filter((_, i) => i !== index);
    setServices(updated);
    updateDoc(doc(db, 'users', user.uid), { services: updated });
  };

  const handleEditService = (index) => setEditingServiceIndex(index);

  const handleServiceChange = (e, index, field) => {
    const updated = [...services];
    updated[index][field] = e.target.value;
    setServices(updated);
  };

  const handleSaveEditedService = () => {
    updateDoc(doc(db, 'users', user.uid), { services });
    setEditingServiceIndex(null);
  };

  if (!company) return null;

  return (
    <div className="container mt-5 pt-4">
      <div className="bg-light p-4 rounded shadow-sm">
        <div className="d-flex flex-column flex-md-row align-items-start align-items-md-center gap-3">
          <div className="position-relative">
            <img
              src={company.photoURL || 'https://placehold.co/100x100'}
              alt="Empresa"
              className="company-image"
            />
            <button
              className="btn btn-sm btn-light position-absolute bottom-0 end-0"
              onClick={() => fileInputRef.current.click()}
            >
              <FaEdit />
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageChange}
              style={{ display: 'none' }}
              accept="image/*"
            />
          </div>

          <div className="flex-grow-1">
            <h4 className="fw-bold">{company.nome}</h4>

            {isEditing ? (
              <>
                <textarea
                  className="form-control mb-2"
                  rows={3}
                  value={form.description}
                  onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Descrição da empresa"
                />
                <button className="btn btn-success btn-sm" onClick={handleUpdateProfile}>
                  Salvar
                </button>
              </>
            ) : (
              <div className="position-relative bg-white p-2 rounded">
                <p className="mb-0">{company.description || 'Sem descrição'}</p>
                <FaEdit
                  role="button"
                  onClick={() => setIsEditing(true)}
                  className="position-absolute top-0 end-0 m-2"
                />
              </div>
            )}
          </div>
        </div>

        <div className="mt-5">
          <h5 className="fw-bold">Serviços</h5>
          <div className="row g-3">
            {services.map((service, idx) => (
              <div className="col-md-4" key={idx}>
                <div className="border rounded p-3 bg-white shadow-sm position-relative">
                  {editingServiceIndex === idx ? (
                    <>
                      <input
                        type="text"
                        className="form-control mb-2"
                        value={service.name}
                        onChange={e => handleServiceChange(e, idx, 'name')}
                      />
                      <input
                        type="text"
                        className="form-control mb-2"
                        value={service.description}
                        onChange={e => handleServiceChange(e, idx, 'description')}
                      />
                      <input
                        type="number"
                        className="form-control mb-2"
                        value={service.price}
                        onChange={e => handleServiceChange(e, idx, 'price')}
                      />
                      <input
                        type="time"
                        className="form-control mb-2"
                        value={service.estimatedTime}
                        onChange={e => handleServiceChange(e, idx, 'estimatedTime')}
                      />
                      <button className="btn btn-success btn-sm w-100" onClick={handleSaveEditedService}>
                        <FaCheck /> Salvar
                      </button>
                    </>
                  ) : (
                    <>
                      <h6 className="fw-bold">{service.name}</h6>
                      <p>{service.description}</p>
                      <p>
                        <strong>Valor:</strong> R$ {parseFloat(service.price).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                      <p>
                        <strong>Tempo Estimado:</strong> {service.estimatedTime}h
                      </p>
                      <div className="d-flex gap-2 position-absolute bottom-0 end-0 m-2">
                        <FaEdit role="button" onClick={() => handleEditService(idx)} />
                        <FaTrash role="button" className="text-danger" onClick={() => handleDeleteService(idx)} />
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4">
            <h6 className="fw-bold">Adicionar novo serviço</h6>
            <div className="row g-2">
              <div className="col-md-3">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Nome"
                  value={newService.name}
                  onChange={e => setNewService(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div className="col-md-3">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Descrição"
                  value={newService.description}
                  onChange={e => setNewService(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>
              <div className="col-md-2">
                <input
                  type="number"
                  className="form-control"
                  placeholder="Preço"
                  value={newService.price}
                  onChange={e => setNewService(prev => ({ ...prev, price: e.target.value }))}
                />
              </div>
              <div className="col-md-2">
                <input
                  type="time"
                  className="form-control"
                  placeholder="hh:mm"
                  value={newService.estimatedTime}
                  onChange={e => setNewService(prev => ({ ...prev, estimatedTime: e.target.value }))}
                />
              </div>
              <div className="col-md-2">
                <button className="btn btn-primary w-100" onClick={handleAddService}>
                  <FaPlus />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-5">
          <h5 className="fw-bold">Horários de Funcionamento</h5>
          <div className="row g-3">
            {weekDays.map(day => {
              const horario = workingHours[day] || {};
              const editing = editingDay && editingDay.day === day;
              const closed = horario.fechado;
              return (
                <div className={`col-md-3 ${closed ? 'bg-danger-subtle' : ''}`} key={day}>
                  <div className="p-3 border rounded small-card h-100">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <strong className="text-capitalize">{day}</strong>
                      {!editing ? (
                        <button className="btn btn-outline-primary btn-sm" onClick={() => setEditingDay({ day, ...horario })}>
                          <FaEdit />
                        </button>
                      ) : (
                        <button className="btn btn-outline-success btn-sm" onClick={() => saveWorkingHours(day)}>
                          <FaCheck />
                        </button>
                      )}
                    </div>
                    {editing && (
                      <>
                        <div className="mb-2">
                          <label className="form-label">Manhã Início</label>
                          <input
                            type="time"
                            className="form-control form-control-sm"
                            value={editingDay.manhaInicio || ''} onChange={e => setEditingDay(prev => ({ ...prev, manhaInicio: e.target.value }))}
                          />
                        </div>
                        <div className="mb-2">
                          <label className="form-label">Manhã Fim</label>
                          <input
                            type="time"
                            className="form-control form-control-sm"
                            value={editingDay.manhaFim || ''} onChange={e => setEditingDay(prev => ({ ...prev, manhaFim: e.target.value }))}
                          />
                        </div>
                        <div className="mb-2">
                          <label className="form-label">Tarde Início</label>
                          <input
                            type="time"
                            className="form-control form-control-sm"
                            value={editingDay.tardeInicio || ''} onChange={e => setEditingDay(prev => ({ ...prev, tardeInicio: e.target.value }))}
                          />
                        </div>
                        <div className="mb-2">
                          <label className="form-label">Tarde Fim</label>
                          <input
                            type="time"
                            className="form-control form-control-sm"
                            value={editingDay.tardeFim || ''} onChange={e => setEditingDay(prev => ({ ...prev, tardeFim: e.target.value }))}
                          />
                        </div>
                        <button className="btn btn-dark btn-sm w-100" onClick={() => toggleClosedDay(day)}>Fechar dia</button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
