const request = require('supertest');
process.env.NODE_ENV = 'test';

const { app } = require('../server');
const sequelize = require('../db');

beforeAll(async () => {
  await sequelize.sync({ force: true });
});

afterAll(async () => {
  await sequelize.close();
});

describe('Posts API', () => {
  let token;
  beforeAll(async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Tester',
      email: 'tester@example.com',
      password: 'password123'
    });
    token = res.body.token;
  });

  test('GET /api/posts returns array', async () => {
    const res = await request(app).get('/api/posts');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('POST /api/posts requires auth', async () => {
    const res = await request(app).post('/api/posts').send({ content: 'hi' });
    expect(res.statusCode).toBe(401);
  });

  test('POST /api/posts creates post', async () => {
    const res = await request(app)
      .post('/api/posts')
      .set('Authorization', `Bearer ${token}`)
      .send({ content: 'hello world' });
    expect(res.statusCode).toBe(200);
    expect(res.body.content).toBe('hello world');
  });
});

describe('Comments API', () => {
  let token;
  let postId;
  beforeAll(async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Commenter',
      email: 'commenter@example.com',
      password: 'password123'
    });
    token = res.body.token;
    const postRes = await request(app)
      .post('/api/posts')
      .set('Authorization', `Bearer ${token}`)
      .send({ content: 'post for comments' });
    postId = postRes.body.id;
  });

  test('POST /api/comments creates comment', async () => {
    const res = await request(app)
      .post('/api/comments')
      .set('Authorization', `Bearer ${token}`)
      .send({ postId, content: 'nice post' });
    expect(res.statusCode).toBe(200);
    expect(res.body.content).toBe('nice post');
  });

  test('GET /api/comments/post/:id returns comments', async () => {
    const res = await request(app).get(`/api/comments/post/${postId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBe(1);
  });
});
