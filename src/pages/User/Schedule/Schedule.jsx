import { useEffect } from 'react';

export default function Schedule() {
  useEffect(() => {
    document.body.classList.remove('auth-page');
  }, []);

  return (
    <div className="container mt-5 pt-5">
      <h3 className="text-center mb-4">Agendamento</h3>
      <p className="text-center text-muted">Aqui será exibida a interface para realizar novos agendamentos.</p>
    </div>
  );
}
