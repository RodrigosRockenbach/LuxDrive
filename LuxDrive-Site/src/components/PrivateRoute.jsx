import { Navigate } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../firebase';

export default function PrivateRoute({ children }) {
  const [user, loading] = useAuthState(auth);

  if (loading) {
    return <div className="text-center mt-5">Carregando...</div>; // você pode trocar por um spinner
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}