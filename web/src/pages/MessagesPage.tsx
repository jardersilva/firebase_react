import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Button,
  TextField,
  Checkbox,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Breadcrumbs,
  Link as MuiLink,
  Chip,
  ToggleButton,
  ToggleButtonGroup,
  FormControlLabel,
  InputAdornment,
  Stepper,
  Step,
  StepLabel,
  AlertColor,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SendIcon from '@mui/icons-material/Send';
import ScheduleIcon from '@mui/icons-material/Schedule';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import { useAuth } from '../contexts/AuthContext';
import useMessages from '../hooks/useMessages';
import useContacts from '../hooks/useContacts';
import useConnections from '../hooks/useConnections';
import { createMessage, updateMessage, deleteMessage } from '../services/messageService';
import dayjs from 'dayjs';
import { Contact, Message } from '../types';

const muiInput = {
  '& .MuiOutlinedInput-root': {
    fontFamily: '"DM Sans", sans-serif',
    borderRadius: '6px',
    '&.Mui-focused fieldset': { borderColor: '#0f766e' },
  },
  '& .MuiInputLabel-root.Mui-focused': { color: '#0f766e' },
};

const STEPS = ['Selecionar contatos', 'Compor mensagem'];

interface MessagesPageProps {
  showToast?: (message: string, severity?: AlertColor) => void;
}

