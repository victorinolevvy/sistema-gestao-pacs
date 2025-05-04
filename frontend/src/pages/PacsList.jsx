import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Avatar,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  IconButton,
  TextField,
  InputAdornment,
  Chip,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Description as DescriptionIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  Business as BusinessIcon,
  Construction as ConstructionIcon,
  Engineering as EngineeringIcon,
  DoNotDisturbOn as DoNotDisturbOnIcon,
  PersonOff as PersonOffIcon
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const PacsList = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [pacs, setPacs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchPacs();
  }, [location.key]);

  const fetchPacs = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/pacs', {
        headers: { 'Cache-Control': 'no-cache' },
        params: { _t: new Date().getTime() }
      });
      setPacs(response.data);
    } catch (err) {
      setError('Erro ao carregar PACs');
      console.error("Erro detalhado:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este PAC?')) {
      try {
        await api.delete(`/pacs/${id}`);
        await fetchPacs(); // Recarregar dados após exclusão
      } catch (err) {
        setError('Erro ao excluir PAC');
      }
    }
  };

  const handleNavigateAndRefresh = (path) => {
    navigate(path);
    fetchPacs(); // Recarregar dados ao navegar
  };

  // Update filter logic to include manager name
  const filteredPacs = pacs.filter(pac =>
    pac.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (pac.provincia?.nome || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (pac.gestorAtual?.nome || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Define roles que podem criar/editar/excluir PACs
  const canManagePacs = user && ['ADMIN', 'SUPERVISOR'].includes(user.role);

  // Calcular KPIs
  const totalPacs = pacs.length;
  const pacsSemGestor = pacs.filter(pac => !pac.gestor_id).length;
  const pacsPorStatus = pacs.reduce((acc, pac) => {
    acc[pac.status] = (acc[pac.status] || 0) + 1;
    return acc;
  }, {});

  // Definir cores e ícones por status
  const statusConfig = {
    'Em Operação': { color: 'success.main', icon: <BusinessIcon /> },
    'Construção': { color: 'info.main', icon: <ConstructionIcon /> },
    'Reabilitação': { color: 'warning.main', icon: <EngineeringIcon /> },
    'Inoperacional': { color: 'error.main', icon: <DoNotDisturbOnIcon /> }
  };

  const renderStatusCards = () => {
    return ['Em Operação', 'Construção', 'Reabilitação', 'Inoperacional'].map(status => (
      <Grid item xs={12} md={3} key={status}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar sx={{ bgcolor: statusConfig[status].color, mr: 2 }}>
                {statusConfig[status].icon}
              </Avatar>
              <Box>
                <Typography variant="h6">
                  {pacsPorStatus[status] || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  PACs em {status}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>
    ));
  };

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        mb: 3,
        flexWrap: 'wrap',
        gap: 2
      }}>
        <Typography variant="h4" component="h1">
          Lista de PACs
        </Typography>
        {canManagePacs && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/pacs/novo')}
          >
            Novo PAC
          </Button>
        )}
      </Box>

      <Box sx={{ mb: 3 }}>
        <Grid container spacing={3}>
          {/* Card Total de PACs */}
          <Grid item xs={12} md={6} lg={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                    <DescriptionIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h6">{totalPacs}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total de PACs
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Card PACs sem Gestor */}
          <Grid item xs={12} md={6} lg={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar sx={{ bgcolor: 'warning.main', mr: 2 }}>
                    <PersonOffIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h6">{pacsSemGestor}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      PACs sem Gestor
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Cards de Status */}
          {Object.entries(statusConfig).map(([status, config]) => (
            <Grid item xs={12} md={6} lg={3} key={status}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar sx={{ bgcolor: config.color, mr: 2 }}>
                      {config.icon}
                    </Avatar>
                    <Box>
                      <Typography variant="h6">
                        {pacsPorStatus[status] || 0}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        PACs em {status}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      <Paper sx={{ p: 2, mb: 3 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Buscar PACs..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Paper>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nome</TableCell>
              <TableCell>Província</TableCell>
              <TableCell>Gestor</TableCell> {/* Add Gestor column header */}
              <TableCell>Valor da Renda</TableCell> 
              <TableCell>Status</TableCell>
              <TableCell>Data de Criação</TableCell>
              <TableCell align="right">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredPacs.map((pac) => (
              <TableRow key={pac.id}>                <TableCell>{pac.nome}</TableCell>
                <TableCell>{pac.provincia?.nome || '-'}</TableCell>
                <TableCell>{pac.gestorAtual?.nome || '-'}</TableCell>
                <TableCell>
                  {/* Corrigir campo e moeda */}
                  {pac.valor_renda_mensal != null ? new Intl.NumberFormat('pt-MZ', { // Usar locale pt-MZ
                    style: 'currency',
                    currency: 'MZN' // Usar MZN
                  }).format(pac.valor_renda_mensal) : '-'} {/* Usar valor_renda_mensal e tratar nulo */}
                </TableCell>
                <TableCell>
                  <Chip
                    label={pac.status}
                    color={
                      // Ajustar cores se necessário para os novos status
                      pac.status === 'Em Operação' ? 'success' :
                      pac.status === 'Construção' ? 'info' :
                      pac.status === 'Reabilitação' ? 'warning' :
                      pac.status === 'Inoperacional' ? 'error' : 'default'
                    }
                  />
                </TableCell>
                <TableCell>
                  {/* Usar data_criacao que existe no modelo Pac */}
                  {new Date(pac.data_criacao).toLocaleDateString('pt-BR')} 
                </TableCell>
                <TableCell align="right">
                  <IconButton
                    color="info"
                    onClick={() => navigate(`/pacs/${pac.id}`)} // Visualizar sempre permitido?
                  >
                    <VisibilityIcon />
                  </IconButton>
                  {/* Renderizar botões de editar/excluir apenas se tiver permissão */}
                  {canManagePacs && (
                    <>
                      <IconButton
                        color="primary"
                        onClick={() => navigate(`/pacs/editar/${pac.id}`)} // Corrected path
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        color="error"
                        onClick={() => handleDelete(pac.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default PacsList;