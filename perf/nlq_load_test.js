import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');
const qaSubmissionTime = new Trend('qa_submission_time');
const jobStatusTime = new Trend('job_status_time');

// Configuration
const BASE_URL = __ENV.BASE_URL || 'http://localhost:3001';
const ANALYST_EMAIL = __ENV.ANALYST_EMAIL || 'analyst@test.com';
const ANALYST_PASSWORD = __ENV.ANALYST_PASSWORD || 'TestPass123!';

// Test configuration
export const options = {
  stages: [
    { duration: '2m', target: 5 },   // Ramp up to 5 RPS
    { duration: '5m', target: 10 },  // Stay at 10 RPS
    { duration: '3m', target: 20 },  // Ramp up to 20 RPS
    { duration: '3m', target: 20 },  // Stay at 20 RPS
    { duration: '2m', target: 0 },   // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<1000'], // 95% of requests under 1s
    http_req_failed: ['rate<0.1'],     // Error rate under 10%
    errors: ['rate<0.05'],             // Custom error rate under 5%
    qa_submission_time: ['p(95)<500'], // QA submission under 500ms
    job_status_time: ['p(95)<200'],    // Status check under 200ms
  },
};

// Global variables
let authToken = '';
const submittedJobs = [];

// Test data
const testQuestions = [
  "What are the Scope 1 emissions for this company?",
  "Describe the company's renewable energy initiatives",
  "What is the company's carbon neutrality target?",
  "How does the company handle waste management?",
  "What are the company's water conservation practices?",
];

const testCompanies = [
  "Nokia",
  "Apple Inc",
  "Microsoft Corporation",
  "Google",
  "Amazon",
];

// Setup function - runs once per VU at the beginning
export function setup() {
  console.log('Setting up test environment...');
  
  // Login and get authentication token
  const loginResponse = http.post(`${BASE_URL}/api/v1/auth/login`, JSON.stringify({
    email: ANALYST_EMAIL,
    password: ANALYST_PASSWORD,
  }), {
    headers: { 'Content-Type': 'application/json' },
  });

  check(loginResponse, {
    'login successful': (r) => r.status === 200,
    'login response has token': (r) => JSON.parse(r.body).token !== undefined,
  });

  if (loginResponse.status === 200) {
    const token = JSON.parse(loginResponse.body).token;
    console.log('Authentication successful');
    return { token };
  } else {
    console.error('Authentication failed:', loginResponse.body);
    return { token: null };
  }
}

