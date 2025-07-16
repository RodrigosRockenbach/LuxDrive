import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import "react-datepicker/dist/react-datepicker.css";

import LoginUser from "./pages/Auth/LoginUser";
import RegisterUser from "./pages/Auth/RegisterUser";
import LoginCompany from "./pages/Auth/LoginCompany";
import RegisterCompany from "./pages/Auth/RegisterCompany";
import VerifyEmailPage from "./pages/Auth/VerifyEmailPage";
import ForgotPassword from "./pages/Auth/ForgotPassword";
import ResetPassword from "./pages/Auth/ResetPassword.jsx";  

import Home from "./pages/User/home";
import Schedule from "./pages/User/Schedule";
import AppointmentsUser from "./pages/User/UserAppointments";
import UserProfile from "./pages/User/UserProfile";
import CompanyProfile from "./pages/CompanyProfile";

import Dashboard from "./pages/Company/Dashboard";
import CompanyAppointments from "./pages/Company/CompanyAppointments";
import PerfilCompany from "./pages/Company/PerfilCompany";

import AboutUs from "./pages/AboutUs";

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
      <Route path="/" element={<Navigate to="/login" replace />} />

      <Route path="/login" element={<LoginUser />} />
      <Route path="/cadastro" element={<RegisterUser />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} /> 
      <Route path="/verify-email" element={<VerifyEmailPage />} />
      <Route path="/company/login" element={<LoginCompany />} />
      <Route path="/company/register" element={<RegisterCompany />} />

      {/* Rotas usuário */}
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
        <Route path="/sobre-nos" element={<AboutUs />} />
      </Route>

      {/* Rotas empresa */}
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
        <Route path="/sobre-nos" element={<AboutUs />} />
      </Route>

      {/*Página de erro*/}
      <Route path="*" element={<ErrorPage />} />
    </Routes>
  );
}

export default App;
