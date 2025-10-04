# QA Engineer Assignment - Sustaining.ai Lite

## Assignment Overview

 Test Engineer assignment, This is a practical testing challenge designed to evaluate your testing skills across manual testing, automation, and performance testing.

## MOCK Product Under Test: Sustaining.ai Lite

Sustaining.ai Lite is a simplified ESG (Environmental, Social, Governance) question-answering web application that helps users get AI-powered insights about companies' sustainability practices.

### System Architecture

```
Frontend (React) ←→ Processing API (Node.js/Go) ←→ AIML Service (Python)
      ↓                          ↓
  WebSocket/SSE         File Upload Handler
```

### Key Features

#### 1. Authentication & Authorization
- **Login:** Email/password authentication
- **Roles:** Admin and Analyst with different permissions
- **Session Management:** Secure session handling with proper expiry

#### 2. Question Console (React Frontend)
- Form to submit ESG questions about companies
- Real-time job status updates via WebSocket/SSE
- Display of last 10 answers
- Role-based UI access control

#### 3. Processing API (Node.js or Go)
- `POST /api/v1/qa` - Submit question, returns jobId
- `GET /api/v1/qa/:jobId` - Get job status and results
- Job states: `queued` → `running` → `done` | `failed`

#### 4. AIML Service (Python)
- `POST /aiml/answer` - Processes questions
- Returns `{answer, confidence}` where confidence ∈ [0,1]
- May return HTTP 429 on rate limits

#### 5. File Upload (Admin Only)
- `POST /api/v1/admin/companies/upload`
- CSV upload with company metadata
- Max size: 2MB, .csv files only
- Expected schema: `{companyName, isin, sector}`

#### 6. Real-time Updates
- WebSocket or Server-Sent Events (SSE)
- Live job status streaming
- Connection resilience handling

## Your Mission

Create a comprehensive test strategy for this application, including manual test cases, automation scripts, performance testing, and security checks.

## What You Need to Deliver

Your submission should be organized in the `/submission` folder with the following structure:

```
/submission
  /manual
    test-plan.md
    test-cases-ui.xlsx (or .csv)
    test-cases-api.xlsx (or .csv)
    bug-reports.xlsx (or .csv)
  /automation
    /ui   # Playwright or Cypress tests
    /api  # pytest or Postman collection
  /perf
    k6-script.js (or locust files)
    perf-findings.md
  README.md
```

### 1. Test Plan (test-plan.md)
- **Scope:** What will be tested
- **Risks:** High-risk areas to prioritize
- **Out-of-scope:** What won't be covered
- **Test Strategy:** Manual + automation approach
- **Environments:** Test environment setup
- **Test Data:** Data requirements
- **Tools:** Testing tools selection

### 2. Test Cases
- **UI Test Cases:** At least 12 high-priority test cases
- **API Test Cases:** At least 12 test cases covering /qa flow, AIML service, and upload
- **Coverage:** Include negative and edge cases
- **Format:** Clear, reusable format with IDs, preconditions, steps, expected results

### 3. Bug Reports
- **Minimum:** 5 bugs documented
- **Format:** Title, reproduction steps, actual vs expected, severity
- **Evidence:** Screenshots, HAR logs where applicable

### 4. Automation Sample (Choose One Focus Area)

#### Option A: UI Automation (Playwright or Cypress)
- 3-5 stable, data-driven tests
- Cover: login, submit question, stream status → result, role-based access
- No brittle selectors (use data-testids or role-based queries)

#### Option B: API Automation (pytest + requests or Postman/Newman)
- 6-8 tests validating status codes, payload contracts
- Include: retries, timeouts, schema validation
- Proper error handling and edge cases

### 5. Performance & Resilience Check
- **Duration:** 10-15 minute test run
- **Tool:** k6 or Locust
- **Scenario:** POST /qa (RPS 5→20 ramp) and GET /qa/:jobId
- **Deliverable:** Chart/screenshot + 3 key observations

### 6. Security & Compliance Sanity
- Document security checks performed
- Areas to cover: auth flows, rate limiting, upload validation, PII in logs, security headers
- Report any findings

### 7. README.md (1 page max)
- How to run your tests
- Assumptions made
- Limitations encountered
- What you'd test next with more time

## Core Test Scenarios

### A. Authentication & Roles
- Valid/invalid login flows
- Role-based access control (Admin vs Analyst)
- Session management and expiry

### B. Question → Job → Result Flow
- Submit question with company name
- Receive and track jobId
- Monitor status transitions: queued → running → done
- Validate answer and confidence values

### C. AIML Service Integration
- Handle 429 rate limiting with retries
- Manage 500 errors and timeouts
- Validate response contracts

### D. File Upload (Admin Feature)
- File type validation (.csv only)
- Size limit enforcement (2MB)
- CSV schema validation
- Error handling for malformed data

### E. Real-time Updates
- WebSocket/SSE connection stability
- State restoration after disconnection
- Parallel job handling without cross-contamination

### F. Negative & Edge Cases
- Empty/invalid inputs
- Unicode and special characters
- Long inputs (10k+ characters)
- Rate limiting behavior
- Network interruptions

## Sample Acceptance Criteria

- `POST /api/v1/qa` returns 202 with `{jobId: string}` within 500ms p95 at 10 RPS
- `GET /api/v1/qa/:jobId` returns terminal state in ≤15s for 95% of requests
- UI displays status transitions within ≤1s of server change
- Upload rejects non-CSV and >2MB files with user-friendly errors
- AIML 429 handling includes exponential backoff retries
- No PII or secrets in client-visible errors
- Security headers present: `X-Content-Type-Options: nosniff`, basic CSP

## Getting Started

1. **Start the mock API server:**
   ```bash
   cd mock-api
   npm install
   npm start
   ```
   Server will run on http://localhost:3001

2. **Review the API documentation** in `/docs/api-spec.yaml`
3. **Examine sample test templates** in `/templates/`
4. **Set up your testing environment** using provided automation starters
5. **Start with the test plan** - identify risks and prioritize
6. **Work iteratively** - manual testing first, then automation

## Evaluation Criteria

Your submission will be evaluated on:

- **Coverage & Prioritization (30%)** - Do you test the right things in the right order?
- **Bug Quality (20%)** - Are your bug reports actionable and well-documented?
- **Automation Quality (25%)** - Are your tests stable, maintainable, and comprehensive?
- **API & Performance Insight (15%)** - Do you provide meaningful technical insights?
- **Communication & Documentation (10%)** - Is your work clear and well-organized?

## What Makes a Great Submission

- Risk-based test planning with clear prioritization
- Test cases in reusable format with proper IDs and structure
- Automation without brittle selectors or hardcoded waits
- API tests that validate both status codes and response schemas
- Performance insights that connect metrics to user experience
- Clear documentation of assumptions and limitations

## Need Help?

- Check the `/docs/` folder for API specifications
- Review `/templates/` for test case formats
- Use `/automation-starters/` for framework setup examples
- Refer to this README for clarification on requirements

## Questions or Assumptions

If anything is unclear, make reasonable assumptions and document them in your README. This is part of the real-world testing experience!

Good luck! 🚀

---

**Note:** This is a practical assessment designed to simulate real-world testing challenges. Focus on quality over quantity, and demonstrate your testing mindset and technical skills.