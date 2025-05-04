import React, { useState, useEffect, useRef } from 'react'; // Added useRef for file input
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
import { formatarMoeda } from '../utils/formatters'; // Changed import name

const PagamentoForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isEditMode = !!id;
  const fileInputRef = useRef(null); // Ref for file input

  const [formData, setFormData] = useState({
    pac_id: '',
    data_pagamento: new Date().toISOString().split('T')[0],
    valor_efetuado: '', // Changed from valor_pago/valor_regularizado
    mes_referencia: new Date().getMonth() + 1,
    ano_referencia: new Date().getFullYear(),
    observacoes: '',
    // Removed status
  });

  // State for calculated values (optional, for display)
  const [calculatedValues, setCalculatedValues] = useState({
    valor_devido: null,
    valor_multa: null,
    status: null,
  });

  // State for file upload
  const [comprovativoFile, setComprovativoFile] = useState(null);
  const [existingComprovativoUrl, setExistingComprovativoUrl] = useState(null);

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
            valor_efetuado: pagamento.valor_efetuado || '', // Use valor_efetuado
            mes_referencia: pagamento.mes_referencia || new Date().getMonth() + 1,
            ano_referencia: pagamento.ano_referencia || new Date().getFullYear(),
            observacoes: pagamento.observacoes || '',
            // Removed status
          });
          // Set calculated values for display if needed
          setCalculatedValues({
            valor_devido: pagamento.valor_devido,
            valor_multa: pagamento.valor_multa,
            status: pagamento.status,
          });
          setExistingComprovativoUrl(pagamento.comprovativo_url); // Store existing URL
          setUsuarioRegistroNome(pagamento.usuarioRegistro?.nome || 'Desconhecido');
        } else {
          setUsuarioRegistroNome(user?.nome || 'Desconhecido');
          setCalculatedValues({ valor_devido: null, valor_multa: null, status: null }); // Reset calculated
          setExistingComprovativoUrl(null);
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

  const handleFileChange = (e) => {
    setComprovativoFile(e.target.files[0]);
  };

  const handleProvinciaChange = (e) => {
    setFiltroProvinciaId(e.target.value);

    // Limpar o PAC selecionado se mudar a província
    setFormData(prev => ({ ...prev, pac_id: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.pac_id || !formData.mes_referencia || !formData.ano_referencia || formData.valor_efetuado === '') {
      setError('PAC, mês/ano de referência e valor efetuado são obrigatórios');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');
      setSuccess('');

      // Use FormData to send data including the file
      const submissionData = new FormData();
      submissionData.append('pac_id', formData.pac_id);
      submissionData.append('data_pagamento', formData.data_pagamento);
      submissionData.append('valor_efetuado', parseFloat(formData.valor_efetuado) || 0);
      submissionData.append('mes_referencia', parseInt(formData.mes_referencia));
      submissionData.append('ano_referencia', parseInt(formData.ano_referencia));
      submissionData.append('observacoes', formData.observacoes);
      // Do not send status

      // Append file if selected
      if (comprovativoFile) {
        submissionData.append('comprovativo', comprovativoFile); // Match backend field name
      }

      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      };

      if (isEditMode) {
        // Use POST for update if including file, or PUT if backend supports it with multipart
        // Check backend route definition - assuming PUT supports multipart for now
        await api.put(`/pagamentos/${id}`, submissionData, config);
        setSuccess('Pagamento atualizado com sucesso!');
        // Optionally refetch data to show updated calculated values and comprovativo link
        const updatedResponse = await api.get(`/pagamentos/${id}`);
        setCalculatedValues({
            valor_devido: updatedResponse.data.valor_devido,
            valor_multa: updatedResponse.data.valor_multa,
            status: updatedResponse.data.status,
        });
        setExistingComprovativoUrl(updatedResponse.data.comprovativo_url);
        setComprovativoFile(null); // Clear file input state
        if (fileInputRef.current) fileInputRef.current.value = ''; // Clear file input visually

      } else {
        await api.post('/pagamentos', submissionData, config);
        setSuccess('Pagamento registrado com sucesso!');

        // Limpar formulário após criação bem-sucedida
        setFormData({
          pac_id: '',
          data_pagamento: new Date().toISOString().split('T')[0],
          valor_efetuado: '', // Clear valor_efetuado
          mes_referencia: new Date().getMonth() + 1,
          ano_referencia: new Date().getFullYear(),
          observacoes: '',
        });
        setComprovativoFile(null); // Clear file input state
        if (fileInputRef.current) fileInputRef.current.value = ''; // Clear file input visually
        setCalculatedValues({ valor_devido: null, valor_multa: null, status: null }); // Reset calculated
        setExistingComprovativoUrl(null);
        // Keep usuarioRegistroNome as current user
      }

      setIsSubmitting(false);
    } catch (err) {
      console.error(err);
      let errorMsg = 'Erro ao salvar pagamento';
      if (err.response && err.response.data && err.response.data.message) {
          errorMsg = err.response.data.message;
      }
      setError(errorMsg);
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
                  required // Make date required
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

              {/* Valor Efetuado */}
              <Grid item xs={12} md={6}>
                <TextField
                  label="Valor Efetuado (MZN)" // Changed label
                  name="valor_efetuado" // Changed name
                  type="number"
                  value={formData.valor_efetuado} // Use new state field
                  onChange={handleChange}
                  fullWidth
                  required // Make value required
                  variant="outlined"
                  InputProps={{ inputProps: { min: 0, step: 0.01 } }}
                />
              </Grid>

              {/* Display Calculated Values (Readonly) */}
              <Grid item xs={12} md={6}>
                <TextField
                  label="Valor Devido (Calculado)"
                  value={calculatedValues.valor_devido !== null ? formatarMoeda(calculatedValues.valor_devido) : '-'}
                  fullWidth
                  variant="outlined"
                  InputProps={{ readOnly: true }}
                  disabled
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  label="Multa (Calculada)"
                  value={calculatedValues.valor_multa !== null ? formatarMoeda(calculatedValues.valor_multa) : '-'}
                  fullWidth
                  variant="outlined"
                  InputProps={{ readOnly: true }}
                  disabled
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  label="Status (Calculado)"
                  value={calculatedValues.status || '-'}
                  fullWidth
                  variant="outlined"
                  InputProps={{ readOnly: true }}
                  disabled
                />
              </Grid>

              {/* Registrado Por */}
              <Grid item xs={12} md={4}>
                <TextField
                  label="Registrado por"
                  value={usuarioRegistroNome}
                  fullWidth
                  variant="outlined"
                  InputProps={{ readOnly: true }}
                  disabled
                />
              </Grid>

              {/* Comprovativo Upload */}
              <Grid item xs={12} md={6}>
                <InputLabel shrink htmlFor="comprovativo-input">
                  Comprovativo (Opcional)
                </InputLabel>
                <TextField
                  id="comprovativo-input"
                  name="comprovativo"
                  type="file"
                  onChange={handleFileChange}
                  fullWidth
                  variant="outlined"
                  inputRef={fileInputRef} // Attach ref
                  sx={{ mt: 1 }}
                />
                {existingComprovativoUrl && (
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    Comprovativo atual: <a href={api.defaults.baseURL + existingComprovativoUrl} target="_blank" rel="noopener noreferrer">Ver</a>
                  </Typography>
                )}
              </Grid>

              {/* Observações */}
              <Grid item xs={12} md={6}> {/* Adjusted grid size */}
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