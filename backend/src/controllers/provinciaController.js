const { Provincia } = require('../models');

// Listar todas as províncias
exports.listarProvincias = async (req, res) => {
  try {
    const provincias = await Provincia.findAll({
      order: [['nome', 'ASC']]
    });
    return res.status(200).json(provincias);
  } catch (error) {
    console.error('Erro ao listar províncias:', error);
    return res.status(500).json({ message: 'Erro ao listar províncias' });
  }
};

// Buscar província por ID
exports.buscarProvinciaPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const provincia = await Provincia.findByPk(id);
    
    if (!provincia) {
      return res.status(404).json({ message: 'Província não encontrada' });
    }
    
    return res.status(200).json(provincia);
  } catch (error) {
    console.error('Erro ao buscar província:', error);
    return res.status(500).json({ message: 'Erro ao buscar província' });
  }
};

// Criar província
exports.criarProvincia = async (req, res) => {
  try {
    const { nome, codigo } = req.body;
    
    if (!nome) {
      return res.status(400).json({ message: 'O nome da província é obrigatório' });
    }
    
    const provinciaExistente = await Provincia.findOne({ where: { nome } });
    if (provinciaExistente) {
      return res.status(400).json({ message: 'Já existe uma província com este nome' });
    }
    
    const provincia = await Provincia.create({ nome, codigo });
    return res.status(201).json(provincia);
  } catch (error) {
    console.error('Erro ao criar província:', error);
    return res.status(500).json({ message: 'Erro ao criar província' });
  }
};

// Atualizar província
exports.atualizarProvincia = async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, codigo } = req.body;
    
    const provincia = await Provincia.findByPk(id);
    if (!provincia) {
      return res.status(404).json({ message: 'Província não encontrada' });
    }
    
    await provincia.update({ 
      nome: nome || provincia.nome, 
      codigo: codigo || provincia.codigo,
      data_atualizacao: new Date()
    });
    
    return res.status(200).json(provincia);
  } catch (error) {
    console.error('Erro ao atualizar província:', error);
    return res.status(500).json({ message: 'Erro ao atualizar província' });
  }
};

// Remover província
exports.removerProvincia = async (req, res) => {
  try {
    const { id } = req.params;
    
    const provincia = await Provincia.findByPk(id);
    if (!provincia) {
      return res.status(404).json({ message: 'Província não encontrada' });
    }
    
    await provincia.destroy();
    return res.status(200).json({ message: 'Província removida com sucesso' });
  } catch (error) {
    console.error('Erro ao remover província:', error);
    return res.status(500).json({ message: 'Erro ao remover província' });
  }
};