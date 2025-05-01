import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  TextField,
  InputAdornment,
  Grid,
  Card,
  CardContent,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  LocationOn as LocationIcon,
  TrendingUp as TrendingUpIcon,
  Assessment as AssessmentIcon
} from '@mui/icons-material';
import api from '../services/api';

const ProvincesList = () => {
  const navigate = useNavigate();
  const [provinces, setProvinces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [newProvince, setNewProvince] = useState({ nome: '', sigla: '' });

  useEffect(() => {
    fetchProvinces();
  }, []);

  const fetchProvinces = async () => {
    try {
      const response = await api.get('/provincias');
      setProvinces(response.data);
      setLoading(false);
    } catch (err) {
      setError('Erro ao carregar províncias');
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir esta província?')) {
      try {
        await api.delete(`/provincias/${id}`);
        fetchProvinces();
      } catch (err) {
        setError('Erro ao excluir província');
      }
    }
  };

  const handleNewProvince = async () => {
    try {
      await api.post('/provincias', newProvince);
      setOpenDialog(false);
      setNewProvince({ nome: '', sigla: '' });
      fetchProvinces();
    } catch (err) {
      setError('Erro ao criar província');
    }
  };

  const filteredProvinces = provinces.filter(province =>
    province.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    province.sigla.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Províncias
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenDialog(true)}
          sx={{ position: 'fixed', right: 32, top: 16, zIndex: 1000 }}
        >
          Nova Província
        </Button>
      </Box>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                  <LocationIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6">{provinces.length}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total de Províncias
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
                  <TrendingUpIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6">
                    {provinces.reduce((sum, p) => sum + (p.pacs?.length || 0), 0)}
                  </Typography>
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
                <Avatar sx={{ bgcolor: 'warning.main', mr: 2 }}>
                  <AssessmentIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6">
                    {provinces.length > 0
                      ? Math.round(provinces.reduce((sum, p) => sum + (p.pacs?.length || 0), 0) / provinces.length)
                      : 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Média de PACs por Província
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
          placeholder="Buscar províncias..."
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
              <TableCell>Sigla</TableCell>
              <TableCell>Número de PACs</TableCell>
              <TableCell align="right">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredProvinces.map((province) => (
              <TableRow key={province.id}>
                <TableCell>{province.nome}</TableCell>
                <TableCell>{province.sigla}</TableCell>
                <TableCell>{province.pacs?.length || 0}</TableCell>
                <TableCell align="right">
                  <IconButton
                    color="primary"
                    onClick={() => navigate(`/provincias/${province.id}/editar`)}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    color="error"
                    onClick={() => handleDelete(province.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Nova Província</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Nome"
            value={newProvince.nome}
            onChange={(e) => setNewProvince({ ...newProvince, nome: e.target.value })}
            sx={{ mt: 2 }}
          />
          <TextField
            fullWidth
            label="Sigla"
            value={newProvince.sigla}
            onChange={(e) => setNewProvince({ ...newProvince, sigla: e.target.value })}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancelar</Button>
          <Button onClick={handleNewProvince} variant="contained">
            Criar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProvincesList; 