import express from 'express';
import { StatusCodes } from 'http-status-codes';
import request from 'supertest';

import { corsMiddleware } from '~/config/cors';

describe("CORS Middleware", () => {
  const createTestApp = () => {
    const app = express();
    app.use(corsMiddleware);
    app.get('/test-cors', (_req, res) => res.json({ ok: true }));

    return app;
  };

  it("Allow request when origin is in whitelist", async () => {
    const allowOrigin = 'http://localhost:5173'; // .env
    const app = createTestApp();

    const responseApp = await request(app).get('/test-cors').set('Origin', allowOrigin);

    expect(responseApp.status).toBe(StatusCodes.OK);
    expect(responseApp.ok).toBe(true);
    expect(responseApp.body).toEqual({ ok: true });
  });

  it("Block request when origin is not allowed", async () => {
    const notAllowOrigin = 'https://xyz.com';
    const app = createTestApp();

    const responseApp = await request(app).get('/test-cors').set('Origin', notAllowOrigin);

    expect(responseApp.status).toBe(StatusCodes.INTERNAL_SERVER_ERROR);
    expect(responseApp.ok).toBe(false);
    expect(JSON.stringify(responseApp.error)).toContain(`Error: Origin ${notAllowOrigin} not allowed by CORS`);
  });

  it("Allow request without origin (e.g, Postman, Curl)", async () => {
    const app = createTestApp();
    const responseApp = await request(app).get('/test-cors');

    expect(responseApp.status).toBe(StatusCodes.OK);
    expect(responseApp.ok).toBe(true);
    expect(responseApp.body).toEqual({ ok: true });
  })
})
