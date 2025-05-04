import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import {
  Container,
  Typography,
  Card,
  CardContent,
  CardHeader,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  CircularProgress,
  Box // Import Box for layout
} from '@mui/material'; // Import Material UI components

const Relatorios = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [resumoProvincias, setResumoProvincias] = useState([]);
  const [tipoRelatorio, setTipoRelatorio] = useState('mensal');

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
  
  // Opções para anos (últimos 5 anos)
  const anos = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);
  
  // Filtros padrão
  const [filtros, setFiltros] = useState({
    mes: new Date().getMonth() + 1,
    ano: new Date().getFullYear(),
    trimestre: obterTrimestreAtual(),
    semestre: obterSemestreAtual()
  });
  
  // Cores para os gráficos
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#8dd1e1', '#a4de6c', '#d0ed57'];
  
  // Função para obter o trimestre atual
  function obterTrimestreAtual() {
    const mesAtual = new Date().getMonth() + 1;
    return Math.ceil(mesAtual / 3);
  }
  
  // Função para obter o semestre atual
  function obterSemestreAtual() {
    const mesAtual = new Date().getMonth() + 1;
    return mesAtual <= 6 ? 1 : 2;
  }
  
  // Função para obter meses de um trimestre
  function obterMesesDoTrimestre(trimestre) {
    const inicio = (trimestre - 1) * 3 + 1;
    return [inicio, inicio + 1, inicio + 2];
  }
  
  // Função para obter meses de um semestre
  function obterMesesDoSemestre(semestre) {
    const inicio = (semestre - 1) * 6 + 1;
    return Array.from({ length: 6 }, (_, i) => inicio + i);
  }
  
  useEffect(() => {
    carregarDados();
  }, []); // Run once on mount
  
  // Função para carregar os dados com base no tipo de relatório selecionado
  const carregarDados = async () => {
    try {
      setLoading(true);
      setError(''); // Clear previous errors
      let dados = [];
      
      switch (tipoRelatorio) {
        case 'mensal':
          dados = await carregarDadosMensais(filtros.mes, filtros.ano);
          break;
        case 'trimestral':
          dados = await carregarDadosTrimestre(filtros.trimestre, filtros.ano);
          break;
        case 'semestral':
          dados = await carregarDadosSemestre(filtros.semestre, filtros.ano);
          break;
        case 'anual':
          dados = await carregarDadosAnuais(filtros.ano);
          break;
        default:
          throw new Error('Tipo de relatório inválido');
      }
      
      // Ensure data is always an array
      setResumoProvincias(Array.isArray(dados) ? dados : []);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError('Erro ao carregar dados para o relatório. Verifique a consola para mais detalhes.');
      setResumoProvincias([]); // Clear data on error
      setLoading(false);
    }
  };
  
  // Funções para carregar dados específicos de cada tipo de relatório
  const carregarDadosMensais = async (mes, ano) => {
    const response = await api.get(`/pagamentos/resumo/${mes}/${ano}`);
    return response.data;
  };
  
  const carregarDadosTrimestre = async (trimestre, ano) => {
    const mesesDoTrimestre = obterMesesDoTrimestre(trimestre);
    const promessas = mesesDoTrimestre.map(mes => api.get(`/pagamentos/resumo/${mes}/${ano}`).catch(err => { console.error(`Erro ao buscar mês ${mes}:`, err); return { data: [] }; })); // Handle individual errors
    const resultados = await Promise.all(promessas);
    return consolidarDados(resultados.map(r => r.data));
  };
  
  const carregarDadosSemestre = async (semestre, ano) => {
    const mesesDoSemestre = obterMesesDoSemestre(semestre);
    const promessas = mesesDoSemestre.map(mes => api.get(`/pagamentos/resumo/${mes}/${ano}`).catch(err => { console.error(`Erro ao buscar mês ${mes}:`, err); return { data: [] }; })); // Handle individual errors
    const resultados = await Promise.all(promessas);
    return consolidarDados(resultados.map(r => r.data));
  };
  
  const carregarDadosAnuais = async (ano) => {
    const promessas = Array.from({ length: 12 }, (_, i) =>
      api.get(`/pagamentos/resumo/${i + 1}/${ano}`).catch(err => { console.error(`Erro ao buscar mês ${i + 1}:`, err); return { data: [] }; }) // Handle individual errors
    );
    const resultados = await Promise.all(promessas);
    return consolidarDados(resultados.map(r => r.data));
  };
  
  // Função para consolidar dados de vários meses
  const consolidarDados = (arrayDeDados) => {
    const dadosConsolidados = {};
    
    // Iterar sobre todos os arrays de dados
    arrayDeDados.forEach(dados => {
      if (!Array.isArray(dados)) return; // Skip if data is not an array
      dados.forEach(item => {
        if (!item || typeof item !== 'object' || !item.id) return; // Skip invalid items
        const provinciaId = item.id;
        
        if (!dadosConsolidados[provinciaId]) {
          dadosConsolidados[provinciaId] = {
            id: provinciaId,
            nome: item.nome || 'Desconhecido',
            totalPago: 0,
            totalDevido: 0,
            // Add other fields if needed from your API response, e.g., valor_previsto
            valor_previsto: 0,
            valor_regularizado: 0,
            total_pacs: item.total_pacs || 0
          };
        }
        
        // Use the correct keys from your API response
        dadosConsolidados[provinciaId].totalPago += parseFloat(item.valor_pago || 0);
        dadosConsolidados[provinciaId].totalDevido += parseFloat(item.valor_previsto || 0); // Assuming valor_previsto is totalDevido
        dadosConsolidados[provinciaId].valor_regularizado += parseFloat(item.valor_regularizado || 0);
      });
    });
    
    return Object.values(dadosConsolidados);
  };
  
  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFiltros(prev => ({ ...prev, [name]: value }));
  };
  
  const handleTipoRelatorioChange = (event) => {
    setTipoRelatorio(event.target.value);
    // Reset filters when type changes? Optional, depends on desired UX
    // setFiltros({ ...initialFilters });
  };
  
  // Função para formatar valores em moeda local
  const formatarMoeda = (valor) => {
    // Ensure valor is a number before formatting
    const numericValue = parseFloat(valor);
    if (isNaN(numericValue)) {
      return 'N/A'; // Or some other placeholder for invalid numbers
    }
    return numericValue.toLocaleString('pt-MZ', {
      style: 'currency',
      currency: 'MZN'
    });
  };
  
  // Calcular totais - Adjust keys based on consolidarDados output
  const calcularTotais = () => {
    return resumoProvincias.reduce((acc, provincia) => {
      acc.totalPago += parseFloat(provincia.totalPago || 0);
      acc.totalDevido += parseFloat(provincia.totalDevido || 0);
      acc.valor_regularizado += parseFloat(provincia.valor_regularizado || 0);
      acc.total_pacs += parseInt(provincia.total_pacs || 0);
      return acc;
    }, { totalPago: 0, totalDevido: 0, valor_regularizado: 0, total_pacs: 0 });
  };
  
  // Preparar dados para o gráfico de barras - Adjust keys
  const dadosGraficoBarras = resumoProvincias.map(item => ({
    nome: item.nome,
    'Total Pago': item.totalPago,
    'Total Devido': item.totalDevido,
    'Valor Regularizado': item.valor_regularizado
  }));
  
  // Preparar dados para o gráfico de pizza (percentual de pagamentos) - Adjust keys
  const totais = calcularTotais();
  const dadosGraficoPizza = [
    { name: 'Pago', value: totais.totalPago },
    { name: 'Pendente', value: Math.max(0, totais.totalDevido - totais.totalPago - totais.valor_regularizado) },
    { name: 'Regularizado', value: totais.valor_regularizado }
  ].filter(item => item.value > 0); // Filter out zero values for better visualization
  
  if (loading && resumoProvincias.length === 0) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <CircularProgress />
      </Container>
    );
  }
  
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Relatórios
      </Typography>

      {/* Card de Filtros */}
      <Card sx={{ mb: 3 }}>
        <CardHeader title="Filtros" />
        <CardContent>
          <Grid container spacing={3} alignItems="flex-end">
            {/* Seletor de Tipo de Relatório */}
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth variant="outlined">
                <InputLabel id="tipo-relatorio-label">Tipo de Relatório</InputLabel>
                <Select
                  labelId="tipo-relatorio-label"
                  id="tipo-relatorio-select"
                  value={tipoRelatorio}
                  label="Tipo de Relatório"
                  onChange={handleTipoRelatorioChange}
                >
                  <MenuItem value="mensal">Mensal</MenuItem>
                  <MenuItem value="trimestral">Trimestral</MenuItem>
                  <MenuItem value="semestral">Semestral</MenuItem>
                  <MenuItem value="anual">Anual</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Filtros Condicionais */}
            {tipoRelatorio === 'mensal' && (
              <>
                <Grid item xs={12} sm={6} md={3}>
                  <FormControl fullWidth variant="outlined">
                    <InputLabel id="mes-label">Mês</InputLabel>
                    <Select
                      labelId="mes-label"
                      name="mes"
                      value={filtros.mes}
                      label="Mês"
                      onChange={handleFilterChange}
                    >
                      {meses.map(mes => (
                        <MenuItem key={mes.valor} value={mes.valor}>{mes.nome}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <FormControl fullWidth variant="outlined">
                    <InputLabel id="ano-label">Ano</InputLabel>
                    <Select
                      labelId="ano-label"
                      name="ano"
                      value={filtros.ano}
                      label="Ano"
                      onChange={handleFilterChange}
                    >
                      {anos.map(ano => (
                        <MenuItem key={ano} value={ano}>{ano}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </>
            )}

            {tipoRelatorio === 'trimestral' && (
              <>
                <Grid item xs={12} sm={6} md={3}>
                  <FormControl fullWidth variant="outlined">
                    <InputLabel id="trimestre-label">Trimestre</InputLabel>
                    <Select
                      labelId="trimestre-label"
                      name="trimestre"
                      value={filtros.trimestre}
                      label="Trimestre"
                      onChange={handleFilterChange}
                    >
                      {[1, 2, 3, 4].map(trimestre => (
                        <MenuItem key={trimestre} value={trimestre}>{trimestre}º Trimestre</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                 <Grid item xs={12} sm={6} md={3}>
                  <FormControl fullWidth variant="outlined">
                    <InputLabel id="ano-label">Ano</InputLabel>
                    <Select
                      labelId="ano-label"
                      name="ano"
                      value={filtros.ano}
                      label="Ano"
                      onChange={handleFilterChange}
                    >
                      {anos.map(ano => (
                        <MenuItem key={ano} value={ano}>{ano}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </>
            )}

             {tipoRelatorio === 'semestral' && (
              <>
                <Grid item xs={12} sm={6} md={3}>
                  <FormControl fullWidth variant="outlined">
                    <InputLabel id="semestre-label">Semestre</InputLabel>
                    <Select
                      labelId="semestre-label"
                      name="semestre"
                      value={filtros.semestre}
                      label="Semestre"
                      onChange={handleFilterChange}
                    >
                      {[1, 2].map(semestre => (
                        <MenuItem key={semestre} value={semestre}>{semestre}º Semestre</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                 <Grid item xs={12} sm={6} md={3}>
                  <FormControl fullWidth variant="outlined">
                    <InputLabel id="ano-label">Ano</InputLabel>
                    <Select
                      labelId="ano-label"
                      name="ano"
                      value={filtros.ano}
                      label="Ano"
                      onChange={handleFilterChange}
                    >
                      {anos.map(ano => (
                        <MenuItem key={ano} value={ano}>{ano}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </>
            )}

            {tipoRelatorio === 'anual' && (
              <Grid item xs={12} sm={6} md={3}>
                 <FormControl fullWidth variant="outlined">
                    <InputLabel id="ano-label">Ano</InputLabel>
                    <Select
                      labelId="ano-label"
                      name="ano"
                      value={filtros.ano}
                      label="Ano"
                      onChange={handleFilterChange}
                    >
                      {anos.map(ano => (
                        <MenuItem key={ano} value={ano}>{ano}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
              </Grid>
            )}

            {/* Botão Aplicar Filtros */}
            <Grid item xs={12} md={3} sx={{ display: 'flex', justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
              <Button variant="contained" color="primary" onClick={carregarDados} disabled={loading}>
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Aplicar Filtros'}
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Seção de Gráficos */}
      {loading ? (
         <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
           <CircularProgress />
         </Box>
      ) : error ? (
        <Typography color="error" sx={{ mt: 2 }}>{error}</Typography>
      ) : resumoProvincias.length === 0 ? (
         <Typography sx={{ mt: 2 }}>Nenhum dado encontrado para os filtros selecionados.</Typography>
      ) : (
        <Grid container spacing={3}>
          {/* Gráfico de Barras */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader title="Pagamentos por Província" />
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={dadosGraficoBarras} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="nome" />
                    {/* Adjust YAxis formatting if needed */}
                    <YAxis tickFormatter={(value) => formatarMoeda(value).replace(/\s*MZN/,'')} />
                    <Tooltip formatter={(value, name) => [formatarMoeda(value), name]} />
                    <Legend />
                    {/* Use the adjusted keys from dadosGraficoBarras */}
                    <Bar dataKey="Total Pago" fill="#8884d8" name="Total Pago" />
                    <Bar dataKey="Total Devido" fill="#82ca9d" name="Total Devido" />
                     {/* Add Bar for 'Valor Regularizado' if needed */}
                     {/* <Bar dataKey="Valor Regularizado" fill="#ffc658" name="Valor Regularizado" /> */}
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>

          {/* Gráfico de Pizza */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader title="Distribuição Geral de Pagamentos" />
              <CardContent>
                 <ResponsiveContainer width="100%" height={300}>
                   <PieChart>
                     <Pie
                       data={dadosGraficoPizza}
                       cx="50%"
                       cy="50%"
                       labelLine={false}
                       outerRadius={80}
                       fill="#8884d8"
                       dataKey="value"
                       nameKey="name"
                       label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                     >
                       {dadosGraficoPizza.map((entry, index) => (
                         <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                       ))}
                     </Pie>
                     <Tooltip formatter={(value) => formatarMoeda(value)} />
                     <Legend />
                   </PieChart>
                 </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Container>
  );
};

export default Relatorios;