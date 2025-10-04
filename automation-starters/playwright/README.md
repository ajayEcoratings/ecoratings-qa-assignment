# UI Testing with Playwright

This directory contains starter templates for UI test automation using Playwright.

## Setup

1. **Start the mock API server:**
   ```bash
   cd ../../mock-api
   npm install
   npm start
   ```
   Keep this running in a separate terminal.

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Install browsers:**
   ```bash
   npx playwright install
   ```

## Running Tests

```bash
# Run all tests
npm test

# Run tests in headed mode (see browser)
npm run test:headed

# Run tests in specific browser
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit

# Run specific test file
npx playwright test tests/ui-starter.spec.ts

# Run with debug mode
npx playwright test --debug

# Generate test report
npx playwright show-report
```

## Test Structure

- `tests/ui-starter.spec.ts` - Example UI test patterns and starter code
- `tests/example.spec.ts` - Simple example test
- `playwright.config.ts` - Playwright configuration
- `package.json` - Dependencies and scripts

## Getting Started

The `ui-starter.spec.ts` file contains:
- Page Object Model examples
- Basic test structure patterns
- Authentication helpers
- TODO comments for expansion areas

## Your Task

Expand the starter tests to create comprehensive UI test coverage:

1. **Authentication Tests**: Login flows, error handling, session management
2. **Question Submission**: Form validation, submission process, result display
3. **File Upload**: CSV upload functionality, validation, error handling
4. **Navigation**: Page transitions, routing, user experience
5. **Responsive Design**: Cross-browser testing, mobile compatibility
6. **Performance**: Load times, responsiveness, user interaction timing

## Key Areas to Test

### User Authentication
- Valid login redirects to dashboard
- Invalid credentials show error messages
- Logout functionality works correctly
- Session timeout handling

### Question & Answer Flow
- Question form accepts valid inputs
- Company selection works properly
- Submit button triggers correct API calls
- Results display correctly
- Real-time updates work as expected

### File Upload
- CSV file upload succeeds for admin users
- Non-CSV files are rejected
- Upload progress indicators work
- Error messages display appropriately

### User Interface
- All navigation links work
- Forms validate inputs properly
- Loading states display correctly
- Error messages are user-friendly

## Page Object Model Pattern

```typescript
class LoginPage {
    constructor(private page: Page) {}
    
    get emailInput() { return this.page.locator('#email'); }
    get passwordInput() { return this.page.locator('#password'); }
    get loginButton() { return this.page.locator('button[type="submit"]'); }
    
    async login(email: string, password: string) {
        await this.emailInput.fill(email);
        await this.passwordInput.fill(password);
        await this.loginButton.click();
    }
}
```

## Best Practices

- Use Page Object Model for maintainable tests
- Wait for elements to be ready before interacting
- Use meaningful test descriptions
- Test both happy path and error scenarios
- Verify visual elements and user feedback
- Test across different browsers and screen sizes
- Include accessibility testing

## Configuration

### Test Users
- **Analyst:** analyst@test.com / TestPass123!
- **Admin:** admin@test.com / AdminPass123!

### Application URL
- Default: `http://localhost:3001`
- Configured in `playwright.config.ts`

## Browser Support

Tests are configured to run on:
- Chromium (Chrome/Edge)
- Firefox
- WebKit (Safari)

## Example Test Pattern

```typescript
test('should perform user action', async ({ page }) => {
    // Arrange
    const loginPage = new LoginPage(page);
    await page.goto('http://localhost:3001');
    
    // Act
    await loginPage.login('user@test.com', 'password');
    
    // Assert
    await expect(page).toHaveURL(/dashboard/);
    await expect(page.locator('.welcome-message')).toBeVisible();
});
```

## Debugging Tips

- Use `--debug` flag to step through tests
- Use `page.pause()` to pause execution
- Take screenshots: `await page.screenshot({ path: 'debug.png' })`
- Use browser developer tools in headed mode
- Check console logs: `page.on('console', console.log)`

## Visual Testing

Playwright supports visual regression testing:

```typescript
// Take screenshot and compare
await expect(page).toHaveScreenshot('login-page.png');

// Compare specific element
await expect(page.locator('.dashboard')).toHaveScreenshot('dashboard.png');
```

## Mobile Testing

Test responsive design:

```typescript
// Emulate mobile device
test('mobile login', async ({ browser }) => {
    const context = await browser.newContext({
        viewport: { width: 375, height: 667 }, // iPhone SE
    });
    const page = await context.newPage();
    // ... test mobile-specific behavior
});
```