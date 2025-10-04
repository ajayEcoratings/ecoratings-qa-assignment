# Test Case Template - API Testing

## Format Instructions
- Use descriptive test case IDs with API prefix
- Include HTTP method and endpoint in title
- Specify request/response examples
- Cover positive and negative scenarios
- Include performance and security considerations

---

## Test Case Example

**Test Case ID:** TC_API_001  
**Test Case Title:** POST /api/v1/qa - Submit valid question returns 202 with jobId  
**Priority:** High  
**Risk Level:** High  
**Component:** Question Submission API  
**Test Type:** Functional  

**Preconditions:**
- Valid JWT token available
- API endpoint is accessible
- Test user has appropriate permissions

**Test Data:**
```json
{
  "question": "What are the Scope 1 emissions for this company?",
  "company": "Nokia"
}
```

**Test Steps:**
1. Set Authorization header with valid JWT token
2. Send POST request to /api/v1/qa with test data
3. Verify response status code
4. Verify response body structure
5. Verify jobId format and uniqueness
6. Verify response time

**Expected Results:**
- HTTP Status Code: 202 (Accepted)
- Response contains valid UUID jobId
- Response time < 500ms
- Response body matches schema:
```json
{
  "jobId": "uuid-format",
  "status": "queued",
  "submittedAt": "ISO-8601-timestamp"
}
```

**API Contract Validation:**
- jobId is valid UUID format
- status is exactly "queued"
- submittedAt is valid ISO-8601 timestamp
- Content-Type: application/json

---

## API Test Case Categories

### 1. Authentication Endpoints
- Login success/failure scenarios
- Token validation
- Session management

### 2. Question & Answer Flow
- Question submission
- Job status retrieval
- Answer history

### 3. AIML Service Integration
- Answer generation
- Rate limiting
- Error handling

### 4. File Upload API
- Valid file upload
- File validation
- Size and format restrictions

### 5. Error Handling
- Invalid requests
- Server errors
- Timeout scenarios

### 6. Security & Performance
- Authentication bypass attempts
- Rate limiting
- Response time validation

---

## API Test Case Template

**Test Case ID:** TC_API_XXX  
**Test Case Title:** [METHOD /endpoint - Description]  
**Priority:** [High/Medium/Low]  
**Risk Level:** [High/Medium/Low]  
**Component:** [API Component Name]  
**Test Type:** [Functional/Security/Performance/etc.]  

**Preconditions:**
- [List prerequisites]

**Test Data:**
```json
{
  "example": "request body"
}
```

**Test Steps:**
1. [Step 1]
2. [Step 2]
3. [Step 3]
...

**Expected Results:**
- HTTP Status Code: [expected code]
- Response time: [performance requirement]
- Response schema: [expected structure]

**API Contract Validation:**
- [Specific field validations]

---

## Sample High Priority API Test Cases

### Authentication API
1. **TC_API_001:** POST /api/v1/auth/login - Valid credentials return JWT token
2. **TC_API_002:** POST /api/v1/auth/login - Invalid credentials return 401
3. **TC_API_003:** POST /api/v1/auth/logout - Valid token logs out successfully

### Question & Answer API
4. **TC_API_004:** POST /api/v1/qa - Valid question returns 202 with jobId
5. **TC_API_005:** GET /api/v1/qa/{jobId} - Returns job status and progress
6. **TC_API_006:** GET /api/v1/qa/{jobId} - Completed job returns answer and confidence
7. **TC_API_007:** GET /api/v1/qa - Returns last 10 answers for user

### File Upload API
8. **TC_API_008:** POST /api/v1/admin/companies/upload - Valid CSV upload succeeds
9. **TC_API_009:** POST /api/v1/admin/companies/upload - Non-CSV file returns 415
10. **TC_API_010:** POST /api/v1/admin/companies/upload - File >2MB returns 413

### AIML Service
11. **TC_API_011:** POST /aiml/answer - Valid request returns answer with confidence
12. **TC_API_012:** POST /aiml/answer - Rate limited request returns 429

---

## Negative Test Cases

