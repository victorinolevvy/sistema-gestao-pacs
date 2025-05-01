const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuarioController');
const { auth, admin } = require('../middleware/auth');
const { loginLimiter } = require('../middleware/rateLimiter');
const validators = require('../middleware/validators');
const validationHandler = require('../middleware/validationHandler');

// Rota pública para login
router.post('/login', loginLimiter, validators.usuario.login, validationHandler, usuarioController.login);

// Rotas protegidas por autenticação
router.get('/perfil', auth, usuarioController.obterPerfil);
router.put('/alterar-senha', auth, usuarioController.atualizarSenha);

// Rota para listar usuários com perfil 'Gestor' (protegida)
router.get('/gestores', auth, (req, res, next) => {
  console.log('>>> ROTA /usuarios/gestores ACIONADA'); // Log adicionado
  next(); // Passa para o próximo middleware/controller
}, usuarioController.listarGestores);

// Rotas administrativas (requerem permissão de admin)
router.get('/', auth, admin, usuarioController.listarUsuarios);
router.get('/:id', auth, admin, (req, res, next) => {
  console.log(`>>> ROTA /usuarios/:id ACIONADA com id: ${req.params.id}`); // Log adicionado
  next(); // Passa para o próximo middleware/controller
}, validators.usuario.atualizar[0], validationHandler, usuarioController.buscarUsuarioPorId);
router.post('/', auth, admin, validators.usuario.criar, validationHandler, usuarioController.criarUsuario);
router.put('/:id', auth, admin, validators.usuario.atualizar, validationHandler, usuarioController.atualizarUsuario);
router.delete('/:id', auth, admin, validators.usuario.atualizar[0], validationHandler, usuarioController.removerUsuario);

module.exports = router;