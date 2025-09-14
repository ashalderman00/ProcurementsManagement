import request from 'supertest';
import app from './index.js';
import { describe, it, expect } from 'vitest';

describe('GET /', () => {
  it('responds with greeting', async () => {
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
    expect(res.text).toBe('Hello World from backend!');
  });
});
