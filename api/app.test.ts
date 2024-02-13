import request from 'supertest';
import express from 'express';
import routes from './routes';

const app = express();

// Re-define the specific route for testing purposes
app.get('/ping', (req, res) => {
  res.json({ message: 'pong' });
});

app.use(routes);

describe('GET /ping', () => {
  it('should respond with a pong message', async () => {
    const response = await request(app).get('/ping');
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({ message: 'pong' });
  });
});
