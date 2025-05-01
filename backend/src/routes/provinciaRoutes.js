const express = require('express');
const router = express.Router();
const provinciaController = require('../controllers/provinciaController');

// Rotas para províncias
router.get('/', provinciaController.listarProvincias);
router.get('/:id', provinciaController.buscarProvinciaPorId);
router.post('/', provinciaController.criarProvincia);
router.put('/:id', provinciaController.atualizarProvincia);
router.delete('/:id', provinciaController.removerProvincia);

module.exports = router;