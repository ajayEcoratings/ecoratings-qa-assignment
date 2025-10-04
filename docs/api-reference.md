# API Endpoint Documentation

## Base URLs
- **Local Mock Server:** `http://localhost:3001`
- **Development:** `https://api.sustaining-lite.dev` (not available for assignment)
- **Staging:** `https://api.sustaining-lite.staging` (not available for assignment)

## Authentication
All API endpoints (except login and AIML service) require Bearer token authentication.

```bash
Authorization: Bearer <jwt_token>
```

## Core Endpoints

### Authentication

#### POST /api/v1/auth/login
Authenticate user with email and password.

**Request:**
```json
{
  "email": "analyst@sustaining.ai",
  "password": "SecurePassword123!"
}
```

**Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "analyst@sustaining.ai",
    "role": "Analyst",
    "name": "John Doe"
  },
  "expiresIn": 3600
}
```

#### POST /api/v1/auth/logout
Logout current user session.

### Question & Answer Flow

#### POST /api/v1/qa
Submit an ESG question about a company.

**Request:**
```json
{
  "question": "What are the Scope 1 emissions for this company?",
  "company": "Nokia"
}
```

**Response (202):**
```json
{
  "jobId": "123e4567-e89b-12d3-a456-426614174000",
  "status": "queued",
  "submittedAt": "2025-10-04T10:30:00Z"
}
```

#### GET /api/v1/qa/{jobId}
Get job status and results.

**Response (200):**
```json
{
  "jobId": "123e4567-e89b-12d3-a456-426614174000",
  "status": "done",
  "submittedAt": "2025-10-04T10:30:00Z",
  "completedAt": "2025-10-04T10:30:15Z",
  "result": {
    "question": "What are the Scope 1 emissions for this company?",
    "company": "Nokia",
    "answer": "Nokia's Scope 1 emissions for 2023 were approximately 45,000 tCO2e...",
    "confidence": 0.85,
    "timestamp": "2025-10-04T10:30:15Z"
  },
  "error": null
}
```

**Job Status Values:**
- `queued` - Job is waiting to be processed
- `running` - Job is currently being processed
- `done` - Job completed successfully
- `failed` - Job failed with error

#### GET /api/v1/qa
Get the last 10 answers for the current user.

### Admin File Upload

#### POST /api/v1/admin/companies/upload
Upload CSV file with company metadata (Admin role required).

**Request:**
```bash
curl -X POST \
  -H "Authorization: Bearer <token>" \
  -F "file=@companies.csv" \
  https://api.sustaining-lite.dev/api/v1/admin/companies/upload
```

**Expected CSV Format:**
```csv
companyName,isin,sector
Nokia Corporation,FI0009000681,Technology
Apple Inc,US0378331005,Technology
```

**Response (200):**
```json
{
  "message": "File uploaded successfully",
  "processedRows": 2,
  "errors": []
}
```

### AIML Service (Internal)

#### POST /aiml/answer
Internal service for AI processing (used by Processing API).

**Request:**
```json
{
  "question": "What are the Scope 1 emissions for this company?",
  "company": "Nokia"
}
```

**Response (200):**
```json
{
  "answer": "Nokia's Scope 1 emissions for 2023 were approximately 45,000 tCO2e...",
  "confidence": 0.85
}
```

## Error Responses

All endpoints return consistent error format:

```json
{
  "error": "Human readable error message",
  "code": "ERROR_CODE",
  "details": {
    "field": "Additional context"
  }
}
```

### Common HTTP Status Codes
- `200` - Success
- `202` - Accepted (for async operations)
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `413` - Payload Too Large
- `415` - Unsupported Media Type
- `429` - Too Many Requests
- `500` - Internal Server Error
- `504` - Gateway Timeout

## Rate Limiting

- **General API:** 100 requests per minute per user
- **AIML Service:** 10 requests per minute (may return 429)
- **File Upload:** 5 uploads per hour per admin

## WebSocket/SSE for Real-time Updates

Connect to job status updates:

**WebSocket:** `wss://api.sustaining-lite.dev/ws/job-status?token=<jwt_token>`

**SSE:** `https://api.sustaining-lite.dev/api/v1/qa/stream?token=<jwt_token>`

**Message Format:**
```json
{
  "jobId": "123e4567-e89b-12d3-a456-426614174000",
  "status": "running",
  "timestamp": "2025-10-04T10:30:10Z"
}
```

## Testing Notes

### Test Data
- **Analyst Account:** `analyst@test.com` / `TestPass123!`
- **Admin Account:** `admin@test.com` / `AdminPass123!`

### Known Behaviors
- AIML service has 8-second timeout
- File uploads have 2MB size limit
- Sessions expire after 1 hour of inactivity
- Confidence scores are always between 0 and 1

### Rate Limit Testing
- AIML service rate limits can be triggered with >10 requests/minute
- API rate limits at 100 requests/minute per user

### Error Scenarios to Test
- Invalid JWT tokens
- Expired sessions
- File upload size violations
- Malformed CSV data
- Unicode characters in questions
- Extremely long questions (>10k characters)
- Network timeouts and retries