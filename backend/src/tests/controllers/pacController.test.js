const request = require('supertest');
const app = require('../../server');
const Pac = require('../../models/Pac');
const Usuario = require('../../models/Usuario');
const bcrypt = require('bcrypt');

let server;

beforeAll(async () => {
  server = app.listen(3002);
});

afterAll(async () => {
  await server.close();
});

describe('PACController', () => {
  let token;
  let adminToken;

  beforeEach(async () => {
    // Limpar banco de dados antes de cada teste
    await Pac.destroy({ where: {} });
    await Usuario.destroy({ where: {} });

    // Criar usuário admin
    const senhaHash = await bcrypt.hash('123456', 10);
    const admin = await Usuario.create({
      nome: 'Admin',
      email: 'admin@teste.com',
      senha: senhaHash,
      role: 'ADMIN'
    });

    // Criar usuário comum
    const usuario = await Usuario.create({
      nome: 'Usuário',
      email: 'usuario@teste.com',
      senha: senhaHash,
      role: 'USER'
    });

    // Fazer login como admin
    const adminResponse = await request(server)
      .post('/api/usuarios/login')
      .send({
        email: 'admin@teste.com',
        senha: '123456'
      });

    adminToken = adminResponse.body.token;

    // Fazer login como usuário
    const userResponse = await request(server)
      .post('/api/usuarios/login')
      .send({
        email: 'usuario@teste.com',
        senha: '123456'
      });

    token = userResponse.body.token;
  });

  describe('POST /api/pacs', () => {
    it('deve criar um novo PAC', async () => {
      const response = await request(server)
        .post('/api/pacs')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          nome: 'PAC Teste',
          provinciaId: 1,
          distritoId: 1,
          endereco: 'Rua Teste, 123',
          telefone: '123456789',
          email: 'pac@teste.com'
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('nome');
      expect(response.body).toHaveProperty('provinciaId');
      expect(response.body).toHaveProperty('distritoId');
    });

    it('não deve criar PAC sem autenticação', async () => {
      const response = await request(server)
        .post('/api/pacs')
        .send({
          nome: 'PAC Teste',
          provinciaId: 1,
          distritoId: 1
        });

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/pacs', () => {
    it('deve listar todos os PACs', async () => {
      const response = await request(server)
        .get('/api/pacs')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('não deve listar PACs sem autenticação', async () => {
      const response = await request(server)
        .get('/api/pacs');

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/pacs/:id', () => {
    it('deve retornar um PAC específico', async () => {
      // Criar PAC para teste
      const pac = await Pac.create({
        nome: 'PAC Específico',
        provinciaId: 1,
        distritoId: 1,
        endereco: 'Rua Teste, 123',
        telefone: '123456789',
        email: 'pac@teste.com'
      });

      const response = await request(server)
        .get(`/api/pacs/${pac.id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id', pac.id);
      expect(response.body).toHaveProperty('nome', 'PAC Específico');
    });

    it('não deve retornar PAC inexistente', async () => {
      const response = await request(server)
        .get('/api/pacs/99999')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(404);
    });
  });

  describe('PUT /api/pacs/:id', () => {
    it('deve atualizar um PAC', async () => {
      // Criar PAC para teste
      const pac = await Pac.create({
        nome: 'PAC para Atualizar',
        provinciaId: 1,
        distritoId: 1,
        endereco: 'Rua Teste, 123',
        telefone: '123456789',
        email: 'pac@teste.com'
      });

      const response = await request(server)
        .put(`/api/pacs/${pac.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          nome: 'PAC Atualizado',
          provinciaId: 2,
          distritoId: 2
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('nome', 'PAC Atualizado');
      expect(response.body).toHaveProperty('provinciaId', 2);
    });

    it('não deve atualizar PAC sem permissão', async () => {
      const response = await request(server)
        .put('/api/pacs/1')
        .set('Authorization', `Bearer ${token}`)
        .send({
          nome: 'PAC Atualizado'
        });

      expect(response.status).toBe(403);
    });
  });
}); 