import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, ArrowLeft, Send, Loader2 } from 'lucide-react';
import api from '../services/api';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setIsLoading(true);
    
    try {
      const response = await api.post('/auth/forgot-password', { email });
      setMessage(response.data.message);
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
            Recuperar Senha
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
            Enviaremos um link para o seu e-mail
          </p>
        </div>
        
        {error && (
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#f87171', padding: '1rem', borderRadius: '8px', fontSize: '0.875rem', textAlign: 'center' }}>
            {error}
          </div>
        )}

        {message && (
          <div style={{ background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.3)', color: '#4ade80', padding: '1rem', borderRadius: '8px', fontSize: '0.875rem', textAlign: 'center' }}>
            {message}
          </div>
        )}
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ position: 'relative' }}>
            <Mail size={18} color="#94a3b8" style={{ position: 'absolute', top: '50%', left: '12px', transform: 'translateY(-50%)' }} />
            <input
              type="email" placeholder="Seu e-mail" value={email} onChange={(e) => setEmail(e.target.value)}
              style={{ width: '100%', padding: '12px 12px 12px 40px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)', color: 'white', fontSize: '0.95rem', outline: 'none' }}
              required
            />
          </div>
          
          <button 
            type="submit" disabled={isLoading}
            style={{ padding: '12px', background: '#38bdf8', color: '#020617', border: 'none', borderRadius: '8px', cursor: isLoading ? 'not-allowed' : 'pointer', fontSize: '1rem', fontWeight: 600, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
          >
            {isLoading ? <Loader2 size={20} className="spinner" /> : 'Enviar Link'}
            {!isLoading && <Send size={18} />}
          </button>
        </form>
        
        <div style={{ textAlign: 'center', marginTop: '0.5rem' }}>
          <span onClick={() => navigate('/')} style={{ color: '#94a3b8', fontSize: '0.9rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <ArrowLeft size={16} /> Voltar para o Login
          </span>
        </div>
      </div>
    </div>
  );
}
