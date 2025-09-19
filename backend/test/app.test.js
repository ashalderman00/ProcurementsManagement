const request = require('supertest');
const app = require('../index');

describe('POST /api/auth/signup', () => {
  it('registers a new user and returns a session token', async () => {
    const res = await request(app)
      .post('/api/auth/signup')
      .send({
        email: 'tester@example.com',
        password: 'password',
        role: 'Requester',
      });

    expect(res.statusCode).toBe(201);
    expect(typeof res.body.token).toBe('string');
    expect(res.body.token.length).toBeGreaterThan(0);
    expect(res.body.user).toEqual({
      id: 1,
      email: 'tester@example.com',
      role: 'requester',
    });
  });
});
