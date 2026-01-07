import { Express } from 'express';
import { StatusCodes } from 'http-status-codes';
import request from 'supertest';

import { createApp } from "~/app";
import { ApiError } from '~/core/http/ApiError';

describe("Express app", () => {
  let app: Express;

  beforeEach(() => {
    app = createApp()
  })

  describe("Health check endpoint", () => {
    it("should return 200 OK with health status", async () => {
      const responseApp = await request(app).get('/health');

      expect(responseApp.status).toBe(StatusCodes.OK);
      expect(responseApp.ok).toBe(true);
      expect(responseApp.statusCode).toBe(StatusCodes.OK);
      expect(responseApp.body).toMatchObject({
        status: 'ok'
      })
    });

    it("should return valid JSON", async () => {
      const responseApp = await request(app).get('/health');

      expect(responseApp.type).toBe('application/json');
      expect(responseApp.body).toBeDefined();
    })
  })

  describe("Cache control headers", () => {
    it("should set no-cache headers on all responses", async () => {
      const responseApp = await request(app).get('/health');

      expect(responseApp.headers['cache-control']).toContain('no-cache');
      expect(responseApp.headers['cache-control']).toContain('no-store');
      expect(responseApp.headers['cache-control']).toContain('must-revalidate');
      expect(responseApp.headers['pragma']).toContain('no-cache');
      expect(responseApp.headers['expires']).toContain('0');
    })

    it("should set no-cache headers on all responses", async () => {
      const responseApp = await request(app).get('/api/some-route');

      expect(responseApp.headers['cache-control']).toContain('no-cache');
      expect(responseApp.headers['cache-control']).toContain('no-store');
      expect(responseApp.headers['cache-control']).toContain('must-revalidate');
    })
  })

  describe("Error handling", () => {
    it("should handle ApiError.BadRequest correctly", async () => {
      app.get('/throw-api-error', () => {
        throw ApiError.BadRequest('Invalid request data');
      });

      const responseApp = await request(app).get('/throw-api-error');

      expect(responseApp.status).toBe(StatusCodes.BAD_REQUEST);
      expect(responseApp.ok).toBe(false);
    });

    it("should handle generic Error with 500", async () => {
      app.get('/throw-generic-error', () => {
        throw new Error('Unexpected error');
      });

      const responseApp = await request(app).get('/throw-generic-error');

      expect(responseApp.status).toBe(StatusCodes.INTERNAL_SERVER_ERROR);
      expect(responseApp.ok).toBe(false);
    });
  })
})
