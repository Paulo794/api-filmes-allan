import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, Eye, EyeOff, ArrowRight, Loader2 } from 'lucide-react';
import api from '../services/api';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (novaSenha !== confirmarSenha) {
      setError('As senhas não coincidem');
      return;
    }
    
    if (novaSenha.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    if (!token) {
      setError('Token inválido ou ausente');
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.post('/auth/reset-password', { token, novaSenha });
      setMessage(response.data.message);
      setTimeout(() => navigate('/'), 3000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao processar requisição');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ 
      display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh',
      background: 'radial-gradient(circle at top right, #1e293b, #020617)', padding: '1rem'
    }}>
      <div className="form-card" style={{ 
        background: 'rgba(255, 255, 255, 0.03)', backdropFilter: 'blur(16px)',
        border: '1px solid rgba(255, 255, 255, 0.1)', padding: '2.5rem', 
        borderRadius: '16px', width: '100%', maxWidth: '420px',
        display: 'flex', flexDirection: 'column', gap: '1.5rem'
      }}>
        
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: '#f8fafc', marginBottom: '0.5rem' }}>
            Redefinir Senha
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
            Digite sua nova senha abaixo
          </p>
        </div>
        
        {error && (
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#f87171', padding: '1rem', borderRadius: '8px', fontSize: '0.875rem', textAlign: 'center' }}>
            {error}
          </div>
        )}

        {message && (
          <div style={{ background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.3)', color: '#4ade80', padding: '1rem', borderRadius: '8px', fontSize: '0.875rem', textAlign: 'center' }}>
            {message} <br/> Redirecionando para o login...
          </div>
        )}
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ position: 'relative' }}>
            <Lock size={18} color="#94a3b8" style={{ position: 'absolute', top: '50%', left: '12px', transform: 'translateY(-50%)' }} />
            <input
              type={showPassword ? 'text' : 'password'} placeholder="Nova senha" value={novaSenha} onChange={(e) => setNovaSenha(e.target.value)}
              style={{ width: '100%', padding: '12px 40px 12px 40px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)', color: 'white', fontSize: '0.95rem', outline: 'none' }}
              required
            />
          </div>

          <div style={{ position: 'relative' }}>
            <Lock size={18} color="#94a3b8" style={{ position: 'absolute', top: '50%', left: '12px', transform: 'translateY(-50%)' }} />
            <input
              type={showPassword ? 'text' : 'password'} placeholder="Confirme a nova senha" value={confirmarSenha} onChange={(e) => setConfirmarSenha(e.target.value)}
              style={{ width: '100%', padding: '12px 40px 12px 40px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)', color: 'white', fontSize: '0.95rem', outline: 'none' }}
              required
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', top: '50%', right: '12px', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer' }}>
              {showPassword ? <EyeOff size={18} color="#94a3b8" /> : <Eye size={18} color="#94a3b8" />}
            </button>
          </div>
          
          <button 
            type="submit" disabled={isLoading}
            style={{ padding: '12px', background: '#38bdf8', color: '#020617', border: 'none', borderRadius: '8px', cursor: isLoading ? 'not-allowed' : 'pointer', fontSize: '1rem', fontWeight: 600, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
          >
            {isLoading ? <Loader2 size={20} className="spinner" /> : 'Atualizar Senha'}
            {!isLoading && <ArrowRight size={18} />}
          </button>
        </form>
      </div>
    </div>
  );
}
