const express = require('express');
const router = express.Router();
const pagamentoController = require('../controllers/pagamentoController');
const { auth } = require('../middleware/auth');
const validators = require('../middleware/validators');
const validationHandler = require('../middleware/validationHandler');
const cache = require('../middleware/cache');
const upload = require('../config/multerConfig'); // Importar multer configurado

// Rotas para pagamentos
router.get('/', auth, cache(300), pagamentoController.listarPagamentos);
router.get('/:id', auth, validators.pagamento.atualizar[0], validationHandler, cache(300), pagamentoController.buscarPagamentoPorId);
router.get('/pac/:pacId', auth, validators.pagamento.criar[0], validationHandler, cache(300), pagamentoController.listarPagamentosPorPac);
router.get('/periodo/:mes/:ano', auth, validators.pagamento.listarPorPeriodo, validationHandler, cache(300), pagamentoController.listarPagamentosPorPeriodo);
router.get('/resumo/:mes/:ano', auth, validators.pagamento.listarPorPeriodo, validationHandler, cache(300), pagamentoController.obterResumoPorProvincia);
router.post('/',
    auth,
    upload.single('comprovativo'), // Middleware multer para o campo 'comprovativo'
    validators.pagamento.criar,
    validationHandler,
    pagamentoController.criarPagamento
);
router.put('/:id', auth, validators.pagamento.atualizar, validationHandler, pagamentoController.atualizarPagamento);

// Add new route for confirming/rejecting payments
router.patch('/:id/confirm',
    auth, // Ensure user is authenticated
    validators.pagamento.atualizar[0], // Reuse ID validation from atualizar
    validationHandler,
    pagamentoController.confirmOrRejectPayment // Call the new controller function
);

router.delete('/:id', auth, validators.pagamento.atualizar[0], validationHandler, pagamentoController.removerPagamento);

module.exports = router;