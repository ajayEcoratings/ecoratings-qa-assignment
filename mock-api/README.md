# Mock API Server

This is a fully functional mock API server that simulates the Sustaining.ai Lite backend for testing purposes.

## Quick Start

1. **Install dependencies:**
   ```bash
   cd mock-api
   npm install
   ```

2. **Start the server:**
   ```bash
   npm start
   ```

3. **Server will be running on:**
   - API: http://localhost:3001
   - WebSocket: ws://localhost:3001

## Test Users

| Role | Email | Password |
|------|-------|----------|
| **Analyst** | analyst@test.com | TestPass123! |
| **Admin** | admin@test.com | AdminPass123! |

## Features

### ✅ Complete API Implementation
- **Authentication**: JWT-based login/logout
- **Question Processing**: Async job handling with realistic delays
- **File Upload**: CSV validation with size/type restrictions  
- **Real-time Updates**: WebSocket support for job status
- **AIML Service**: Rate limiting and error simulation
- **Role-based Access**: Admin vs Analyst permissions

### 🧪 Built-in Test Scenarios
- **Rate Limiting**: AIML service limited to 10 requests/minute
- **File Validation**: Rejects non-CSV and >2MB files
- **Error Simulation**: Random failures and timeouts
- **Data Validation**: UUID format checking, confidence scores
- **Security**: JWT token validation, role-based access control

### 📊 Realistic Behavior
- **Processing Delays**: 3-10 second job completion times
- **Confidence Scores**: Mostly 0.6-1.0, occasionally invalid (1.2)
- **Answer Generation**: Dynamic ESG-related responses
- **Job Status Flow**: queued → running → done/failed
- **WebSocket Updates**: Real-time job status broadcasting

## API Endpoints

### Authentication
```bash
# Login
POST /api/v1/auth/login
Content-Type: application/json
{
  "email": "analyst@test.com",
  "password": "TestPass123!"
}

# Logout  
POST /api/v1/auth/logout
Authorization: Bearer <token>
```

### Question & Answer
```bash
# Submit question
POST /api/v1/qa
Authorization: Bearer <token>
Content-Type: application/json
{
  "question": "What are the Scope 1 emissions?",
  "company": "Nokia"
}

# Get job status
GET /api/v1/qa/{jobId}
Authorization: Bearer <token>

# Get recent answers
GET /api/v1/qa
Authorization: Bearer <token>
```

### File Upload (Admin Only)
```bash
# Upload CSV
POST /api/v1/admin/companies/upload
Authorization: Bearer <admin-token>
Content-Type: multipart/form-data
[file field with CSV data]
```

### AIML Service
```bash
# Process question (internal service)
POST /aiml/answer
Content-Type: application/json
{
  "question": "What are Nokia's emissions?",
  "company": "Nokia"
}
```

## WebSocket Connection

```javascript
const ws = new WebSocket('ws://localhost:3001');

// Authenticate
ws.send(JSON.stringify({
  type: 'auth',
  token: 'your-jwt-token'
}));

// Listen for job updates
ws.onmessage = (event) => {
  const update = JSON.parse(event.data);
  console.log('Job update:', update);
};
```

## Configuration

### Environment Variables
```bash
PORT=3001                    # Server port (default: 3001)
NODE_ENV=development         # Environment mode
```

### Rate Limits
- **AIML Service**: 10 requests per minute per IP
- **File Upload**: 2MB maximum size
- **JWT Tokens**: 1 hour expiration

## Testing Features

### Intentional "Bugs" for Discovery
1. **File Upload**: Accepts .txt files despite validation message
2. **Confidence Scores**: Occasionally returns values >1.0
3. **Rate Limiting**: AIML service may be too aggressive
4. **Error Messages**: Some expose internal details
5. **WebSocket**: Connection handling could be improved

### Error Simulation
- **5% chance** of AIML service 500 errors
- **10% chance** of job processing failures  
- **Random timeouts** for realistic behavior
- **Invalid data** occasionally returned for testing

## Sample Test Commands

### Manual API Testing
```bash
# Login as analyst
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"analyst@test.com","password":"TestPass123!"}'

# Submit a question
curl -X POST http://localhost:3001/api/v1/qa \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"question":"What are Nokia emissions?","company":"Nokia"}'

# Check job status
curl -X GET http://localhost:3001/api/v1/qa/JOB_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### File Upload Testing
```bash
# Create test CSV
echo "companyName,isin,sector
Nokia,FI0009000681,Technology
Apple,US0378331005,Technology" > test.csv

# Upload as admin
curl -X POST http://localhost:3001/api/v1/admin/companies/upload \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -F "file=@test.csv"
```

## Integration with Test Frameworks

### Update Base URLs
Update your test configurations to use the local mock server:

**Playwright config:**
```javascript
use: {
  baseURL: 'http://localhost:3001',
}
```

**pytest config:**
```python
base_url = "http://localhost:3001"
```

**k6 config:**
```javascript
const BASE_URL = 'http://localhost:3001';
```

## Server Logs

The server provides helpful logging:
```
🚀 Mock API Server running on http://localhost:3001
📚 API Documentation: Check docs/api-reference.md
🔧 WebSocket endpoint: ws://localhost:3001
👤 Test Users:
   Analyst: analyst@test.com / TestPass123!
   Admin: admin@test.com / AdminPass123!
```

## Troubleshooting

### Common Issues

**Port already in use:**
```bash
# Change port
PORT=3002 npm start
```

**WebSocket connection issues:**
```bash
# Check server logs for connection status
# Ensure JWT token is valid for WebSocket auth
```

**File upload errors:**
```bash
# Ensure file is <2MB and has .csv extension
# Check Content-Type is multipart/form-data
```

### Health Check
```bash
curl http://localhost:3001/health
# Should return: {"status":"OK","message":"Mock API server is running"}
```

## Development Notes

### Adding New Features
1. Update `server.js` with new endpoints
2. Add corresponding documentation
3. Update API spec in `/docs/api-spec.yaml`

### Modifying Test Data
- Edit user credentials in the `users` array
- Modify answer templates in `generateAnswer()`
- Adjust rate limits and delays as needed

---

**Ready to test!** Start the server and begin your testing assignment. The mock API provides all the functionality described in the assignment requirements.