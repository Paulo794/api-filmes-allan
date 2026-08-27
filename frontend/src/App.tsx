import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import Login from './pages/Login';
import Catalog from './pages/Catalog';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

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
      </Routes>
    </Router>
  );
}

export default App;
