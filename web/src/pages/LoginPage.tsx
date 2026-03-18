import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { TextField, Button, Alert } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signIn(email, password);
      navigate('/connections');
    } catch (err: any) {
      const messages: Record<string, string> = {
        'auth/user-not-found': 'Usuário não encontrado.',
        'auth/wrong-password': 'Senha incorreta.',
        'auth/invalid-email': 'E-mail inválido.',
        'auth/invalid-credential': 'Credenciais inválidas.',
      };
      setError(messages[err.code] || 'Erro ao fazer login. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#f8f8f7]">
      {/* Left side - branding */}
      <div className="hidden lg:flex lg:w-[45%] bg-brand-800 items-end p-12">
        <div>
          <h1 className="text-4xl text-white leading-tight mb-3">
            Login
          </h1>
          <p className="text-brand-200 text-base leading-relaxed max-w-md">
            Faça login para continuar.
          </p>
        </div>
      </div>

      {/* Right side - form */}
      <div className="flex-1 flex items-center justify-center px-6">
        <div className="w-full max-w-sm">
          <div className="mb-10">
            <h1 className="text-3xl text-zinc-900 mb-1">Entrar</h1>
            <p className="text-zinc-500 text-sm font-sans">Acesse sua conta para continuar</p>
          </div>

          {error && (
            <Alert severity="error" sx={{ mb: 3, fontFamily: '"DM Sans", sans-serif' }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <TextField
              fullWidth
              label="E-mail"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              variant="outlined"
              size="small"
              sx={{
                '& .MuiOutlinedInput-root': {
                  fontFamily: '"DM Sans", sans-serif',
                  borderRadius: '6px',
                  '&.Mui-focused fieldset': { borderColor: '#0f766e' },
                },
                '& .MuiInputLabel-root.Mui-focused': { color: '#0f766e' },
              }}
            />
            <TextField
              fullWidth
              label="Senha"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              variant="outlined"
              size="small"
              sx={{
                '& .MuiOutlinedInput-root': {
                  fontFamily: '"DM Sans", sans-serif',
                  borderRadius: '6px',
                  '&.Mui-focused fieldset': { borderColor: '#0f766e' },
                },
                '& .MuiInputLabel-root.Mui-focused': { color: '#0f766e' },
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              sx={{
                backgroundColor: '#0f766e',
                textTransform: 'none',
                fontFamily: '"DM Sans", sans-serif',
                fontWeight: 600,
                fontSize: '0.875rem',
                borderRadius: '6px',
                py: 1.2,
                boxShadow: 'none',
                '&:hover': { backgroundColor: '#115e59', boxShadow: 'none' },
              }}
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>

          <p className="text-center text-sm text-zinc-500 mt-6 font-sans">
            Não tem conta?{' '}
            <Link to="/signup" className="text-brand-700 font-medium hover:underline">
              Criar conta
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
