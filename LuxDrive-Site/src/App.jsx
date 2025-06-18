import React from "react";
import { Routes, Route } from "react-router-dom";

import "./assets/styles/App.css";

import LoginUser from "./pages/Auth/LoginUser";
import RegisterUser from "./pages/Auth/RegisterUser";
import LoginCompany from "./pages/Auth/LoginCompany"; 
import RegisterCompany from "./pages/Auth/RegisterCompany";

function App() {
  return (
    <Routes>
      <Route path="/" element={<home />} />
      <Route path="/login" element={<LoginUser />} />
      <Route path="/cadastro" element={<RegisterUser />} />
      <Route path="/company/login" element={<LoginCompany />} />
      <Route path="/company/register" element={<RegisterCompany />} />
      {/* Adicionando uma rota 404 */}
      <Route path="*" element={<h2>Página não encontrada</h2>} />
    </Routes>
  );
}

export default App;
