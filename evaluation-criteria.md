# Evaluation Criteria & Scoring Rubric

This document outlines how submissions will be evaluated and what constitutes excellence at each level.

## Overall Scoring (100 points total)

| Category | Weight | Points | Description |
|----------|--------|--------|-------------|
| **Coverage & Prioritization** | 30% | 30 | Risk-based testing, appropriate scope, critical path focus |
| **Bug Quality** | 20% | 20 | Clear, actionable, well-documented defects |
| **Automation Quality** | 25% | 25 | Stable, maintainable, comprehensive automated tests |
| **API & Performance Insight** | 15% | 15 | Technical depth, meaningful metrics, user impact |
| **Communication & Documentation** | 10% | 10 | Clear explanations, assumptions, next steps |

---

## 1. Coverage & Prioritization (30 points)

### Excellent (26-30 points)
- **Risk-based approach:** High-risk areas tested first (auth, real-time updates, file upload)
- **Complete coverage:** All core scenarios covered with appropriate depth
- **Smart prioritization:** Critical paths identified and thoroughly tested
- **Edge case awareness:** Boundary conditions, negative scenarios, error handling
- **Integration focus:** API integration points, WebSocket behavior, AIML service interaction

**Example:** Test plan clearly identifies auth bypass as highest risk, dedicates 40% of effort to authentication flows, covers Unicode/boundary cases, and tests AIML rate limiting integration.

### Good (21-25 points)
- Most high-risk areas covered
- Good functional coverage with some edge cases
- Generally appropriate prioritization
- Some integration testing

### Needs Improvement (0-20 points)
- Random or unfocused testing approach
- Missing critical scenarios (auth, file upload, real-time)
- No clear risk assessment
- Surface-level testing only

---

## 2. Bug Quality (20 points)

### Excellent (18-20 points)
- **Clear titles:** Concise, specific, actionable (e.g., "File upload accepts .txt files despite .csv-only validation")
- **Minimal reproduction:** Exact steps that reliably reproduce the issue
- **Expected vs Actual:** Clear description of what should happen vs what happens
- **Appropriate severity:** Critical for security, High for broken functionality, etc.
- **Evidence:** Screenshots, HAR files, error messages, network traces
- **User impact:** Explains how the bug affects real users

**Example Bug Report:**
```
Title: Admin file upload bypasses size validation allowing >2MB files
Severity: High
Steps: 1. Login as admin, 2. Navigate to upload, 3. Select 5MB CSV file, 4. Click upload
Expected: File rejected with "File too large" error
Actual: File uploads successfully, server returns 200 OK
Impact: Could lead to storage exhaustion and server performance issues
Evidence: [Screenshot of successful upload, Network tab showing 5MB transfer]
```

### Good (14-17 points)
- Clear reproduction steps
- Appropriate severity assignment
- Some evidence provided
- Generally actionable

### Needs Improvement (0-13 points)
- Vague descriptions
- Missing reproduction steps
- Incorrect severity assignment
- No supporting evidence

---

## 3. Automation Quality (25 points)

### Excellent (22-25 points)
- **Stable selectors:** Uses data-testids, avoids brittle CSS selectors
- **No hardcoded waits:** Proper wait strategies, condition-based waiting
- **Page Object Model:** Well-organized, reusable code structure
- **Data-driven:** Configurable test data, environment variables
- **Comprehensive assertions:** Status codes, response schemas, timing validations
- **Error handling:** Graceful failure handling, meaningful error messages
- **CI-ready:** Can run in headless mode, generates reports

**Example - Excellent Playwright Test:**
```typescript
// ✅ Good: Stable selector, proper waiting, clear assertion
await page.fill('[data-testid="question-input"]', testData.question);
await page.click('[data-testid="submit-button"]');
await expect(page.locator('[data-testid="job-id"]')).toBeVisible();
const jobId = await page.textContent('[data-testid="job-id"]');
expect(jobId).toMatch(/^[0-9a-f-]{36}$/);
```

**Example - Excellent API Test:**
```python
# ✅ Good: Schema validation, performance check, proper assertion
response = session.post(f"{config.base_url}/api/v1/qa", json=payload, headers=headers)
assert response.status_code == 202
assert response.elapsed.total_seconds() < 0.5
data = response.json()
assert validate_uuid(data["jobId"])
assert data["status"] == "queued"
```

### Good (18-21 points)
- Generally stable selectors
- Most tests are reliable
- Basic assertions present
- Some code organization

### Needs Improvement (0-17 points)
- Brittle selectors (CSS classes, complex XPath)
- Hardcoded sleeps
- Minimal or missing assertions
- Flaky test execution

---

## 4. API & Performance Insight (15 points)

### Excellent (13-15 points)
- **Technical depth:** Validates HTTP headers, response schemas, error codes
- **Performance awareness:** Response time assertions, identifies bottlenecks
- **User impact focus:** Connects metrics to user experience (p95 latency affects perceived performance)
- **Meaningful observations:** Actionable insights about system behavior
- **Contract validation:** JSON schema validation, data type checking

