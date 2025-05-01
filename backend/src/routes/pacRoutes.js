const express = require('express');
const router = express.Router();
const pacController = require('../controllers/pacController');
const { auth } = require('../middleware/auth');
const validators = require('../middleware/validators');
const validationHandler = require('../middleware/validationHandler');
const cache = require('../middleware/cache');

// Rotas para PACs
router.get('/', auth, cache(300), pacController.listarPacs);
router.get('/:id', auth, validators.pac.atualizar[0], validationHandler, cache(300), pacController.buscarPacPorId);
router.get('/provincia/:provinciaId', auth, validators.pac.atualizar[0], validationHandler, cache(300), pacController.listarPacsPorProvincia);
router.post('/', auth, validators.pac.criar, validationHandler, pacController.criarPac);
router.put('/:id', auth, validators.pac.atualizar, validationHandler, pacController.atualizarPac);
router.delete('/:id', auth, validators.pac.atualizar[0], validationHandler, pacController.removerPac);

module.exports = router;