import React, { useState, useEffect, useContext } from 'react'; // Keep useContext for now, might be used elsewhere, but remove if not needed after change
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Typography,
  CircularProgress,
  Alert,
  Container,
  Button,
  Grid,
  Divider,
  List,             // Add List components
  ListItem,
  ListItemText,
  IconButton,
  Chip,
  Stack,             // Add Stack for buttons
  Table,             // Add Table components
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper             // Add Paper for TableContainer
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle'; // Icon for Confirmar
import CancelIcon from '@mui/icons-material/Cancel';       // Icon for Rejeitar
import api from '../services/api';
import { useAuth } from '../context/AuthContext'; // Import useAuth instead of AuthContext
import { confirmarOuRejeitarPagamento } from '../services/pagamentoService'; // Import the service function
// Assuming a function to get payments by PAC exists or we use the endpoint directly
// import { getPagamentosPorPac } from '../services/pagamentoService';

const PacDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth(); // Use the useAuth hook
  const [pac, setPac] = useState(null);
  const [pacPagamentos, setPacPagamentos] = useState([]); // State for payments
  const [loading, setLoading] = useState(true);
  const [loadingPagamentos, setLoadingPagamentos] = useState(true); // Loading state for payments
  const [error, setError] = useState('');
  const [pagamentoError, setPagamentoError] = useState(''); // Error state for payment actions

  const fetchPacData = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await api.get(`/pacs/${id}`);
        setPac(response.data);
      } catch (err) {
        console.error('Erro ao carregar detalhes do PAC:', err);
        setError('Erro ao carregar detalhes do PAC.');
      } finally {
        setLoading(false);
      }
    };

  const fetchPagamentos = async () => {
      try {
          setLoadingPagamentos(true);
          setPagamentoError('');
          // Fetch payments specifically for this PAC
          const response = await api.get(`/pagamentos/pac/${id}`);
          setPacPagamentos(response.data || []);
      } catch (err) {
          console.error('Erro ao carregar pagamentos do PAC:', err);
          // Don't overwrite main PAC error, use separate state
          setPagamentoError('Erro ao carregar histórico de pagamentos.');
      } finally {
          setLoadingPagamentos(false);
      }
  };


  useEffect(() => {
    fetchPacData();
    fetchPagamentos(); // Fetch payments when component mounts or ID changes
  }, [id]);

  // Function to handle confirmation/rejection
  const handleStatusUpdate = async (pagamentoId, newStatus) => {
      setPagamentoError(''); // Clear previous errors
      try {
          const response = await confirmarOuRejeitarPagamento(pagamentoId, newStatus);
          // Update the payment list locally to reflect the change
          setPacPagamentos(prevPagamentos =>
              prevPagamentos.map(p =>
                  p.id === pagamentoId ? { ...p, ...response.data } : p
              )
          );
          // Optionally show a success notification
      } catch (err) {
          console.error(`Erro ao ${newStatus === 'CONFIRMADO' ? 'confirmar' : 'rejeitar'} pagamento:`, err);
          setPagamentoError(err.message || `Falha ao ${newStatus === 'CONFIRMADO' ? 'confirmar' : 'rejeitar'} o pagamento.`);
      }
  };


  // Filter pending payments
  const pagamentosPendentes = pacPagamentos.filter(p => p.status_confirmacao === 'PENDENTE');

  // ... existing loading, error, and no-pac checks ...
  if (loading) {
    return (
      <Container sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error && !pac) { // Only show main error if PAC failed to load
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
        <Button onClick={() => navigate('/pacs')} sx={{ mt: 2 }}>Voltar para Lista</Button>
      </Container>
    );
  }

  if (!pac && !loading) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="warning">PAC não encontrado.</Alert>
        <Button onClick={() => navigate('/pacs')} sx={{ mt: 2 }}>Voltar para Lista</Button>
      </Container>
    );
  }

  // Helper function to format currency
  const formatCurrency = (value) => {
    if (value == null) return '-';
    return new Intl.NumberFormat('pt-MZ', { style: 'currency', currency: 'MZN' }).format(value);
  };

  // Helper function to format date
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    // Show date and time if available
    const date = new Date(dateString);
     if (isNaN(date.getTime())) return '-'; // Invalid date
    return date.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
  };

   // Helper function to format month/year
   const formatMonthYear = (mes, ano) => {
       if (!mes || !ano) return '-';
       const monthNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
       return `${monthNames[mes - 1]}/${ano}`;
   }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Card for PAC Details */}
      <Card sx={{ mb: 3 }}> {/* Add margin bottom */}
        <CardHeader
          title={`Detalhes do PAC: ${pac?.nome || 'Carregando...'}`}
          action={
            <Button onClick={() => navigate('/pacs')} variant="outlined">
              Voltar para Lista
            </Button>
          }
        />
        {/* Show loading/error/not found only if PAC data is the issue */}
        {loading ? <CircularProgress sx={{m: 2}}/> : error && !pac ? <Alert severity="error" sx={{m: 2}}>{error}</Alert> : !pac ? <Alert severity="warning" sx={{m: 2}}>PAC não encontrado.</Alert> : (
            <CardContent>
              <Grid container spacing={2}>
                {/* ... existing PAC detail fields ... */}
                 <Grid item xs={12} md={6}>
                   <Typography variant="subtitle1" gutterBottom><strong>Nome:</strong></Typography>
                   <Typography>{pac.nome}</Typography>
                 </Grid>
                 <Grid item xs={12} md={6}>
                   <Typography variant="subtitle1" gutterBottom><strong>Província:</strong></Typography>
                   <Typography>{pac.provincia?.nome || '-'}</Typography>
                 </Grid>
                 <Grid item xs={12} md={6}>
                   <Typography variant="subtitle1" gutterBottom><strong>Gestor:</strong></Typography>
                   {/* Use gestor based on updated model */}
                   <Typography>{pac.gestor?.nome || 'Sem Gestor Associado'}</Typography>
                 </Grid>
                 <Grid item xs={12} md={6}>
                   <Typography variant="subtitle1" gutterBottom><strong>Status:</strong></Typography>
                   <Typography>{pac.status || '-'}</Typography>
                 </Grid>
                 <Grid item xs={12} md={6}>
                   <Typography variant="subtitle1" gutterBottom><strong>Valor da Renda Mensal:</strong></Typography>
                   <Typography>{formatCurrency(pac.valor_renda_mensal)}</Typography>
                 </Grid>
                 <Grid item xs={12} md={6}>
                   <Typography variant="subtitle1" gutterBottom><strong>Data de Criação:</strong></Typography>
                   <Typography>{formatDate(pac.data_criacao)}</Typography>
                 </Grid>
                 {/* Add more fields as needed */}
                 <Grid item xs={12}><Divider sx={{ my: 2 }} /></Grid>
                 <Grid item xs={12} md={6}>
                   <Typography variant="subtitle1" gutterBottom><strong>Status Financeiro:</strong></Typography>
                   <Typography>{pac.status_financeiro || '-'}</Typography>
                 </Grid>
                  <Grid item xs={12} md={6}>
                   <Typography variant="subtitle1" gutterBottom><strong>Dias em Atraso:</strong></Typography>
                   <Typography>{pac.dias_atraso ?? '-'}</Typography>
                 </Grid>
                  <Grid item xs={12} md={6}>
                   <Typography variant="subtitle1" gutterBottom><strong>Valor Devido:</strong></Typography>
                   <Typography>{formatCurrency(pac.valor_devido)}</Typography>
                 </Grid>
              </Grid>
            </CardContent>
        )}
      </Card>

      {/* Conditional Card for Pending Payments (ADMIN/SUPERVISOR only) */}
      {(user?.role === 'ADMIN' || user?.role === 'SUPERVISOR') && (
          <Card>
              <CardHeader title="Pagamentos Pendentes de Confirmação" />
              <CardContent>
                  {loadingPagamentos ? (
                      <CircularProgress />
                  ) : pagamentoError && pagamentosPendentes.length === 0 ? ( // Show payment loading error only if list is empty
                      <Alert severity="error">{pagamentoError}</Alert>
                  ) : pagamentosPendentes.length === 0 ? (
                      <Typography>Nenhum pagamento pendente para este PAC.</Typography>
                  ) : (
                      <List dense>
                          {pagamentosPendentes.map((pag) => (
                              <ListItem
                                  key={pag.id}
                                  divider
                                  secondaryAction={
                                      <Stack direction="row" spacing={1}>
                                          <IconButton
                                              edge="end"
                                              aria-label="confirmar"
                                              color="success"
                                              onClick={() => handleStatusUpdate(pag.id, 'CONFIRMADO')}
                                              title="Confirmar Pagamento" // Tooltip em Português
                                          >
                                              <CheckCircleIcon />
                                          </IconButton>
                                          <IconButton
                                              edge="end"
                                              aria-label="rejeitar"
                                              color="error"
                                              onClick={() => handleStatusUpdate(pag.id, 'REJEITADO')}
                                              title="Rejeitar Pagamento" // Tooltip em Português
                                          >
                                              <CancelIcon />
                                          </IconButton>
                                      </Stack>
                                  }
                              >
                                  <ListItemText
                                      primary={`Ref: ${formatMonthYear(pag.mes_referencia, pag.ano_referencia)} - Valor Pago: ${formatCurrency(pag.valor_pago)}`}
                                      secondary={`Registrado por: ${pag.usuarioRegistro?.nome || 'N/A'} em ${formatDate(pag.data_criacao)} ${pag.observacoes ? `- Obs: ${pag.observacoes}` : ''}`}
                                  />
                              </ListItem>
                          ))}
                      </List>
                  )}
                  {/* Show general payment error if any occurred during update */}
                  {pagamentoError && !loadingPagamentos && <Alert severity="error" sx={{mt: 2}}>{pagamentoError}</Alert>}
              </CardContent>
          </Card>
      )}

      {/* Card for Payment History */}
      <Card sx={{ mt: 3 }}> {/* Add margin top */}
        <CardHeader title="Histórico de Pagamentos" />
        <CardContent>
          {loadingPagamentos ? (
            <CircularProgress />
          ) : pagamentoError ? ( // Show error if loading payments failed
            <Alert severity="error">{pagamentoError}</Alert>
          ) : pacPagamentos.length === 0 ? (
            <Typography>Nenhum pagamento registrado para este PAC.</Typography>
          ) : (
            <TableContainer component={Paper}>
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Ref.</TableCell>
                    <TableCell>Data Pag.</TableCell>
                    <TableCell>Valor Pago</TableCell>
                    <TableCell>Valor Reg.</TableCell>
                    <TableCell>Total</TableCell>
                    <TableCell>Status Pag.</TableCell>
                    <TableCell>Status Conf.</TableCell>
                    <TableCell>Registrado Por</TableCell>
                    <TableCell>Confirmado Por</TableCell>
                    <TableCell>Data Conf.</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {pacPagamentos.map((pag) => (
                    <TableRow hover key={pag.id}>
                      <TableCell>{formatMonthYear(pag.mes_referencia, pag.ano_referencia)}</TableCell>
                      <TableCell>{formatDate(pag.data_pagamento)}</TableCell>
                      <TableCell>{formatCurrency(pag.valor_pago)}</TableCell>
                      <TableCell>{formatCurrency(pag.valor_regularizado)}</TableCell>
                      <TableCell><strong>{formatCurrency(parseFloat(pag.valor_pago || 0) + parseFloat(pag.valor_regularizado || 0))}</strong></TableCell>
                      <TableCell>
                        <Chip
                          label={pag.status || 'N/A'}
                          size="small"
                          color={
                            pag.status === 'Pago' ? 'success' :
                            pag.status === 'Pendente Parcial' || pag.status === 'Pago Parcialmente' ? 'warning' :
                            pag.status === 'Pendente' ? 'error' : 'default'
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={pag.status_confirmacao || 'N/A'}
                          size="small"
                          color={
                            pag.status_confirmacao === 'CONFIRMADO' ? 'success' :
                            pag.status_confirmacao === 'REJEITADO' ? 'error' : 'default' // PENDENTE is default
                          }
                        />
                      </TableCell>
                      <TableCell>{pag.usuarioRegistro?.nome || '-'}</TableCell>
                      <TableCell>{pag.usuarioConfirmacao?.nome || '-'}</TableCell>
                      <TableCell>{formatDate(pag.data_confirmacao)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

    </Container>
  );
};

export default PacDetails;
