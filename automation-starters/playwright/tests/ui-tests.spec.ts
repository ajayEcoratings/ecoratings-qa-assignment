/**
 * REFERENCE EXAMPLE: UI Test Suite for Sustaining.ai Lite
 * 
 * This file provides comprehensive examples of UI testing patterns using Playwright.
 * Note: These tests assume a frontend UI exists. For this assignment, you may want to 
 * focus on API testing via Playwright's request API or create these UI tests as examples 
 * of what you would test if the frontend was available.
 * 
 * Key Patterns Demonstrated:
 * - Page Object Model
 * - Data-driven testing
 * - Real-time updates testing
 * - Role-based access control
 * - Edge case handling
 */

import { test, expect, Page } from '@playwright/test';

// Test data configuration
const TEST_CONFIG = {
  baseURL: process.env.BASE_URL || 'http://localhost:3001',
  apiURL: process.env.API_URL || 'http://localhost:3001',
  users: {
    analyst: {
      email: 'analyst@test.com',
      password: 'TestPass123!',
      role: 'Analyst'
    },
    admin: {
      email: 'admin@test.com', 
      password: 'AdminPass123!',
      role: 'Admin'
    }
  },
  testData: {
    validQuestion: 'What are the Scope 1 emissions for this company?',
    validCompany: 'Nokia',
    longQuestion: 'This is a very long question about sustainability practices that exceeds normal length to test boundary conditions and system behavior under stress conditions with extensive text input that might cause issues with the application processing and display capabilities in the user interface components and backend systems that handle the question processing workflow and validation mechanisms.',
    unicodeQuestion: 'What are 中国公司\'s sustainability practices?',
    unicodeCompany: '中国移动'
  }
};

// Page Object Model - Login Page
class LoginPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/login');
  }

  async login(email: string, password: string) {
    await this.page.fill('[data-testid="email-input"]', email);
    await this.page.fill('[data-testid="password-input"]', password);
    await this.page.click('[data-testid="login-button"]');
  }

  async getErrorMessage() {
    return await this.page.textContent('[data-testid="error-message"]');
  }
}

// Page Object Model - Dashboard Page
class DashboardPage {
  constructor(private page: Page) {}

  async isLoaded() {
    await expect(this.page.locator('[data-testid="dashboard"]')).toBeVisible();
  }

  async getUserRole() {
    return await this.page.textContent('[data-testid="user-role"]');
  }

  async submitQuestion(question: string, company: string) {
    await this.page.fill('[data-testid="question-input"]', question);
    await this.page.fill('[data-testid="company-input"]', company);
    await this.page.click('[data-testid="submit-button"]');
  }

  async getJobId() {
    await this.page.waitForSelector('[data-testid="job-id"]');
    return await this.page.textContent('[data-testid="job-id"]');
  }

  async getJobStatus() {
    return await this.page.textContent('[data-testid="job-status"]');
  }

  async waitForJobCompletion(timeout = 30000) {
    await this.page.waitForFunction(
      () => {
        const status = document.querySelector('[data-testid="job-status"]')?.textContent;
        return status === 'done' || status === 'failed';
      },
      { timeout }
    );
  }

  async getAnswer() {
    await this.page.waitForSelector('[data-testid="answer-text"]');
    return await this.page.textContent('[data-testid="answer-text"]');
  }

  async getConfidence() {
    await this.page.waitForSelector('[data-testid="confidence-score"]');
    const confidenceText = await this.page.textContent('[data-testid="confidence-score"]');
    return parseFloat(confidenceText?.replace('Confidence: ', '') || '0');
  }

  async getValidationError() {
    return await this.page.textContent('[data-testid="validation-error"]');
  }
}

// Page Object Model - Admin Upload Page
class AdminUploadPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/admin/upload');
  }

  async uploadFile(filePath: string) {
    await this.page.setInputFiles('[data-testid="file-input"]', filePath);
    await this.page.click('[data-testid="upload-button"]');
  }

  async getUploadResult() {
    await this.page.waitForSelector('[data-testid="upload-result"]');
    return await this.page.textContent('[data-testid="upload-result"]');
  }

  async getErrorMessage() {
    return await this.page.textContent('[data-testid="upload-error"]');
  }
}

// Test Suite: Authentication
test.describe('Authentication Flow', () => {
  let loginPage: LoginPage;
  let dashboardPage: DashboardPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    dashboardPage = new DashboardPage(page);
  });

  test('TC_UI_001: Valid login redirects to dashboard', async ({ page }) => {
    await loginPage.goto();
    await loginPage.login(TEST_CONFIG.users.analyst.email, TEST_CONFIG.users.analyst.password);
    
    // Verify redirect to dashboard
    await expect(page).toHaveURL(/.*dashboard/);
    await dashboardPage.isLoaded();
    
    // Verify user role is displayed
    const role = await dashboardPage.getUserRole();
    expect(role).toBe(TEST_CONFIG.users.analyst.role);
  });

  test('TC_UI_002: Invalid credentials show error message', async ({ page }) => {
    await loginPage.goto();
    await loginPage.login('invalid@email.com', 'wrongpassword');
    
    // Verify error message is displayed
    const errorMessage = await loginPage.getErrorMessage();
    expect(errorMessage).toBeTruthy();
    expect(errorMessage).toContain('Invalid credentials');
    
    // Verify user remains on login page
    await expect(page).toHaveURL(/.*login/);
  });
});

