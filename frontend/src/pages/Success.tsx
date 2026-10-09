import { useNavigate } from 'react-router-dom';

export default function Success() {
  const navigate = useNavigate();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', color: 'white', textAlign: 'center' }}>
      <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎉</div>
      <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', background: 'linear-gradient(90deg, #f59e0b, #fbbf24)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
        Pagamento Aprovado!
      </h1>
      <p style={{ color: '#94a3b8', fontSize: '1.2rem', maxWidth: '500px', marginBottom: '2rem' }}>
        Você agora é um membro <strong>Premium</strong>. Aproveite todos os benefícios exclusivos do catálogo, incluindo o seu novo selo oficial!
      </p>
      <button 
        onClick={() => navigate('/profile')}
        style={{ padding: '12px 24px', background: '#38bdf8', color: '#0f172a', border: 'none', borderRadius: '8px', fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer' }}
      >
        Ver meu Perfil
      </button>
    </div>
  );
}
