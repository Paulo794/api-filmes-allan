import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import api from '../services/api';

export default function Catalog() {
  const [movies, setMovies] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [favorites, setFavorites] = useState<any[]>([]);
  const [selectedMovie, setSelectedMovie] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/');
      return;
    }
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [moviesRes, favsRes] = await Promise.all([
        api.get('/movies/tom-hanks'),
        api.get('/movies/favorites')
      ]);
      setMovies(moviesRes.data);
      setFavorites(favsRes.data);
    } catch (error) {
      console.error('Erro ao carregar dados', error);
    }
  };

  const isFavorite = (id: number) => {
    return favorites.some((f) => f.tmdb_movie_id === id);
  };

  const toggleFavorite = async (movie: any) => {
    const currentlyFavorite = isFavorite(movie.id);

    // UX Otimista: Atualiza a interface instantaneamente antes de esperar o servidor
    if (currentlyFavorite) {
      setFavorites(prev => prev.filter(f => f.tmdb_movie_id !== movie.id));
      try {
        await api.delete(`/movies/favorites/${movie.id}`);
      } catch (error) {
        // Se falhar, desfaz a alteração otimista
        setFavorites(prev => [...prev, { tmdb_movie_id: movie.id, titulo: movie.title }]);
        alert('Erro ao remover dos favoritos');
      }
    } else {
      setFavorites(prev => [...prev, { tmdb_movie_id: movie.id, titulo: movie.title }]);
      try {
        await api.post('/movies/favorites', {
          tmdb_movie_id: movie.id,
          titulo: movie.title,
          poster_path: movie.poster_path
        });
      } catch (error) {
        setFavorites(prev => prev.filter(f => f.tmdb_movie_id !== movie.id));
        alert('Erro ao favoritar');
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    navigate('/');
  };

  const openMovie = async (movie: any) => {
    setSelectedMovie(movie);
    try {
      const res = await api.get(`/movies/comments/${movie.id}`);
      setComments(res.data);
    } catch (error) {
      console.error('Erro ao buscar comentários', error);
    }
  };

  const addComment = async () => {
    if (!newComment.trim()) return;
    try {
      await api.post('/movies/comments', {
        tmdb_movie_id: selectedMovie.id,
        texto: newComment
      });
      setNewComment('');
      const res = await api.get(`/movies/comments/${selectedMovie.id}`);
      setComments(res.data);
    } catch (error) {
      console.error('Erro ao comentar', error);
    }
  };

  // Filtro de pesquisa no front-end
  const filteredMovies = movies.filter(movie => 
    movie.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', paddingBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 700, color: '#f8fafc' }}>
          <span style={{ color: '#38bdf8' }}>Catálogo</span> Tom Hanks
        </h1>
        
        {/* Barra de Pesquisa */}
        <div style={{ position: 'relative', flex: '1 1 300px', maxWidth: '400px' }}>
          <Search size={18} color="#94a3b8" style={{ position: 'absolute', top: '50%', left: '12px', transform: 'translateY(-50%)' }} />
          <input 
            type="text" 
            placeholder="Pesquisar filme..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: '100%', padding: '10px 10px 10px 40px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)', color: 'white', outline: 'none' }}
          />
        </div>

        <button onClick={handleLogout} style={{ padding: '8px 16px', background: 'rgba(239, 68, 68, 0.1)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '8px', cursor: 'pointer', fontWeight: 500 }}>
          Sair
        </button>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '2rem' }}>
        {filteredMovies.map(movie => (
          <div key={movie.id} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', overflow: 'hidden', transition: 'transform 0.2s', cursor: 'pointer' }} onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
            {movie.poster_path ? (
              <img src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`} alt={movie.title} style={{ width: '100%', display: 'block', objectFit: 'cover' }} />
            ) : (
              <div style={{ width: '100%', height: '330px', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Sem Imagem</div>
            )}
            <div style={{ padding: '1.2rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: '0 0 1rem 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={movie.title}>{movie.title}</h3>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button 
                  onClick={() => toggleFavorite(movie)} 
                  style={{ 
                    flex: 1, padding: '8px', 
                    backgroundColor: isFavorite(movie.id) ? 'rgba(239, 68, 68, 0.1)' : '#38bdf8', 
                    color: isFavorite(movie.id) ? '#f87171' : '#020617', 
                    border: isFavorite(movie.id) ? '1px solid rgba(239, 68, 68, 0.3)' : 'none', 
                    borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' 
                  }}
                >
                  {isFavorite(movie.id) ? 'Desfavoritar' : 'Favoritar'}
                </button>
                <button onClick={() => openMovie(movie)} style={{ flex: 1, padding: '8px', backgroundColor: 'rgba(255,255,255,0.1)', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}>
                  Detalhes
                </button>
              </div>
            </div>
          </div>
        ))}
        {filteredMovies.length === 0 && (
          <p style={{ color: '#94a3b8', gridColumn: '1 / -1', textAlign: 'center', padding: '3rem' }}>Nenhum filme encontrado.</p>
        )}
      </div>

      {selectedMovie && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '2rem', zIndex: 50 }}>
          <div style={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', padding: '2rem', borderRadius: '16px', width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 600 }}>{selectedMovie.title}</h2>
              <button onClick={() => setSelectedMovie(null)} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', width: '32px', height: '32px', borderRadius: '50%', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>&times;</button>
            </div>
            <p style={{ marginTop: '1rem', color: '#94a3b8', lineHeight: 1.6 }}>{selectedMovie.overview}</p>
            
            <hr style={{ margin: '2rem 0', borderColor: 'rgba(255,255,255,0.1)' }} />
            
            <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Comentários ({comments.length})</h3>
            <div style={{ display: 'flex', gap: '10px' }}>
              <input 
                type="text" 
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
                placeholder="O que você achou do filme?"
                style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)', color: 'white', outline: 'none' }}
              />
              <button onClick={addComment} style={{ padding: '0 24px', backgroundColor: '#38bdf8', color: '#020617', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>Enviar</button>
            </div>

            <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {comments.map(c => (
                <div key={c.id} style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <p style={{ margin: '0 0 8px 0', color: '#e2e8f0', lineHeight: 1.5 }}>{c.texto}</p>
                  <small style={{ color: '#64748b' }}>{new Date(c.criado_em).toLocaleString('pt-BR')}</small>
                </div>
              ))}
              {comments.length === 0 && <p style={{ color: '#64748b', textAlign: 'center', fontStyle: 'italic', padding: '2rem 0' }}>Seja o primeiro a comentar!</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