const MessagesPage = ({ showToast }: MessagesPageProps) => {
  const { connectionId } = useParams<{ connectionId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [statusFilter, setStatusFilter] = useState<'all' | 'sent' | 'scheduled' | null>(null);
  const { messages, loading } = useMessages(user?.uid, connectionId, statusFilter as any);
  const { contacts } = useContacts(user?.uid, connectionId);
  const { connections } = useConnections(user?.uid);

  const connection = connections.find((c) => c.id === connectionId);

  // Form state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [content, setContent] = useState('');
  const [selectedContactIds, setSelectedContactIds] = useState<string[]>([]);
  const [isScheduled, setIsScheduled] = useState(false);
  const [scheduledAt, setScheduledAt] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; id: string | null }>({ open: false, id: null });
  const [contactSearch, setContactSearch] = useState('');

  const contactMap = useMemo(() => {
    const map: Record<string, Contact> = {};
    contacts.forEach((c) => { map[c.id] = c as Contact; });
    return map;
  }, [contacts]);

  const filteredContacts = useMemo(() => {
    if (!contactSearch.trim()) return contacts;
    const term = contactSearch.toLowerCase().trim();
    return contacts.filter(
      (c) =>
        c.name.toLowerCase().includes(term) ||
        c.phone.toLowerCase().includes(term)
    );
  }, [contacts, contactSearch]);

  const toggleContact = (contactId: string) => {
    setSelectedContactIds((prev) =>
      prev.includes(contactId)
        ? prev.filter((id) => id !== contactId)
        : [...prev, contactId]
    );
  };

  const selectAllFiltered = () => {
    const filteredIds = filteredContacts.map((c) => c.id);
    setSelectedContactIds((prev) => {
      const newSet = new Set(prev);
      filteredIds.forEach((id) => newSet.add(id));
      return Array.from(newSet);
    });
  };

  const deselectAllFiltered = () => {
    const filteredIds = new Set(filteredContacts.map((c) => c.id));
    setSelectedContactIds((prev) => prev.filter((id) => !filteredIds.has(id)));
  };

  const openCreate = () => {
    setEditingId(null);
    setContent('');
    setSelectedContactIds([]);
    setIsScheduled(false);
    setScheduledAt('');
    setContactSearch('');
    setActiveStep(0);
    setDialogOpen(true);
  };

  const openEdit = (msg: Message) => {
    setEditingId(msg.id);
    setContent(msg.content);
    setSelectedContactIds(msg.contactIds || []);
    setIsScheduled(msg.status === 'scheduled');
    setScheduledAt(
      msg.scheduledAt
        ? dayjs((msg.scheduledAt as any).toDate()).format('YYYY-MM-DDTHH:mm')
        : ''
    );
    setContactSearch('');
    setActiveStep(0);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!content.trim() || selectedContactIds.length === 0) return;
    setSaving(true);
    try {
      const scheduleDate = isScheduled && scheduledAt ? new Date(scheduledAt) : null;
      if (editingId) {
        await updateMessage(editingId, {
          content: content.trim(),
          contactIds: selectedContactIds,
          scheduledAt: scheduleDate as any,
        });
        showToast?.('Mensagem atualizada.');
      } else if (user?.uid && connectionId) {
        await createMessage(
          user.uid,
          connectionId,
          selectedContactIds,
          content.trim(),
          scheduleDate as any
        );
        showToast?.(isScheduled ? 'Mensagem agendada.' : 'Mensagem enviada.');
      }
      setDialogOpen(false);
    } catch {
      showToast?.('Erro ao salvar mensagem.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      if (deleteDialog.id) {
        await deleteMessage(deleteDialog.id);
        showToast?.('Mensagem excluída.');
      }
    } catch {
      showToast?.('Erro ao excluir.', 'error');
    } finally {
      setDeleteDialog({ open: false, id: null });
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return '—';
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return dayjs(date).format('DD/MM/YYYY [às] HH:mm');
    } catch {
      return '—';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <CircularProgress sx={{ color: '#0f766e' }} size={28} />
      </div>
    );
  }

  // --- Step content renderers ---

  const renderStepContacts = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {/* Selected chips */}
      {selectedContactIds.length > 0 && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
            <p className="text-xs text-zinc-500 font-sans font-medium">
              {selectedContactIds.length} {selectedContactIds.length === 1 ? 'selecionado' : 'selecionados'}
            </p>
            <button
              type="button"
              onClick={() => setSelectedContactIds([])}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#a1a1aa', fontSize: '0.75rem', fontFamily: '"DM Sans", sans-serif' }}
            >
              Limpar
            </button>
          </div>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '4px',
              maxHeight: '72px',
              overflowY: 'auto',
              padding: '6px',
              border: '1px solid #f4f4f5',
              borderRadius: '6px',
              backgroundColor: '#fafafa',
            }}
          >
            {selectedContactIds.map((cId) => (
              <Chip
                key={cId}
                label={contactMap[cId]?.name || 'Removido'}
                size="small"
                onDelete={() => toggleContact(cId)}
                deleteIcon={<CloseIcon sx={{ fontSize: '14px !important' }} />}
                sx={{
                  fontFamily: '"DM Sans"',
                  fontSize: '0.75rem',
                  height: 24,
                  backgroundColor: '#f0fdfa',
                  color: '#0f766e',
                  border: '1px solid #ccfbf1',
                  '& .MuiChip-deleteIcon': { color: '#0d9488', '&:hover': { color: '#0f766e' } },
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Search + actions */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
          <p className="text-xs text-zinc-500 font-sans font-medium" style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Contatos
          </p>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              type="button"
              onClick={selectAllFiltered}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#0f766e', fontSize: '0.75rem', fontFamily: '"DM Sans", sans-serif', fontWeight: 500 }}
            >
              Selecionar {contactSearch.trim() ? 'filtrados' : 'todos'}
            </button>
            <button
              type="button"
              onClick={deselectAllFiltered}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#a1a1aa', fontSize: '0.75rem', fontFamily: '"DM Sans", sans-serif' }}
            >
              Desmarcar
            </button>
          </div>
        </div>

        <TextField
          fullWidth
          placeholder="Buscar por nome ou telefone..."
          value={contactSearch}
          onChange={(e) => setContactSearch(e.target.value)}
          variant="outlined"
          size="small"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ fontSize: 18, color: '#a1a1aa' }} />
              </InputAdornment>
            ),
            endAdornment: contactSearch && (
              <InputAdornment position="end">
                <IconButton size="small" onClick={() => setContactSearch('')}>
                  <CloseIcon sx={{ fontSize: 16, color: '#a1a1aa' }} />
                </IconButton>
              </InputAdornment>
            ),
          }}
          sx={{ mb: 1, ...muiInput }}
        />

        <div
          style={{
            maxHeight: '260px',
            overflowY: 'auto',
            border: '1px solid #f4f4f5',
            borderRadius: '6px',
          }}
        >
          {filteredContacts.length === 0 ? (
            <div style={{ padding: '16px', textAlign: 'center' }}>
              <p className="text-xs text-zinc-400 font-sans">
                {contactSearch.trim() ? 'Nenhum contato encontrado.' : 'Nenhum contato.'}
              </p>
            </div>
          ) : (
            filteredContacts.map((contact, idx) => (
              <label
                key={contact.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '8px 12px',
                  cursor: 'pointer',
                  borderBottom: idx < filteredContacts.length - 1 ? '1px solid #fafafa' : 'none',
                  backgroundColor: selectedContactIds.includes(contact.id) ? '#f0fdfa' : 'transparent',
                  transition: 'background-color 0.1s',
                }}
                onMouseEnter={(e) => { if (!selectedContactIds.includes(contact.id)) e.currentTarget.style.backgroundColor = '#fafafa'; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = selectedContactIds.includes(contact.id) ? '#f0fdfa' : 'transparent'; }}
              >
                <Checkbox
                  checked={selectedContactIds.includes(contact.id)}
                  onChange={() => toggleContact(contact.id)}
                  size="small"
                  sx={{ p: 0, mr: 1.5, color: '#d4d4d8', '&.Mui-checked': { color: '#0f766e' } }}
                />
                <span className="text-sm text-zinc-700 font-sans" style={{ flex: 1 }}>{contact.name}</span>
                <span className="text-xs text-zinc-400 font-sans">{contact.phone}</span>
              </label>
            ))
          )}
        </div>
        {contactSearch.trim() && filteredContacts.length > 0 && (
          <p className="text-xs text-zinc-400 font-sans" style={{ marginTop: '4px' }}>
            {filteredContacts.length} de {contacts.length} contatos
          </p>
        )}
      </div>
    </div>
  );

  const renderStepMessage = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Summary of selected contacts */}
      <div>
        <p className="text-xs text-zinc-500 font-sans font-medium" style={{ marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Destinatários ({selectedContactIds.length})
        </p>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '4px',
            maxHeight: '56px',
            overflowY: 'auto',
          }}
        >
          {selectedContactIds.map((cId) => (
            <Chip
              key={cId}
              label={contactMap[cId]?.name || 'Removido'}
              size="small"
              sx={{
                fontFamily: '"DM Sans"',
                fontSize: '0.7rem',
                height: 22,
                backgroundColor: '#f0fdfa',
                color: '#0f766e',
                border: '1px solid #ccfbf1',
              }}
            />
          ))}
        </div>
      </div>

      {/* Message content */}
      <TextField
        autoFocus
        fullWidth
        label="Mensagem"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        variant="outlined"
        multiline
        rows={4}
        sx={muiInput}
      />

      {/* Schedule toggle */}
      <div>
        <FormControlLabel
          control={
            <Checkbox
              checked={isScheduled}
              onChange={(e) => setIsScheduled(e.target.checked)}
              size="small"
              sx={{ color: '#d4d4d8', '&.Mui-checked': { color: '#0f766e' } }}
            />
          }
          label={
            <span className="text-sm text-zinc-600 font-sans">Agendar envio</span>
          }
        />
        {isScheduled && (
          <TextField
            fullWidth
            type="datetime-local"
            value={scheduledAt}
            onChange={(e) => setScheduledAt(e.target.value)}
            variant="outlined"
            size="small"
            sx={{ mt: 1, ...muiInput }}
            InputLabelProps={{ shrink: true }}
          />
        )}
      </div>
    </div>
  );

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
          <MuiLink
            underline="hover"
            color="#0f766e"
            onClick={() => navigate(`/connections/${connectionId}/contacts`)}
            sx={{ cursor: 'pointer', fontFamily: '"DM Sans"' }}
          >
            {connection?.name || '...'}
          </MuiLink>
          <span className="text-zinc-500 text-xs font-sans">Mensagens</span>
        </Breadcrumbs>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 gap-4">
        <div className="flex items-center gap-3">
          <IconButton
            onClick={() => navigate(`/connections/${connectionId}/contacts`)}
            size="small"
            sx={{ color: '#71717a' }}
          >
            <ArrowBackIcon sx={{ fontSize: 20 }} />
          </IconButton>
          <div>
            <h1 className="text-2xl sm:text-3xl text-zinc-900">Mensagens</h1>
            <p className="text-sm text-zinc-500 mt-0.5 font-sans">{connection?.name || '...'}</p>
          </div>
        </div>
        <Button
          onClick={openCreate}
          startIcon={<SendIcon />}
          variant="contained"
          disabled={contacts.length === 0}
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
          Nova mensagem
        </Button>
      </div>

      {/* Filters */}
      <div className="mb-6">
        <ToggleButtonGroup
          value={statusFilter || 'all'}
          exclusive
          onChange={(_, val) => setStatusFilter(val === 'all' ? null : val)}
          size="small"
          sx={{
            '& .MuiToggleButton-root': {
              textTransform: 'none',
              fontFamily: '"DM Sans"',
              fontSize: '0.8rem',
              fontWeight: 500,
              border: '1px solid #e4e4e7',
              color: '#71717a',
              px: 2,
              '&.Mui-selected': {
                backgroundColor: '#f0fdfa',
                color: '#0f766e',
                borderColor: '#0f766e',
                '&:hover': { backgroundColor: '#ccfbf1' },
              },
            },
          }}
        >
          <ToggleButton value="all">Todas</ToggleButton>
          <ToggleButton value="sent">Enviadas</ToggleButton>
          <ToggleButton value="scheduled">Agendadas</ToggleButton>
        </ToggleButtonGroup>
      </div>

      {contacts.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-zinc-400 text-sm font-sans">Nenhum contato nesta conexão.</p>
          <p className="text-zinc-400 text-xs font-sans mt-1">
            Adicione contatos antes de enviar mensagens.
          </p>
        </div>
      ) : messages.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-zinc-400 text-sm font-sans">
            {statusFilter ? `Nenhuma mensagem ${statusFilter === 'sent' ? 'enviada' : 'agendada'}.` : 'Nenhuma mensagem ainda.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className="group bg-white border border-zinc-100 rounded-lg px-4 py-4 hover:border-zinc-200 transition-colors"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <Chip
                      label={msg.status === 'sent' ? 'Enviada' : 'Agendada'}
                      size="small"
                      icon={msg.status === 'scheduled' ? <ScheduleIcon sx={{ fontSize: '14px !important' }} /> : undefined}
                      sx={{
                        fontFamily: '"DM Sans"',
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        height: 22,
                        backgroundColor: msg.status === 'sent' ? '#f0fdfa' : '#fffbeb',
                        color: msg.status === 'sent' ? '#0f766e' : '#b45309',
                        border: `1px solid ${msg.status === 'sent' ? '#ccfbf1' : '#fef3c7'}`,
                        '& .MuiChip-icon': { color: 'inherit' },
                      }}
                    />
                    <span className="text-xs text-zinc-400 font-sans">
                      {msg.status === 'scheduled'
                        ? `Agendada para ${formatDate(msg.scheduledAt)}`
                        : formatDate(msg.sentAt || msg.createdAt)}
                    </span>
                  </div>
                  <p className="text-sm text-zinc-700 font-sans leading-relaxed mb-2">{msg.content}</p>
                  <div className="flex flex-wrap gap-1">
                    {(msg.contactIds || []).map((cId) => (
                      <span
                        key={cId}
                        className="text-xs bg-zinc-50 text-zinc-500 px-2 py-0.5 rounded font-sans"
                      >
                        {contactMap[cId]?.name || 'Contato removido'}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <IconButton
                    size="small"
                    onClick={() => openEdit(msg)}
                    sx={{ opacity: 0, '.group:hover &': { opacity: 1 }, transition: 'opacity 0.15s', color: '#71717a' }}
                  >
                    <EditIcon sx={{ fontSize: 16 }} />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => setDeleteDialog({ open: true, id: msg.id })}
                    sx={{ opacity: 0, '.group:hover &': { opacity: 1 }, transition: 'opacity 0.15s', color: '#71717a' }}
                  >
                    <DeleteIcon sx={{ fontSize: 16 }} />
                  </IconButton>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Dialog — Two Steps */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: '8px', maxHeight: '90vh' } }}
      >
        <DialogTitle sx={{ fontFamily: '"DM Serif Display", serif', fontSize: '1.25rem', pb: 0 }}>
          {editingId ? 'Editar mensagem' : 'Nova mensagem'}
        </DialogTitle>

        {/* Stepper */}
        <div style={{ padding: '8px 24px 0' }}>
          <Stepper
            activeStep={activeStep}
            sx={{
              '& .MuiStepLabel-label': { fontFamily: '"DM Sans"', fontSize: '0.8rem' },
              '& .MuiStepIcon-root.Mui-active': { color: '#0f766e' },
              '& .MuiStepIcon-root.Mui-completed': { color: '#0f766e' },
            }}
          >
            {STEPS.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </div>

        <DialogContent sx={{ pt: '16px !important' }}>
          {activeStep === 0 ? renderStepContacts() : renderStepMessage()}
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2, justifyContent: 'space-between' }}>
          <div>
            {activeStep > 0 && (
              <Button
                onClick={() => setActiveStep(0)}
                sx={{ textTransform: 'none', color: '#71717a', fontFamily: '"DM Sans"' }}
              >
                Voltar
              </Button>
            )}
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <Button
              onClick={() => setDialogOpen(false)}
              sx={{ textTransform: 'none', color: '#71717a', fontFamily: '"DM Sans"' }}
            >
              Cancelar
            </Button>

            {activeStep === 0 ? (
              <Button
                onClick={() => setActiveStep(1)}
                disabled={selectedContactIds.length === 0}
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
                Avançar
              </Button>
            ) : (
              <Button
                onClick={handleSave}
                disabled={saving || !content.trim() || (isScheduled && !scheduledAt)}
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
                {saving ? 'Salvando...' : isScheduled ? 'Agendar' : 'Enviar'}
              </Button>
            )}
          </div>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, id: null })}
        maxWidth="xs"
        PaperProps={{ sx: { borderRadius: '8px' } }}
      >
        <DialogTitle sx={{ fontFamily: '"DM Serif Display", serif', fontSize: '1.125rem' }}>
          Excluir mensagem
        </DialogTitle>
        <DialogContent>
          <p className="text-sm text-zinc-600 font-sans">
            Tem certeza que deseja excluir esta mensagem? Esta ação não pode ser desfeita.
          </p>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDeleteDialog({ open: false, id: null })} sx={{ textTransform: 'none', color: '#71717a', fontFamily: '"DM Sans"' }}>
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

export default MessagesPage;
