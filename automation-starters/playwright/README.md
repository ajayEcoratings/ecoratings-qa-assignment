# Playwright UI Automation Starter

This is a starter template for UI automation testing using Playwright for the Sustaining.ai Lite application.

## Setup Instructions

1. **Install dependencies:**
   ```bash
   npm install
   npx playwright install
   ```

2. **Set environment variables:**
   ```bash
   # Create .env file (optional)
   BASE_URL=http://localhost:3001
   API_URL=http://localhost:3001
   ```

3. **Start the mock API server:**
   ```bash
   cd ../../mock-api
   npm install
   npm start
   ```
   Keep this running in a separate terminal.

4. **Run tests:**
   ```bash
   # Run all tests
   npm test

   # Run with browser UI visible
   npm run test:headed

   # Run in debug mode
   npm run test:debug

   # Run with Playwright UI mode
   npm run test:ui
   ```

## Project Structure

```
playwright/
├── tests/
│   └── ui-tests.spec.ts       # Main test file with examples
├── playwright.config.ts       # Playwright configuration
├── package.json              # Dependencies and scripts
└── README.md                 # This file
```

## Key Features

### Page Object Model
The tests use Page Object Model (POM) pattern for better maintainability:
- `LoginPage` - Login functionality
- `DashboardPage` - Main application features
- `AdminUploadPage` - File upload functionality

### Test Data Configuration
Centralized test data in `TEST_CONFIG` object:
- User credentials for different roles
- Test questions and companies
- Environment URLs

### Robust Selectors
Tests use `data-testid` attributes for stable element selection:
```typescript
await this.page.fill('[data-testid="email-input"]', email);
```

## Sample Test Cases Included

1. **Authentication Flow**
   - Valid login redirects to dashboard
   - Invalid credentials show error message

2. **Question Submission**
   - Submit valid question displays job ID
   - Job status updates in real-time
   - Completed job shows answer and confidence
   - Empty question shows validation error

3. **Role-based Access Control**
   - Admin can access upload page, Analyst cannot

4. **Edge Cases**
   - Unicode characters in question field
   - Very long question handling

## Writing New Tests

### Basic Test Structure
```typescript
test('Test description', async ({ page }) => {
  // Arrange
  await page.goto('/some-page');
  
  // Act
  await page.click('[data-testid="button"]');
  
  // Assert
  await expect(page.locator('[data-testid="result"]')).toBeVisible();
});
```

### Using Page Objects
```typescript
test('Example with page objects', async ({ page }) => {
  const loginPage = new LoginPage(page);
  const dashboardPage = new DashboardPage(page);
  
  await loginPage.goto();
  await loginPage.login('user@test.com', 'password');
  await dashboardPage.isLoaded();
});
```

## Best Practices

### Selector Strategy
1. **Preferred:** Use `data-testid` attributes
2. **Alternative:** Use semantic selectors (role, label)
3. **Avoid:** CSS classes or XPath

### Wait Strategies
```typescript
// Wait for element to be visible
await page.waitForSelector('[data-testid="element"]');

// Wait for custom condition
await page.waitForFunction(() => window.someCondition);

// Use built-in expects with auto-wait
await expect(page.locator('[data-testid="element"]')).toBeVisible();
```

### Error Handling
```typescript
try {
  await page.click('[data-testid="button"]', { timeout: 5000 });
} catch (error) {
  // Handle timeout or other errors
  console.log('Button not found or not clickable');
}
```

## Configuration Options

### Browser Configuration
The project is configured to run on:
- Desktop: Chrome, Firefox, Safari
- Mobile: Chrome (Pixel 5), Safari (iPhone 12)

### Reporting
- HTML report: `npm run test:report`
- JSON results: Available in `test-results.json`

### Screenshots and Videos
- Screenshots: Taken on test failure
- Videos: Recorded for failed tests
- Traces: Available for debugging

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `BASE_URL` | Application base URL | `http://localhost:3001` |
| `API_URL` | API base URL | `http://localhost:3001` |
| `CI` | CI environment flag | - |

## Tips for Success

1. **Start Simple:** Begin with basic login and navigation tests
2. **Use Page Objects:** Organize code for reusability
3. **Stable Selectors:** Request `data-testid` attributes from developers
4. **Wait Appropriately:** Use Playwright's auto-waiting features
5. **Test Data:** Keep test data separate and configurable
6. **Debug Effectively:** Use `--debug` mode and screenshots

## Common Issues

### Element Not Found
```typescript
// Instead of this:
await page.click('.some-class');

// Use this:
await page.click('[data-testid="element"]');
await expect(page.locator('[data-testid="element"]')).toBeVisible();
```

### Timing Issues
```typescript
// Instead of hardcoded waits:
await page.waitForTimeout(5000);

// Use condition-based waits:
await page.waitForSelector('[data-testid="loaded"]');
await expect(page.locator('[data-testid="result"]')).toContainText('Expected');
```

### Flaky Tests
- Use built-in auto-waiting mechanisms
- Avoid hardcoded timeouts
- Use stable selectors
- Handle dynamic content properly

## Next Steps

1. **Expand Test Coverage:**
   - Add more edge cases
   - Test error scenarios
   - Add cross-browser specific tests

2. **Enhance Framework:**
   - Add custom fixtures
   - Implement test data management
   - Add helper utilities

3. **CI/CD Integration:**
   - Add GitHub Actions workflow
   - Configure parallel execution
   - Set up test reporting

4. **Advanced Features:**
   - API mocking with Playwright
   - Visual regression testing
   - Performance monitoring

## Resources

- [Playwright Documentation](https://playwright.dev/)
- [Best Practices Guide](https://playwright.dev/docs/best-practices)
- [Page Object Model](https://playwright.dev/docs/pom)
- [Test Configuration](https://playwright.dev/docs/test-configuration)