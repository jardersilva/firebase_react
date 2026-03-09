import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Button,
  TextField,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { useAuth } from '../contexts/AuthContext';
import useConnections from '../hooks/useConnections';
import { createConnection, updateConnection, deleteConnection } from '../services/connectionService';

const muiInput = {
  '& .MuiOutlinedInput-root': {
    fontFamily: '"DM Sans", sans-serif',
    borderRadius: '6px',
    '&.Mui-focused fieldset': { borderColor: '#0f766e' },
  },
  '& .MuiInputLabel-root.Mui-focused': { color: '#0f766e' },
};

const ConnectionsPage = ({ showToast }) => {
  const { user } = useAuth();
  const { connections, loading } = useConnections(user?.uid);
  const navigate = useNavigate();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, id: null, name: '' });

  const openCreate = () => {
    setEditingId(null);
    setName('');
    setDialogOpen(true);
  };

  const openEdit = (conn) => {
    setEditingId(conn.id);
    setName(conn.name);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!name.trim()) return;
    setSaving(true);
    try {
      if (editingId) {
        await updateConnection(editingId, { name: name.trim() });
        showToast?.('Conexão atualizada.');
      } else {
        await createConnection(user.uid, name.trim());
        showToast?.('Conexão criada.');
      }
      setDialogOpen(false);
      setName('');
      setEditingId(null);
    } catch {
      showToast?.('Erro ao salvar conexão.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteConnection(deleteDialog.id);
      showToast?.('Conexão excluída.');
    } catch {
      showToast?.('Erro ao excluir conexão.', 'error');
    } finally {
      setDeleteDialog({ open: false, id: null, name: '' });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <CircularProgress sx={{ color: '#0f766e' }} size={28} />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-end justify-between mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl text-zinc-900">Conexões</h1>
          <p className="text-sm text-zinc-500 mt-1 font-sans">
            {connections.length} {connections.length === 1 ? 'conexão' : 'conexões'}
          </p>
        </div>
        <Button
          onClick={openCreate}
          startIcon={<AddIcon />}
          variant="contained"
          sx={{
            backgroundColor: '#0f766e',
            textTransform: 'none',
            fontFamily: '"DM Sans", sans-serif',
            fontWeight: 600,
            fontSize: '0.813rem',
            borderRadius: '6px',
            boxShadow: 'none',
            px: 2.5,
            '&:hover': { backgroundColor: '#115e59', boxShadow: 'none' },
          }}
        >
          Nova conexão
        </Button>
      </div>

      {connections.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-zinc-400 text-sm font-sans">Nenhuma conexão ainda.</p>
          <p className="text-zinc-400 text-xs font-sans mt-1">Crie a primeira para começar.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {connections.map((conn) => (
            <div
              key={conn.id}
              className="group flex items-center justify-between bg-white border border-zinc-100 rounded-lg px-4 py-3.5 hover:border-zinc-200 transition-colors cursor-pointer"
              onClick={() => navigate(`/connections/${conn.id}/contacts`)}
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-zinc-800 font-sans truncate">{conn.name}</p>
              </div>
              <div className="flex items-center gap-1 ml-3">
                <IconButton
                  size="small"
                  onClick={(e) => { e.stopPropagation(); openEdit(conn); }}
                  sx={{ opacity: 0, '.group:hover &': { opacity: 1 }, transition: 'opacity 0.15s', color: '#71717a' }}
                >
                  <EditIcon sx={{ fontSize: 16 }} />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={(e) => { e.stopPropagation(); setDeleteDialog({ open: true, id: conn.id, name: conn.name }); }}
                  sx={{ opacity: 0, '.group:hover &': { opacity: 1 }, transition: 'opacity 0.15s', color: '#71717a' }}
                >
                  <DeleteIcon sx={{ fontSize: 16 }} />
                </IconButton>
                <ChevronRightIcon sx={{ fontSize: 18, color: '#d4d4d8', ml: 0.5 }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: '8px' } }}
      >
        <DialogTitle sx={{ fontFamily: '"DM Serif Display", serif', fontSize: '1.25rem', pb: 1 }}>
          {editingId ? 'Editar conexão' : 'Nova conexão'}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            label="Nome da conexão"
            value={name}
            onChange={(e) => setName(e.target.value)}
            variant="outlined"
            size="small"
            sx={{ mt: 1, ...muiInput }}
            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDialogOpen(false)} sx={{ textTransform: 'none', color: '#71717a', fontFamily: '"DM Sans"' }}>
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving || !name.trim()}
            variant="contained"
            sx={{
              backgroundColor: '#0f766e',
              textTransform: 'none',
              fontFamily: '"DM Sans"',
              fontWeight: 600,
              borderRadius: '6px',
              boxShadow: 'none',
              '&:hover': { backgroundColor: '#115e59', boxShadow: 'none' },
            }}
          >
            {saving ? 'Salvando...' : 'Salvar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, id: null, name: '' })}
        maxWidth="xs"
        PaperProps={{ sx: { borderRadius: '8px' } }}
      >
        <DialogTitle sx={{ fontFamily: '"DM Serif Display", serif', fontSize: '1.125rem' }}>
          Excluir conexão
        </DialogTitle>
        <DialogContent>
          <p className="text-sm text-zinc-600 font-sans">
            Tem certeza que deseja excluir <strong>{deleteDialog.name}</strong>? Esta ação não pode ser desfeita.
          </p>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDeleteDialog({ open: false, id: null, name: '' })} sx={{ textTransform: 'none', color: '#71717a', fontFamily: '"DM Sans"' }}>
            Cancelar
          </Button>
          <Button
            onClick={handleDelete}
            variant="contained"
            sx={{
              backgroundColor: '#dc2626',
              textTransform: 'none',
              fontFamily: '"DM Sans"',
              fontWeight: 600,
              borderRadius: '6px',
              boxShadow: 'none',
              '&:hover': { backgroundColor: '#b91c1c', boxShadow: 'none' },
            }}
          >
            Excluir
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default ConnectionsPage;
