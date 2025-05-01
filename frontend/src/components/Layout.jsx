import React from 'react'; // Removed useState
import { Box, useTheme, Toolbar, CssBaseline } from '@mui/material'; // Removed useMediaQuery
import Header from '../pages/Header';
// Removed Sidebar import

// Removed drawerWidth constant

const Layout = ({ children }) => {
  const theme = useTheme();
  // Removed isMobile and sidebar state/handlers

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <CssBaseline />

      {/* Pass only necessary props to Header */}
      <Header />

      {/* Removed Sidebar component */}

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          pt: theme.spacing(3),
          pb: theme.spacing(3),
          px: theme.spacing(3),
          // Removed marginLeft, width, and transition related to sidebar
          minHeight: '100vh',
          overflow: 'auto'
        }}
      >
        {/* Toolbar provides the necessary spacing below the fixed AppBar */}
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
};

export default Layout;