import express from 'express';
import { app } from '../api';
import request from "supertest";
describe('GET /test', () => {
  it('should return a 200 status and "API GENERATE CERTIFICATE"', async () => {
    const response = await request(app).get('/ping');
    expect(response.status).toBe(200);
    expect(response.text).toBe('API GENERATE CERTIFICATE');
  });
});