### Input Validation
- **TC_API_013:** POST /api/v1/qa - Empty question returns 400
- **TC_API_014:** POST /api/v1/qa - Missing company field returns 400
- **TC_API_015:** POST /api/v1/qa - Question >10k chars returns 413
- **TC_API_016:** POST /api/v1/qa - Invalid JSON format returns 400

### Authentication & Authorization
- **TC_API_017:** Any protected endpoint without token returns 401
- **TC_API_018:** Protected endpoint with invalid token returns 401
- **TC_API_019:** Admin endpoint with Analyst token returns 403
- **TC_API_020:** Expired token returns 401

### Error Handling
- **TC_API_021:** GET /api/v1/qa/invalid-uuid returns 400
- **TC_API_022:** GET /api/v1/qa/non-existent-job returns 404
- **TC_API_023:** AIML service timeout handled gracefully
- **TC_API_024:** AIML service 500 error handled appropriately

---

## Edge Cases & Boundary Testing

### Data Boundaries
- Question length: 1 char, 9999 chars, 10000 chars, 10001 chars
- Company name: 1 char, 199 chars, 200 chars, 201 chars
- File size: 1 byte, 2MB-1byte, 2MB, 2MB+1byte

### Unicode & Special Characters
- Unicode in question: "What are 中国公司's emissions?"
- Special chars: "What's the company's CO₂ emissions?"
- Emoji in question: "What are the 🌍 emissions?"
- SQL injection attempts: "'; DROP TABLE companies; --"

### Concurrent Requests
- Multiple simultaneous job submissions
- Parallel status checks for same jobId
- Rate limiting with burst requests

---

## Performance Test Cases

- **TC_API_025:** POST /api/v1/qa response time <500ms at 10 RPS
- **TC_API_026:** GET /api/v1/qa/{jobId} response time <200ms
- **TC_API_027:** System handles 20 concurrent job submissions
- **TC_API_028:** File upload completes within 30s for 2MB file

---

## Security Test Cases

- **TC_API_029:** No sensitive data in error responses
- **TC_API_030:** Security headers present in responses
- **TC_API_031:** JWT token validation for all protected endpoints
- **TC_API_032:** No PII exposure in logs or responses

---

## Test Data Examples

### Valid Login Requests
```json
{
  "email": "analyst@test.com",
  "password": "TestPass123!"
}
```

### Valid Question Requests
```json
{
  "question": "What are the Scope 1 emissions for this company?",
  "company": "Nokia"
}
```

### Invalid Requests
```json
// Missing required field
{
  "question": "What are emissions?"
}

// Empty values
{
  "question": "",
  "company": ""
}

// Invalid data types
{
  "question": 123,
  "company": null
}
```

### Expected Response Schemas

**Job Response:**
```json
{
  "jobId": "string (UUID)",
  "status": "string (enum: queued|running|done|failed)",
  "submittedAt": "string (ISO-8601)",
  "completedAt": "string (ISO-8601) | null",
  "result": "object | null",
  "error": "string | null"
}
```

**Answer Object:**
```json
{
  "question": "string",
  "company": "string", 
  "answer": "string",
  "confidence": "number (0-1)",
  "timestamp": "string (ISO-8601)"
}
```

---

## Tools and Setup

### Recommended Tools
- **Postman** - For manual API testing and collection sharing
- **pytest + requests** - For automated API testing
- **Newman** - For running Postman collections in CI/CD

### Environment Variables
```bash
BASE_URL=https://api.sustaining-lite.dev
ANALYST_EMAIL=analyst@test.com
ANALYST_PASSWORD=TestPass123!
ADMIN_EMAIL=admin@test.com
ADMIN_PASSWORD=AdminPass123!
```

### Common Headers
```
Content-Type: application/json
Authorization: Bearer <jwt_token>
Accept: application/json
```

---

## Validation Checklist

For each API test case, verify:

- [ ] HTTP status code matches expectation
- [ ] Response time within acceptable limits
- [ ] Response body structure matches schema
- [ ] All required fields present in response
- [ ] Data types match specification
- [ ] Error messages are user-friendly
- [ ] No sensitive data exposed
- [ ] Proper HTTP headers set
- [ ] Rate limiting works as expected
- [ ] Timeouts handled gracefully