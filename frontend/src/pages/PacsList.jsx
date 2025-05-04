import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom'; // Importar useLocation
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Button,
  IconButton,
  Chip,
  TextField,
  InputAdornment,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Avatar,
  Divider
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Description as DescriptionIcon,
  Payment as PaymentIcon,
  Assessment as AssessmentIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext'; // Importar useAuth
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

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 3,
        flexWrap: 'wrap', // Allow wrapping on smaller screens
        gap: 2 // Add gap between items
      }}>
        <Typography variant="h4" component="h1">
          Lista de PACs
        </Typography>
        {/* Renderizar botão apenas se o usuário tiver permissão */}
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

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                  <DescriptionIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6">{pacs.length}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total de PACs
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar sx={{ bgcolor: 'success.main', mr: 2 }}>
                  <PaymentIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6">
                    {pacs.filter(pac => pac.status === 'PAGO').length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    PACs Pagos
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar sx={{ bgcolor: 'warning.main', mr: 2 }}>
                  <AssessmentIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6">
                    {pacs.filter(pac => pac.status === 'PENDENTE').length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    PACs Pendentes
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

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