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
  }, []);
  
  // Função para carregar os dados com base no tipo de relatório selecionado
  const carregarDados = async () => {
    try {
      setLoading(true);
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
      }
      
      setResumoProvincias(dados);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError('Erro ao carregar dados para o relatório');
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
    const promessas = mesesDoTrimestre.map(mes => api.get(`/pagamentos/resumo/${mes}/${ano}`));
    const resultados = await Promise.all(promessas);
    
    // Combinar os resultados de todos os meses do trimestre
    return consolidarDados(resultados.map(r => r.data));
  };
  
  const carregarDadosSemestre = async (semestre, ano) => {
    const mesesDoSemestre = obterMesesDoSemestre(semestre);
    const promessas = mesesDoSemestre.map(mes => api.get(`/pagamentos/resumo/${mes}/${ano}`));
    const resultados = await Promise.all(promessas);
    
    // Combinar os resultados de todos os meses do semestre
    return consolidarDados(resultados.map(r => r.data));
  };
  
  const carregarDadosAnuais = async (ano) => {
    const promessas = Array.from({ length: 12 }, (_, i) => 
      api.get(`/pagamentos/resumo/${i + 1}/${ano}`)
    );
    const resultados = await Promise.all(promessas);
    
    // Combinar os resultados de todos os meses do ano
    return consolidarDados(resultados.map(r => r.data));
  };
  
  // Função para consolidar dados de vários meses
  const consolidarDados = (arrayDeDados) => {
    const dadosConsolidados = {};
    
    // Iterar sobre todos os arrays de dados
    arrayDeDados.forEach(dados => {
      dados.forEach(item => {
        const provinciaId = item.id;
        
        if (!dadosConsolidados[provinciaId]) {
          dadosConsolidados[provinciaId] = {
            id: provinciaId,
            nome: item.nome,
            valor_previsto: 0,
            valor_pago: 0,
            valor_regularizado: 0,
            total_pacs: item.total_pacs
          };
        }
        
        dadosConsolidados[provinciaId].valor_previsto += parseFloat(item.valor_previsto || 0);
        dadosConsolidados[provinciaId].valor_pago += parseFloat(item.valor_pago || 0);
        dadosConsolidados[provinciaId].valor_regularizado += parseFloat(item.valor_regularizado || 0);
      });
    });
    
    return Object.values(dadosConsolidados);
  };
  
  const handleFiltroChange = (e) => {
    const { name, value } = e.target;
    setFiltros(prev => ({ ...prev, [name]: value }));
  };
  
  const aplicarFiltros = () => {
    carregarDados();
  };
  
  const handleTipoRelatorioChange = (e) => {
    setTipoRelatorio(e.target.value);
  };
  
  // Função para formatar valores em moeda local
  const formatarMoeda = (valor) => {
    return parseFloat(valor).toLocaleString('pt-MZ', {
      style: 'currency',
      currency: 'MZN'
    });
  };
  
  // Calcular totais
  const calcularTotais = () => {
    return resumoProvincias.reduce((acc, provincia) => {
      acc.valor_previsto += parseFloat(provincia.valor_previsto || 0);
      acc.valor_pago += parseFloat(provincia.valor_pago || 0);
      acc.valor_regularizado += parseFloat(provincia.valor_regularizado || 0);
      acc.total_pacs += parseInt(provincia.total_pacs || 0);
      return acc;
    }, { valor_previsto: 0, valor_pago: 0, valor_regularizado: 0, total_pacs: 0 });
  };
  
  // Preparar dados para o gráfico de barras
  const dadosGraficoBarras = resumoProvincias.map(item => ({
    nome: item.nome,
    'Valor Previsto': parseFloat(item.valor_previsto || 0),
    'Valor Pago': parseFloat(item.valor_pago || 0),
    'Valor Regularizado': parseFloat(item.valor_regularizado || 0)
  }));
  
  // Preparar dados para o gráfico de pizza (percentual de pagamentos)
  const totais = calcularTotais();
  const dadosGraficoPizza = [
    { name: 'Pago', value: totais.valor_pago },
    { name: 'Pendente', value: Math.max(0, totais.valor_previsto - totais.valor_pago - totais.valor_regularizado) },
    { name: 'Regularizado', value: totais.valor_regularizado }
  ];
  
  // Renderizar controles de filtro conforme o tipo de relatório
  const renderizarFiltros = () => {
    switch (tipoRelatorio) {
      case 'mensal':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mês
              </label>
              <select
                name="mes"
                value={filtros.mes}
                onChange={handleFiltroChange}
                className="w-full border border-gray-300 rounded px-3 py-2"
              >
                {meses.map(mes => (
                  <option key={mes.valor} value={mes.valor}>
                    {mes.nome}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ano
              </label>
              <select
                name="ano"
                value={filtros.ano}
                onChange={handleFiltroChange}
                className="w-full border border-gray-300 rounded px-3 py-2"
              >
                {anos.map(ano => (
                  <option key={ano} value={ano}>
                    {ano}
                  </option>
                ))}
              </select>
            </div>
          </div>
        );
      
      case 'trimestral':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Trimestre
              </label>
              <select
                name="trimestre"
                value={filtros.trimestre}
                onChange={handleFiltroChange}
                className="w-full border border-gray-300 rounded px-3 py-2"
              >
                <option value="1">1º Trimestre (Jan-Mar)</option>
                <option value="2">2º Trimestre (Abr-Jun)</option>
                <option value="3">3º Trimestre (Jul-Set)</option>
                <option value="4">4º Trimestre (Out-Dez)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ano
              </label>
              <select
                name="ano"
                value={filtros.ano}
                onChange={handleFiltroChange}
                className="w-full border border-gray-300 rounded px-3 py-2"
              >
                {anos.map(ano => (
                  <option key={ano} value={ano}>
                    {ano}
                  </option>
                ))}
              </select>
            </div>
          </div>
        );
      
      case 'semestral':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Semestre
              </label>
              <select
                name="semestre"
                value={filtros.semestre}
                onChange={handleFiltroChange}
                className="w-full border border-gray-300 rounded px-3 py-2"
              >
                <option value="1">1º Semestre (Jan-Jun)</option>
                <option value="2">2º Semestre (Jul-Dez)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ano
              </label>
              <select
                name="ano"
                value={filtros.ano}
                onChange={handleFiltroChange}
                className="w-full border border-gray-300 rounded px-3 py-2"
              >
                {anos.map(ano => (
                  <option key={ano} value={ano}>
                    {ano}
                  </option>
                ))}
              </select>
            </div>
          </div>
        );
      
      case 'anual':
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ano
            </label>
            <select
              name="ano"
              value={filtros.ano}
              onChange={handleFiltroChange}
              className="w-full border border-gray-300 rounded px-3 py-2"
            >
              {anos.map(ano => (
                <option key={ano} value={ano}>
                  {ano}
                </option>
              ))}
            </select>
          </div>
        );
      
      default:
        return null;
    }
  };
  
  // Formatar o título do relatório
  const obterTituloRelatorio = () => {
    switch (tipoRelatorio) {
      case 'mensal':
        return `Relatório Mensal: ${meses.find(m => m.valor == filtros.mes)?.nome} de ${filtros.ano}`;
      case 'trimestral':
        return `Relatório Trimestral: ${filtros.trimestre}º Trimestre de ${filtros.ano}`;
      case 'semestral':
        return `Relatório Semestral: ${filtros.semestre}º Semestre de ${filtros.ano}`;
      case 'anual':
        return `Relatório Anual: ${filtros.ano}`;
      default:
        return 'Relatório';
    }
  };
  
  if (loading && resumoProvincias.length === 0) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-2xl font-semibold text-gray-700">Carregando...</div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-blue-600 text-white shadow">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-xl font-bold">Relatórios</h1>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">{obterTituloRelatorio()}</h2>
          <button
            onClick={() => navigate('/pagamentos')}
            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
          >
            Voltar para Pagamentos
          </button>
        </div>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}
        
        {/* Seletor de tipo de relatório e filtros */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h3 className="text-lg font-semibold mb-4">Filtros</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de Relatório
              </label>
              <select
                value={tipoRelatorio}
                onChange={handleTipoRelatorioChange}
                className="w-full border border-gray-300 rounded px-3 py-2"
              >
                <option value="mensal">Mensal</option>
                <option value="trimestral">Trimestral</option>
                <option value="semestral">Semestral</option>
                <option value="anual">Anual</option>
              </select>
            </div>
            
            {/* Renderiza os filtros específicos para cada tipo de relatório */}
            <div className="col-span-3">
              {renderizarFiltros()}
            </div>
          </div>
          
          <div className="flex justify-end">
            <button
              onClick={aplicarFiltros}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
            >
              Gerar Relatório
            </button>
          </div>
        </div>
        
        {/* Cards de resumo */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-gray-500 text-sm">Valor Total Previsto</h3>
            <p className="text-2xl font-bold text-blue-600">{formatarMoeda(totais.valor_previsto)}</p>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-gray-500 text-sm">Valor Total Pago</h3>
            <p className="text-2xl font-bold text-green-600">{formatarMoeda(totais.valor_pago)}</p>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-gray-500 text-sm">Valor Total Regularizado</h3>
            <p className="text-2xl font-bold text-orange-600">{formatarMoeda(totais.valor_regularizado)}</p>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-gray-500 text-sm">Taxa de Pagamento</h3>
            <p className="text-2xl font-bold text-purple-600">
              {totais.valor_previsto > 0 
                ? `${((totais.valor_pago / totais.valor_previsto) * 100).toFixed(1)}%` 
                : '0%'}
            </p>
          </div>
        </div>
        
        {/* Gráficos */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Pagamentos por Província</h3>
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                <BarChart
                  data={dadosGraficoBarras}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="nome" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatarMoeda(value)} />
                  <Legend />
                  <Bar dataKey="Valor Previsto" fill="#8884d8" />
                  <Bar dataKey="Valor Pago" fill="#82ca9d" />
                  <Bar dataKey="Valor Regularizado" fill="#ffc658" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Distribuição de Pagamentos</h3>
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={dadosGraficoPizza}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                  >
                    {dadosGraficoPizza.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatarMoeda(value)} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
        
        {/* Tabela de dados */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead className="bg-gray-100">
                <tr>
                  <th className="py-3 px-4 text-left">Província</th>
                  <th className="py-3 px-4 text-center">Total PACs</th>
                  <th className="py-3 px-4 text-right">Valor Previsto</th>
                  <th className="py-3 px-4 text-right">Valor Pago</th>
                  <th className="py-3 px-4 text-right">Valor Regularizado</th>
                  <th className="py-3 px-4 text-right">% Pagamento</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {resumoProvincias.map((provincia) => {
                  const percentualPagamento = provincia.valor_previsto > 0 
                    ? ((provincia.valor_pago / provincia.valor_previsto) * 100).toFixed(1)
                    : 0;
                    
                  return (
                    <tr key={provincia.id}>
                      <td className="py-3 px-4">{provincia.nome}</td>
                      <td className="py-3 px-4 text-center">{provincia.total_pacs}</td>
                      <td className="py-3 px-4 text-right">{formatarMoeda(provincia.valor_previsto)}</td>
                      <td className="py-3 px-4 text-right">{formatarMoeda(provincia.valor_pago)}</td>
                      <td className="py-3 px-4 text-right">{formatarMoeda(provincia.valor_regularizado)}</td>
                      <td className="py-3 px-4 text-right">
                        <span className={`px-2 py-1 rounded ${
                          percentualPagamento >= 90 ? 'bg-green-100 text-green-800' : 
                          percentualPagamento >= 70 ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-red-100 text-red-800'
                        }`}>
                          {percentualPagamento}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
                <tr className="bg-gray-50 font-bold">
                  <td className="py-3 px-4">TOTAL</td>
                  <td className="py-3 px-4 text-center">{totais.total_pacs}</td>
                  <td className="py-3 px-4 text-right">{formatarMoeda(totais.valor_previsto)}</td>
                  <td className="py-3 px-4 text-right">{formatarMoeda(totais.valor_pago)}</td>
                  <td className="py-3 px-4 text-right">{formatarMoeda(totais.valor_regularizado)}</td>
                  <td className="py-3 px-4 text-right">
                    <span className={`px-2 py-1 rounded ${
                      totais.valor_previsto > 0 && ((totais.valor_pago / totais.valor_previsto) * 100) >= 90 
                        ? 'bg-green-100 text-green-800' 
                        : totais.valor_previsto > 0 && ((totais.valor_pago / totais.valor_previsto) * 100) >= 70 
                        ? 'bg-yellow-100 text-yellow-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {totais.valor_previsto > 0 
                        ? ((totais.valor_pago / totais.valor_previsto) * 100).toFixed(1) 
                        : 0}%
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Relatorios;