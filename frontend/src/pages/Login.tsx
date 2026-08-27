import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Eye, EyeOff, Film, ArrowRight, Loader2 } from 'lucide-react';
import api from '../services/api';

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [error, setError] = useState('');
  
  const navigate = useNavigate();

  const toggleMode = () => {
    setError('');
    // Usa View Transitions API (se disponível no navegador) para animar a troca de tamanho do card
    if (document.startViewTransition) {
      document.startViewTransition(() => {
        setIsLogin(!isLogin);
      });
    } else {
      setIsLogin(!isLogin);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      if (isLogin) {
        const response = await api.post('/auth/login', { email, senha });
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('usuario', JSON.stringify(response.data.usuario));
        navigate('/catalog');
      } else {
        await api.post('/auth/register', { nome, email, senha });
        toggleMode();
        setError('Cadastro realizado com sucesso! Faça login.');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao processar requisição');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh',
      // Fundo cinematográfico escuro com um leve gradiente
      background: 'radial-gradient(circle at top right, #1e293b, #020617)',
      padding: '1rem'
    }}>
      
      {/* Container Principal com Efeito Glassmorphism */}
      <div className="form-card" style={{ 
        background: 'rgba(255, 255, 255, 0.03)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        padding: '2.5rem', 
        borderRadius: '16px', 
        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', 
        width: '100%', 
        maxWidth: '420px',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem'
      }}>
        
        <div style={{ textAlign: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
            <div style={{ background: 'rgba(56, 189, 248, 0.1)', padding: '12px', borderRadius: '50%' }}>
              <Film size={32} color="#38bdf8" />
            </div>
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: '#f8fafc', marginBottom: '0.5rem' }}>
            {isLogin ? 'Bem-vindo de volta' : 'Crie sua conta'}
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
            {isLogin ? 'Entre para ver o catálogo do Tom Hanks' : 'Junte-se à comunidade cinéfila'}
          </p>
        </div>
        
        {error && (
          <div className="error-message" style={{ 
            background: error.includes('sucesso') ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)', 
            border: `1px solid ${error.includes('sucesso') ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
            color: error.includes('sucesso') ? '#4ade80' : '#f87171', 
            padding: '1rem', 
            borderRadius: '8px', 
            fontSize: '0.875rem',
            textAlign: 'center'
          }}>
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          {/* Nome - Só aparece no cadastro */}
          {!isLogin && (
            <div style={{ position: 'relative' }}>
              <User size={18} color="#94a3b8" style={{ position: 'absolute', top: '50%', left: '12px', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                placeholder="Seu nome"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                style={{ 
                  width: '100%', padding: '12px 12px 12px 40px', borderRadius: '8px', 
                  border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)', 
                  color: 'white', fontSize: '0.95rem', outline: 'none', transition: 'border-color 0.2s'
                }}
                onFocus={(e) => e.target.style.borderColor = '#38bdf8'}
                onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                required
              />
            </div>
          )}

          {/* Email */}
          <div style={{ position: 'relative' }}>
            <Mail size={18} color="#94a3b8" style={{ position: 'absolute', top: '50%', left: '12px', transform: 'translateY(-50%)' }} />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ 
                width: '100%', padding: '12px 12px 12px 40px', borderRadius: '8px', 
                border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)', 
                color: 'white', fontSize: '0.95rem', outline: 'none', transition: 'border-color 0.2s'
              }}
              onFocus={(e) => e.target.style.borderColor = '#38bdf8'}
              onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
              required
            />
          </div>

          {/* Senha */}
          <div style={{ position: 'relative' }}>
            <Lock size={18} color="#94a3b8" style={{ position: 'absolute', top: '50%', left: '12px', transform: 'translateY(-50%)' }} />
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Senha"
              value={senha}
              autoComplete="new-password"
              onChange={(e) => setSenha(e.target.value)}
              style={{ 
                width: '100%', padding: '12px 40px 12px 40px', borderRadius: '8px', 
                border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)', 
                color: 'white', fontSize: '0.95rem', outline: 'none', transition: 'border-color 0.2s'
              }}
              onFocus={(e) => e.target.style.borderColor = '#38bdf8'}
              onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
              required
            />
            {/* Botão olho para mostrar senha */}
            <button 
              type="button" 
              onClick={() => setShowPassword(!showPassword)}
              style={{ position: 'absolute', top: '50%', right: '12px', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex' }}
            >
              {showPassword ? <EyeOff size={18} color="#94a3b8" /> : <Eye size={18} color="#94a3b8" />}
            </button>
          </div>
          
          <button 
            type="submit" 
            disabled={isLoading}
            style={{ 
              marginTop: '0.5rem', padding: '12px', background: '#38bdf8', color: '#020617', 
              border: 'none', borderRadius: '8px', cursor: isLoading ? 'not-allowed' : 'pointer', 
              fontSize: '1rem', fontWeight: 600, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px',
              transition: 'background-color 0.2s, transform 0.1s'
            }}
            onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.98)'}
            onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#0ea5e9'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#38bdf8'}
          >
            {isLoading ? <Loader2 size={20} className="spinner" /> : (isLogin ? 'Entrar' : 'Criar conta')}
            {!isLoading && <ArrowRight size={18} />}
          </button>
        </form>
        
        {isLogin && (
          <div style={{ textAlign: 'center', marginTop: '-0.5rem' }}>
            <span 
              onClick={() => navigate('/forgot-password')}
              style={{ color: '#94a3b8', fontSize: '0.85rem', cursor: 'pointer', textDecoration: 'underline' }}
            >
              Esqueci minha senha
            </span>
          </div>
        )}
        
        <div style={{ textAlign: 'center', marginTop: '0.5rem' }}>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
            {isLogin ? "Ainda não tem conta? " : "Já possui conta? "}
            <span 
              onClick={toggleMode} 
              style={{ color: '#38bdf8', cursor: 'pointer', fontWeight: 500, textDecoration: 'none' }}
            >
              {isLogin ? 'Cadastre-se' : 'Fazer login'}
            </span>
          </p>
        </div>
      </div>

      <style>
        {`
          .spinner { animation: spin 1s linear infinite; }
          @keyframes spin { 100% { transform: rotate(360deg); } }
        `}
      </style>
    </div>
  );
}
