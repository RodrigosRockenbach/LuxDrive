import React from "react";
import { Routes, Route } from "react-router-dom";

import "./assets/styles/App.css";

import LoginUser from "./pages/Auth/LoginUser";
import RegisterUser from "./pages/Auth/RegisterUser";
import LoginCompany from "./pages/Auth/LoginCompany"; 
import RegisterCompany from "./pages/Auth/RegisterCompany";
import Home from "./pages/Home";
import Layout from "./components/Layout";

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/home" element={<Home />} />
        {/* outras rotas dentro do layout */}
        </Route>
      <Route path="/login" element={<LoginUser />} />
      <Route path="/cadastro" element={<RegisterUser />} />
      <Route path="/company/login" element={<LoginCompany />} />
     <Route path="/company/register" element={<RegisterCompany />} />
    </Routes>
  );
}

export default App;