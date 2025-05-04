import React, { useState, useEffect, useRef } from 'react'; // Added useRef
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api';
import { formatarMoeda, formatarData } from '../utils/formatters'; // Import formatters
import { DownloadSimple } from '@phosphor-icons/react'; // Import icon for download

// Componente para o status do pagamento
const StatusBadge = ({ status }) => {
  let bgColor = '';
  let text = status || 'Não definido';

  switch (status) {
    case 'PAGO':
      bgColor = 'bg-green-100 text-green-800';
      text = 'Pago';
      break;
    case 'PENDENTE':
      bgColor = 'bg-yellow-100 text-yellow-800';
      text = 'Pendente';
      break;
    case 'PAGO_PARCIALMENTE': // Added
      bgColor = 'bg-blue-100 text-blue-800';
      text = 'Pago Parcialmente';
      break;
    case 'ATRASADO': // Keep or remove depending on backend logic
      bgColor = 'bg-red-100 text-red-800';
      text = 'Atrasado'; // Or maybe map to PENDENTE/PAGO_PARCIALMENTE?
      break;
    case 'VALOR_DEVIDO_INVALIDO': // Added
        bgColor = 'bg-orange-100 text-orange-800';
        text = 'Valor Inválido';
        break;
    // Removed 'Regularizado' as it might be covered by PAGO/PAGO_PARCIALMENTE
    default:
      bgColor = 'bg-gray-100 text-gray-800';
  }

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${bgColor}`}>
      {text}
    </span>
  );
};

// Componente para o card de filtros
const FilterCard = ({ 
  // ... existing props ...
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
              <option value="PAGO">Pago</option>
              <option value="PENDENTE">Pendente</option>
              <option value="PAGO_PARCIALMENTE">Pago Parcialmente</option>
              {/* <option value="ATRASADO">Atrasado</option> */}
              <option value="VALOR_DEVIDO_INVALIDO">Valor Inválido</option>
              {/* Removed Regularizado */}
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
  // ... existing state variables ...
  const navigate = useNavigate();
  const location = useLocation();
  const [pagamentos, setPagamentos] = useState([]);
  const [pacs, setPacs] = useState([]);
  const [provincias, setProvincias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [itensPorPagina, setItensPorPagina] = useState(10);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [ordenacao, setOrdenacao] = useState({
    campo: 'data_pagamento', // Default sort field
    direcao: 'desc'
  });
  const [buscaRapida, setBuscaRapida] = useState('');
  const [filtro, setFiltro] = useState({
    provincia: '',
    pac: '',
    mes: '',
    ano: '',
    status: ''
  });
  const timeoutRef = useRef(null); // Use useRef

  // ... meses and anos arrays remain the same ...
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
  const anos = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

  // ... useEffect to load initial data ...
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        
        const [provinciasResponse, pacsResponse] = await Promise.all([
          api.get('/provincias'),
          api.get('/pacs')
        ]);
        
        setProvincias(provinciasResponse.data);
        setPacs(pacsResponse.data);
        
        const dataAtual = new Date();
        const mesAtual = dataAtual.getMonth() + 1;
        const anoAtual = dataAtual.getFullYear();
        
        const params = new URLSearchParams(location.search);
        const filtrosIniciais = {
          provincia: params.get('provincia') || '',
          pac: params.get('pac') || '',
          mes: params.get('mes') || mesAtual,
          ano: params.get('ano') || anoAtual,
          status: params.get('status') || ''
        };
        
        setFiltro(filtrosIniciais);
        await carregarPagamentos(filtrosIniciais, 1, itensPorPagina, ordenacao); // Pass pagination/sort
        
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError('Erro ao carregar dados');
        setLoading(false);
      }
    }
    
    loadData();
  // Depend on location, itensPorPagina to reload if these change
  }, [location, itensPorPagina]);

  // Função para carregar pagamentos com base nos filtros, paginação e ordenação
  const carregarPagamentos = async (
    filtrosAtuais = filtro, 
    pagina = paginaAtual, 
    limite = itensPorPagina, 
    ordem = ordenacao
  ) => {
    try {
      setLoading(true);
      
      // Build query parameters
      const params = {
        page: pagina,
        limit: limite,
        sortBy: ordem.campo,
        sortOrder: ordem.direcao,
        search: buscaRapida.trim(), // Add search term
        provinciaId: filtrosAtuais.provincia,
        pacId: filtrosAtuais.pac,
        mes: filtrosAtuais.mes,
        ano: filtrosAtuais.ano,
        status: filtrosAtuais.status
      };

      // Remove empty params
      Object.keys(params).forEach(key => (params[key] === '' || params[key] === null || params[key] === undefined) && delete params[key]);

      const response = await api.get(`/pagamentos`, { params });
      
      setPagamentos(response.data.pagamentos || []);
      setTotalPaginas(response.data.totalPages || 1);
      setPaginaAtual(response.data.currentPage || 1);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError('Erro ao carregar ou filtrar pagamentos');
      setPagamentos([]); // Clear data on error
      setTotalPaginas(1);
      setPaginaAtual(1);
      setLoading(false);
    }
  };

  // ... handleFilterChange, handlePacsPorProvincia remain the same ...
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFiltro(prev => ({ ...prev, [name]: value }));
  };
  
  const handlePacsPorProvincia = () => {
    if (!filtro.provincia) return pacs;
    return pacs.filter(pac => pac.provincia_id == filtro.provincia);
  };

  const aplicarFiltros = () => {
    setPaginaAtual(1); // Reset to first page when applying filters
    // Update URL
    const params = new URLSearchParams();
    if (filtro.provincia) params.set('provincia', filtro.provincia);
    if (filtro.pac) params.set('pac', filtro.pac);
    if (filtro.mes) params.set('mes', filtro.mes);
    if (filtro.ano) params.set('ano', filtro.ano);
    if (filtro.status) params.set('status', filtro.status);
    navigate({ pathname: location.pathname, search: params.toString() });
    // Reload data is handled by useEffect dependency on location
  };

  // Função para mudar a página
  const mudarPagina = (pagina) => {
    if (pagina >= 1 && pagina <= totalPaginas) {
      setPaginaAtual(pagina);
      carregarPagamentos(filtro, pagina, itensPorPagina, ordenacao); // Reload data for new page
    }
  };

  // Função para mudar a ordenação
  const alterarOrdenacao = (campo) => {
    const novaDirecao = ordenacao.campo === campo && ordenacao.direcao === 'asc' ? 'desc' : 'asc';
    const novaOrdenacao = { campo, direcao: novaDirecao };
    setOrdenacao(novaOrdenacao);
    carregarPagamentos(filtro, 1, itensPorPagina, novaOrdenacao); // Reload data with new sort, reset to page 1
  };

  // Função para busca rápida
  const handleBuscaRapida = (e) => {
    const novoTermo = e.target.value;
    setBuscaRapida(novoTermo);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setPaginaAtual(1); // Reset page on search
      carregarPagamentos(filtro, 1, itensPorPagina, ordenacao); // Reload data with search term
    }, 500); // Debounce search
  };

  // ... handleExcluirPagamento, confirmarExclusao remain the same ...
  const handleExcluirPagamento = async (id) => {
    setConfirmDelete(id);
  };
  
  const confirmarExclusao = async () => {
    if (!confirmDelete) return;
    
    try {
      await api.delete(`/pagamentos/${confirmDelete}`);
      // Reload data after delete to reflect changes and pagination
      carregarPagamentos(filtro, paginaAtual, itensPorPagina, ordenacao);
      setConfirmDelete(null);
    } catch (err) {
      setError('Erro ao excluir pagamento');
      setConfirmDelete(null); // Close modal even on error
    }
  };

  // REMOVED local formatarMoeda and formatarData, using imported ones

  // ... getNomeMes remains the same ...
  const getNomeMes = (mesNumero) => {
    const mes = meses.find(m => m.valor === parseInt(mesNumero));
    return mes ? mes.nome : '-';
  };

  // REMOVED getPagamentosPaginados, data is now fetched paginated

  // ... renderizarBotoesPaginacao remains the same ...
  const renderizarBotoesPaginacao = () => {
    const botoes = [];
    
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

  // ... renderSortIcon remains the same ...
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

  // ... Loading display remains the same ...
  if (loading && pagamentos.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ... Header ... */}
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
      {/* ... Error Alert ... */}
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
      {/* ... FilterCard ... */}
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
      {/* ... Search Bar and Items per Page ... */}
      <div className="flex flex-col md:flex-row justify-between items-center bg-white p-4 rounded-lg shadow-md">
        <div className="w-full md:w-auto mb-4 md:mb-0">
          <div className="relative">
            <input
              type="text"
              value={buscaRapida}
              onChange={handleBuscaRapida}
              placeholder="Busca rápida (PAC, Província...)" // Updated placeholder
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
            onChange={(e) => {
              const novoLimite = Number(e.target.value);
              setItensPorPagina(novoLimite);
              setPaginaAtual(1); // Reset page when changing limit
              // Reload data is handled by useEffect dependency
            }}
            className="border border-gray-300 rounded px-2 py-1 text-sm"
          >
            <option value="10">10</option>
            <option value="25">25</option>
            <option value="50">50</option>
            <option value="100">100</option> {/* Added 100 */}
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
                {/* PAC Header */}
                <th 
                  onClick={() => alterarOrdenacao('pac.nome')} 
                  className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                >
                  <div className="flex items-center">
                    PAC
                    {renderSortIcon('pac.nome')}
                  </div>
                </th>
                {/* Província Header */}
                <th 
                  onClick={() => alterarOrdenacao('pac.provincia.nome')}
                  className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                >
                  <div className="flex items-center">
                    Província
                    {renderSortIcon('pac.provincia.nome')}
                  </div>
                </th>
                {/* Período Header */}
                <th 
                  onClick={() => alterarOrdenacao('ano_referencia')} // Sort by year first, then month implicitly
                  className="py-3 px-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                >
                  <div className="flex items-center justify-center">
                    Período
                    {renderSortIcon('ano_referencia')}
                  </div>
                </th>
                {/* Valor Devido Header (Added) */}
                <th 
                  onClick={() => alterarOrdenacao('valor_devido')}
                  className="py-3 px-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                >
                  <div className="flex items-center justify-end">
                    Valor Devido
                    {renderSortIcon('valor_devido')}
                  </div>
                </th>
                {/* Valor Efetuado Header (Renamed) */}
                <th 
                  onClick={() => alterarOrdenacao('valor_efetuado')}
                  className="py-3 px-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                >
                  <div className="flex items-center justify-end">
                    Valor Efetuado
                    {renderSortIcon('valor_efetuado')}
                  </div>
                </th>
                {/* Valor Multa Header (Added) */}
                <th 
                  onClick={() => alterarOrdenacao('valor_multa')}
                  className="py-3 px-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                >
                  <div className="flex items-center justify-end">
                    Multa
                    {renderSortIcon('valor_multa')}
                  </div>
                </th>
                {/* Data Pagamento Header */}
                <th 
                  onClick={() => alterarOrdenacao('data_pagamento')}
                  className="py-3 px-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                >
                  <div className="flex items-center justify-center">
                    Data Pag.
                    {renderSortIcon('data_pagamento')}
                  </div>
                </th>
                {/* Status Header */}
                <th 
                  onClick={() => alterarOrdenacao('status')}
                  className="py-3 px-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                >
                  <div className="flex items-center justify-center">
                    Status
                    {renderSortIcon('status')}
                  </div>
                </th>
                 {/* Comprovativo Header (Added) */}
                 <th className="py-3 px-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Comp.
                </th>
                {/* Ações Header */}
                <th className="py-3 px-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {pagamentos.length > 0 ? (
                pagamentos.map(pagamento => (
                  <tr key={pagamento.id} className="hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm text-gray-800 whitespace-nowrap">{pagamento.pac?.nome || '-'}</td>
                    <td className="py-3 px-4 text-sm text-gray-600 whitespace-nowrap">{pagamento.pac?.provincia?.nome || '-'}</td>
                    <td className="py-3 px-4 text-center text-sm text-gray-600 whitespace-nowrap">
                      {getNomeMes(pagamento.mes_referencia)}/{pagamento.ano_referencia}
                    </td>
                    {/* Valor Devido Cell (Added) */}
                    <td className="py-3 px-4 text-right text-sm font-medium text-gray-800 whitespace-nowrap">
                      {formatarMoeda(pagamento.valor_devido)}
                    </td>
                    {/* Valor Efetuado Cell (Renamed) */}
                    <td className="py-3 px-4 text-right text-sm font-medium text-blue-700 whitespace-nowrap">
                      {formatarMoeda(pagamento.valor_efetuado)}
                    </td>
                    {/* Valor Multa Cell (Added) */}
                    <td className="py-3 px-4 text-right text-sm font-medium text-red-600 whitespace-nowrap">
                      {formatarMoeda(pagamento.valor_multa)}
                    </td>
                    {/* Data Pagamento Cell */}
                    <td className="py-3 px-4 text-center text-sm text-gray-600 whitespace-nowrap">
                      {formatarData(pagamento.data_pagamento)}
                    </td>
                    {/* Status Cell */}
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <StatusBadge status={pagamento.status} />
                    </td>
                    {/* Comprovativo Cell (Added) */}
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      {pagamento.comprovativo_url ? (
                        <a 
                          href={`${api.defaults.baseURL}${pagamento.comprovativo_url}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 inline-block p-1" 
                          title="Ver Comprovativo"
                        >
                          <DownloadSimple size={20} />
                        </a>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    {/* Ações Cell */}
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <div className="flex justify-center space-x-1">
                        {/* View Button - Consider removing if details are in the list */}
                        {/* <button 
                          onClick={() => navigate(`/pagamentos/${pagamento.id}`)}
                          className="text-blue-600 hover:text-blue-800 p-1"
                          title="Ver detalhes"
                        >
                          <svg>...</svg>
                        </button> */}
                        {/* Edit Button */}
                        <button 
                          onClick={() => navigate(`/pagamentos/editar/${pagamento.id}`)}
                          className="text-green-600 hover:text-green-800 p-1"
                          title="Editar"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        {/* Delete Button */}
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
                  <td colSpan="10" className="py-4 px-4 text-center text-gray-500"> {/* Updated colSpan */} 
                    {loading ? 'Carregando...' : 'Nenhum pagamento encontrado com os filtros aplicados.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* ... Pagination ... */}
        {pagamentos.length > 0 && totalPaginas > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200">
            {/* ... Mobile Pagination ... */}
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
            {/* ... Desktop Pagination ... */}
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Página <span className="font-medium">{paginaAtual}</span> de <span className="font-medium">{totalPaginas}</span>
                  {/* Mostrando <span className="font-medium">{pagamentos.length > 0 ? (paginaAtual - 1) * itensPorPagina + 1 : 0}</span> a{' '} */}
                  {/* <span className="font-medium">
                    {Math.min(paginaAtual * itensPorPagina, pagamentos.length)} // This calculation is wrong if data is fetched paginated
                  </span>{' '} */}
                  {/* de <span className="font-medium">{pagamentos.length}</span> resultados // This is also wrong */}
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
      
      {/* ... Confirmation Modal ... */}
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