// Test Suite: Question Submission Flow
test.describe('Question Submission and Processing', () => {
  let loginPage: LoginPage;
  let dashboardPage: DashboardPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    dashboardPage = new DashboardPage(page);
    
    // Login as analyst for each test
    await loginPage.goto();
    await loginPage.login(TEST_CONFIG.users.analyst.email, TEST_CONFIG.users.analyst.password);
    await dashboardPage.isLoaded();
  });

  test('TC_UI_004: Submit valid question displays job ID', async ({ page }) => {
    await dashboardPage.submitQuestion(
      TEST_CONFIG.testData.validQuestion,
      TEST_CONFIG.testData.validCompany
    );
    
    // Verify job ID is displayed
    const jobId = await dashboardPage.getJobId();
    expect(jobId).toBeTruthy();
    expect(jobId).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);
    
    // Verify initial status is queued
    const status = await dashboardPage.getJobStatus();
    expect(status).toBe('queued');
  });

  test('TC_UI_005: Job status updates in real-time', async ({ page }) => {
    await dashboardPage.submitQuestion(
      TEST_CONFIG.testData.validQuestion,
      TEST_CONFIG.testData.validCompany
    );
    
    // Wait for job to complete
    await dashboardPage.waitForJobCompletion();
    
    // Verify final status
    const finalStatus = await dashboardPage.getJobStatus();
    expect(['done', 'failed']).toContain(finalStatus);
  });

  test('TC_UI_006: Completed job shows answer and confidence', async ({ page }) => {
    await dashboardPage.submitQuestion(
      TEST_CONFIG.testData.validQuestion,
      TEST_CONFIG.testData.validCompany
    );
    
    // Wait for completion
    await dashboardPage.waitForJobCompletion();
    
    // Verify answer is displayed
    const answer = await dashboardPage.getAnswer();
    expect(answer).toBeTruthy();
    expect(answer.length).toBeGreaterThan(10);
    
    // Verify confidence score is valid
    const confidence = await dashboardPage.getConfidence();
    expect(confidence).toBeGreaterThanOrEqual(0);
    expect(confidence).toBeLessThanOrEqual(1);
  });

  test('TC_UI_012: Empty question shows validation error', async ({ page }) => {
    await dashboardPage.submitQuestion('', TEST_CONFIG.testData.validCompany);
    
    // Verify validation error is shown
    const errorMessage = await dashboardPage.getValidationError();
    expect(errorMessage).toBeTruthy();
    expect(errorMessage).toContain('Question is required');
  });
});

// Test Suite: Role-based Access Control
test.describe('Role-based Access Control', () => {
  let loginPage: LoginPage;
  let adminUploadPage: AdminUploadPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    adminUploadPage = new AdminUploadPage(page);
  });

  test('TC_UI_003: Admin can access upload page, Analyst cannot', async ({ page }) => {
    // Test as Analyst - should be denied
    await loginPage.goto();
    await loginPage.login(TEST_CONFIG.users.analyst.email, TEST_CONFIG.users.analyst.password);
    
    await adminUploadPage.goto();
    await expect(page).toHaveURL(/.*403/); // Expect 403 forbidden page
    
    // Logout and test as Admin - should have access
    await page.goto('/logout');
    await loginPage.login(TEST_CONFIG.users.admin.email, TEST_CONFIG.users.admin.password);
    
    await adminUploadPage.goto();
    await expect(page).toHaveURL(/.*admin\/upload/);
  });
});

// Test Suite: Edge Cases and Error Handling
test.describe('Edge Cases and Error Handling', () => {
  let loginPage: LoginPage;
  let dashboardPage: DashboardPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    dashboardPage = new DashboardPage(page);
    
    await loginPage.goto();
    await loginPage.login(TEST_CONFIG.users.analyst.email, TEST_CONFIG.users.analyst.password);
    await dashboardPage.isLoaded();
  });

  test('TC_UI_013: Unicode characters in question field', async ({ page }) => {
    await dashboardPage.submitQuestion(
      TEST_CONFIG.testData.unicodeQuestion,
      TEST_CONFIG.testData.unicodeCompany
    );
    
    // Verify job is created successfully
    const jobId = await dashboardPage.getJobId();
    expect(jobId).toBeTruthy();
  });

  test('TC_UI_014: Very long question handling', async ({ page }) => {
    await dashboardPage.submitQuestion(
      TEST_CONFIG.testData.longQuestion,
      TEST_CONFIG.testData.validCompany
    );
    
    // Should either create job successfully or show appropriate validation
    try {
      const jobId = await dashboardPage.getJobId();
      expect(jobId).toBeTruthy();
    } catch (error) {
      const validationError = await dashboardPage.getValidationError();
      expect(validationError).toContain('Question too long');
    }
  });
});