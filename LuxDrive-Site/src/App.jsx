import React from "react";
import { Routes, Route } from "react-router-dom";

import LoginUser from "./pages/Auth/LoginUser";
import RegisterUser from "./pages/Auth/RegisterUser";
import LoginCompany from "./pages/Auth/LoginCompany";
import RegisterCompany from "./pages/Auth/RegisterCompany";
import Home from "./pages/Home";
import Layout from "./components/Layout";
import PrivateRoute from "./components/PrivateRoute";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginUser />} />
      <Route path="/cadastro" element={<RegisterUser />} />
      <Route path="/company/login" element={<LoginCompany />} />
      <Route path="/company/register" element={<RegisterCompany />} />

      {/* Rotas protegidas dentro do layout */}
      <Route element={<PrivateRoute><Layout /></PrivateRoute>}>
        <Route path="/home" element={<Home />} />
      </Route>
    </Routes>
  );
}

export default App;