**Example Insights:**
- "p95 response time of 420ms meets requirement but shows degradation at >15 RPS"
- "AIML service rate limiting appears aggressive - 10 req/min may impact user experience"
- "WebSocket reconnection takes 3-5 seconds, users will notice status update delays"

### Good (11-12 points)
- Basic performance metrics
- Some technical validation
- General observations

### Needs Improvement (0-10 points)
- Only basic status code checks
- No performance considerations
- Superficial analysis

---

## 5. Communication & Documentation (10 points)

### Excellent (9-10 points)
- **Clear assumptions:** Documents decisions and assumptions made
- **Honest limitations:** Acknowledges what wasn't tested and why
- **Actionable next steps:** Specific recommendations for further testing
- **Well-organized:** Easy to follow structure, proper formatting
- **Context awareness:** Shows understanding of real-world constraints

**Example README excerpt:**
```markdown
## Assumptions Made
- WebSocket reconnection timeout set to 30 seconds (not documented in API spec)
- File upload validation happens client-side only (security concern noted)
- AIML service has 10 req/min rate limit based on 429 responses observed

## Limitations
- Did not test with files >10MB due to environment constraints
- Cross-browser testing limited to Chrome/Firefox (Safari requires macOS)
- Load testing capped at 20 RPS due to test account limits

## Next Steps (with more time)
1. Security penetration testing for file upload endpoints
2. Extended soak testing (4+ hours) to detect memory leaks  
3. Mobile-specific testing for WebSocket behavior on poor networks
```

### Good (7-8 points)
- Generally clear documentation
- Some assumptions documented
- Basic next steps

### Needs Improvement (0-6 points)
- Poor organization
- Missing key information
- No clear next steps

---

## Assessment Guidelines (For Evaluators)

### Major Issues (-10 points each)
- **Non-functional automation:** Scripts that don't run or fail immediately
- **Security blind spots:** Missing tests for auth bypass, file upload security
- **Copy-paste errors:** Evidence of copying without understanding

### Minor Issues (-2 to -5 points each)
- **Inconsistent formatting:** Poor organization, hard to follow
- **Missing evidence:** Bug reports without screenshots or reproduction steps
- **Unrealistic timelines:** Claiming 8 hours of work in 2 hours

---

## Bonus Points (up to +5 points)

### Exceptional Quality Indicators
- **Creative testing approaches:** Novel edge cases or testing strategies
- **Tool mastery:** Advanced use of testing frameworks or tools
- **Business insight:** Understanding of real user impact and business priorities
- **Security awareness:** Identifies potential vulnerabilities beyond basic testing

---

## Sample Scoring Examples

### Scenario A: Senior-level Submission (85/100)
- **Coverage (25/30):** Excellent risk prioritization, minor gaps in edge cases
- **Bugs (18/20):** 6 well-documented bugs with clear evidence
- **Automation (23/25):** Stable Playwright tests with good POM, minor issues with waits
- **Performance (13/15):** Insightful k6 analysis with user impact focus
- **Communication (8/10):** Well-organized, clear assumptions, good next steps
- **Bonus (+2):** Creative boundary testing approach

### Scenario B: Mid-level Submission (72/100)
- **Coverage (22/30):** Good functional coverage, some prioritization issues
- **Bugs (15/20):** 5 bugs with adequate documentation, missing some evidence
- **Automation (18/25):** Working tests but some brittle selectors
- **Performance (11/15):** Basic performance testing, limited insights
- **Communication (7/10):** Adequate documentation, some gaps

### Scenario C: Junior-level Submission (58/100)
- **Coverage (18/30):** Surface-level testing, missed critical areas
- **Bugs (12/20):** 3 bugs with minimal documentation
- **Automation (15/25):** Tests run but are flaky, hardcoded waits
- **Performance (8/15):** Basic k6 script, no meaningful analysis
- **Communication (5/10):** Poor organization, missing assumptions

---

## What Hiring Managers Look For

### Strong Signals
1. **Testing mindset:** Thinks like a user, identifies real problems
2. **Technical competence:** Comfortable with tools and APIs
3. **Communication skills:** Can explain technical issues clearly
4. **Business awareness:** Understands impact and priorities
5. **Continuous learning:** Shows willingness to try new approaches

### Warning Signs
1. **Checkbox mentality:** Going through motions without thinking
2. **Tool obsession:** Focuses on tools over testing strategy
3. **Perfectionism:** Spends too much time on low-value activities
4. **Poor communication:** Can't explain findings clearly

---

## Self-Assessment Questions

Before submitting, ask yourself:

1. **Would I be comfortable deploying this system based on my testing?**
2. **Have I identified the most critical risks and tested them thoroughly?**
3. **Could another QA engineer easily understand and extend my work?**
4. **Do my bug reports give developers everything they need to fix issues?**
5. **Have I provided actionable insights beyond just "tests pass/fail"?**

Remember: This is not just about finding bugs—it's about demonstrating your ability to assess risk, communicate effectively, and provide value to a development team.