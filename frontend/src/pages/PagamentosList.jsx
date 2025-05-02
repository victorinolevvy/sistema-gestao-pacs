import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api';

// Componente para o status do pagamento
const StatusBadge = ({ status }) => {
  let bgColor = '';
  
  switch (status) {
    case 'Pago':
      bgColor = 'bg-green-100 text-green-800';
      break;
    case 'Pendente':
      bgColor = 'bg-yellow-100 text-yellow-800';
      break;
    case 'Regularizado':
      bgColor = 'bg-blue-100 text-blue-800';
      break;
    case 'Atrasado':
      bgColor = 'bg-red-100 text-red-800';
      break;
    default:
      bgColor = 'bg-gray-100 text-gray-800';
  }
  
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${bgColor}`}>
      {status || 'Não definido'}
    </span>
  );
};

// Componente para o card de filtros
const FilterCard = ({ 
  provincias, 
  pacs, 
  filtro, 
  handleFilterChange, 
  handlePacsPorProvincia,
  aplicarFiltros,
  meses,
  anos
}) => {
  // Estado para controlar a visibilidade dos filtros em dispositivos móveis
  const [showFilters, setShowFilters] = useState(false);

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-800">Filtros</h3>
        <button 
          onClick={() => setShowFilters(!showFilters)}
          className="md:hidden bg-white p-2 rounded-md border border-gray-300 text-gray-500 hover:bg-gray-100"
          aria-label="Mostrar/Esconder Filtros"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
      
      <div className={`p-4 ${showFilters ? 'block' : 'hidden md:block'}`}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Província
            </label>
            <select
              name="provincia"
              value={filtro.provincia}
              onChange={handleFilterChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Todas as províncias</option>
              {provincias.map(provincia => (
                <option key={provincia.id} value={provincia.id}>
                  {provincia.nome}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              PAC
            </label>
            <select
              name="pac"
              value={filtro.pac}
              onChange={handleFilterChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Todos os PACs</option>
              {handlePacsPorProvincia().map(pac => (
                <option key={pac.id} value={pac.id}>
                  {pac.nome}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              name="status"
              value={filtro.status}
              onChange={handleFilterChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Todos</option>
              <option value="Pago">Pago</option>
              <option value="Pendente">Pendente</option>
              <option value="Regularizado">Regularizado</option>
              <option value="Atrasado">Atrasado</option>
            </select>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mês
            </label>
            <select
              name="mes"
              value={filtro.mes}
              onChange={handleFilterChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
              value={filtro.ano}
              onChange={handleFilterChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {anos.map(ano => (
                <option key={ano} value={ano}>
                  {ano}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="flex justify-end">
          <button
            onClick={aplicarFiltros}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center shadow-sm transition-colors duration-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414v6.586a1 1 0 01-1.414 1.414l-2-2A1 1 0 0110 17.586V9.707L3.293 3A1 1 0 013 2.293V4z" />
            </svg>
            Aplicar Filtros
          </button>
        </div>
      </div>
    </div>
  );
};

const PagamentosList = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [pagamentos, setPagamentos] = useState([]);
  const [pacs, setPacs] = useState([]);
  const [provincias, setProvincias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null);
  
  // Estado para controle de paginação
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [itensPorPagina, setItensPorPagina] = useState(10);
  const [totalPaginas, setTotalPaginas] = useState(1);
  
  // Estado para ordenação
  const [ordenacao, setOrdenacao] = useState({
    campo: 'data_pagamento',
    direcao: 'desc'
  });
  
  // Estado para busca rápida
  const [buscaRapida, setBuscaRapida] = useState('');
  
  // Estado para filtros
  const [filtro, setFiltro] = useState({
    provincia: '',
    pac: '',
    mes: '',
    ano: '',
    status: ''
  });
  
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
  
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        
        // Carregar dados de províncias e PACs para filtros
        const [provinciasResponse, pacsResponse] = await Promise.all([
          api.get('/provincias'),
          api.get('/pacs')
        ]);
        
        setProvincias(provinciasResponse.data);
        setPacs(pacsResponse.data);
        
        // Definindo valores padrão para os filtros
        const dataAtual = new Date();
        const mesAtual = dataAtual.getMonth() + 1;
        const anoAtual = dataAtual.getFullYear();
        
        // Verificar se há parâmetros na URL
        const params = new URLSearchParams(location.search);
        const provinciaParam = params.get('provincia');
        const pacParam = params.get('pac');
        const mesParam = params.get('mes');
        const anoParam = params.get('ano');
        const statusParam = params.get('status');
        
        // Usar parâmetros da URL ou valores padrão
        const filtrosIniciais = {
          provincia: provinciaParam || '',
          pac: pacParam || '',
          mes: mesParam || mesAtual,
          ano: anoParam || anoAtual,
          status: statusParam || ''
        };
        
        setFiltro(filtrosIniciais);
        
        // Carregar pagamentos com os filtros
        await carregarPagamentos(filtrosIniciais);
        
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError('Erro ao carregar dados');
        setLoading(false);
      }
    }
    
    loadData();
  }, [location]);
  
  // Função para carregar pagamentos com base nos filtros
  const carregarPagamentos = async (filtrosAtuais = filtro) => {
    try {
      setLoading(true);
      
      let url = `/pagamentos`;
      
      // Se tiver mês e ano, busca por período
      if (filtrosAtuais.mes && filtrosAtuais.ano) {
        url = `/pagamentos/periodo/${filtrosAtuais.mes}/${filtrosAtuais.ano}`;
      }
      
      const response = await api.get(url);
      let pagamentosFiltrados = response.data;
      
      // Aplicando filtros adicionais no frontend
      if (filtrosAtuais.provincia) {
        pagamentosFiltrados = pagamentosFiltrados.filter(pagamento => 
          pagamento.pac?.provincia_id === parseInt(filtrosAtuais.provincia)
        );
      }
      
      if (filtrosAtuais.pac) {
        pagamentosFiltrados = pagamentosFiltrados.filter(pagamento => 
          pagamento.pac_id === parseInt(filtrosAtuais.pac)
        );
      }
      
      if (filtrosAtuais.status) {
        pagamentosFiltrados = pagamentosFiltrados.filter(pagamento => 
          pagamento.status === filtrosAtuais.status
        );
      }
      
      // Aplicar busca rápida se houver
      if (buscaRapida.trim()) {
        const termoBusca = buscaRapida.toLowerCase();
        pagamentosFiltrados = pagamentosFiltrados.filter(pagamento => 
          pagamento.pac?.nome?.toLowerCase().includes(termoBusca) ||
          pagamento.pac?.provincia?.nome?.toLowerCase().includes(termoBusca) ||
          pagamento.observacoes?.toLowerCase().includes(termoBusca)
        );
      }
      
      // Ordenar os pagamentos
      pagamentosFiltrados.sort((a, b) => {
        const valorA = a[ordenacao.campo];
        const valorB = b[ordenacao.campo];
        
        // Tratamento para valores nulos ou indefinidos
        if (!valorA && !valorB) return 0;
        if (!valorA) return 1;
        if (!valorB) return -1;
        
        // Ordenar strings
        if (typeof valorA === 'string') {
          if (ordenacao.direcao === 'asc') {
            return valorA.localeCompare(valorB);
          } else {
            return valorB.localeCompare(valorA);
          }
        }
        
        // Ordenar números e datas
        if (ordenacao.direcao === 'asc') {
          return valorA - valorB;
        } else {
          return valorB - valorA;
        }
      });
      
      // Configurar paginação
      setTotalPaginas(Math.ceil(pagamentosFiltrados.length / itensPorPagina));
      
      setPagamentos(pagamentosFiltrados);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError('Erro ao aplicar filtros');
      setLoading(false);
    }
  };
  
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFiltro(prev => ({ ...prev, [name]: value }));
  };
  
  const handlePacsPorProvincia = () => {
    if (!filtro.provincia) return pacs;
    return pacs.filter(pac => pac.provincia_id == filtro.provincia);
  };
  
  const aplicarFiltros = () => {
    setPaginaAtual(1);
    carregarPagamentos();
    
    // Atualizar a URL com os parâmetros de filtro
    const params = new URLSearchParams();
    if (filtro.provincia) params.set('provincia', filtro.provincia);
    if (filtro.pac) params.set('pac', filtro.pac);
    if (filtro.mes) params.set('mes', filtro.mes);
    if (filtro.ano) params.set('ano', filtro.ano);
    if (filtro.status) params.set('status', filtro.status);
    
    navigate({
      pathname: location.pathname,
      search: params.toString()
    });
  };
  
  // Função para mudar a página
  const mudarPagina = (pagina) => {
    setPaginaAtual(pagina);
  };
  
  // Função para mudar a ordenação
  const alterarOrdenacao = (campo) => {
    setOrdenacao(prev => ({
      campo,
      direcao: prev.campo === campo && prev.direcao === 'asc' ? 'desc' : 'asc'
    }));
  };
  
  // Função para busca rápida
  const handleBuscaRapida = (e) => {
    setBuscaRapida(e.target.value);
    // Reset para a primeira página quando buscar
    setPaginaAtual(1);
    
    // Debounce para não fazer muitas buscas
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      carregarPagamentos();
    }, 300);
  };
  
  // Referência para o timeout da busca
  const timeoutRef = React.useRef(null);
  
  // Função para excluir um pagamento
  const handleExcluirPagamento = async (id) => {
    setConfirmDelete(id);
  };
  
  const confirmarExclusao = async () => {
    if (!confirmDelete) return;
    
    try {
      await api.delete(`/pagamentos/${confirmDelete}`);
      setPagamentos(pagamentos.filter(pagamento => pagamento.id !== confirmDelete));
      setConfirmDelete(null);
    } catch (err) {
      setError('Erro ao excluir pagamento');
    }
  };
  
  // Função para formatar valores em moeda local
  const formatarMoeda = (valor) => {
    return parseFloat(valor).toLocaleString('pt-MZ', {
      style: 'currency',
      currency: 'MZN'
    });
  };
  
  // Função para formatar a data
  const formatarData = (data) => {
    if (!data) return '-';
    return new Date(data).toLocaleDateString('pt-MZ');
  };
  
  // Função para obter o nome do mês a partir do número
  const getNomeMes = (mesNumero) => {
    const mes = meses.find(m => m.valor === parseInt(mesNumero));
    return mes ? mes.nome : '-';
  };
  
  // Função para obter pagamentos da página atual
  const getPagamentosPaginados = () => {
    const inicio = (paginaAtual - 1) * itensPorPagina;
    const fim = inicio + itensPorPagina;
    return pagamentos.slice(inicio, fim);
  };
  
  // Gerar botões de paginação
  const renderizarBotoesPaginacao = () => {
    const botoes = [];
    
    // Botão para a primeira página
    botoes.push(
      <button
        key="first"
        onClick={() => mudarPagina(1)}
        disabled={paginaAtual === 1}
        className={`px-3 py-1 rounded-md ${
          paginaAtual === 1
            ? 'text-gray-400 cursor-not-allowed'
            : 'text-blue-600 hover:bg-blue-100'
        }`}
      >
        &laquo;
      </button>
    );
    
    // Botão para página anterior
    botoes.push(
      <button
        key="prev"
        onClick={() => mudarPagina(paginaAtual - 1)}
        disabled={paginaAtual === 1}
        className={`px-3 py-1 rounded-md ${
          paginaAtual === 1
            ? 'text-gray-400 cursor-not-allowed'
            : 'text-blue-600 hover:bg-blue-100'
        }`}
      >
        &lsaquo;
      </button>
    );
    
    // Botões para páginas específicas
    let startPage = Math.max(1, paginaAtual - 2);
    let endPage = Math.min(totalPaginas, startPage + 4);
    
    if (endPage - startPage < 4) {
      startPage = Math.max(1, endPage - 4);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      botoes.push(
        <button
          key={i}
          onClick={() => mudarPagina(i)}
          className={`px-3 py-1 rounded-md ${
            paginaAtual === i
              ? 'bg-blue-600 text-white'
              : 'text-blue-600 hover:bg-blue-100'
          }`}
        >
          {i}
        </button>
      );
    }
    
    // Botão para próxima página
    botoes.push(
      <button
        key="next"
        onClick={() => mudarPagina(paginaAtual + 1)}
        disabled={paginaAtual === totalPaginas}
        className={`px-3 py-1 rounded-md ${
          paginaAtual === totalPaginas
            ? 'text-gray-400 cursor-not-allowed'
            : 'text-blue-600 hover:bg-blue-100'
        }`}
      >
        &rsaquo;
      </button>
    );
    
    // Botão para a última página
    botoes.push(
      <button
        key="last"
        onClick={() => mudarPagina(totalPaginas)}
        disabled={paginaAtual === totalPaginas}
        className={`px-3 py-1 rounded-md ${
          paginaAtual === totalPaginas
            ? 'text-gray-400 cursor-not-allowed'
            : 'text-blue-600 hover:bg-blue-100'
        }`}
      >
        &raquo;
      </button>
    );
    
    return botoes;
  };
  
  // Renderizar ícone de ordenação
  const renderSortIcon = (campo) => {
    if (ordenacao.campo !== campo) {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      );
    }
    
    if (ordenacao.direcao === 'asc') {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
        </svg>
      );
    } else {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      );
    }
  };
  
  if (loading && pagamentos.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Cabeçalho da Página */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Pagamentos</h2>
          <p className="text-sm text-gray-600">Gerencie todos os pagamentos do sistema</p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => navigate('/pagamentos/registrar')}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center shadow-sm transition-colors duration-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Novo Pagamento
          </button>
          <button
            onClick={() => navigate('/relatorios')}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center shadow-sm transition-colors duration-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Ver Relatórios
          </button>
        </div>
      </div>
      
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm">{error}</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Filtros */}
      <FilterCard 
        provincias={provincias}
        pacs={pacs}
        filtro={filtro}
        handleFilterChange={handleFilterChange}
        handlePacsPorProvincia={handlePacsPorProvincia}
        aplicarFiltros={aplicarFiltros}
        meses={meses}
        anos={anos}
      />
      
      {/* Barra de pesquisa rápida e seleção de itens por página */}
      <div className="flex flex-col md:flex-row justify-between items-center bg-white p-4 rounded-lg shadow-md">
        <div className="w-full md:w-auto mb-4 md:mb-0">
          <div className="relative">
            <input
              type="text"
              value={buscaRapida}
              onChange={handleBuscaRapida}
              placeholder="Busca rápida..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full md:w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="absolute left-3 top-2.5">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">Mostrar</span>
          <select
            value={itensPorPagina}
            onChange={(e) => setItensPorPagina(Number(e.target.value))}
            className="border border-gray-300 rounded px-2 py-1 text-sm"
          >
            <option value="5">5</option>
            <option value="10">10</option>
            <option value="25">25</option>
            <option value="50">50</option>
          </select>
          <span className="text-sm text-gray-600">itens por página</span>
        </div>
      </div>
      
      {/* Tabela de Pagamentos */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead className="bg-gray-50">
              <tr>
                <th 
                  onClick={() => alterarOrdenacao('pac.nome')} 
                  className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                >
                  <div className="flex items-center">
                    PAC
                    {renderSortIcon('pac.nome')}
                  </div>
                </th>
                <th 
                  onClick={() => alterarOrdenacao('pac.provincia.nome')}
                  className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                >
                  <div className="flex items-center">
                    Província
                    {renderSortIcon('pac.provincia.nome')}
                  </div>
                </th>
                <th 
                  onClick={() => alterarOrdenacao('mes_referencia')}
                  className="py-3 px-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                >
                  <div className="flex items-center justify-center">
                    Período
                    {renderSortIcon('mes_referencia')}
                  </div>
                </th>
                <th 
                  onClick={() => alterarOrdenacao('valor_pago')}
                  className="py-3 px-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                >
                  <div className="flex items-center justify-end">
                    Valor Pago
                    {renderSortIcon('valor_pago')}
                  </div>
                </th>
                <th 
                  onClick={() => alterarOrdenacao('data_pagamento')}
                  className="py-3 px-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                >
                  <div className="flex items-center justify-center">
                    Data Pagamento
                    {renderSortIcon('data_pagamento')}
                  </div>
                </th>
                <th 
                  onClick={() => alterarOrdenacao('status')}
                  className="py-3 px-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                >
                  <div className="flex items-center justify-center">
                    Status
                    {renderSortIcon('status')}
                  </div>
                </th>
                <th className="py-3 px-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {getPagamentosPaginados().length > 0 ? (
                getPagamentosPaginados().map(pagamento => (
                  <tr key={pagamento.id} className="hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm text-gray-800">{pagamento.pac?.nome || '-'}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">{pagamento.pac?.provincia?.nome || '-'}</td>
                    <td className="py-3 px-4 text-center text-sm text-gray-600">
                      {getNomeMes(pagamento.mes_referencia)}/{pagamento.ano_referencia}
                    </td>
                    <td className="py-3 px-4 text-right text-sm font-medium text-gray-800">
                      {formatarMoeda(pagamento.valor_pago || 0)}
                    </td>
                    <td className="py-3 px-4 text-center text-sm text-gray-600">
                      {formatarData(pagamento.data_pagamento)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <StatusBadge status={pagamento.status} />
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex justify-center space-x-2">
                        <button 
                          onClick={() => navigate(`/pagamentos/${pagamento.id}`)}
                          className="text-blue-600 hover:text-blue-800 p-1"
                          title="Ver detalhes"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                        <button 
                          onClick={() => navigate(`/pagamentos/editar/${pagamento.id}`)}
                          className="text-green-600 hover:text-green-800 p-1"
                          title="Editar"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button 
                          onClick={() => handleExcluirPagamento(pagamento.id)}
                          className="text-red-600 hover:text-red-800 p-1"
                          title="Excluir"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="py-4 px-4 text-center text-gray-500">
                    Nenhum pagamento encontrado com os filtros aplicados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Paginação */}
        {pagamentos.length > 0 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => mudarPagina(paginaAtual - 1)}
                disabled={paginaAtual === 1}
                className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                  paginaAtual === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                Anterior
              </button>
              <button
                onClick={() => mudarPagina(paginaAtual + 1)}
                disabled={paginaAtual === totalPaginas}
                className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                  paginaAtual === totalPaginas ? 'text-gray-300 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                Próximo
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Mostrando <span className="font-medium">{pagamentos.length > 0 ? (paginaAtual - 1) * itensPorPagina + 1 : 0}</span> a{' '}
                  <span className="font-medium">
                    {Math.min(paginaAtual * itensPorPagina, pagamentos.length)}
                  </span>{' '}
                  de <span className="font-medium">{pagamentos.length}</span> resultados
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Paginação">
                  {renderizarBotoesPaginacao()}
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Modal de confirmação de exclusão */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 overflow-auto bg-black bg-opacity-40 flex items-center justify-center">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-center mb-4">
              <div className="bg-red-100 p-2 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
            </div>
            <h3 className="text-lg font-medium text-center mb-2">Confirmar Exclusão</h3>
            <p className="text-sm text-gray-500 text-center mb-6">
              Tem certeza que deseja excluir este pagamento? Esta ação não pode ser desfeita.
            </p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => setConfirmDelete(null)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
              >
                Cancelar
              </button>
              <button
                onClick={confirmarExclusao}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PagamentosList;