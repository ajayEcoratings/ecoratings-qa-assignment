# Performance Testing Template - k6

This directory contains k6 performance testing scripts for the Sustaining.ai Lite API.

## Overview

The performance tests simulate realistic user behavior by:
- Authenticating as an analyst user
- Submitting ESG questions about companies
- Checking job status periodically
- Retrieving recent answers

## Test Scenarios

### 1. Basic Load Test (Default)
- **Duration:** 15 minutes total
- **Load Pattern:** 5 → 10 → 20 → 0 RPS
- **Purpose:** Validate normal operation under expected load

### 2. Stress Test
- **Duration:** 7 minutes
- **Load Pattern:** 50 → 100 → 0 RPS  
- **Purpose:** Find breaking point and recovery behavior

### 3. Soak Test
- **Duration:** 40 minutes
- **Load Pattern:** Sustained 10 RPS
- **Purpose:** Detect memory leaks and degradation over time

## Requirements

1. **Start the mock API server:**
   ```bash
   cd ../mock-api
   npm install
   npm start
   ```
   Server runs on http://localhost:3001

2. **Install k6:**
   ```bash
   # macOS
   brew install k6
   
   # Ubuntu/Debian
   sudo apt update && sudo apt install k6
   
   # Windows
   choco install k6
   ```

3. **Environment Variables (optional):**
   ```bash
   export BASE_URL=http://localhost:3001
   export ANALYST_EMAIL=analyst@test.com
   export ANALYST_PASSWORD=TestPass123!
   ```

## Running Tests

### Basic Load Test
```bash
k6 run nlq_load_test.js
```

### Stress Test
```bash
k6 run --env SCENARIO=stress nlq_load_test.js
```

### Soak Test
```bash
k6 run --env SCENARIO=soak nlq_load_test.js
```

### Custom Configuration
```bash
# Custom environment (if running mock server on different port)
k6 run --env BASE_URL=http://localhost:3002 nlq_load_test.js

# Custom target and duration
k6 run --env TARGET_RPS=30 --env DURATION=10m nlq_load_test.js

# Generate detailed output
k6 run --out json=results.json nlq_load_test.js
```

## Test Metrics

### Key Performance Indicators (KPIs)

1. **Response Time Requirements:**
   - POST /qa: p95 < 500ms
   - GET /qa/{jobId}: p95 < 200ms
   - Overall p95 < 1000ms

2. **Error Rate Targets:**
   - HTTP errors < 10%
   - Custom errors < 5%

3. **Throughput Targets:**
   - Sustain 20 RPS without degradation
   - Handle burst to 50+ RPS temporarily

### Custom Metrics

- `qa_submission_time`: Time for question submissions
- `job_status_time`: Time for status checks  
- `errors`: Custom error rate tracking

## Test Data

### Questions Pool
- "What are the Scope 1 emissions for this company?"
- "Describe the company's renewable energy initiatives"
- "What is the company's carbon neutrality target?"
- "How does the company handle waste management?"
- "What are the company's water conservation practices?"

### Companies Pool
- Nokia
- Apple Inc
- Microsoft Corporation  
- Google
- Amazon

## Interpreting Results

### Sample Output
```
     ✓ QA submission status is 202
     ✓ QA submission response time < 500ms
     ✓ Job status check is 200
     ✓ Job status response time < 200ms

     checks.........................: 98.5%  ✓ 2950   ✗ 45
     data_received..................: 1.2 MB 85 kB/s
     data_sent......................: 450 kB 32 kB/s
     http_req_duration..............: avg=245ms min=45ms med=200ms max=1.2s p(90)=380ms p(95)=450ms
     http_req_failed................: 1.5%   ✓ 45     ✗ 2955
     iteration_duration.............: avg=2.1s  min=1.2s med=2.0s max=4.1s p(90)=2.8s p(95)=3.2s
     iterations.....................: 1500   107/s
     vus............................: 20     min=5    max=20
     vus_max........................: 20     min=5    max=20

Custom Metrics:
     ✓ qa_submission_time...........: avg=180ms min=45ms med=160ms max=890ms p(95)=420ms
     ✓ job_status_time..............: avg=95ms  min=30ms med=85ms  max=450ms p(95)=180ms
     ✓ errors.......................: 2.1%   ✓ 63     ✗ 2937
```

