import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom'; // Added useLocation
import { useAuth } from '../context/AuthContext';
import {
  AppBar,
  Toolbar,
  IconButton,
  InputBase,
  Badge,
  Menu,
  MenuItem,
  Avatar,
  Box,
  Typography,
  Divider,
  ListItemIcon,
  Tooltip,
  alpha,
  styled,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  useTheme,
  Button, // Added Button
} from '@mui/material';
import {
  Menu as MenuIcon, // Keep for now, might remove later if not needed
  Search as SearchIcon,
  Notifications as NotificationsIcon,
  AccountCircle,
  Logout,
  Settings,
  Payment as PaymentIcon,
  Assessment as AssessmentIcon,
  // Removed ChevronLeft/Right Icons
  // Added Icons from Sidebar
  Dashboard as DashboardIcon,
  Description as DescriptionIcon,
  Map as MapIcon,
  People as PeopleIcon,
} from '@mui/icons-material';

// Styled search component (Optional, can use sx prop directly too)
const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.black, 0.05),
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.black, 0.10),
  },
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    marginLeft: theme.spacing(3),
    width: 'auto',
  },
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'inherit',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    // vertical padding + font size from searchIcon
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('md')]: {
      width: '30ch',
    },
  },
}));

// Moved from Sidebar
const menuItems = [
  { path: '/dashboard', name: 'Dashboard', icon: <DashboardIcon fontSize="small" /> },
  { path: '/pacs', name: 'PACs', icon: <DescriptionIcon fontSize="small" /> },
  { path: '/pagamentos', name: 'Pagamentos', icon: <PaymentIcon fontSize="small" />, roles: ['ADMIN', 'SUPERVISOR', 'GESTOR'] }, 
  // { path: '/provincias', name: 'Províncias', icon: <MapIcon fontSize="small" /> }, // Removed Provincias
  { path: '/relatorios', name: 'Relatórios', icon: <AssessmentIcon fontSize="small" /> }, // Consider restricting this?
  { path: '/usuarios', name: 'Usuários', icon: <PeopleIcon fontSize="small" />, roles: ['ADMIN'] } 
];

