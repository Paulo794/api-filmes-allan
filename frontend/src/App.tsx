import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import Login from './pages/Login';
import Catalog from './pages/Catalog';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Profile from './pages/Profile';
import Success from './pages/Success';
import Cancel from './pages/Cancel';

// Componente para proteger rotas
function ProtectedRoute({ children }: { children: ReactNode }) {
  const token = localStorage.getItem('token');
  
  // Se não tiver token salvo, bloqueia e manda de volta pro login
  if (!token) {
    return <Navigate to="/" replace />;
  }
  
  return children;
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        {/* Protegemos a rota do catálogo */}
        <Route 
          path="/catalog" 
          element={
            <ProtectedRoute>
              <Catalog />
            </ProtectedRoute>
          } 
        />
        {/* Rota Protegida do Perfil */}
        <Route 
          path="/profile" 
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/success" 
          element={
            <ProtectedRoute>
              <Success />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/cancel" 
          element={
            <ProtectedRoute>
              <Cancel />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </Router>
  );
}

export default App;
