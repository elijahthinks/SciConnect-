const request = require('supertest');
const express = require('express');
const postsRoutes = require('../routes/posts');
const sequelize = require('../db');

const app = express();
app.use(express.json());
app.use('/api/posts', postsRoutes);

beforeAll(async () => {
  await sequelize.sync({ force: true });
});

afterAll(async () => {
  await sequelize.close();
});

test('GET /api/posts responds with 200', async () => {
  const res = await request(app).get('/api/posts');
  expect(res.status).toBe(200);
});