### Key Observations Template

**Performance Summary:**
- ✅ **Response Times:** All endpoints met p95 requirements
- ⚠️  **Error Rate:** 2.1% error rate (target: <5%)
- ✅ **Throughput:** Successfully handled 20 RPS sustained load

**Detailed Findings:**

1. **Question Submission (/qa):**
   - Average: 180ms, p95: 420ms (✅ <500ms target)
   - 1.2% failure rate at peak load

2. **Job Status Checks (/qa/{jobId}):**
   - Average: 95ms, p95: 180ms (✅ <200ms target)
   - Consistent performance across load levels

3. **System Behavior:**
   - No significant degradation during ramp-up
   - Recovery time after peak: ~30 seconds
   - Memory usage appeared stable

**Recommendations:**
- System performs well under expected load
- Consider investigating error sources during high RPS
- Monitor database connection pooling at scale

## Creating Your Own Analysis

### 1. Capture Results
```bash
# JSON output for detailed analysis
k6 run --out json=results.json nlq_load_test.js

# InfluxDB for time-series analysis (if available)
k6 run --out influxdb=http://localhost:8086/k6db nlq_load_test.js
```

### 2. Generate Charts/Screenshots
- Use k6 Cloud (k6.io) for automatic charts
- Import JSON to Grafana for custom dashboards
- Use built-in summary for quick screenshots

### 3. Document Key Observations
Focus on:
- Response time trends during load changes
- Error patterns and recovery behavior
- Resource utilization correlation
- User experience impact (p95 latency)

## Common Issues & Solutions

### High Error Rates
```javascript
// Check authentication
check(loginResponse, {
  'login successful': (r) => r.status === 200,
});

// Validate test data
console.log('Using credentials:', ANALYST_EMAIL);
```

### Performance Bottlenecks
```javascript
// Add more detailed timing
const startTime = Date.now();
const response = http.post(url, payload, { headers });
const duration = Date.now() - startTime;
console.log(`Request took ${duration}ms`);
```

### Resource Exhaustion
```javascript
// Limit job tracking
if (submittedJobs.length > 50) {
  submittedJobs.splice(0, 10); // Keep only recent jobs
}
```

## Advanced Configuration

### Custom Load Patterns
```javascript
export const options = {
  stages: [
    { duration: '30s', target: 5 },    // Warm up
    { duration: '1m', target: 10 },    // Normal load
    { duration: '30s', target: 50 },   // Spike test
    { duration: '1m', target: 10 },    // Recovery
    { duration: '30s', target: 0 },    // Cool down
  ],
};
```

### Environment-specific Settings
```javascript
const configs = {
  dev: { baseUrl: 'https://dev-api.sustaining-lite.dev', maxRPS: 10 },
  staging: { baseUrl: 'https://staging-api.sustaining-lite.dev', maxRPS: 20 },
  prod: { baseUrl: 'https://api.sustaining-lite.dev', maxRPS: 50 },
};

const config = configs[__ENV.ENVIRONMENT || 'dev'];
```

## Next Steps

1. **Baseline Testing:** Establish performance baselines
2. **Trend Monitoring:** Regular performance regression testing
3. **Capacity Planning:** Determine scaling requirements
4. **Optimization:** Identify and address bottlenecks

## Resources

- [k6 Documentation](https://k6.io/docs/)
- [Performance Testing Guide](https://k6.io/docs/testing-guides/)
- [k6 Examples](https://github.com/grafana/k6/tree/main/examples)