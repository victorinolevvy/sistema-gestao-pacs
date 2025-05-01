const jwt = require('jsonwebtoken');
require('dotenv').config();

// Middleware para verificar token JWT
const auth = (req, res, next) => {
  try {
    // Obter token do header
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({ message: 'Token não fornecido' });
    }
    
    // O formato esperado é: Bearer <token>
    const parts = authHeader.split(' ');
    
    if (parts.length !== 2) {
      return res.status(401).json({ message: 'Formato de token inválido' });
    }
    
    const [scheme, token] = parts;
    
    if (!/^Bearer$/i.test(scheme)) {
      return res.status(401).json({ message: 'Formato de token inválido' });
    }
    
    // Verificar token
    jwt.verify(token, process.env.JWT_SECRET || 'pacs_secret_key', (err, decoded) => {
      if (err) {
        return res.status(401).json({ message: 'Token inválido ou expirado' });
      }
      
      // Adicionar ID do usuário à requisição
      req.userId = decoded.id;
      req.userEmail = decoded.email;
      req.userRole = decoded.role;
      req.user = decoded;
      
      return next();
    });
  } catch (error) {
    console.error('Erro na autenticação:', error);
    return res.status(500).json({ message: 'Erro na autenticação' });
  }
};

// Middleware para verificar se usuário é admin
const admin = (req, res, next) => {
  try {
    // Usar o perfil ADMIN em maiúsculas, conforme definido no modelo
    if (req.userRole !== 'ADMIN') { 
      return res.status(403).json({ message: 'Acesso negado: requer permissão de administrador' });
    }
    return next();
  } catch (error) {
    console.error('Erro na verificação de admin:', error);
    return res.status(500).json({ message: 'Erro na verificação de permissões' });
  }
};

module.exports = {
  auth,
  admin
};