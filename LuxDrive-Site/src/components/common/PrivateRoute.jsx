import { Navigate } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useEffect, useState } from 'react';
import { auth, db } from '../../services/firebase';
import { doc, getDoc } from 'firebase/firestore';
import Loading from './Loading';

export default function PrivateRoute({ children, requiredType = null }) {
  const [user, loading] = useAuthState(auth);
  const [checking, setChecking] = useState(true);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const fetchUserType = async () => {
      if (user) {
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setUserData(docSnap.data());
        }
      }
      setChecking(false);
    };

    if (!loading) {
      fetchUserType();
    }
  }, [user, loading]);

  if (loading || checking) return <Loading />;

  if (!user) return <Navigate to="/login" replace />;

  if (requiredType && userData?.type !== requiredType) {
    return <Navigate to="/" replace />;
  }

  return children;
}
