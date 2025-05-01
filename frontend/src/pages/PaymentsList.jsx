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
  Chip,
  TextField,
  InputAdornment,
  Grid,
  Card,
  CardContent,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Payment as PaymentIcon,
  Assessment as AssessmentIcon,
  TrendingUp as TrendingUpIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';
import api from '../services/api';

const PaymentsList = () => {
  const navigate = useNavigate();
  const [payments, setPayments] = useState([]);
  const [pacs, setPacs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedPac, setSelectedPac] = useState('');
  const [paymentValue, setPaymentValue] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [paymentsResponse, pacsResponse] = await Promise.all([
        api.get('/pagamentos'),
        api.get('/pacs')
      ]);
      setPayments(paymentsResponse.data);
      setPacs(pacsResponse.data);
      setLoading(false);
    } catch (err) {
      setError('Erro ao carregar dados');
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este pagamento?')) {
      try {
        await api.delete(`/pagamentos/${id}`);
        fetchData();
      } catch (err) {
        setError('Erro ao excluir pagamento');
      }
    }
  };

  const handleNewPayment = async () => {
    try {
      await api.post('/pagamentos', {
        pac_id: selectedPac,
        valor: parseFloat(paymentValue)
      });
      setOpenDialog(false);
      fetchData();
    } catch (err) {
      setError('Erro ao registrar pagamento');
    }
  };

  const filteredPayments = payments.filter(payment =>
    payment.pac.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payment.pac.provincia.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Pagamentos
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenDialog(true)}
          sx={{ position: 'fixed', right: 32, top: 16, zIndex: 1000 }}
        >
          Novo Pagamento
        </Button>
      </Box>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                  <PaymentIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6">
                    {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL'
                    }).format(payments.reduce((sum, p) => sum + p.valor, 0))}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Pago
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
                    {payments.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Pagamentos Registrados
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
                    {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL'
                    }).format(payments.reduce((sum, p) => sum + p.valor, 0) / payments.length || 0)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Média por Pagamento
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
          placeholder="Buscar pagamentos..."
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
              <TableCell>PAC</TableCell>
              <TableCell>Província</TableCell>
              <TableCell>Valor</TableCell>
              <TableCell>Data</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredPayments.map((payment) => (
              <TableRow key={payment.id}>
                <TableCell>{payment.pac.nome}</TableCell>
                <TableCell>{payment.pac.provincia.nome}</TableCell>
                <TableCell>
                  {new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                  }).format(payment.valor)}
                </TableCell>
                <TableCell>
                  {new Date(payment.created_at).toLocaleDateString('pt-BR')}
                </TableCell>
                <TableCell>
                  <Chip
                    label={payment.status}
                    color={
                      payment.status === 'CONFIRMADO' ? 'success' :
                      payment.status === 'PENDENTE' ? 'warning' : 'error'
                    }
                  />
                </TableCell>
                <TableCell align="right">
                  <IconButton
                    color="info"
                    onClick={() => navigate(`/pagamentos/${payment.id}`)}
                  >
                    <VisibilityIcon />
                  </IconButton>
                  <IconButton
                    color="primary"
                    onClick={() => navigate(`/pagamentos/${payment.id}/editar`)}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    color="error"
                    onClick={() => handleDelete(payment.id)}
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
        <DialogTitle>Novo Pagamento</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>PAC</InputLabel>
            <Select
              value={selectedPac}
              onChange={(e) => setSelectedPac(e.target.value)}
              label="PAC"
            >
              {pacs.map((pac) => (
                <MenuItem key={pac.id} value={pac.id}>
                  {pac.nome} - {pac.provincia.nome}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            fullWidth
            label="Valor"
            type="number"
            value={paymentValue}
            onChange={(e) => setPaymentValue(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancelar</Button>
          <Button onClick={handleNewPayment} variant="contained">
            Registrar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PaymentsList; 