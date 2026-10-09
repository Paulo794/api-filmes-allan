import { useNavigate } from 'react-router-dom';

export default function Cancel() {
  const navigate = useNavigate();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', color: 'white', textAlign: 'center' }}>
      <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>😔</div>
      <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', color: '#f87171' }}>
        Pagamento Cancelado
      </h1>
      <p style={{ color: '#94a3b8', fontSize: '1.2rem', maxWidth: '500px', marginBottom: '2rem' }}>
        Você desistiu ou ocorreu um problema durante a assinatura. Nenhuma cobrança foi realizada no seu cartão de teste.
      </p>
      <button 
        onClick={() => navigate('/profile')}
        style={{ padding: '12px 24px', background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer' }}
      >
        Voltar ao Perfil
      </button>
    </div>
  );
}
