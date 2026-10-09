import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function Profile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [newBio, setNewBio] = useState('');
  const [isEditingBio, setIsEditingBio] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const res = await api.get('/profile');
      setProfile(res.data);
      setNewBio(res.data.bio || '');
    } catch (error) {
      console.error('Erro ao carregar perfil', error);
      alert('Sessão expirada ou erro ao carregar.');
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await api.post('/profile/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setProfile({ ...profile, avatar_url: res.data.avatar_url });
    } catch (error: any) {
      console.error('Erro ao fazer upload da foto', error);
      alert(error.response?.data?.error || 'Erro ao enviar foto. Verifique o tamanho (máx 5MB).');
    }
  };

  const handleBioUpdate = async () => {
    try {
      await api.put('/profile', { bio: newBio });
      setProfile({ ...profile, bio: newBio });
      setIsEditingBio(false);
    } catch (error) {
      console.error('Erro ao atualizar bio', error);
      alert('Erro ao atualizar bio');
    }
  };

  const handleCheckout = async () => {
    try {
      const res = await api.post('/stripe/checkout');
      window.location.href = res.data.url;
    } catch (error) {
      console.error('Erro ao gerar checkout', error);
      alert('Erro ao iniciar pagamento. Tente novamente mais tarde.');
    }
  };

  if (!profile) return <div style={{ color: 'white', textAlign: 'center', marginTop: '50px' }}>Carregando Perfil...</div>;

  return (
    <div style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto', color: 'white' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 700 }}><span style={{ color: '#38bdf8' }}>Meu</span> Perfil</h1>
        <button onClick={() => navigate('/catalog')} style={{ padding: '8px 16px', background: 'rgba(255,255,255,0.1)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>Voltar ao Catálogo</button>
      </header>

      <div style={{ display: 'flex', gap: '3rem', flexWrap: 'wrap', background: 'rgba(255,255,255,0.03)', padding: '2rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)' }}>
        
        {/* Lado Esquerdo: Avatar */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '180px', height: '180px', borderRadius: '50%', overflow: 'hidden', background: '#1e293b', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '4px solid #38bdf8' }}>
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <span style={{ color: '#94a3b8', fontSize: '3rem' }}>{profile.nome.charAt(0)}</span>
            )}
          </div>
          <input type="file" accept="image/*" ref={fileInputRef} style={{ display: 'none' }} onChange={handleAvatarUpload} />
          <button onClick={() => fileInputRef.current?.click()} style={{ padding: '8px 16px', backgroundColor: '#38bdf8', color: '#0f172a', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>
            Alterar Foto
          </button>
          <small style={{ color: '#64748b' }}>Máx. 5MB (JPG/PNG)</small>
        </div>

        {/* Lado Direito: Informações */}
        <div style={{ flex: 1, minWidth: '300px' }}>
          <h2 style={{ fontSize: '1.8rem', margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
            {profile.nome}
            {profile.is_premium && (
              <span style={{ fontSize: '0.8rem', background: 'linear-gradient(90deg, #f59e0b, #fbbf24)', color: '#451a03', padding: '4px 10px', borderRadius: '12px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>
                🌟 Premium
              </span>
            )}
          </h2>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
            <p style={{ color: '#94a3b8', margin: 0 }}>{profile.email}</p>
            {!profile.is_premium && (
              <button 
                onClick={handleCheckout}
                style={{ padding: '8px 20px', background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)', color: 'white', border: 'none', borderRadius: '20px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 15px rgba(139, 92, 246, 0.4)' }}
              >
                ✨ Assinar Premium
              </button>
            )}
          </div>

          <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem' }}>Biografia</h3>
              {!isEditingBio && (
                <button onClick={() => setIsEditingBio(true)} style={{ background: 'none', border: 'none', color: '#38bdf8', cursor: 'pointer', fontWeight: 600 }}>
                  Editar Bio
                </button>
              )}
            </div>
            {isEditingBio ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <textarea 
                  value={newBio} 
                  onChange={(e) => setNewBio(e.target.value)} 
                  rows={4} 
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #38bdf8', background: 'rgba(0,0,0,0.3)', color: 'white', outline: 'none', resize: 'none' }} 
                  placeholder="Escreva um pouco sobre você..."></textarea>
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                  <button onClick={() => { setIsEditingBio(false); setNewBio(profile.bio || ''); }} style={{ padding: '6px 12px', background: 'transparent', color: '#f87171', border: '1px solid #f87171', borderRadius: '6px', cursor: 'pointer' }}>Cancelar</button>
                  <button onClick={handleBioUpdate} style={{ padding: '6px 12px', background: '#38bdf8', color: '#0f172a', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}>Salvar</button>
                </div>
              </div>
            ) : (
              <p style={{ color: '#e2e8f0', lineHeight: 1.6, margin: 0 }}>
                {profile.bio || <span style={{ color: '#64748b', fontStyle: 'italic' }}>Nenhuma biografia informada.</span>}
              </p>
            )}
          </div>
        </div>
      </div>

      <h3 style={{ fontSize: '1.5rem', marginTop: '3rem', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>
        Meus Favoritos
      </h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1.5rem' }}>
        {profile.favoritos?.length > 0 ? profile.favoritos.map((fav: any) => (
          <div key={fav.tmdb_movie_id} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
            {fav.poster_path ? (
              <img src={`https://image.tmdb.org/t/p/w500${fav.poster_path}`} alt={fav.titulo} style={{ width: '100%', display: 'block' }} />
            ) : (
              <div style={{ width: '100%', height: '270px', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Sem Imagem</div>
            )}
            <div style={{ padding: '1rem' }}>
              <h4 style={{ margin: 0, fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={fav.titulo}>
                {fav.titulo}
              </h4>
            </div>
          </div>
        )) : (
          <p style={{ color: '#94a3b8', gridColumn: '1 / -1' }}>Você ainda não tem filmes favoritos.</p>
        )}
      </div>
    </div>
  );
}
