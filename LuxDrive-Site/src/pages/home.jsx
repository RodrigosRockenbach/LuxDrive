import { useEffect } from 'react';

export default function Home() {
  useEffect(() => {
    document.body.classList.remove('auth-page'); // Remove o fundo azul
  }, []);

  return (
    <div className="home-page bg-light min-vh-100">
      {/* Conteúdo da Home aqui */}
    </div>
  );
}