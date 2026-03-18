import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Button,
  TextField,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Breadcrumbs,
  Link as MuiLink,
  AlertColor,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import MessageIcon from '@mui/icons-material/Message';
import { useAuth } from '../contexts/AuthContext';
import useContacts from '../hooks/useContacts';
import useConnections from '../hooks/useConnections';
import { createContact, updateContact, deleteContact } from '../services/contactService';
import { Contact } from '../types';

const muiInput = {
  '& .MuiOutlinedInput-root': {
    fontFamily: '"DM Sans", sans-serif',
    borderRadius: '6px',
    '&.Mui-focused fieldset': { borderColor: '#0f766e' },
  },
  '& .MuiInputLabel-root.Mui-focused': { color: '#0f766e' },
};

interface ContactsPageProps {
  showToast?: (message: string, severity?: AlertColor) => void;
}

const ContactsPage = ({ showToast }: ContactsPageProps) => {
  const { connectionId } = useParams<{ connectionId: string }>();
  const { user } = useAuth();
  const { contacts, loading } = useContacts(user?.uid, connectionId);
  const { connections } = useConnections(user?.uid);
  const navigate = useNavigate();

  const connection = connections.find((c) => c.id === connectionId);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; id: string | null; name: string }>({ open: false, id: null, name: '' });

  const openCreate = () => {
    setEditingId(null);
    setName('');
    setPhone('');
    setDialogOpen(true);
  };

  const openEdit = (contact: Contact) => {
    setEditingId(contact.id);
    setName(contact.name);
    setPhone(contact.phone);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!name.trim() || !phone.trim()) return;
    setSaving(true);
    try {
      if (editingId) {
        await updateContact(editingId, { name: name.trim(), phone: phone.trim() });
        showToast?.('Contato atualizado.');
      } else if (user?.uid && connectionId) {
        await createContact(user.uid, connectionId, name.trim(), phone.trim());
        showToast?.('Contato criado.');
      }
      setDialogOpen(false);
      setName('');
      setPhone('');
      setEditingId(null);
    } catch {
      showToast?.('Erro ao salvar contato.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      if (deleteDialog.id) {
        await deleteContact(deleteDialog.id);
        showToast?.('Contato excluído.');
      }
    } catch {
      showToast?.('Erro ao excluir contato.', 'error');
    } finally {
      setDeleteDialog({ open: false, id: null, name: '' });
    }
  };

  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, '');
    if (digits.length <= 2) return digits;
    if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    if (digits.length <= 11) return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
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
      {/* Breadcrumb */}
      <div className="mb-6">
        <Breadcrumbs sx={{ fontSize: '0.8rem', fontFamily: '"DM Sans"' }}>
          <MuiLink
            underline="hover"
            color="#0f766e"
            onClick={() => navigate('/connections')}
            sx={{ cursor: 'pointer', fontFamily: '"DM Sans"' }}
          >
            Conexões
          </MuiLink>
          <span className="text-zinc-500 text-xs font-sans">{connection?.name || '...'}</span>
        </Breadcrumbs>
      </div>

      <div className="flex items-end justify-between mb-8">
        <div className="flex items-center gap-3">
          <IconButton onClick={() => navigate('/connections')} size="small" sx={{ color: '#71717a' }}>
            <ArrowBackIcon sx={{ fontSize: 20 }} />
          </IconButton>
          <div>
            <h1 className="text-2xl sm:text-3xl text-zinc-900">Contatos</h1>
            <p className="text-sm text-zinc-500 mt-0.5 font-sans">
              {contacts.length} {contacts.length === 1 ? 'contato' : 'contatos'} em {connection?.name || '...'}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => navigate(`/connections/${connectionId}/messages`)}
            startIcon={<MessageIcon />}
            variant="outlined"
            sx={{
              borderColor: '#e4e4e7',
              color: '#3f3f46',
              textTransform: 'none',
              fontFamily: '"DM Sans"',
              fontWeight: 500,
              fontSize: '0.813rem',
              borderRadius: '6px',
              '&:hover': { borderColor: '#0f766e', color: '#0f766e', backgroundColor: '#f0fdfa' },
            }}
          >
            Mensagens
          </Button>
          <Button
            onClick={openCreate}
            startIcon={<AddIcon />}
            variant="contained"
            sx={{
              backgroundColor: '#0f766e',
              textTransform: 'none',
              fontFamily: '"DM Sans"',
              fontWeight: 600,
              fontSize: '0.813rem',
              borderRadius: '6px',
              boxShadow: 'none',
              px: 2.5,
              '&:hover': { backgroundColor: '#115e59', boxShadow: 'none' },
            }}
          >
            Novo contato
          </Button>
        </div>
      </div>

      {contacts.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-zinc-400 text-sm font-sans">Nenhum contato nesta conexão.</p>
          <p className="text-zinc-400 text-xs font-sans mt-1">Adicione contatos para enviar mensagens.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {contacts.map((contact) => (
            <div
              key={contact.id}
              className="group flex items-center justify-between bg-white border border-zinc-100 rounded-lg px-4 py-3.5 hover:border-zinc-200 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-zinc-800 font-sans">{contact.name}</p>
                <p className="text-xs text-zinc-400 font-sans mt-0.5">{contact.phone}</p>
              </div>
              <div className="flex items-center gap-1 ml-3">
                <IconButton
                  size="small"
                  onClick={() => openEdit(contact)}
                  sx={{ opacity: 0, '.group:hover &': { opacity: 1 }, transition: 'opacity 0.15s', color: '#71717a' }}
                >
                  <EditIcon sx={{ fontSize: 16 }} />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={() => setDeleteDialog({ open: true, id: contact.id, name: contact.name })}
                  sx={{ opacity: 0, '.group:hover &': { opacity: 1 }, transition: 'opacity 0.15s', color: '#71717a' }}
                >
                  <DeleteIcon sx={{ fontSize: 16 }} />
                </IconButton>
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
          {editingId ? 'Editar contato' : 'Novo contato'}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            label="Nome"
            value={name}
            onChange={(e) => setName(e.target.value)}
            variant="outlined"
            size="small"
            sx={{ mt: 1, mb: 2, ...muiInput }}
          />
          <TextField
            fullWidth
            label="Telefone"
            value={phone}
            onChange={(e) => setPhone(formatPhone(e.target.value))}
            variant="outlined"
            size="small"
            placeholder="(00) 00000-0000"
            sx={muiInput}
            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDialogOpen(false)} sx={{ textTransform: 'none', color: '#71717a', fontFamily: '"DM Sans"' }}>
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving || !name.trim() || !phone.trim()}
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
          Excluir contato
        </DialogTitle>
        <DialogContent>
          <p className="text-sm text-zinc-600 font-sans">
            Tem certeza que deseja excluir <strong>{deleteDialog.name}</strong>?
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

export default ContactsPage;
