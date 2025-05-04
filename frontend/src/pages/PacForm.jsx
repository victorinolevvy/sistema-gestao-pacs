import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Typography,
  TextField,
  Button,
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Alert,
  Container
} from '@mui/material';
import api from '../services/api';
import { format } from 'date-fns'; // Import date-fns for formatting

const PacForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [formData, setFormData] = useState({
    nome: '',
    endereco: '', // Add endereco
    provincia_id: '',
    gestor_id: '', // Use gestor_id consistently
    valor_renda_mensal: '',
    status: 'Em Operação',
    data_inicio_atividade: format(new Date(), 'yyyy-MM-dd') // Add and initialize
  });

  const [provincias, setProvincias] = useState([]);
  const [gestores, setGestores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError('');

        const [provinciasResponse, gestoresResponse] = await Promise.all([
          api.get('/provincias'),
          api.get('/usuarios/gestores') // Correct endpoint
        ]);

        setProvincias(provinciasResponse.data || []);
        setGestores(gestoresResponse.data || []);

        if (isEditMode) {
          const pacResponse = await api.get(`/pacs/${id}`);
          const pac = pacResponse.data;

          // Format date if it exists
          const formattedDate = pac.data_inicio_atividade
            ? format(new Date(pac.data_inicio_atividade), 'yyyy-MM-dd')
            : format(new Date(), 'yyyy-MM-dd'); // Default to today if null

          setFormData({
            nome: pac.nome || '',
            endereco: pac.endereco || '', // Load endereco
            provincia_id: pac.provincia_id || '',
            gestor_id: pac.gestor_id || '', // Use gestor_id
            valor_renda_mensal: pac.valor_renda_mensal || '',
            status: [
              'Em Operação',
              'Reabilitação',
              'Construção',
              'Inoperacional'
            ].includes(pac.status) ? pac.status : 'Em Operação',
            data_inicio_atividade: formattedDate // Load formatted date
          });
        }

        setLoading(false);
      } catch (err) {
        console.error('Erro ao carregar dados:', err.response || err.message || err);
        setError('Erro ao carregar dados. Verifique a conexão e tente novamente.');
        setLoading(false);
      }
    }

    loadData();
  }, [id, isEditMode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Add validation for required fields matching backend - gestor_id removed from required fields
    if (!formData.nome || !formData.provincia_id || !formData.valor_renda_mensal || !formData.data_inicio_atividade) {
       setError('Nome, Província, Valor da Renda Mensal e Data de Início são obrigatórios.');
       return;
    }

    try {
      setIsSubmitting(true);
      setError('');
      setSuccess('');

      // Prepare data, ensuring correct types and field names
      const dataToSend = {
        nome: formData.nome,
        endereco: formData.endereco,
        provincia_id: parseInt(formData.provincia_id),
        gestor_id: formData.gestor_id ? parseInt(formData.gestor_id) : null, // Allow null gestor_id
        valor_renda_mensal: parseFloat(formData.valor_renda_mensal),
        status: formData.status,
        data_inicio_atividade: formData.data_inicio_atividade // Send date string
      };

      let response;
      if (isEditMode) {
        response = await api.put(`/pacs/${id}`, dataToSend, {
          headers: { 'Cache-Control': 'no-cache' } 
        });
        setSuccess('PAC atualizado com sucesso!');
      } else {
        response = await api.post('/pacs', dataToSend);
        setSuccess('PAC criado com sucesso!');
        
        // Clear form after successful creation
        setFormData({
          nome: '',
          endereco: '',
          provincia_id: '',
          gestor_id: '',
          valor_renda_mensal: '',
          status: 'Em Operação',
          data_inicio_atividade: format(new Date(), 'yyyy-MM-dd')
        });
      }

      // Atualizar o cache
      await api.get('/pacs', { headers: { 'Cache-Control': 'no-cache' } });
      
      setTimeout(() => navigate('/pacs'), 1500);

    } catch (err) {
      console.error('Submit Error:', err.response || err); // Log the full error response
      // Use the specific message from the backend if available
      const backendMessage = err.response?.data?.message || 'Erro desconhecido ao salvar PAC.';
      const validationErrors = err.response?.data?.errors; // Check for validation errors array

      let displayError = backendMessage;
      if (validationErrors && Array.isArray(validationErrors)) {
          // Format validation errors if they exist
          displayError += ': ' + validationErrors.join(', ');
      }

      setError(displayError);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Container sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Card>
        <CardHeader
          title={isEditMode ? 'Editar PAC' : 'Novo PAC'}
          action={
            <Button onClick={() => navigate('/pacs')} variant="outlined">
              Voltar para Lista
            </Button>
          }
        />
        <CardContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {success}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Nome do PAC"
                  name="nome"
                  value={formData.nome}
                  onChange={handleChange}
                  fullWidth
                  required
                  variant="outlined"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  label="Endereço (Opcional)"
                  name="endereco"
                  value={formData.endereco}
                  onChange={handleChange}
                  fullWidth
                  variant="outlined"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth required variant="outlined" sx={{ minWidth: 150 }}>
                  <InputLabel id="provincia-label">Província</InputLabel>
                  <Select
                    labelId="provincia-label"
                    label="Província"
                    name="provincia_id"
                    value={formData.provincia_id}
                    onChange={handleChange}
                  >
                    <MenuItem value="">
                      <em>Selecione uma província</em>
                    </MenuItem>
                    {Array.isArray(provincias) && provincias.map(provincia => (
                      <MenuItem key={provincia.id} value={provincia.id}>
                        {provincia.nome}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Gestor */}
              <Grid item xs={12} md={6}>
                <FormControl fullWidth variant="outlined" sx={{ minWidth: 150 }}>
                  <InputLabel id="gestor-label">Gestor (Opcional)</InputLabel>
                  <Select
                    labelId="gestor-label"
                    label="Gestor (Opcional)"
                    name="gestor_id"
                    value={formData.gestor_id}
                    onChange={handleChange}
                  >
                    <MenuItem value="">
                      <em>Sem Gestor</em>
                    </MenuItem>
                    {Array.isArray(gestores) && gestores.map(gestor => (
                      <MenuItem key={gestor.id} value={gestor.id}>
                        {gestor.nome}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  label="Valor da Renda Mensal"
                  name="valor_renda_mensal"
                  value={formData.valor_renda_mensal}
                  onChange={handleChange}
                  type="number"
                  fullWidth
                  required
                  variant="outlined"
                  InputProps={{ inputProps: { min: 0, step: 0.01 } }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  label="Data Início Atividade"
                  name="data_inicio_atividade"
                  type="date"
                  value={formData.data_inicio_atividade}
                  onChange={handleChange}
                  fullWidth
                  required
                  variant="outlined"
                  InputLabelProps={{
                    shrink: true, // Keep label floated
                  }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth variant="outlined">
                  <InputLabel id="status-label">Status</InputLabel>
                  <Select
                    labelId="status-label"
                    label="Status"
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                  >
                    <MenuItem value="Em Operação">Em Operação</MenuItem>
                    <MenuItem value="Reabilitação">Reabilitação</MenuItem>
                    <MenuItem value="Construção">Construção</MenuItem>
                    <MenuItem value="Inoperacional">Inoperacional</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/pacs')}
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={isSubmitting}
                  startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : null}
                >
                  {isSubmitting ? 'Salvando...' : 'Salvar'}
                </Button>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>
    </Container>
  );
};

export default PacForm;