// filepath: frontend/src/services/pagamentoService.js
import api from './api'; // Import the configured axios instance

// Create a new payment record
export const criarPagamento = (pagamentoData) => {
    return api.post('/pagamentos', pagamentoData);
};

// Confirm or Reject a payment
export const confirmarOuRejeitarPagamento = (pagamentoId, status) => {
    // status should be 'CONFIRMADO' or 'REJEITADO'
    return api.patch(`/pagamentos/${pagamentoId}/confirm`, { status_confirmacao: status });
};

// Add other Pagamento-related functions as needed
// export const getAllPagamentos = () => api.get('/pagamentos');
// export const getPagamentoById = (id) => api.get(`/pagamentos/${id}`);
// export const updatePagamento = (id, data) => api.put(`/pagamentos/${id}`, data);
// export const deletePagamento = (id) => api.delete(`/pagamentos/${id}`);
// export const getPagamentosPorPac = (pacId) => api.get(`/pagamentos/pac/${pacId}`);
// export const getPagamentosPorPeriodo = (mes, ano) => api.get(`/pagamentos/periodo/${mes}/${ano}`);