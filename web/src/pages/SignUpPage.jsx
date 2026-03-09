import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { TextField, Button, Alert } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

const SignUpPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }

    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    setLoading(true);

    try {
      await signUp(email, password);
      navigate('/connections');
    } catch (err) {
      const messages = {
        'auth/email-already-in-use': 'Este e-mail já está cadastrado.',
        'auth/invalid-email': 'E-mail inválido.',
        'auth/weak-password': 'Senha muito fraca.',
      };
      setError(messages[err.code] || 'Erro ao criar conta. Tente novamente.');
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
            Cadastre-se
          </h1>
          <p className="text-brand-200 text-base leading-relaxed max-w-md">
            Cadastre-se para começar.
          </p>
        </div>
      </div>

      {/* Right side - form */}
      <div className="flex-1 flex items-center justify-center px-6">
        <div className="w-full max-w-sm">
          <div className="mb-10">
            <h1 className="text-3xl text-zinc-900 mb-1">Criar conta</h1>
            <p className="text-zinc-500 text-sm font-sans">Preencha os dados para começar</p>
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
            <TextField
              fullWidth
              label="Confirmar senha"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
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
              {loading ? 'Criando...' : 'Criar conta'}
            </Button>
          </form>

          <p className="text-center text-sm text-zinc-500 mt-6 font-sans">
            Já tem conta?{' '}
            <Link to="/login" className="text-brand-700 font-medium hover:underline">
              Fazer login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
