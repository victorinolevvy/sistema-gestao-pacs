import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Card,
  CardHeader,
  CardContent,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Typography // Import Typography for loading message
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const PagamentoForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isEditMode = !!id;

  const [formData, setFormData] = useState({
    pac_id: '',
    data_pagamento: new Date().toISOString().split('T')[0],
    valor_pago: '',
    valor_regularizado: '',
    mes_referencia: new Date().getMonth() + 1,
    ano_referencia: new Date().getFullYear(),
    observacoes: '',
    status: 'Pago',
  });

  // State to hold the display name for the user who registered
  const [usuarioRegistroNome, setUsuarioRegistroNome] = useState('');

  const [pacs, setPacs] = useState([]);
  const [provincias, setProvincias] = useState([]);
  const [loading, setLoading] = useState(false); // For initial data load
  const [isSubmitting, setIsSubmitting] = useState(false); // For form submission
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [filtroProvinciaId, setFiltroProvinciaId] = useState('');

  // Opções para meses
  const meses = [
    { valor: 1, nome: 'Janeiro' },
    { valor: 2, nome: 'Fevereiro' },
    { valor: 3, nome: 'Março' },
    { valor: 4, nome: 'Abril' },
    { valor: 5, nome: 'Maio' },
    { valor: 6, nome: 'Junho' },
    { valor: 7, nome: 'Julho' },
    { valor: 8, nome: 'Agosto' },
    { valor: 9, nome: 'Setembro' },
    { valor: 10, nome: 'Outubro' },
    { valor: 11, nome: 'Novembro' },
    { valor: 12, nome: 'Dezembro' }
  ];

  // Opções para anos (últimos 5 anos e próximos 2)
  const anoAtual = new Date().getFullYear();
  const anos = Array.from({ length: 7 }, (_, i) => anoAtual - 3 + i);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError('');

        const [provinciasResponse, pacsResponse] = await Promise.all([
          api.get('/provincias'),
          api.get('/pacs')
        ]);

        setProvincias(provinciasResponse.data);
        setPacs(pacsResponse.data);

        if (isEditMode) {
          const pagamentoResponse = await api.get(`/pagamentos/${id}`);
          const pagamento = pagamentoResponse.data;

          if (pagamento.pac?.provincia_id) {
            setFiltroProvinciaId(pagamento.pac.provincia_id);
          }

          setFormData({
            pac_id: pagamento.pac_id || '',
            data_pagamento: pagamento.data_pagamento ? pagamento.data_pagamento.substring(0, 10) : new Date().toISOString().split('T')[0],
            valor_pago: pagamento.valor_pago || '',
            valor_regularizado: pagamento.valor_regularizado || '',
            mes_referencia: pagamento.mes_referencia || new Date().getMonth() + 1,
            ano_referencia: pagamento.ano_referencia || new Date().getFullYear(),
            observacoes: pagamento.observacoes || '',
            status: pagamento.status || 'Pago',
          });
          // Set the display name from the fetched data
          setUsuarioRegistroNome(pagamento.usuarioRegistro?.nome || 'Desconhecido');
        } else {
          // Set the display name from the logged-in user context
          setUsuarioRegistroNome(user?.nome || 'Desconhecido');
          // No need to set usuario_registro in formData
        }

        setLoading(false);
      } catch (err) {
        console.error(err);
        setError('Erro ao carregar dados. Verifique a conexão e tente novamente.');
        setLoading(false);
      }
    }

    loadData();
  }, [id, isEditMode, user?.nome]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Se o usuário selecionar um PAC, atualizar o filtro de província
    if (name === 'pac_id') {
      const pacSelecionado = pacs.find(pac => pac.id == value);
      if (pacSelecionado && pacSelecionado.provincia_id) {
        setFiltroProvinciaId(pacSelecionado.provincia_id);
      }
    }
  };

  const handleProvinciaChange = (e) => {
    setFiltroProvinciaId(e.target.value);

    // Limpar o PAC selecionado se mudar a província
    setFormData(prev => ({ ...prev, pac_id: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.pac_id || !formData.mes_referencia || !formData.ano_referencia) {
      setError('PAC, mês e ano de referência são obrigatórios');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');
      setSuccess('');

      const dataToSend = {
        pac_id: formData.pac_id,
        data_pagamento: formData.data_pagamento,
        valor_pago: formData.valor_pago ? parseFloat(formData.valor_pago) : 0,
        valor_regularizado: formData.valor_regularizado ? parseFloat(formData.valor_regularizado) : 0,
        mes_referencia: parseInt(formData.mes_referencia),
        ano_referencia: parseInt(formData.ano_referencia),
        observacoes: formData.observacoes,
        status: formData.status
      };

      if (isEditMode) {
        await api.put(`/pagamentos/${id}`, dataToSend);
        setSuccess('Pagamento atualizado com sucesso!');
      } else {
        await api.post('/pagamentos', dataToSend);
        setSuccess('Pagamento registrado com sucesso!');

        // Limpar formulário após criação bem-sucedida
        setFormData({
          pac_id: '',
          data_pagamento: new Date().toISOString().split('T')[0],
          valor_pago: '',
          valor_regularizado: '',
          mes_referencia: new Date().getMonth() + 1,
          ano_referencia: new Date().getFullYear(),
          observacoes: '',
          status: 'Pago',
        });
        // No need to reset usuarioRegistroNome here, it stays the current user
      }

      setIsSubmitting(false);
    } catch (err) {
      console.error(err);
      if (err.response && err.response.data.message.includes('já existe um pagamento')) {
        // Erro de duplicidade
        setError('Já existe um pagamento registrado para este PAC neste período');
      } else {
        setError('Erro ao salvar pagamento');
      }
      setIsSubmitting(false);
    }
  };

  // Filtrar PACs por província
  const pacsFiltrados = filtroProvinciaId
    ? pacs.filter(pac => pac.provincia_id == filtroProvinciaId)
    : pacs;

  // Loading state display
  if (loading) {
    return (
      <Container sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Carregando...</Typography>
      </Container>
    );
  }

  return (
    // Use Material UI Container
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Card>
        <CardHeader
          title={isEditMode ? 'Editar Pagamento' : 'Novo Pagamento'}
          action={
            <Button onClick={() => navigate('/pagamentos')} variant="outlined">
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
              {/* Província Filter */}
              <Grid item xs={12} md={4}>
                <FormControl fullWidth variant="outlined">
                  <InputLabel id="provincia-filter-label">Filtrar por Província</InputLabel>
                  <Select
                    labelId="provincia-filter-label"
                    label="Filtrar por Província"
                    value={filtroProvinciaId}
                    onChange={handleProvinciaChange}
                  >
                    <MenuItem value="">
                      <em>Todas as Províncias</em>
                    </MenuItem>
                    {provincias.map(provincia => (
                      <MenuItem key={provincia.id} value={provincia.id}>
                        {provincia.nome}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* PAC Selection */}
              <Grid item xs={12} md={4}>
                <FormControl fullWidth required variant="outlined">
                  <InputLabel id="pac-label">PAC</InputLabel>
                  <Select
                    labelId="pac-label"
                    label="PAC"
                    name="pac_id"
                    value={formData.pac_id}
                    onChange={handleChange}
                    required
                  >
                    <MenuItem value="">
                      <em>Selecione um PAC</em>
                    </MenuItem>
                    {pacsFiltrados.map(pac => (
                      <MenuItem key={pac.id} value={pac.id}>
                        {pac.nome}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Data Pagamento */}
              <Grid item xs={12} md={4}>
                <TextField
                  label="Data do Pagamento"
                  name="data_pagamento"
                  type="date"
                  value={formData.data_pagamento}
                  onChange={handleChange}
                  fullWidth
                  variant="outlined"
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              {/* Mês Referência */}
              <Grid item xs={12} md={6}>
                <FormControl fullWidth required variant="outlined">
                  <InputLabel id="mes-ref-label">Mês de Referência</InputLabel>
                  <Select
                    labelId="mes-ref-label"
                    label="Mês de Referência"
                    name="mes_referencia"
                    value={formData.mes_referencia}
                    onChange={handleChange}
                    required
                  >
                    {meses.map(mes => (
                      <MenuItem key={mes.valor} value={mes.valor}>
                        {mes.nome}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Ano Referência */}
              <Grid item xs={12} md={6}>
                <FormControl fullWidth required variant="outlined">
                  <InputLabel id="ano-ref-label">Ano de Referência</InputLabel>
                  <Select
                    labelId="ano-ref-label"
                    label="Ano de Referência"
                    name="ano_referencia"
                    value={formData.ano_referencia}
                    onChange={handleChange}
                    required
                  >
                    {anos.map(ano => (
                      <MenuItem key={ano} value={ano}>
                        {ano}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Valor Pago */}
              <Grid item xs={12} md={6}>
                <TextField
                  label="Valor Pago (MZN)"
                  name="valor_pago"
                  type="number"
                  value={formData.valor_pago}
                  onChange={handleChange}
                  fullWidth
                  variant="outlined"
                  InputProps={{ inputProps: { min: 0, step: 0.01 } }}
                />
              </Grid>

              {/* Valor Regularizado */}
              <Grid item xs={12} md={6}>
                <TextField
                  label="Valor Regularizado (MZN)"
                  name="valor_regularizado"
                  type="number"
                  value={formData.valor_regularizado}
                  onChange={handleChange}
                  fullWidth
                  variant="outlined"
                  InputProps={{ inputProps: { min: 0, step: 0.01 } }}
                />
              </Grid>

              {/* Status Pagamento */}
              <Grid item xs={12} md={6}>
                <FormControl fullWidth variant="outlined">
                  <InputLabel id="status-pag-label">Status do Pagamento</InputLabel>
                  <Select
                    labelId="status-pag-label"
                    label="Status do Pagamento"
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                  >
                    {/* TODO: Revisar estas opções */}
                    <MenuItem value="Pago">Pago</MenuItem>
                    <MenuItem value="Pendente">Pendente</MenuItem>
                    <MenuItem value="Regularizado">Regularizado</MenuItem>
                    <MenuItem value="Atrasado">Atrasado</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {/* Registrado Por */}
              <Grid item xs={12} md={6}>
                <TextField
                  label="Registrado por"
                  name="usuario_registro_display" // Use a different name to avoid confusion
                  value={usuarioRegistroNome} // Use the state variable for display
                  fullWidth
                  variant="outlined"
                  InputProps={{
                    readOnly: true,
                  }}
                  disabled
                />
              </Grid>

              {/* Observações */}
              <Grid item xs={12}>
                <TextField
                  label="Observações"
                  name="observacoes"
                  value={formData.observacoes}
                  onChange={handleChange}
                  fullWidth
                  multiline
                  rows={3}
                  variant="outlined"
                />
              </Grid>

              {/* Buttons */}
              <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/pagamentos')}
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

export default PagamentoForm;