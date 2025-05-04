const express = require('express');
const router = express.Router();
const pacController = require('../controllers/pacController');
const { auth } = require('../middleware/auth');
const validators = require('../middleware/validators');
const validationHandler = require('../middleware/validationHandler');
const cache = require('../middleware/cache');

// Rotas para PACs - diminuir o tempo de cache para 60 segundos
router.get('/', auth, cache(60), pacController.listarPacs);
router.get('/provincia/:provinciaId', auth, validators.pac.atualizar[0], validationHandler, cache(60), pacController.listarPacsPorProvincia);
router.get('/:id', auth, validators.pac.atualizar[0], validationHandler, cache(60), pacController.buscarPacPorId);
router.post('/', auth, validators.pac.criar, validationHandler, pacController.criarPac);
router.put('/:id', auth, validators.pac.atualizar, validationHandler, pacController.atualizarPac);
router.delete('/:id', auth, validators.pac.atualizar[0], validationHandler, pacController.removerPac);

module.exports = router;