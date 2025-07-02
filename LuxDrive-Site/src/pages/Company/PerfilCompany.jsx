import { useEffect, useState } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import { db, auth } from "../../services/firebase";

export default function PerfilCompany() {
  const [user] = useAuthState(auth);
  const [data, setData] = useState(null);
  const [form, setForm] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      const ref = doc(db, "users", user.uid);
      const snapshot = await getDoc(ref);
      if (snapshot.exists()) {
        const userData = snapshot.data();
        setData(userData);
        setForm({
          nome: userData.nome || "",
          name: userData.name || "",
          email: userData.email || "",
          celular: userData.celular || "",
          instagram: userData.instagram || "",
          whatsapp: userData.whatsapp || "",
          facebook: userData.facebook || "",
          endereco: {
            rua: userData.endereco?.rua || "",
            numero: userData.endereco?.numero || "",
            bairro: userData.endereco?.bairro || "",
            cidade: userData.endereco?.cidade || "",
            estado: userData.endereco?.estado || "",
            cep: userData.endereco?.cep || "",
          },
        });
      }
    };
    fetchData();
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith("endereco.")) {
      const field = name.split(".")[1];
      setForm((prev) => ({
        ...prev,
        endereco: { ...prev.endereco, [field]: value },
      }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSave = async () => {
    if (!user || !form) return;
    const ref = doc(db, "users", user.uid);
    await updateDoc(ref, form);
    setIsEditing(false);
    setSuccessMsg("Perfil atualizado com sucesso!");
    setTimeout(() => setSuccessMsg(""), 3000);
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
              name="nome"
              value={form.nome}
              onChange={handleChange}
              disabled={!isEditing}
            />
          </div>

          <div className="col-md-6">
            <label>Nome da Empresa</label>
            <input
              type="text"
              className="form-control"
              name="name"
              value={form.name}
              onChange={handleChange}
              disabled={!isEditing}
            />
          </div>

          <div className="col-md-6">
            <label>Email</label>
            <input
              type="email"
              className="form-control"
              name="email"
              value={form.email}
              onChange={handleChange}
              disabled={!isEditing}
            />
          </div>

          <div className="col-md-6">
            <label>Celular</label>
            <input
              type="text"
              className="form-control"
              name="celular"
              value={form.celular}
              onChange={handleChange}
              disabled={!isEditing}
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

          <div className="col-md-3">
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

          <div className="col-md-4">
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

          <div className="col-md-4">
            <label>CEP</label>
            <input
              type="text"
              className="form-control"
              name="endereco.cep"
              value={form.endereco.cep}
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
