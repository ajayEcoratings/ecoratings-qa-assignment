# API Testing with pytest

This directory contains starter templates for API test automation using pytest and requests.

## Setup

1. **Start the mock API server:**
   ```bash
   cd ../../mock-api
   npm install
   npm start
   ```
   Keep this running in a separate terminal.

2. **Create virtual environment:**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

## Running Tests

```bash
# Run all tests
pytest

# Run with verbose output
pytest -v

# Run specific test file
pytest test_api_starter.py

# Run specific test
pytest test_api_starter.py::TestAuthentication::test_valid_login_returns_token

# Run with coverage
pytest --cov=. --cov-report=html

# Run with HTML report
pytest --html=report.html --self-contained-html
```

## Test Structure

- `test_api_starter.py` - Example API test patterns and starter code
- `conftest.py` - Shared fixtures and configuration
- `requirements.txt` - Python dependencies

## Getting Started

The `test_api_starter.py` file contains:
- Basic test structure examples
- Authentication fixtures
- Helper functions
- TODO comments for expansion areas

## Your Task

Expand the starter tests to create comprehensive API test coverage:

1. **Authentication Tests**: Login, logout, token validation, error handling
2. **Question/Answer API**: Submit questions, retrieve results, edge cases
3. **File Upload Tests**: CSV upload, validation, error scenarios
4. **Negative Testing**: Invalid inputs, unauthorized access, malformed requests
5. **Performance Tests**: Response times, concurrent requests

## Key Areas to Test

### Authentication Flow
- Valid credentials return JWT token
- Invalid credentials return appropriate errors
- Token expiration and refresh
- Logout functionality

### API Contract Validation
- Required fields validation
- Response structure validation
- Data type validation
- Status code verification

### Error Handling
- Missing required parameters
- Invalid data formats
- Authorization failures
- Network timeouts

### Edge Cases
- Unicode characters in inputs
- Boundary values (empty strings, very long inputs)
- Special characters and SQL injection attempts
- Concurrent requests

## Best Practices

- Follow pytest naming conventions (`test_*.py` or `*_test.py`)
- Use fixtures for setup and teardown
- Group related tests in classes
- Include descriptive docstrings
- Test both happy path and error scenarios
- Validate response times and performance
- Use parameterized tests for data-driven testing

## Configuration

### Test Users
- **Analyst:** analyst@test.com / TestPass123!
- **Admin:** admin@test.com / AdminPass123!

### API Base URL
- Default: `http://localhost:3001`
- Can be configured via environment variables

## Helper Functions Available

- `validate_uuid()`: Validate UUID format
- `TestConfig`: Configuration dataclass
- Authentication fixtures for easy token management
- Session fixture for HTTP requests

## Example Test Pattern

```python
def test_api_endpoint_example(self, session, auth_headers):
    # Arrange
    test_data = {"key": "value"}
    
    # Act
    response = session.post(
        f"{config.base_url}/api/endpoint",
        json=test_data,
        headers=auth_headers
    )
    
    # Assert
    assert response.status_code == 200
    assert "expected_field" in response.json()
```

## Debugging Tips

- Use `pytest -s` to see print statements
- Use `pytest --pdb` to drop into debugger on failures
- Check response details: `print(response.text)` for debugging
- Use `pytest -v` for verbose test names and results