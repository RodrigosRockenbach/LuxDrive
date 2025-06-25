import { useEffect, useRef, useState } from "react";
import { auth, db, storage } from "../../services/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useAuthState } from "react-firebase-hooks/auth";
import { FaEdit, FaTrash, FaPlus } from "react-icons/fa";
import "../../styles/Dashboard.css";

export default function Dashboard() {
  const [user] = useAuthState(auth);
  const [company, setCompany] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", photoURL: "" });
  const [services, setServices] = useState([]);
  const [newService, setNewService] = useState({ name: "", description: "", price: "", estimatedTime: "" });
  const fileInputRef = useRef();

  useEffect(() => {
    document.body.classList.remove("auth-page");
  }, []);

  useEffect(() => {
    const fetchCompany = async () => {
      if (!user) return;
      const refDoc = doc(db, "users", user.uid);
      const snapshot = await getDoc(refDoc);
      if (snapshot.exists()) {
        const data = snapshot.data();
        setCompany(data);
        setForm({
          name: data.name || "",
          description: data.description || "",
          photoURL: data.photoURL || "",
        });
        setServices(data.services || []);
      }
    };
    fetchCompany();
  }, [user]);

  const handleUpdateProfile = async () => {
    try {
      const refDoc = doc(db, "users", user.uid);
      await updateDoc(refDoc, {
        name: form.name,
        description: form.description,
        photoURL: form.photoURL,
        services,
      });
      setIsEditing(false);
      setCompany({ ...company, ...form, services });
    } catch (error) {
      console.error("Erro ao atualizar perfil:", error);
    }
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const storageRef = ref(storage, `profileImages/${user.uid}`);
      await uploadBytes(storageRef, file);
      const imageUrl = await getDownloadURL(storageRef);
      setForm((prev) => ({ ...prev, photoURL: imageUrl }));
    }
  };

  const handleAddService = () => {
    if (!newService.name || !newService.price) return;
    setServices([...services, newService]);
    setNewService({ name: "", description: "", price: "", estimatedTime: "" });
  };

  const handleDeleteService = (index) => {
    const updated = services.filter((_, i) => i !== index);
    setServices(updated);
  };

  const formatCurrency = (value) => {
    const floatVal = parseFloat(value.replace(/[^\d]/g, "")) / 100;
    return floatVal.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  };

  const formatTime = (value) => {
    const [hours, minutes] = value.split(":");
    return `${hours || "00"}h ${minutes || "00"}min`;
  };

  if (!company) return null;

  return (
    <div className="container mt-5 pt-4">
      <div className="bg-light p-4 rounded shadow-sm">
        <div className="d-flex flex-column flex-md-row align-items-start align-items-md-center gap-3">
          <div className="position-relative">
            <img
              src={form.photoURL || "https://via.placeholder.com/100"}
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
              style={{ display: "none" }}
              accept="image/*"
            />
          </div>

          <div className="flex-grow-1">
            {isEditing ? (
              <>
                <input
                  type="text"
                  className="form-control mb-2"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Nome da empresa"
                />
                <textarea
                  className="form-control mb-2"
                  rows="3"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Descrição da empresa"
                />
                <button className="btn btn-success btn-sm" onClick={handleUpdateProfile}>Salvar</button>
              </>
            ) : (
              <>
                <h4 className="fw-bold">{form.name} <FaEdit role="button" onClick={() => setIsEditing(true)} /></h4>
                <p className="bg-white p-2 rounded position-relative">{form.description}</p>
              </>
            )}
          </div>
        </div>

        <div className="mt-5">
          <h5 className="fw-bold">Serviços</h5>
          <div className="row g-3">
            {services.map((service, idx) => (
              <div className="col-md-4" key={idx}>
                <div className="border rounded p-3 bg-white shadow-sm position-relative">
                  <h6 className="fw-bold">{service.name}</h6>
                  <p>{service.description}</p>
                  <p><strong>Valor:</strong> R$ {parseFloat(service.price).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
                  <p><strong>Tempo Estimado:</strong> {formatTime(service.estimatedTime)}</p>
                  <div className="d-flex gap-2 position-absolute bottom-0 end-0 m-2">
                    <FaEdit role="button" />
                    <FaTrash role="button" className="text-danger" onClick={() => handleDeleteService(idx)} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4">
            <h6 className="fw-bold">Adicionar novo serviço</h6>
            <div className="row g-2">
              <div className="col-md-3">
                <input type="text" className="form-control" placeholder="Nome"
                  value={newService.name} onChange={e => setNewService({ ...newService, name: e.target.value })} />
              </div>
              <div className="col-md-3">
                <input type="text" className="form-control" placeholder="Descrição"
                  value={newService.description} onChange={e => setNewService({ ...newService, description: e.target.value })} />
              </div>
              <div className="col-md-2">
                <input type="number" className="form-control" placeholder="Preço"
                  value={newService.price} onChange={e => setNewService({ ...newService, price: e.target.value })} />
              </div>
              <div className="col-md-2">
                <input type="time" className="form-control" placeholder="hh:mm"
                  value={newService.estimatedTime} onChange={e => setNewService({ ...newService, estimatedTime: e.target.value })} />
              </div>
              <div className="col-md-2">
                <button className="btn btn-primary w-100" onClick={handleAddService}><FaPlus /></button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
