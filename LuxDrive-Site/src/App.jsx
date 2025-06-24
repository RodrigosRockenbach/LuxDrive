import React, { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";

import LoginUser from "./pages/Auth/LoginUser";
import RegisterUser from "./pages/Auth/RegisterUser";
import LoginCompany from "./pages/Auth/LoginCompany";
import RegisterCompany from "./pages/Auth/RegisterCompany";
import Home from "./pages/Home";
import Layout from "./components/Layout";
import PrivateRoute from "./components/PrivateRoute";
import Loading from "./components/Loading";
import ErrorPage from "./components/ErrorPage"; 

function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timeout);
  }, []);

  if (isLoading) return <Loading />;

  return (
    <Routes>
      <Route path="/login" element={<LoginUser />} />
      <Route path="/cadastro" element={<RegisterUser />} />
      <Route path="/company/login" element={<LoginCompany />} />
      <Route path="/company/register" element={<RegisterCompany />} />

      <Route element={<PrivateRoute><Layout /></PrivateRoute>}>
        <Route path="/home" element={<Home />} />
      </Route>

      <Route path="*" element={<ErrorPage />} />
    </Routes>
  );
}

export default App;