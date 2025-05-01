import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Button,
  CircularProgress,
  Alert,
  Divider,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Description as DescriptionIcon,
  Payment as PaymentIcon,
  AssignmentTurnedIn as AssignmentTurnedInIcon,
  TrendingUp as TrendingUpIcon,
  Add as AddIcon,
  AccessTime as AccessTimeIcon
} from '@mui/icons-material';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    estatisticas: {
      pacs: {
        total: 0,
        pendentes: 0,
        aprovados: 0,
        rejeitados: 0
      },
      pagamentos: {
        total: 0,
        pendentes: 0,
        confirmados: 0
      }
    },
    atividadesRecentes: []
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('Token:', localStorage.getItem('token'));
        const response = await api.get('/dashboard');
        console.log('Resposta do dashboard:', response.data);
        setDashboardData(response.data);
      } catch (err) {
        console.error('Erro detalhado:', err);
        setError(err.message || 'Erro ao carregar dados do dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Safely access nested properties using optional chaining (?.)
  // and provide default values (?? {})
  const pacStats = dashboardData?.estatisticas?.pacs ?? { total: 0, pendentes: 0, aprovados: 0, rejeitados: 0 };
  const pagamentoStats = dashboardData?.estatisticas?.pagamentos ?? { total: 0, pendentes: 0, confirmados: 0 };
  const atividades = dashboardData?.atividadesRecentes ?? [];
  const taxaAprovacao = pacStats.total > 0 ? Math.round((pacStats.aprovados / pacStats.total) * 100) : 0;

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>

      {/* Estatísticas */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <DescriptionIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Total de PACs</Typography>
              </Box>
              <Typography variant="h4">{pacStats.total}</Typography>
              <Typography variant="body2" color="text.secondary">
                {pacStats.pendentes} pendentes
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <PaymentIcon color="success" sx={{ mr: 1 }} />
                <Typography variant="h6">Pagamentos</Typography>
              </Box>
              <Typography variant="h4">{pagamentoStats.total}</Typography>
              <Typography variant="body2" color="text.secondary">
                {pagamentoStats.pendentes} pendentes
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <AssignmentTurnedInIcon color="info" sx={{ mr: 1 }} />
                <Typography variant="h6">PACs Aprovados</Typography>
              </Box>
              <Typography variant="h4">{pacStats.aprovados}</Typography>
              <Typography variant="body2" color="text.secondary">
                {pacStats.rejeitados} rejeitados
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <TrendingUpIcon color="warning" sx={{ mr: 1 }} />
                <Typography variant="h6">Taxa de Aprovação</Typography>
              </Box>
              <Typography variant="h4">
                {taxaAprovacao}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Ações Rápidas e Atividades Recentes */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Ações Rápidas
            </Typography>
            <List>
              <ListItem>
                <Button
                  startIcon={<AddIcon />}
                  variant="contained"
                  fullWidth
                  onClick={() => navigate('/pacs/novo')}
                >
                  Criar Novo PAC
                </Button>
              </ListItem>
              <ListItem>
                <Button
                  startIcon={<PaymentIcon />}
                  variant="outlined"
                  fullWidth
                  onClick={() => navigate('/pagamentos/novo')}
                >
                  Registrar Pagamento
                </Button>
              </ListItem>
              <ListItem>
                <Button
                  startIcon={<DescriptionIcon />}
                  variant="outlined"
                  fullWidth
                  onClick={() => navigate('/relatorios/novo')}
                >
                  Gerar Relatório
                </Button>
              </ListItem>
            </List>
          </Paper>
        </Grid>

        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Atividades Recentes
            </Typography>
            <List>
              {atividades.length === 0 ? (
                 <Typography>Nenhuma atividade recente.</Typography>
              ) : (
                atividades.map((atividade) => (
                  <React.Fragment key={atividade.id}>
                    <ListItem>
                      <ListItemIcon>
                        <AccessTimeIcon />
                      </ListItemIcon>
                      <ListItemText
                        primary={atividade.titulo}
                        secondary={`${atividade.usuario} - ${new Date(atividade.data).toLocaleDateString()}`}
                      />
                      <Typography variant="caption" color="text.secondary">
                        Status: {atividade.status}
                      </Typography>
                    </ListItem>
                    <Divider />
                  </React.Fragment>
                ))
              )}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;