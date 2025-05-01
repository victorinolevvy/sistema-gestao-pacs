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
  Container // Import Container for consistent layout
} from '@mui/material';
import api from '../services/api';

const PacForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [formData, setFormData] = useState({
    nome: '',
    provincia_id: '',
    usuario_id: '', // Campo de seleção para o usuário gestor
    valor_renda_mensal: '',
    status: 'Em Operação' // Atualizar status inicial
  });

  const [provincias, setProvincias] = useState([]);
  const [gestores, setGestores] = useState([]); // Adicionar estado para gestores
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false); // Renomear para clareza
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError('');

        // Load provinces and gestores in parallel
        const [provinciasResponse, gestoresResponse] = await Promise.all([
          api.get('/provincias'),
          // Ensure the correct URL is used here
          api.get('/usuarios/gestores')
        ]);

        console.log('Provincias recebidas:', provinciasResponse.data); // Log para depuração
        setProvincias(provinciasResponse.data || []); // Garantir que é um array

        // Log and set gestores
        console.log('Gestores recebidos:', gestoresResponse.data); // Log para depuração
        setGestores(gestoresResponse.data || []); // Garantir que é um array

        // Se for modo de edição, carregar dados do PAC
        if (isEditMode) {
          const pacResponse = await api.get(`/pacs/${id}`);
          const pac = pacResponse.data;

          setFormData({
            nome: pac.nome || '',
            provincia_id: pac.provincia_id || '',
            usuario_id: pac.usuario_id || '', // Carrega o ID do gestor (número)
            valor_renda_mensal: pac.valor_renda_mensal || '',
            // Garantir que o status carregado seja uma das opções válidas
            status: [
              'Em Operação',
              'Reabilitação',
              'Construção',
              'Inoperacional'
            ].includes(pac.status) ? pac.status : 'Em Operação'
          });
        }

        setLoading(false);
      } catch (err) {
        // Log the error object for more details
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

    if (!formData.nome || !formData.provincia_id) {
      setError('Nome e Província são obrigatórios');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');
      setSuccess('');

      const dataToSend = {
        ...formData,
        valor_renda_mensal: formData.valor_renda_mensal ? parseFloat(formData.valor_renda_mensal) : null,
        provincia_id: parseInt(formData.provincia_id) // Garantir que ID é número
      };

      if (isEditMode) {
        await api.put(`/pacs/${id}`, dataToSend);
        setSuccess('PAC atualizado com sucesso!');
      } else {
        await api.post('/pacs', dataToSend);
        setSuccess('PAC criado com sucesso!');

        // Limpar formulário após criação
        setFormData({
          nome: '',
          provincia_id: '',
          usuario_id: '',
          valor_renda_mensal: '',
          status: 'Em Operação'
        });
      }

      // Opcional: Redirecionar para a lista após salvar
      setTimeout(() => navigate('/pacs'), 1500); // <-- Descomentado

    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Erro ao salvar PAC. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Mostrar loading inicial
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
                  disabled={isEditMode} // Disable if in edit mode
                />
              </Grid>

              <Grid item xs={12} md={6}>
                {/* Add minWidth to ensure label fits */}
                <FormControl fullWidth required variant="outlined" sx={{ minWidth: 150 }}>
                  {/* Add htmlFor attribute */}
                  <InputLabel id="provincia-label" htmlFor="provincia-select">Província</InputLabel>
                  <Select
                    labelId="provincia-label"
                    id="provincia-select" // Adicionar ID para acessibilidade
                    label="Província"
                    name="provincia_id"
                    value={formData.provincia_id}
                    onChange={handleChange}
                    disabled={isEditMode} // Disable if in edit mode
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

              {/* Gestor Dropdown - Replacing the old TextField */}
              <Grid item xs={12} md={6}>
                <FormControl fullWidth variant="outlined" sx={{ minWidth: 150 }}>
                  {/* Add htmlFor attribute */}
                  <InputLabel id="gestor-label" htmlFor="gestor-select">Gestor (Opcional)</InputLabel>
                  <Select
                    labelId="gestor-label"
                    id="gestor-select"
                    label="Gestor (Opcional)"
                    name="usuario_id" // Bind to usuario_id
                    value={formData.usuario_id} // Use usuario_id from state
                    onChange={handleChange}
                  >
                    <MenuItem value="">
                      <em>Sem Gestor</em>
                    </MenuItem>
                    {/* Populate with gestores from state */}
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
                  variant="outlined"
                  InputProps={{ inputProps: { min: 0, step: 0.01 } }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth variant="outlined">
                  {/* Add htmlFor attribute */}
                  <InputLabel id="status-label" htmlFor="status-select">Status</InputLabel>
                  <Select
                    labelId="status-label"
                    id="status-select" // Add id attribute
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