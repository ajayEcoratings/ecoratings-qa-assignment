# API Testing with pytest and requests

This is a comprehensive API testing framework for the Sustaining.ai Lite API using pytest and requests.

## Setup Instructions

1. **Start the mock API server:**
   ```bash
   cd ../../mock-api
   npm install
   npm start
   ```
   Keep this running in a separate terminal.

2. **Install Python dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Set environment variables (optional):**
   ```bash
   export BASE_URL=http://localhost:3001
   export AIML_URL=http://localhost:3001
   ```

4. **Run tests:**
   ```bash
   # Run all tests
   pytest

   # Run with detailed output
   pytest -v

   # Run specific test class
   pytest test_api.py::TestAuthentication -v

   # Run with HTML report
   pytest --html=report.html --self-contained-html

   # Run with JSON report
   pytest --json-report --json-report-file=report.json
   ```

## Project Structure

```
api-pytest/
├── test_api.py           # Main test file with all test cases
├── requirements.txt      # Python dependencies
├── pytest.ini          # Pytest configuration
├── conftest.py          # Shared fixtures and configuration (optional)
└── README.md            # This file
```

## Key Features

### Configuration Management
- Centralized configuration in `TestConfig` dataclass
- Environment variable support
- Test data management

### Fixtures
- `session`: Reusable requests session
- `analyst_token`: Authentication token for analyst user
- `admin_token`: Authentication token for admin user
- `auth_headers`: Authorization headers for API calls

### Helper Functions
- `validate_uuid()`: Validate UUID format
- `validate_iso_timestamp()`: Validate ISO-8601 timestamps
- `wait_for_job_completion()`: Poll job status until completion

## Test Coverage

### Authentication Tests
- Valid login returns JWT token
- Invalid credentials return 401
- Logout with valid token succeeds

### Question & Answer API Tests
- Submit valid question returns job ID
- Get job status returns progress
- Completed job returns answer and confidence
- Get recent answers for user

### File Upload Tests
- Admin CSV upload succeeds
- Non-CSV file returns 415
- Analyst cannot access admin endpoints

### AIML Service Tests
- Valid request returns answer with confidence
- Rate limiting behavior

### Negative Testing
- Empty/missing required fields
- Invalid data formats
- Authorization failures
- Non-existent resources

### Edge Cases
- Unicode characters
- Special characters
- Boundary values

### Performance Tests
- Response time validation
- Basic load testing

## Sample Test Cases

### Authentication Flow
```python
def test_valid_login_returns_token(self, session):
    login_data = {
        "email": "analyst@test.com",
        "password": "TestPass123!"
    }
    
    response = session.post(
        f"{config.base_url}/api/v1/auth/login",
        json=login_data
    )
    
    assert response.status_code == 200
    assert "token" in response.json()
```

### API Contract Validation
```python
def test_submit_valid_question_returns_job_id(self, session, auth_headers):
    question_data = {
        "question": "What are the Scope 1 emissions?",
        "company": "Nokia"
    }
    
    response = session.post(
        f"{config.base_url}/api/v1/qa",
        json=question_data,
        headers=auth_headers
    )
    
    assert response.status_code == 202
    data = response.json()
    assert validate_uuid(data["jobId"])
    assert data["status"] == "queued"
```

## Best Practices Implemented

### 1. Fixture-based Authentication
```python
@pytest.fixture
def analyst_token(session):
    # Login and return token
    response = session.post("/api/v1/auth/login", json=login_data)
    return response.json()["token"]
```

### 2. Response Validation
```python
# Status code validation
assert response.status_code == 200

# Response structure validation
data = response.json()
assert "jobId" in data
assert validate_uuid(data["jobId"])

# Performance validation
assert response.elapsed.total_seconds() < 0.5
```

### 3. Error Handling
```python
try:
    final_data = wait_for_job_completion(session, job_id, headers)
    assert final_data["status"] == "done"
except TimeoutError:
    pytest.fail(f"Job did not complete within timeout")
```

