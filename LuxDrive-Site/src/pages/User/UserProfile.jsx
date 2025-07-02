import { useEffect, useState } from "react";
import { auth, db, storage } from "../../services/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import {
  doc,
  getDoc,
  updateDoc
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import "../../styles/UserProfile.css";

export default function UserProfile() {
  const [user] = useAuthState(auth);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    cep: "",
    rua: "",
    numero: "",
    bairro: "",
    cidade: "",
    estado: "",
    photoURL: ""
  });
  const [selectedImage, setSelectedImage] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      if (!user) return;

      const docRef = doc(db, "users", user.uid);
      const snapshot = await getDoc(docRef);
      if (snapshot.exists()) {
        setFormData(prev => ({
          ...prev,
          ...snapshot.data()
        }));
      }
    };

    loadData();
  }, [user]);

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleCEP = async () => {
    if (formData.cep.length !== 8) return;

    try {
      const res = await fetch(`https://viacep.com.br/ws/${formData.cep}/json/`);
      const data = await res.json();

      if (!data.erro) {
        setFormData(prev => ({
          ...prev,
          rua: data.logradouro || "",
          bairro: data.bairro || "",
          cidade: data.localidade || "",
          estado: data.uf || ""
        }));
      }
    } catch (err) {
      console.error("Erro ao buscar CEP", err);
    }
  };

  const handleImageChange = (e) => {
    if (e.target.files[0]) {
      setSelectedImage(e.target.files[0]);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);

    let photoURL = formData.photoURL;

    // Se for adicionada uma nova imagem, faz o upload
    if (selectedImage) {
      const imageRef = ref(storage, `profileImages/${user.uid}`);
      await uploadBytes(imageRef, selectedImage);
      photoURL = await getDownloadURL(imageRef);
    }

    const updatedData = {
      ...formData,
      photoURL
    };

    const docRef = doc(db, "users", user.uid);
    await updateDoc(docRef, updatedData);

    setIsSaving(false);
    alert("Dados atualizados com sucesso!");
  };

  return (
    <div className="container mt-5 pt-4">
      <h3 className="mb-4 fw-bold">Perfil do Usuário</h3>

      <div className="text-center mb-4">
        <div className="position-relative d-inline-block">
          <img
            src={
              selectedImage
                ? URL.createObjectURL(selectedImage)
                : formData.photoURL || "https://via.placeholder.com/120"
            }
            className="rounded-circle profile-img"
            alt="Perfil"
          />
          <label className="edit-icon">
            <i className="bi bi-pencil-square"></i>
            <input type="file" hidden accept="image/*" onChange={handleImageChange} />
          </label>
        </div>
      </div>

      <div className="row g-3">
        <div className="col-md-6">
          <label className="form-label">Nome completo</label>
          <input
            type="text"
            className="form-control"
            name="name"
            value={formData.name || ""}
            onChange={handleChange}
          />
        </div>

        <div className="col-md-6">
          <label className="form-label">Email</label>
          <input
            type="email"
            className="form-control"
            value={formData.email || ""}
            disabled
          />
        </div>

        <div className="col-md-3">
          <label className="form-label">CEP</label>
          <input
            type="text"
            className="form-control"
            name="cep"
            value={formData.cep || ""}
            onChange={handleChange}
            onBlur={handleCEP}
            maxLength={8}
          />
        </div>

        <div className="col-md-5">
          <label className="form-label">Rua</label>
          <input
            type="text"
            className="form-control"
            name="rua"
            value={formData.rua || ""}
            onChange={handleChange}
          />
        </div>

        <div className="col-md-2">
          <label className="form-label">Número</label>
          <input
            type="text"
            className="form-control"
            name="numero"
            value={formData.numero || ""}
            onChange={handleChange}
          />
        </div>

        <div className="col-md-4">
          <label className="form-label">Bairro</label>
          <input
            type="text"
            className="form-control"
            name="bairro"
            value={formData.bairro || ""}
            onChange={handleChange}
          />
        </div>

        <div className="col-md-4">
          <label className="form-label">Cidade</label>
          <input
            type="text"
            className="form-control"
            name="cidade"
            value={formData.cidade || ""}
            onChange={handleChange}
          />
        </div>

        <div className="col-md-4">
          <label className="form-label">Estado</label>
          <input
            type="text"
            className="form-control"
            name="estado"
            value={formData.estado || ""}
            onChange={handleChange}
          />
        </div>
      </div>

      <div className="d-grid mt-4">
        <button className="btn btn-primary" onClick={handleSave} disabled={isSaving}>
          {isSaving ? "Salvando..." : "Salvar Alterações"}
        </button>
      </div>
    </div>
  );
}
