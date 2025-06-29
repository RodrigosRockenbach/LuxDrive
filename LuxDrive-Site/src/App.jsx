import React, { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";

import LoginUser from "./pages/Auth/LoginUser";
import RegisterUser from "./pages/Auth/RegisterUser";
import LoginCompany from "./pages/Auth/LoginCompany";
import RegisterCompany from "./pages/Auth/RegisterCompany";

import Home from "./pages/User/home";
import Schedule from "./pages/User/Schedule";
import AppointmentsUser from "./pages/User/UserAppointments";
import CompanyProfile from "./pages/CompanyProfile";

import Dashboard from "./pages/Company/Dashboard";
import CompanyAppointments from "./pages/Company/CompanyAppointments";

import UserLayout from "./layouts/UserLayout";
import CompanyLayout from "./layouts/CompanyLayout";

import PrivateRoute from "./components/common/PrivateRoute";
import Loading from "./components/common/Loading";
import ErrorPage from "./pages/ErrorPage";

function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timeout = setTimeout(() => setIsLoading(false), 2000);
    return () => clearTimeout(timeout);
  }, []);

  if (isLoading) return <Loading />;

  return (
    <Routes>
      {/* Rotas públicas */}
      <Route path="/login" element={<LoginUser />} />
      <Route path="/cadastro" element={<RegisterUser />} />
      <Route path="/company/login" element={<LoginCompany />} />
      <Route path="/company/register" element={<RegisterCompany />} />

      {/* Rotas protegidas - usuário */}
      <Route element={<PrivateRoute><UserLayout /></PrivateRoute>}>
        <Route path="/home" element={<Home />} />
        <Route path="/agendar" element={<Schedule />} />
        <Route path="/meus-agendamentos" element={<AppointmentsUser />} />
        <Route path="/empresa/:id" element={<CompanyProfile />} /> {/* Agora protegida */}
      </Route>

      {/* Rotas protegidas - empresa */}
      <Route element={<PrivateRoute><CompanyLayout /></PrivateRoute>}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/empresa/agendamentos" element={<CompanyAppointments />} />
      </Route>

      <Route path="*" element={<ErrorPage />} />
    </Routes>
  );
}

export default App;