### 4. Data-driven Testing
```python
@pytest.mark.parametrize("invalid_input", [
    "",  # Empty string
    None,  # Null value
    " " * 10001,  # Too long
])
def test_invalid_questions(self, session, auth_headers, invalid_input):
    # Test with different invalid inputs
```

## Configuration

### Test Data
- **Analyst User:** analyst@test.com / TestPass123!
- **Admin User:** admin@test.com / AdminPass123!
- **Valid Company:** Nokia
- **Test Questions:** Various ESG-related questions

### Environment Variables
| Variable | Default | Description |
|----------|---------|-------------|
| `BASE_URL` | `http://localhost:3001` | API base URL |
| `AIML_URL` | `http://localhost:3001` | AIML service URL |

## Running Specific Test Categories

```bash
# Authentication tests only
pytest test_api.py::TestAuthentication -v

# Negative tests only  
pytest test_api.py::TestNegativeScenarios -v

# Performance tests only
pytest test_api.py::TestPerformance -v

# Run tests with specific markers
pytest -m "not slow" -v  # Skip slow tests
```

## Test Reporting

### HTML Report
```bash
pytest --html=report.html --self-contained-html
```
Generates a comprehensive HTML report with:
- Test results summary
- Failed test details
- Test duration metrics
- Environment information

### JSON Report
```bash
pytest --json-report --json-report-file=report.json
```
Generates machine-readable JSON for CI/CD integration.

### Console Output
```bash
# Verbose output with test names
pytest -v

# Show local variables on failure
pytest -l

# Stop on first failure
pytest -x
```

## Common Assertions

### HTTP Status Codes
```python
assert response.status_code == 200
assert response.status_code in [200, 202]
```

### Response Structure
```python
data = response.json()
assert "required_field" in data
assert isinstance(data["list_field"], list)
assert len(data["list_field"]) <= 10
```

### Data Validation
```python
# UUID validation
assert validate_uuid(data["jobId"])

# Timestamp validation
assert validate_iso_timestamp(data["submittedAt"])

# Confidence score validation
assert 0 <= data["confidence"] <= 1
```

### Performance
```python
# Response time validation
assert response.elapsed.total_seconds() < 0.5

# Timeout handling
response = session.get(url, timeout=10)
```

## Debugging Tips

### 1. Print Response Details
```python
print(f"Status: {response.status_code}")
print(f"Headers: {response.headers}")
print(f"Body: {response.text}")
```

### 2. Use pytest Debugger
```bash
# Drop into debugger on failure
pytest --pdb

# Drop into debugger on first failure
pytest --pdb -x
```

### 3. Capture Output
```bash
# Show print statements
pytest -s

# Capture logs
pytest --log-cli-level=DEBUG
```

## Error Handling Patterns

### Network Issues
```python
try:
    response = session.post(url, json=data, timeout=10)
except requests.Timeout:
    pytest.fail("Request timed out")
except requests.ConnectionError:
    pytest.fail("Connection failed")
```

### API Errors
```python
if response.status_code != 200:
    error_detail = response.json().get("error", "Unknown error")
    pytest.fail(f"API error: {error_detail}")
```

## CI/CD Integration

### GitHub Actions Example
```yaml
- name: Run API Tests
  run: |
    pip install -r requirements.txt
    pytest --json-report --json-report-file=api-test-results.json
```

### Environment Setup
```bash
# Set test environment
export BASE_URL=http://localhost:3001
export TEST_USER_EMAIL=test@example.com
export TEST_USER_PASSWORD=password

# Run tests
pytest -v
```

## Next Steps

1. **Extend Test Coverage:**
   - Add more edge cases
   - Test error recovery scenarios
   - Add load testing scenarios

2. **Framework Enhancements:**
   - Add custom assertions
   - Implement test data factories
   - Add API mocking capabilities

3. **Reporting Improvements:**
   - Custom test reports
   - Integration with test management tools
   - Performance metrics tracking

4. **CI/CD Integration:**
   - Automated test execution
   - Test result notifications
   - Test environment management

## Resources

- [pytest Documentation](https://docs.pytest.org/)
- [requests Library](https://requests.readthedocs.io/)
- [API Testing Best Practices](https://restfulapi.net/testing/)
- [HTTP Status Codes](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status)