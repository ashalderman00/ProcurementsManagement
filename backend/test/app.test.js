const request = require('supertest');
const app = require('../index');

describe('POST /auth/register', () => {
  it('registers a new user', async () => {
    const res = await request(app)
      .post('/auth/register')
      .send({ username: 'tester', password: 'password', role: 'Requester' });

    expect(res.statusCode).toBe(201);
    expect(res.body).toEqual({ message: 'User registered' });
  });
});