const Header = () => { // Removed toggleSidebar, sidebarOpen props
  const theme = useTheme();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation(); // Added useLocation
  const [anchorElUser, setAnchorElUser] = useState(null);
  const [anchorElNotif, setAnchorElNotif] = useState(null);

  // Mock notifications (keep for now, replace with real data later)
  const notifications = [
    { id: 1, title: 'Pagamento atrasado', message: 'PAC Beira tem pagamento atrasado', time: '5 minutos atrás', read: false },
    { id: 2, title: 'Novo PAC registrado', message: 'Um novo PAC foi registrado em Maputo', time: '1 hora atrás', read: true },
    { id: 3, title: 'Relatório mensal', message: 'O relatório mensal está disponível', time: '1 dia atrás', read: true }
  ];
  const unreadNotifications = notifications.filter(n => !n.read).length;

  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleOpenNotifMenu = (event) => {
    setAnchorElNotif(event.currentTarget);
  };

  const handleCloseNotifMenu = () => {
    setAnchorElNotif(null);
  };

  const handleLogout = () => {
    handleCloseUserMenu();
    signOut();
  };

  // Updated handleNavigate to close user menu if open
  const handleNavigate = (path) => {
    handleCloseUserMenu(); // Close user menu if open
    handleCloseNotifMenu(); // Close notification menu if open
    navigate(path);
  };

  // Moved from Sidebar
  const shouldShowMenuItem = (item) => {
    if (!item.roles) return true;
    return user && item.roles.includes(user.role);
  };

  // Moved from Sidebar
  const isActive = (path) => {
    if (path === '/dashboard') {
      return location.pathname === path;
    }
    // Match if the current path starts with the item path, but handle exact match for '/'
    return location.pathname === path || (path !== '/' && location.pathname.startsWith(path + '/'));
  };

  return (
    // Removed sx prop adjusting zIndex based on drawer
    <AppBar position="fixed" color="inherit" elevation={1}>
      <Toolbar>
         {/* Removed Sidebar Toggle Button */}
         {/* <Tooltip title={sidebarOpen ? "Recolher Menu" : "Expandir Menu"}>...</Tooltip> */}

         {/* App Title/Logo */}
         <Typography
            variant="h6"
            noWrap
            component={Link} // Make title a link to dashboard
            to="/dashboard"
            sx={{
              mr: 2,
              display: { xs: 'none', md: 'flex' },
              fontWeight: 700,
              color: 'inherit',
              textDecoration: 'none',
            }}
          >
            SG-PACs
          </Typography>

         {/* Horizontal Navigation Items */}
         <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' }, gap: 1, ml: 2 }}>
           {menuItems.map((item) =>
             shouldShowMenuItem(item) && (
               <Button
                 key={item.path}
                 onClick={() => handleNavigate(item.path)}
                 startIcon={item.icon}
                 sx={{
                   color: isActive(item.path) ? 'primary.main' : 'text.secondary',
                   fontWeight: isActive(item.path) ? 'bold' : 'normal',
                   textTransform: 'none', // Prevent uppercase
                   '&:hover': {
                     backgroundColor: alpha(theme.palette.action.hover, 0.04)
                   }
                 }}
               >
                 {item.name}
               </Button>
             )
           )}
         </Box>

        {/* Search Bar - Keep as is or adjust position */}
        {/* <Search sx={{ display: { xs: 'none', md: 'flex' } }}> ... </Search> */}
        {/* OR move search after nav items if preferred */}

        {/* Spacer to push remaining icons to the right */}
        {/* <Box sx={{ flexGrow: 1 }} /> */} {/* Might not be needed if nav items use flexGrow */}

        {/* Action Buttons (Notifications, User Profile) - Keep as is */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}> {/* Group right-side icons */}
          {/* Search Icon for smaller screens (optional) */}
           <IconButton sx={{ display: { xs: 'flex', md: 'none' } }} color="inherit">
              <SearchIcon />
           </IconButton>

          {/* Notifications */}
          <Tooltip title="Notificações">
            {/* ... existing notification IconButton and Badge ... */}
             <IconButton
                size="large"
                aria-label={`mostrar ${unreadNotifications} novas notificações`}
                color="inherit"
                onClick={handleOpenNotifMenu}
              >
                <Badge badgeContent={unreadNotifications} color="error">
                  <NotificationsIcon />
                </Badge>
              </IconButton>
          </Tooltip>
          {/* ... existing notification Menu ... */}
           <Menu
              id="menu-notifications"
              anchorEl={anchorElNotif}
              // ... other props
              open={Boolean(anchorElNotif)}
              onClose={handleCloseNotifMenu}
              // ... PaperProps
            >
              {/* ... menu content ... */}
               <Box sx={{ px: 2, py: 1, borderBottom: 1, borderColor: 'divider' }}>
                 <Typography variant="subtitle1">Notificações</Typography>
               </Box>
               {notifications.length > 0 ? (
                 <List dense sx={{ p: 0 }}>
                   {notifications.map((notification) => (
                     <MenuItem
                       key={notification.id}
                       onClick={() => { handleCloseNotifMenu(); /* Navigate to notification? */ }}
                       sx={{
                         bgcolor: !notification.read ? alpha(theme.palette.primary.light, 0.1) : 'inherit',
                         alignItems: 'flex-start'
                       }}
                     >
                       {/* ... notification item content ... */}
                        {!notification.read && (
                          <ListItemIcon sx={{ minWidth: 'auto', mr: 1, mt: 0.5 }}>
                            <Box sx={{ width: 8, height: 8, bgcolor: 'primary.main', borderRadius: '50%' }} />
                          </ListItemIcon>
                        )}
                        <ListItemText
                          primary={notification.title}
                          secondary={
                            <React.Fragment>
                              <Typography component="span" variant="body2" color="text.primary">
                                {notification.message}
                              </Typography>
                              <Typography component="span" variant="caption" display="block" color="text.secondary">
                                {notification.time}
                              </Typography>
                            </React.Fragment>
                          }
                          primaryTypographyProps={{ fontWeight: !notification.read ? 'bold' : 'normal' }}
                          sx={{ ml: !notification.read ? 0 : 3.5 }} // Indent read notifications
                        />
                     </MenuItem>
                   ))}
                   <Divider />
                   <MenuItem onClick={() => { handleCloseNotifMenu(); navigate('/notificacoes'); }}>
                     <ListItemText primary="Ver todas as notificações" primaryTypographyProps={{ textAlign: 'center', color: 'primary.main' }} />
                   </MenuItem>
                 </List>
               ) : (
                 <MenuItem disabled>
                   <ListItemText primary="Não há notificações." />
                 </MenuItem>
               )}
            </Menu>

          {/* User Profile */}
          <Tooltip title="Abrir configurações">
             {/* ... existing user IconButton ... */}
              <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                <Avatar sx={{ bgcolor: 'primary.main' }}>
                  {user?.nome?.charAt(0)?.toUpperCase() || 'U'}
                </Avatar>
              </IconButton>
          </Tooltip>
           {/* ... existing user Menu ... */}
           <Menu
              id="menu-appbar"
              anchorEl={anchorElUser}
              // ... other props
              open={Boolean(anchorElUser)}
              onClose={handleCloseUserMenu}
            >
               {/* ... menu content ... */}
                <Box sx={{ px: 2, py: 1, borderBottom: 1, borderColor: 'divider' }}>
                  <Typography variant="caption" display="block" color="text.secondary">Conectado como</Typography>
                  <Typography variant="subtitle2" noWrap>{user?.nome || 'Usuário'}</Typography>
                  <Typography variant="body2" noWrap color="text.secondary">{user?.email || 'sem email'}</Typography>
                </Box>
                <MenuItem onClick={() => handleNavigate('/perfil')}>
                  <ListItemIcon>
                    <AccountCircle fontSize="small" />
                  </ListItemIcon>
                  Meu Perfil
                </MenuItem>
                <MenuItem onClick={() => handleNavigate('/configuracoes')}>
                  <ListItemIcon>
                    <Settings fontSize="small" />
                  </ListItemIcon>
                  Configurações
                </MenuItem>
                <Divider />
                <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
                  <ListItemIcon>
                    <Logout fontSize="small" sx={{ color: 'error.main' }} />
                  </ListItemIcon>
                  Sair
                </MenuItem>
            </Menu>
        </Box> {/* End right-side icons group */}

      </Toolbar>
    </AppBar>
  );
};

export default Header;