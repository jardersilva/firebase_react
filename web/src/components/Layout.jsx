import { useState } from 'react';
import { useNavigate, useLocation, Link as RouterLink } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  IconButton,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  useMediaQuery,
  Snackbar,
  Alert,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import CableIcon from '@mui/icons-material/Cable';
import LogoutIcon from '@mui/icons-material/Logout';
import { useAuth } from '../contexts/AuthContext';

const DRAWER_WIDTH = 240;

const Layout = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });
  const { signOut, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useMediaQuery('(max-width:768px)');

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const showToast = (message, severity = 'success') => {
    setToast({ open: true, message, severity });
  };

  const drawerContent = (
    <div className="flex flex-col h-full bg-white">
      <div className="px-5 py-6">
        <h2 className="text-xl text-brand-800 tracking-tight">Dashboard</h2>
        <p className="text-xs text-zinc-400 mt-1 font-sans truncate">{user?.email}</p>
      </div>
      <Divider />
      <List className="flex-1 px-2 pt-2">
        <ListItemButton
          component={RouterLink}
          to="/connections"
          selected={location.pathname.startsWith('/connections')}
          sx={{
            borderRadius: '6px',
            mb: 0.5,
            '&.Mui-selected': {
              backgroundColor: '#f0fdfa',
              color: '#0f766e',
              '&:hover': { backgroundColor: '#ccfbf1' },
            },
          }}
        >
          <ListItemIcon sx={{ minWidth: 36 }}>
            <CableIcon sx={{ fontSize: 20, color: location.pathname.startsWith('/connections') ? '#0f766e' : '#71717a' }} />
          </ListItemIcon>
          <ListItemText
            primary="Conexões"
            primaryTypographyProps={{ fontSize: 14, fontWeight: 500, fontFamily: '"DM Sans", sans-serif' }}
          />
        </ListItemButton>
      </List>
      <Divider />
      <div className="p-2">
        <ListItemButton
          onClick={handleSignOut}
          sx={{ borderRadius: '6px' }}
        >
          <ListItemIcon sx={{ minWidth: 36 }}>
            <LogoutIcon sx={{ fontSize: 20, color: '#71717a' }} />
          </ListItemIcon>
          <ListItemText
            primary="Sair"
            primaryTypographyProps={{ fontSize: 14, fontWeight: 500, fontFamily: '"DM Sans", sans-serif', color: '#71717a' }}
          />
        </ListItemButton>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar - Desktop */}
      {!isMobile && (
        <div className="w-[240px] flex-shrink-0 border-r border-zinc-200 bg-white">
          {drawerContent}
        </div>
      )}

      {/* Sidebar - Mobile */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { width: DRAWER_WIDTH, border: 'none' },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {isMobile && (
          <AppBar
            position="static"
            elevation={0}
            sx={{ backgroundColor: 'white', borderBottom: '1px solid #e4e4e7' }}
          >
            <Toolbar>
              <IconButton
                edge="start"
                onClick={() => setMobileOpen(true)}
                sx={{ color: '#3f3f46' }}
              >
                <MenuIcon />
              </IconButton>
              <h2 className="text-lg text-brand-800 ml-2">Dashboard</h2>
            </Toolbar>
          </AppBar>
        )}

        <main className="flex-1 overflow-y-auto bg-[#f8f8f7]">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
            {typeof children === 'function' ? children({ showToast }) : children}
          </div>
        </main>
      </div>

      <Snackbar
        open={toast.open}
        autoHideDuration={3000}
        onClose={() => setToast((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setToast((prev) => ({ ...prev, open: false }))}
          severity={toast.severity}
          sx={{ fontFamily: '"DM Sans", sans-serif' }}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default Layout;
