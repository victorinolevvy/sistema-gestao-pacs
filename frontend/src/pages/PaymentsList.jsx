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
  Avatar
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
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const PaymentsList = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const canCreatePayment = user && ['GESTOR','ADMIN','SUPERVISOR'].includes(user.role);
  const [payments, setPayments] = useState([]);
  const [pacs, setPacs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [paymentsResponse, pacsResponse] = await Promise.all([
        api.get('/pagamentos'),
        api.get('/pacs')
      ]);
      const paymentsData = paymentsResponse.data;
      const pacsData = pacsResponse.data;
      setPayments(Array.isArray(paymentsData) ? paymentsData : []);
      setPacs(Array.isArray(pacsData) ? pacsData : []);
    } catch (err) {
      setError('Erro ao carregar pagamentos');
    } finally {
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

  const filteredPayments = Array.isArray(payments)
    ? payments.filter(payment =>
      payment.pac.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.pac.provincia.nome.toLowerCase().includes(searchTerm.toLowerCase())
    )
    : [];

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Pagamentos
        </Typography>
        {canCreatePayment && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/pagamentos/registrar')}
          >
            Novo Pagamento
          </Button>
        )}
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
                    {new Intl.NumberFormat('pt-MZ', { // Change locale to pt-MZ
                      style: 'currency',
                      currency: 'MZN' // Change currency to MZN
                    }).format(
                      Array.isArray(payments)
                        ? payments.reduce(
                            (sum, p) => sum + (parseFloat(p.valor_pago || 0) + parseFloat(p.valor_regularizado || 0)),
                            0
                          )
                        : 0
                    )}
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
                    {Array.isArray(payments) ? payments.length : 0}
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
                    {new Intl.NumberFormat('pt-MZ', { // Change locale to pt-MZ
                      style: 'currency',
                      currency: 'MZN' // Change currency to MZN
                    }).format(
                      Array.isArray(payments) && payments.length > 0
                        ? payments.reduce(
                            (sum, p) => sum + (parseFloat(p.valor_pago || 0) + parseFloat(p.valor_regularizado || 0)),
                            0
                          ) / payments.length
                        : 0
                    )}
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
              <TableCell>Valor Pago (MZN)</TableCell>
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
                  {new Intl.NumberFormat('pt-MZ', {
                    style: 'currency',
                    currency: 'MZN'
                  }).format(parseFloat(payment.valor_pago || 0))}
                </TableCell>
                <TableCell>
                  {new Date(payment.data_pagamento).toLocaleDateString('pt-BR')}
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
    </Box>
  );
};

export default PaymentsList;