// Main test function
export default function (data) {
  if (!data.token) {
    console.error('No valid authentication token available');
    return;
  }

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${data.token}`,
  };

  // Test 1: Submit a question (Primary load test scenario)
  testQuestionSubmission(headers);
  
  // Test 2: Check job status (if we have submitted jobs)
  if (submittedJobs.length > 0) {
    testJobStatusCheck(headers);
  }

  // Test 3: Get recent answers (lighter load)
  if (Math.random() < 0.3) { // 30% of the time
    testGetRecentAnswers(headers);
  }

  // Small delay between operations
  sleep(Math.random() * 2 + 1); // 1-3 second delay
}

function testQuestionSubmission(headers) {
  const question = testQuestions[Math.floor(Math.random() * testQuestions.length)];
  const company = testCompanies[Math.floor(Math.random() * testCompanies.length)];
  
  const payload = {
    question: question,
    company: company,
  };

  const startTime = Date.now();
  const response = http.post(`${BASE_URL}/api/v1/qa`, JSON.stringify(payload), { headers });
  const duration = Date.now() - startTime;

  // Record custom metrics
  qaSubmissionTime.add(duration);
  
  const success = check(response, {
    'QA submission status is 202': (r) => r.status === 202,
    'QA submission response time < 500ms': (r) => duration < 500,
    'QA response has jobId': (r) => {
      if (r.status === 202) {
        const body = JSON.parse(r.body);
        return body.jobId !== undefined;
      }
      return false;
    },
    'QA response has valid status': (r) => {
      if (r.status === 202) {
        const body = JSON.parse(r.body);
        return body.status === 'queued';
      }
      return false;
    },
  });

  if (!success) {
    errorRate.add(1);
    console.error(`QA submission failed: ${response.status} ${response.body}`);
  } else {
    errorRate.add(0);
    if (response.status === 202) {
      const jobId = JSON.parse(response.body).jobId;
      submittedJobs.push({
        jobId: jobId,
        submittedAt: Date.now(),
      });
      
      // Keep only recent jobs to avoid memory issues
      if (submittedJobs.length > 50) {
        submittedJobs.splice(0, 10);
      }
    }
  }
}

function testJobStatusCheck(headers) {
  // Check status of a recently submitted job
  const recentJobs = submittedJobs.filter(job => Date.now() - job.submittedAt < 300000); // Last 5 minutes
  
  if (recentJobs.length === 0) return;
  
  const randomJob = recentJobs[Math.floor(Math.random() * recentJobs.length)];
  
  const startTime = Date.now();
  const response = http.get(`${BASE_URL}/api/v1/qa/${randomJob.jobId}`, { headers });
  const duration = Date.now() - startTime;

  // Record custom metrics
  jobStatusTime.add(duration);

  const success = check(response, {
    'Job status check is 200': (r) => r.status === 200,
    'Job status response time < 200ms': (r) => duration < 200,
    'Job status has valid status': (r) => {
      if (r.status === 200) {
        const body = JSON.parse(r.body);
        return ['queued', 'running', 'done', 'failed'].includes(body.status);
      }
      return false;
    },
    'Job status response has jobId': (r) => {
      if (r.status === 200) {
        const body = JSON.parse(r.body);
        return body.jobId === randomJob.jobId;
      }
      return false;
    },
  });

  if (!success) {
    errorRate.add(1);
    console.error(`Job status check failed: ${response.status} ${response.body}`);
  } else {
    errorRate.add(0);
  }
}

function testGetRecentAnswers(headers) {
  const response = http.get(`${BASE_URL}/api/v1/qa`, { headers });

  const success = check(response, {
    'Get recent answers status is 200': (r) => r.status === 200,
    'Get recent answers has answers array': (r) => {
      if (r.status === 200) {
        const body = JSON.parse(r.body);
        return Array.isArray(body.answers);
      }
      return false;
    },
    'Recent answers count <= 10': (r) => {
      if (r.status === 200) {
        const body = JSON.parse(r.body);
        return body.answers.length <= 10;
      }
      return false;
    },
  });

  if (!success) {
    errorRate.add(1);
    console.error(`Get recent answers failed: ${response.status} ${response.body}`);
  } else {
    errorRate.add(0);
  }
}

// Teardown function - runs once at the end
export function teardown(data) {
  console.log('Tearing down test environment...');
  
  if (data.token) {
    // Logout
    const logoutResponse = http.post(`${BASE_URL}/api/v1/auth/logout`, null, {
      headers: { 'Authorization': `Bearer ${data.token}` },
    });
    
    check(logoutResponse, {
      'logout successful': (r) => r.status === 200,
    });
    
    console.log('Logout completed');
  }
  
  console.log(`Total jobs submitted during test: ${submittedJobs.length}`);
}

// Advanced scenarios for comprehensive testing
export function stressTestScenario() {
  // This function can be used for stress testing
  // Run with: k6 run --env SCENARIO=stress load_test.js
  
  return {
    stages: [
      { duration: '1m', target: 50 },   // Ramp up to 50 RPS quickly
      { duration: '5m', target: 100 },  // Stress at 100 RPS
      { duration: '1m', target: 0 },    // Quick ramp down
    ],
    thresholds: {
      http_req_duration: ['p(95)<2000'], // More lenient during stress
      http_req_failed: ['rate<0.3'],     // Allow higher error rate
    },
  };
}

export function soakTestScenario() {
  // This function can be used for soak testing
  // Run with: k6 run --env SCENARIO=soak load_test.js
  
  return {
    stages: [
      { duration: '5m', target: 10 },   // Ramp up
      { duration: '30m', target: 10 },  // Soak for 30 minutes
      { duration: '5m', target: 0 },    // Ramp down
    ],
    thresholds: {
      http_req_duration: ['p(95)<1000'],
      http_req_failed: ['rate<0.05'],
    },
  };
}

// Usage:
// Basic load test: k6 run load_test.js
// Stress test: k6 run --env SCENARIO=stress load_test.js  
// Soak test: k6 run --env SCENARIO=soak load_test.js
// With custom target: k6 run --env BASE_URL=https://staging.api.com load_test.js