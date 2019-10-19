const request = require('supertest');

const app = require('../../src/app');

const email = `${Date.now()}@email.com`;

test('to list all users', () => request(app).get('/users')
  .then((res) => {
    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
  }));

test('to create an new user successfully', () => request(app).post('/users')
  .send({ name: 'Walter Mitty', email, password: '1234' })
  .then((res) => {
    expect(res.status).toBe(201);
    expect(res.body.name).toBe('Walter Mitty');
    expect(res.body).not.toHaveProperty('password');
  }));

test('to store encrypted password', async () => {
  const response = await request(app).post('/users')
    .send({ name: 'Walter Mitty', email: `${Date.now()}@email.com}`, password: '1234' });

  expect(response.status).toBe(201);

  const { id } = response.body;

  const userSaved = await app.services.user.findOne({ id });
  expect(userSaved.password).not.toBeUndefined();
  expect(userSaved.password).not.toBe('1234');
});

test('to disallow an user creation without name property', () => request(app).post('/users')
  .send({ email, password: '123456' })
  .then((res) => {
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Nome é um atributo obrigatório');
  }));

test('to disallow an user creation without email property', () => request(app).post('/users')
  .send({ name: 'Walter Mitty', password: '1234' })
  .then((res) => {
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Email é um atributo obrigatório');
  }));

test('to disallow an user creation without password property', (done) => request(app).post('/users')
  .send({ name: 'Walter Mitty', email })
  .then((res) => {
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Senha é um atributo obrigatório');
    done();
  })
  .catch((err) => done.fail(err)));

test('to disallow an user creation with existing email', async () => {
  await request(app).post('/users')
    .send({ name: 'Walter Mitty', email, password: '1234' })
    .then((res) => {
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Já existe um usuário com esse email');
    });
});
