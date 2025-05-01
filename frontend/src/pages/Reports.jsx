import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Avatar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip
} from '@mui/material';
import {
  Assessment as AssessmentIcon,
  Description as DescriptionIcon,
  Payment as PaymentIcon,
  TrendingUp as TrendingUpIcon,
  Download as DownloadIcon,
  Print as PrintIcon
} from '@mui/icons-material';
import api from '../services/api';

const Reports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedType, setSelectedType] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const response = await api.get('/relatorios');
      setReports(response.data);
      setLoading(false);
    } catch (err) {
      setError('Erro ao carregar relatórios');
      setLoading(false);
    }
  };

  const handleGenerateReport = async () => {
    try {
      const response = await api.post('/relatorios', {
        tipo: selectedType,
        data_inicio: startDate,
        data_fim: endDate
      });
      setReports([...reports, response.data]);
    } catch (err) {
      setError('Erro ao gerar relatório');
    }
  };

  const handleDownload = async (id) => {
    try {
      const response = await api.get(`/relatorios/${id}/download`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `relatorio-${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      setError('Erro ao baixar relatório');
    }
  };

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Relatórios
      </Typography>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                  <AssessmentIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6">{reports.length}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total de Relatórios
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
                  <DescriptionIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6">
                    {reports.filter(r => r.tipo === 'PAC').length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Relatórios de PACs
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
                  <PaymentIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6">
                    {reports.filter(r => r.tipo === 'PAGAMENTO').length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Relatórios de Pagamentos
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Gerar Novo Relatório
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Tipo de Relatório</InputLabel>
              <Select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                label="Tipo de Relatório"
              >
                <MenuItem value="PAC">Relatório de PACs</MenuItem>
                <MenuItem value="PAGAMENTO">Relatório de Pagamentos</MenuItem>
                <MenuItem value="GERAL">Relatório Geral</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Data Inicial"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Data Final"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12}>
            <Button
              variant="contained"
              startIcon={<AssessmentIcon />}
              onClick={handleGenerateReport}
              disabled={!selectedType || !startDate || !endDate}
            >
              Gerar Relatório
            </Button>
          </Grid>
        </Grid>
      </Paper>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Tipo</TableCell>
              <TableCell>Período</TableCell>
              <TableCell>Data de Geração</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {reports.map((report) => (
              <TableRow key={report.id}>
                <TableCell>{report.tipo}</TableCell>
                <TableCell>
                  {new Date(report.data_inicio).toLocaleDateString('pt-BR')} -{' '}
                  {new Date(report.data_fim).toLocaleDateString('pt-BR')}
                </TableCell>
                <TableCell>
                  {new Date(report.created_at).toLocaleDateString('pt-BR')}
                </TableCell>
                <TableCell>
                  <Chip
                    label={report.status}
                    color={
                      report.status === 'CONCLUIDO' ? 'success' :
                      report.status === 'PROCESSANDO' ? 'warning' : 'error'
                    }
                  />
                </TableCell>
                <TableCell align="right">
                  <IconButton
                    color="primary"
                    onClick={() => handleDownload(report.id)}
                    disabled={report.status !== 'CONCLUIDO'}
                  >
                    <DownloadIcon />
                  </IconButton>
                  <IconButton
                    color="secondary"
                    onClick={() => window.print()}
                    disabled={report.status !== 'CONCLUIDO'}
                  >
                    <PrintIcon />
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

export default Reports; 