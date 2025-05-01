import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Box,
  Typography,
  IconButton,
  Tooltip,
  Avatar,
  Toolbar,
  useTheme,
  useMediaQuery,
  alpha, // Import alpha
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Description as DescriptionIcon,
  Payment as PaymentIcon,
  Map as MapIcon,
  Assessment as AssessmentIcon,
  People as PeopleIcon,
  ExitToApp as ExitToAppIcon,
  ChevronLeft as ChevronLeftIcon,
} from '@mui/icons-material';

const Sidebar = ({ open, onClose, onOpen, drawerWidth }) => {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const menuItems = [
    { path: '/dashboard', name: 'Dashboard', icon: <DashboardIcon /> },
    { path: '/pacs', name: 'PACs', icon: <DescriptionIcon /> },
    { path: '/pagamentos', name: 'Pagamentos', icon: <PaymentIcon /> },
    { path: '/provincias', name: 'Províncias', icon: <MapIcon /> },
    { path: '/relatorios', name: 'Relatórios', icon: <AssessmentIcon /> },
    { path: '/usuarios', name: 'Usuários', icon: <PeopleIcon />, roles: ['ADMIN', 'GESTOR'] }
  ];

  const shouldShowMenuItem = (item) => {
    if (!item.roles) return true;
    return user && item.roles.includes(user.role);
  };

  const isActive = (path) => {
    if (path === '/dashboard') {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  const handleLogout = () => {
    if (isMobile) onClose();
    signOut();
  };

  const handleNavigate = (path) => {
    if (isMobile) onClose();
    navigate(path);
  };

  const drawerContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Toolbar sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: [1] }}>
        <Typography variant="h6" noWrap component="div" sx={{ ml: 1 }}>
          SG-PACs
        </Typography>
      </Toolbar>
      <Divider />
      <List sx={{ flexGrow: 1, overflowY: 'auto' }}>
        {menuItems.map((item) =>
          shouldShowMenuItem(item) && (
            <ListItem key={item.path} disablePadding>
              <ListItemButton
                selected={isActive(item.path)}
                onClick={() => handleNavigate(item.path)}
                sx={{ 
                  py: 1.5,
                  px: 2.5,
                  mb: 0.5,
                  borderRadius: 1,
                  mx: 1,
                  '&.Mui-selected': {
                    backgroundColor: 'action.selected',
                    '&:hover': {
                      backgroundColor: 'action.selected',
                    }
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 40, color: isActive(item.path) ? 'primary.main' : 'inherit' }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.name} />
              </ListItemButton>
            </ListItem>
          )
        )}
      </List>
      <Divider />
      <Box sx={{ p: 2, mt: 'auto' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32, mr: 1.5 }}>
            {user?.nome?.charAt(0)?.toUpperCase() || 'U'}
          </Avatar>
          <Box>
            <Typography variant="subtitle2" noWrap>
              {user?.nome || 'Usuário'}
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap>
              {user?.role === 'ADMIN' ? 'Administrador' : (user?.role === 'GESTOR' ? 'Gestor' : 'Usuário')}
            </Typography>
          </Box>
        </Box>
        <Tooltip title="Sair">
          <ListItemButton
            onClick={handleLogout}
            sx={{ 
              color: 'error.main', 
              borderRadius: 1, 
              py: 1,
              '&:hover': { bgcolor: alpha(theme.palette.error.main, 0.1) }
            }}
          >
            <ListItemIcon sx={{ minWidth: 40, color: 'error.main' }}>
              <ExitToAppIcon />
            </ListItemIcon>
            <ListItemText primary="Sair" />
          </ListItemButton>
        </Tooltip>
      </Box>
    </Box>
  );

  return (
    <Drawer
      variant={isMobile ? "temporary" : "persistent"}
      open={open}
      onClose={onClose}
      ModalProps={{
        keepMounted: true,
      }}
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: { 
          width: drawerWidth, 
          boxSizing: 'border-box', 
          borderRight: { sm: 'none' },
          bgcolor: 'background.paper'
        },
      }}
    >
      {drawerContent}
    </Drawer>
  );
};

export default Sidebar;