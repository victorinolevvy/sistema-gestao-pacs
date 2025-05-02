// filepath: frontend/src/services/pagamentoService.js
import api from './api'; // Import the configured axios instance

// Função para criar um novo pagamento (agora recebe FormData)
export const criarPagamento = async (formData) => {
  try {
    // Enviar FormData, o Axios/Navegador definirá Content-Type como multipart/form-data
    const response = await api.post('/pagamentos', formData, {
      headers: {
        // Não defina Content-Type manualmente aqui, deixe o navegador/Axios fazer isso
        // 'Content-Type': 'multipart/form-data', // <- REMOVER OU COMENTAR
      },
    });
    return response; // Retorna a resposta completa
  } catch (error) {
    console.error('Erro ao criar pagamento no serviço:', error.response || error.message);
    throw error; // Re-lança o erro para ser tratado no componente
  }
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