/**
 * Formata um número como moeda (Metical moçambicano).
 * @param {number | string | null | undefined} valor O valor a ser formatado.
 * @returns {string} O valor formatado como moeda ou 'MZN 0.00' se inválido.
 */
export const formatarMoeda = (valor) => {
  const numero = parseFloat(valor);
  if (isNaN(numero)) {
    return 'MZN 0.00'; // Retorna um valor padrão ou lança um erro, dependendo da necessidade
  }
  return new Intl.NumberFormat('pt-MZ', {
    style: 'currency',
    currency: 'MZN',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numero);
};

/**
 * Formata uma data (string ou Date) para o formato DD/MM/YYYY.
 * @param {string | Date | null | undefined} data A data a ser formatada.
 * @returns {string} A data formatada ou uma string vazia se inválida.
 */
export const formatarData = (data) => {
  if (!data) return '';
  try {
    const dataObj = new Date(data);
    // Adiciona verificação para datas inválidas resultantes do construtor Date
    if (isNaN(dataObj.getTime())) {
        return '';
    }
    // Ajuste para UTC para evitar problemas de fuso horário que podem mudar o dia
    const dia = String(dataObj.getUTCDate()).padStart(2, '0');
    const mes = String(dataObj.getUTCMonth() + 1).padStart(2, '0'); // Meses são 0-indexados
    const ano = dataObj.getUTCFullYear();
    return `${dia}/${mes}/${ano}`;
  } catch (error) {
    console.error("Erro ao formatar data:", data, error);
    return ''; // Retorna string vazia em caso de erro
  }
};
