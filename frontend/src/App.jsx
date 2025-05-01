import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import theme from './theme';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import PacsList from './pages/PacsList';
import PacForm from './pages/PacForm';
import PacDetails from './pages/PacDetails'; // Import the new component
import PagamentosList from './pages/PagamentosList';
// import PagamentoForm from './pages/PagamentoForm'; // Remove this import
import PagamentoDetails from './pages/PagamentoDetails';
import RegistrarPagamento from './pages/Pagamentos/RegistrarPagamento'; // Add this import
import Relatorios from './pages/Relatorios';
import UsuariosList from './pages/UsuariosList';
import UsuarioForm from './pages/UsuarioForm'; // Import the new form component

// Helper component for loading state
const LoadingIndicator = () => (
  <Box 
    sx={{ 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      minHeight: '100vh', 
    }}
  >
    <CircularProgress />
  </Box>
);

const PrivateRoute = ({ children }) => {
  const { signed, loading } = useAuth();
  
  if (loading) {
    return <LoadingIndicator />;
  }
  
  if (!signed) {
    return <Navigate to="/login" />;
  }
  
  return <Layout>{children}</Layout>;
};

const AdminRoute = ({ children }) => {
  const { signed, loading, user } = useAuth();
  if (loading) {
    return <LoadingIndicator />;
  }
  if (!signed || user.role !== 'ADMIN') {
    return <Navigate to="/" replace />;
  }
  // Wrap children with Layout to include Header/Sidebar
  return <Layout>{children}</Layout>; 
};

// Guard route for users who are NOT Visualizador
const NonVisualizadorRoute = ({ children }) => {
  const { signed, loading, user } = useAuth();
  if (loading) {
    return <LoadingIndicator />;
  }
  // Redirect if not signed in OR if user is VISUALIZADOR
  if (!signed || user.role === 'VISUALIZADOR') {
    return <Navigate to="/dashboard" replace />; // Redirect to dashboard or another appropriate page
  }
  return <Layout>{children}</Layout>; // Include Layout
};

const RootRedirect = () => {
  const { signed, loading } = useAuth();

  if (loading) {
    return <LoadingIndicator />;
  }

  if (!signed) {
    return <Navigate to="/login" />;
  }

  return <Navigate to="/dashboard" />;
};

// Helper component for the Not Found page
const NotFound = () => {
  const navigate = useNavigate();

  return (
    <Box 
      sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: 'calc(100vh - 104px)', 
        textAlign: 'center',
        p: 3,
      }}
    >
      <Typography variant="h4" component="h2" sx={{ mb: 2, fontWeight: 'bold', color: 'text.secondary' }}>
        Página não encontrada
      </Typography>
      <Typography sx={{ mb: 4, color: 'text.secondary' }}>
        A página que você está procurando não existe ou foi removida.
      </Typography>
      <Button 
        variant="contained" 
        onClick={() => navigate(-1)}
      >
        Voltar
      </Button>
    </Box>
  );
};

const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <NotificationProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<Login />} />
              
              <Route 
                path="/dashboard" 
                element={
                  <PrivateRoute>
                    <Dashboard />
                  </PrivateRoute>
                } 
              />
              
              {/* Rotas para PACs */}
              <Route 
                path="/pacs" 
                element={
                  <PrivateRoute>
                    <PacsList />
                  </PrivateRoute>
                } 
              />
              
              <Route 
                path="/pacs/novo" 
                element={
                  <PrivateRoute>
                    <PacForm />
                  </PrivateRoute>
                } 
              />
              
              <Route 
                path="/pacs/editar/:id" 
                element={
                  <PrivateRoute>
                    <PacForm />
                  </PrivateRoute>
                } 
              />
              
              {/* Add route for viewing PAC details */}
              <Route 
                path="/pacs/:id" 
                element={
                  <PrivateRoute>
                    <PacDetails />
                  </PrivateRoute>
                } 
              />

              {/* Rotas para Pagamentos - Use NonVisualizadorRoute */}
              <Route 
                path="/pagamentos" 
                element={
                  <NonVisualizadorRoute>
                    <PagamentosList />
                  </NonVisualizadorRoute>
                } 
              />

              {/* Route for the new payment registration form */}
              <Route
                path="/pagamentos/registrar" // Use this path for the new form
                element={
                  <NonVisualizadorRoute>
                    <RegistrarPagamento />
                  </NonVisualizadorRoute>
                }
              />

              {/* Keep the edit route if PagamentoForm is still used for editing */}
              <Route
                path="/pagamentos/editar/:id"
                element={
                  <NonVisualizadorRoute>
                    {/* Use RegistrarPagamento for editing as well */}
                    <RegistrarPagamento />
                  </NonVisualizadorRoute>
                }
              />

              <Route
                path="/pagamentos/:id"
                element={
                  <NonVisualizadorRoute>
                    <PagamentoDetails />
                  </NonVisualizadorRoute>
                }
              />
              
              {/* Rota para Relatórios */}
              <Route 
                path="/relatorios" 
                element={
                  <PrivateRoute>
                    <Relatorios />
                  </PrivateRoute>
                } 
              />
              
              {/* Rota para Usuários */}
              <Route 
                path="/usuarios" 
                element={
                  <AdminRoute>
                    <UsuariosList />
                  </AdminRoute>
                } 
              />
              {/* Add route for editing a user */}
              <Route
                path="/usuarios/editar/:id"
                element={
                  <AdminRoute>
                    <UsuarioForm />
                  </AdminRoute>
                }
              />

              {/* Rota raiz verifica autenticação */}
              <Route 
                path="/" 
                element={
                  <RootRedirect />
                }
              />
              
              {/* Rota de fallback */}
              <Route 
                path="*" 
                element={
                  <PrivateRoute>
                    <NotFound /> 
                  </PrivateRoute>
                } 
              />
            </Routes>
          </BrowserRouter>
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;