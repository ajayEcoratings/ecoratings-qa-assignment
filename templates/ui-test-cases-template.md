# Test Case Template - UI Testing

## Format Instructions
- Use clear, unique test case IDs
- Include preconditions and test data requirements  
- Write specific, actionable steps
- Define clear expected results
- Assign appropriate priority and risk levels

---

## Test Case Example

**Test Case ID:** TC_UI_001  
**Test Case Title:** Valid login redirects to dashboard  
**Priority:** High  
**Risk Level:** High  
**Component:** Authentication  
**Test Type:** Functional  

**Preconditions:**
- Application is accessible
- Test user credentials available: analyst@test.com / TestPass123!
- User is not already logged in

**Test Data:**
- Valid email: analyst@test.com
- Valid password: TestPass123!

**Test Steps:**
1. Navigate to the login page
2. Enter valid email in the email field
3. Enter valid password in the password field  
4. Click the "Login" button
5. Verify redirection occurs
6. Verify dashboard page elements are displayed

**Expected Results:**
- User is redirected to dashboard page within 2 seconds
- Dashboard displays user name and role
- Navigation menu shows appropriate options for Analyst role
- No error messages are displayed
- Session cookie is set with proper security flags

**Postconditions:**
- User is authenticated and on dashboard
- Session is active

---

## UI Test Case Categories

### 1. Authentication & Authorization
- Valid/invalid login scenarios
- Role-based access control
- Session management
- Logout functionality

### 2. Question Submission Flow
- Form validation
- Question submission
- Job tracking
- Result display

### 3. Real-time Updates
- WebSocket connection
- Status updates
- Connection recovery

### 4. File Upload (Admin)
- File selection
- Upload validation
- Progress indication
- Error handling

### 5. Navigation & Layout
- Page routing
- Responsive design
- Cross-browser compatibility

### 6. Error Handling
- Network errors
- Server errors  
- Validation errors
- User feedback

---

## Test Case Template (Copy this for your test cases)

**Test Case ID:** TC_UI_XXX  
**Test Case Title:** [Clear, descriptive title]  
**Priority:** [High/Medium/Low]  
**Risk Level:** [High/Medium/Low]  
**Component:** [Authentication/QA Flow/File Upload/etc.]  
**Test Type:** [Functional/UI/Integration/etc.]  

**Preconditions:**
- [List all prerequisites]

**Test Data:**
- [Specify test data needed]

**Test Steps:**
1. [Step 1]
2. [Step 2]
3. [Step 3]
...

**Expected Results:**
- [Clear, specific expected outcomes]

**Postconditions:**
- [System state after test]

---

## Sample Test Case Ideas

### High Priority Test Cases
1. **TC_UI_001:** Valid login redirects to dashboard
2. **TC_UI_002:** Invalid credentials show error message
3. **TC_UI_003:** Admin can access upload page, Analyst cannot
4. **TC_UI_004:** Submit valid question displays job ID
5. **TC_UI_005:** Job status updates in real-time
6. **TC_UI_006:** Completed job shows answer and confidence
7. **TC_UI_007:** CSV upload succeeds with valid file
8. **TC_UI_008:** Non-CSV file upload shows error
9. **TC_UI_009:** File size over 2MB shows error
10. **TC_UI_010:** Session expiry redirects to login
11. **TC_UI_011:** Last 10 answers display correctly
12. **TC_UI_012:** Empty question shows validation error

### Medium Priority Test Cases
13. **TC_UI_013:** Unicode characters in question field
14. **TC_UI_014:** Very long question (10k+ chars) handling
15. **TC_UI_015:** Network disconnection during job processing
16. **TC_UI_016:** Multiple parallel job submissions
17. **TC_UI_017:** Browser refresh during active job
18. **TC_UI_018:** WebSocket reconnection after network failure

### Low Priority Test Cases
19. **TC_UI_019:** UI responsiveness on mobile devices
20. **TC_UI_020:** Keyboard navigation accessibility
21. **TC_UI_021:** Cross-browser compatibility (Chrome, Firefox, Safari)
22. **TC_UI_022:** Dark/light theme consistency

---

## Negative Test Cases to Include

- Empty form submissions
- SQL injection attempts in text fields
- XSS payload attempts
- Boundary value testing (max/min lengths)
- Special characters and emojis
- Network timeout scenarios
- Server error responses (500, 503)
- Malformed API responses

---

## Test Data Recommendations

**User Accounts:**
- analyst@test.com / TestPass123! (Analyst role)
- admin@test.com / AdminPass123! (Admin role)

**Test Questions:**
- "What are the Scope 1 emissions for this company?"
- "Describe the company's renewable energy initiatives"
- Very long question (>1000 chars)
- Unicode question: "What are 中国公司's sustainability practices?"
- Empty string
- Only spaces

**Test Companies:**
- Nokia
- Apple Inc
- Microsoft Corporation
- Invalid company: "NonExistentCompany123"
- Unicode company: "中国移动"

**Test CSV Files:**
- valid-companies.csv (proper format)
- invalid-format.csv (wrong columns)
- large-file.csv (>2MB)
- empty-file.csv
- text-file.txt (wrong extension)

---

## Notes for Test Execution

1. **Browser Testing:** Test on Chrome, Firefox, and Safari
2. **Mobile Testing:** Include iOS Safari and Android Chrome
3. **Network Conditions:** Test on slow 3G and offline scenarios
4. **Accessibility:** Use screen reader and keyboard-only navigation
5. **Security:** Check for sensitive data exposure in DevTools
6. **Performance:** Monitor page load times and UI responsiveness