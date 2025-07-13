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
  const [newService, setNewService] = useState({
    name: '',
    description: '',
    price: '',
    estimatedTime: '',
    isCustom: false
  });
  const [editingServiceIndex, setEditingServiceIndex] = useState(null);
  const [workingHours, setWorkingHours] = useState({});
  const [editingDay, setEditingDay] = useState(null);
  const fileInputRef = useRef();

  const weekDays = ['domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado'];
  const defaultServices = ['Lavagem Simples', 'Lavagem Completa', 'Polimento', 'Higienização'];

  useEffect(() => {
    document.body.classList.remove('auth-page');
  }, []);

  useEffect(() => {
    async function fetchCompany() {
      if (!user) return;
      const refDoc = doc(db, 'users', user.uid);
      const snap = await getDoc(refDoc);
      if (snap.exists()) {
        const data = snap.data();
        setCompany({
          ...data,
          name: data.name || data.nome
        });
        setForm({ description: data.description || '', photoURL: data.photoURL || '' });
        setServices(data.services || []);
        setWorkingHours(data.workingHours || {});
      }
    }
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
    const updated = { ...workingHours, [day]: { ...(workingHours[day] || {}), fechado: true } };
    await updateDoc(doc(db, 'users', user.uid), { workingHours: updated });
    setWorkingHours(updated);
    setEditingDay(null);
  };

  const saveWorkingHours = async (day) => {
    const updated = { ...workingHours, [day]: { ...(editingDay || {}), fechado: false } };
    await updateDoc(doc(db, 'users', user.uid), { workingHours: updated });
    setWorkingHours(updated);
    setEditingDay(null);
  };

  const handleAddService = () => {
    const name = newService.name.trim();
    if (!name) return alert('Informe o nome do serviço.');
    if (!newService.price) return alert('Informe o preço.');
    const serviceToAdd = {
      name,
      description: newService.description,
      price: newService.price,
      estimatedTime: newService.estimatedTime,
      isCustom: newService.isCustom
    };
    const updatedServices = [...services, serviceToAdd];
    setServices(updatedServices);
    updateDoc(doc(db, 'users', user.uid), { services: updatedServices });
    setNewService({ name: '', description: '', price: '', estimatedTime: '', isCustom: false });
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

  const handleSaveEditedService = async () => {
    if (editingServiceIndex == null) return;
    await updateDoc(doc(db, 'users', user.uid), { services });
    setEditingServiceIndex(null);
  };

  if (!company) return null;

  return (
    <div className="container mt-5 pt-4">
      <div className="bg-light p-4 rounded shadow-sm">
        {/* Header */}
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
            <h4 className="fw-bold">{company.name}</h4>
            {isEditing ? (
              <>
                <textarea
                  className="form-control mb-2"
                  rows={3}
                  value={form.description}
                  onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
                />
                <button className="btn btn-success btn-sm" onClick={handleUpdateProfile}>
                  Salvar
                </button>
              </>
            ) : (
              <div className="position-relative bg-white p-2 rounded">
                <p className="mb-0">{company.description || 'Sem descrição'}</p>
                <button
                  className="btn btn-sm btn-outline-secondary position-absolute top-0 end-0 m-2"
                  onClick={() => setIsEditing(true)}
                >
                  <FaEdit />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Services list */}
        <div className="mt-5">
          <h5 className="fw-bold">Serviços</h5>
          <div className="row g-3">
            {services.map((srv, idx) => (
              <div className="col-md-4" key={idx}>
                <div className="border rounded p-3 bg-white shadow-sm position-relative">
                  {editingServiceIndex === idx ? (
                    <>
                      <input
                        type="text"
                        className="form-control mb-2"
                        value={services[idx].name}
                        onChange={e => handleServiceChange(e, idx, 'name')}
                      />
                      <input
                        type="text"
                        className="form-control mb-2"
                        value={services[idx].description}
                        onChange={e => handleServiceChange(e, idx, 'description')}
                      />
                      <input
                        type="number"
                        className="form-control mb-2"
                        value={services[idx].price}
                        onChange={e => handleServiceChange(e, idx, 'price')}
                      />
                      <input
                        type="time"
                        className="form-control mb-2"
                        value={services[idx].estimatedTime}
                        onChange={e => handleServiceChange(e, idx, 'estimatedTime')}
                      />
                      <div className="d-flex gap-2">
                        <button
                          className="btn btn-success btn-sm flex-grow-1"
                          onClick={handleSaveEditedService}
                        >
                          <FaCheck /> Salvar
                        </button>
                        <button
                          className="btn btn-secondary btn-sm flex-grow-1"
                          onClick={() => setEditingServiceIndex(null)}
                        >
                          Cancelar
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <h6 className="fw-bold">{srv.name}</h6>
                      <p>{srv.description}</p>
                      <p><strong>Valor:</strong> R$ {parseFloat(srv.price).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                      <p><strong>Tempo Estimado:</strong> {srv.estimatedTime}h</p>
                      <div className="d-flex gap-2 position-absolute bottom-0 end-0 m-2">
                        <button type="button" className="btn btn-sm btn-outline-secondary p-1" onClick={() => handleEditService(idx)}>
                          <FaEdit />
                        </button>
                        <button type="button" className="btn btn-sm btn-outline-danger p-1" onClick={() => handleDeleteService(idx)}>
                          <FaTrash />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Add new service */}
          <div className="mt-4">
            <h6 className="fw-bold">Adicionar novo serviço</h6>
            <div className="row g-2">
              <div className="col-md-3">
                <select
                  className="form-select mb-2"
                  value={newService.isCustom ? 'other' : newService.name}
                  onChange={e => {
                    const val = e.target.value;
                    if (val === 'other') {
                      setNewService(prev => ({ ...prev, name: '', isCustom: true }));
                    } else {
                      setNewService(prev => ({ ...prev, name: val, isCustom: false }));
                    }
                  }}
                >
                  <option value="">-- selecione --</option>
                  {defaultServices.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                  <option value="other">Outro</option>
                </select>
                {newService.isCustom && (
                  <input
                    type="text"
                    className="form-control mb-2"
                    placeholder="Nome do novo serviço"
                    value={newService.name}
                    onChange={e => setNewService(prev => ({ ...prev, name: e.target.value }))}
                  />
                )}
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

          {/* Working hours */}
          <div className="mt-5">
            <h5 className="fw-bold">Horários de Funcionamento</h5>
            <div className="row g-3">
              {weekDays.map(day => {
                const horario = workingHours[day] || {};
                const editing = editingDay && editingDay.day === day;
                const closed = horario.fechado;
                const hasHorario =
                  horario.manhaInicio ||
                  horario.manhaFim ||
                  horario.tardeInicio ||
                  horario.tardeFim;

                return (
                  <div className="col-md-3" key={day}>
                    {/* fundo só no card interno: */}
                    <div
                      className={`
                        p-3
                        border
                        rounded
                        small-card
                        h-100
                        ${closed ? 'bg-danger-subtle' : ''}
                        ${!closed && hasHorario ? 'bg-primary-subtle' : ''}
                      `}
                    >
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <strong className="text-capitalize">{day}</strong>
                        {!editing ? (
                          <button
                            className="btn btn-outline-primary btn-sm"
                            onClick={() => setEditingDay({ day, ...horario })}
                          >
                            <FaEdit />
                          </button>
                        ) : (
                          <button
                            className="btn btn-outline-success btn-sm"
                            onClick={() => saveWorkingHours(day)}
                          >
                            <FaCheck />
                          </button>
                        )}
                      </div>

                      {editing && (
                        <>
                          <div className="mb-2">
                            <label>Manhã Início</label>
                            <input
                              type="time"
                              className="form-control form-control-sm"
                              value={editingDay.manhaInicio || ''}
                              onChange={e =>
                                setEditingDay(prev => ({ ...prev, manhaInicio: e.target.value }))
                              }
                            />
                          </div>
                          <div className="mb-2">
                            <label>Manhã Fim</label>
                            <input
                              type="time"
                              className="form-control form-control-sm"
                              value={editingDay.manhaFim || ''}
                              onChange={e =>
                                setEditingDay(prev => ({ ...prev, manhaFim: e.target.value }))
                              }
                            />
                          </div>
                          <div className="mb-2">
                            <label>Tarde Início</label>
                            <input
                              type="time"
                              className="form-control form-control-sm"
                              value={editingDay.tardeInicio || ''}
                              onChange={e =>
                                setEditingDay(prev => ({ ...prev, tardeInicio: e.target.value }))
                              }
                            />
                          </div>
                          <div className="mb-2">
                            <label>Tarde Fim</label>
                            <input
                              type="time"
                              className="form-control form-control-sm"
                              value={editingDay.tardeFim || ''}
                              onChange={e =>
                                setEditingDay(prev => ({ ...prev, tardeFim: e.target.value }))
                              }
                            />
                          </div>
                          <button
                            className="btn btn-dark btn-sm w-100"
                            onClick={() => toggleClosedDay(day)}
                          >
                            Fechar dia
                          </button>
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
    </div>
  );
}
