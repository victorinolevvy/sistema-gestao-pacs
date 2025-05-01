const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');

// Importar routers dedicados
const usuarioRoutes = require('./usuarioRoutes');
const pacRoutes = require('./pacRoutes');
const pagamentoRoutes = require('./pagamentoRoutes');
const provinciaRoutes = require('./provinciaRoutes');
// const relatorioRoutes = require('./relatorioRoutes'); // Assumindo que existe ou será criado
// const dashboardRoutes = require('./dashboardRoutes'); // Assumindo que existe ou será criado

// Importar controllers (apenas para rotas ainda não migradas para routers dedicados)
const relatorioController = require('../controllers/relatorioController');
const dashboardController = require('../controllers/dashboardController');

// Rotas públicas (exemplo: login pode ficar aqui ou mover para usuarioRoutes sem auth)
// Se mover para usuarioRoutes, remover a linha abaixo
router.post('/usuarios/login', require('../controllers/usuarioController').login);

// Middleware de autenticação para rotas protegidas abaixo
// router.use(auth); // Mover middleware 'auth' para dentro de cada router dedicado conforme necessário

// Montar routers dedicados
router.use('/usuarios', usuarioRoutes); // Usar o router de usuários
router.use('/pacs', pacRoutes); // Usar o router de PACs (já deve estar assim)
router.use('/pagamentos', pagamentoRoutes); // Usar o router de pagamentos (já deve estar assim)
router.use('/provincias', provinciaRoutes); // Usar o router de províncias (já deve estar assim)
// router.use('/relatorios', relatorioRoutes);
// router.use('/dashboard', dashboardRoutes);

// --- Remover definições diretas que foram movidas para os routers dedicados ---
// // Rotas de usuários (REMOVIDAS - agora em usuarioRoutes.js)
// router.get('/usuarios/perfil', usuarioController.obterPerfil);
// router.get('/usuarios', usuarioController.listarUsuarios);
// router.get('/usuarios/:id', usuarioController.buscarUsuarioPorId);
// router.post('/usuarios', usuarioController.criarUsuario);
// router.put('/usuarios/:id', usuarioController.atualizarUsuario);
// router.delete('/usuarios/:id', usuarioController.removerUsuario);

// // Rotas de PACs (REMOVIDAS - agora em pacRoutes.js)
// router.get('/pacs', pacController.listarPacs);
// router.get('/pacs/:id', pacController.buscarPacPorId);
// router.post('/pacs', pacController.criarPac);
// router.put('/pacs/:id', pacController.atualizarPac);
// router.delete('/pacs/:id', pacController.removerPac);

// // Rotas de pagamentos (REMOVIDAS - agora em pagamentoRoutes.js)
// router.get('/pagamentos', pagamentoController.listarPagamentos);
// router.get('/pagamentos/:id', pagamentoController.buscarPagamentoPorId);
// router.post('/pagamentos', pagamentoController.criarPagamento);
// router.put('/pagamentos/:id', pagamentoController.atualizarPagamento);
// router.delete('/pagamentos/:id', pagamentoController.removerPagamento);
// router.get('/pagamentos/periodo/:mes/:ano', pagamentoController.listarPagamentosPorPeriodo);

// // Rotas de províncias (REMOVIDAS - agora em provinciaRoutes.js)
// router.get('/provincias', provinciaController.listarProvincias);
// router.get('/provincias/:id', provinciaController.buscarProvinciaPorId);
// router.post('/provincias', provinciaController.criarProvincia);
// router.put('/provincias/:id', provinciaController.atualizarProvincia);
// router.delete('/provincias/:id', provinciaController.removerProvincia);

// --- Manter rotas ainda não migradas --- 
// Rotas de relatórios
router.get('/relatorios', auth, relatorioController.listar);
router.post('/relatorios', auth, relatorioController.gerar);
router.get('/relatorios/:id', auth, relatorioController.buscarPorId);
router.delete('/relatorios/:id', auth, relatorioController.remover);

// Rota do dashboard
router.get('/dashboard', auth, dashboardController.getDashboardData);

module.exports = router;