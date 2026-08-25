import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import "react-datepicker/dist/react-datepicker.css";

import LoginUser from "./pages/Auth/LoginUser/LoginUser";
import RegisterUser from "./pages/Auth/RegisterUser/RegisterUser";
import LoginCompany from "./pages/Auth/LoginCompany/LoginCompany";
import RegisterCompany from "./pages/Auth/RegisterCompany/RegisterCompany";
import ForgotPassword from "./pages/Auth/ForgotPassword/ForgotPassword";
import AuthAction from "./pages/Auth/AuthAction/AuthAction";

import Home from "./pages/User/Home/Home";
import Schedule from "./pages/User/Schedule/Schedule";
import AppointmentsUser from "./pages/User/UserAppointments/UserAppointments";
import UserProfile from "./pages/User/UserProfile/UserProfile";
import CompanyProfile from "./pages/Company/CompanyProfile/CompanyProfile";

import Dashboard from "./pages/Company/Dashboard/Dashboard";
import CompanyAppointments from "./pages/Company/CompanyAppointments/CompanyAppointments";
import PerfilCompany from "./pages/Company/CompanySettings/CompanySettings";

import AboutUs from "./pages/AboutUs/AboutUs";

import UserLayout from "./layouts/UserLayout/UserLayout";
import CompanyLayout from "./layouts/CompanyLayout/CompanyLayout";

import PrivateRoute from "./components/common/PrivateRoute";
import Loading from "./components/common/Loading";
import ErrorPage from "./pages/ErrorPage/ErrorPage";

function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timeout = setTimeout(() => setIsLoading(false), 2000);
    return () => clearTimeout(timeout);
  }, []);

  if (isLoading) return <Loading />;

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* Público */}
      <Route path="/login" element={<LoginUser />} />
      <Route path="/cadastro" element={<RegisterUser />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/auth-action" element={<AuthAction />} /> 
      <Route path="/company/login" element={<LoginCompany />} />
      <Route path="/company/register" element={<RegisterCompany />} />
      <Route path="/sobre-nos" element={<AboutUs />} />

      {/* Usuário */}
      <Route
        element={
          <PrivateRoute requiredType="user">
            <UserLayout />
          </PrivateRoute>
        }
      >
        <Route path="/home" element={<Home />} />
        <Route path="/agendar" element={<Schedule />} />
        <Route path="/meus-agendamentos" element={<AppointmentsUser />} />
        <Route path="/empresa/:id" element={<CompanyProfile />} />
        <Route path="/perfil" element={<UserProfile />} />
      </Route>

      {/* Empresa */}
      <Route
        element={
          <PrivateRoute requiredType="company">
            <CompanyLayout />
          </PrivateRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/empresa/agendamentos" element={<CompanyAppointments />} />
        <Route path="/empresa/perfil" element={<PerfilCompany />} />
      </Route>

      {/* Página de erro */}
      <Route path="*" element={<ErrorPage />} />
    </Routes>
  );
}

export default App;