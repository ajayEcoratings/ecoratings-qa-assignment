import { test, expect } from '@playwright/test';

test.describe('Sustaining.ai Lite Tests', () => {
  test('health check endpoint responds', async ({ page }) => {
    // Example test - candidates can expand this
    const response = await page.request.get('http://localhost:3001/health');
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(data.status).toBe('OK');
  });

  // TODO: Add more tests here
  // - Authentication tests
  // - Question submission tests  
  // - File upload tests
  // - UI interaction tests
});