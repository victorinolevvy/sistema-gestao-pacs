const request = require('supertest');
const app = require('../../server');
const Usuario = require('../../models/Usuario');
const bcrypt = require('bcrypt');

describe('UsuarioController', () => {
  let token;
  let server;

  beforeAll(async () => {
    // Iniciar servidor para testes
    server = app.listen(3002);

    // Criar usuário de teste
    const senhaHash = await bcrypt.hash('123456', 10);
    await Usuario.create({
      nome: 'Teste',
      email: 'teste@teste.com',
      senha: senhaHash,
      role: 'ADMIN'
    });
  });

  describe('POST /api/usuarios/login', () => {
    it('deve fazer login com sucesso', async () => {
      const response = await request(server)
        .post('/api/usuarios/login')
        .send({
          email: 'teste@teste.com',
          senha: '123456'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('usuario');
      expect(response.body.usuario).toHaveProperty('id');
      expect(response.body.usuario).toHaveProperty('nome');
      expect(response.body.usuario).toHaveProperty('email');
      expect(response.body.usuario).not.toHaveProperty('senha');

      token = response.body.token;
    });

    it('não deve fazer login com credenciais inválidas', async () => {
      const response = await request(server)
        .post('/api/usuarios/login')
        .send({
          email: 'teste@teste.com',
          senha: 'senhaerrada'
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /api/usuarios/perfil', () => {
    it('deve retornar o perfil do usuário', async () => {
      const response = await request(server)
        .get('/api/usuarios/perfil')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('nome');
      expect(response.body).toHaveProperty('email');
      expect(response.body).not.toHaveProperty('senha');
    });

    it('não deve retornar o perfil sem token', async () => {
      const response = await request(server)
        .get('/api/usuarios/perfil');

      expect(response.status).toBe(401);
    });
  });

  describe('POST /api/usuarios', () => {
    it('deve criar um novo usuário', async () => {
      const response = await request(server)
        .post('/api/usuarios')
        .set('Authorization', `Bearer ${token}`)
        .send({
          nome: 'Novo Usuário',
          email: 'novo@teste.com',
          senha: '123456',
          role: 'USER'
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('nome');
      expect(response.body).toHaveProperty('email');
      expect(response.body).not.toHaveProperty('senha');
    });

    it('não deve criar usuário com email duplicado', async () => {
      const response = await request(server)
        .post('/api/usuarios')
        .set('Authorization', `Bearer ${token}`)
        .send({
          nome: 'Usuário Duplicado',
          email: 'teste@teste.com',
          senha: '123456',
          role: 'USER'
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });

  afterAll(async () => {
    // Fechar servidor
    await server.close();
    
    // Limpar banco de dados
    await Usuario.destroy({ where: {} });
  });
}); 