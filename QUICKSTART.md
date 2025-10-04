# Quick Start Guide

## 🚀 Getting Started in 3 Steps

### 1. Start the Mock API Server
```bash
cd mock-api
npm install
npm start
```
✅ Server running on http://localhost:3001

### 2. Choose Your Testing Approach

#### Option A: Manual API Testing
```bash
# Test login endpoint
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"analyst@test.com","password":"TestPass123!"}'
```

#### Option B: UI Automation (Playwright)
```bash
cd automation-starters/playwright
npm install
npm test
```

#### Option C: API Automation (pytest)
```bash
cd automation-starters/api-pytest
pip install -r requirements.txt
pytest -v
```

#### Option D: Performance Testing (k6)
```bash
cd perf
k6 run nlq_load_test.js
```

### 3. Start Testing!

**Test Users Available:**
- 👤 **Analyst:** analyst@test.com / TestPass123!
- 👨‍💼 **Admin:** admin@test.com / AdminPass123!

**Key Test Scenarios:**
1. Authentication flows
2. Question submission & job tracking
3. File upload (Admin only)
4. Real-time WebSocket updates
5. Error handling & edge cases

---

## 📋 Assignment Checklist

- [ ] Start mock API server
- [ ] Create test plan with risk analysis
- [ ] Write manual test cases (UI & API)
- [ ] Execute tests and document bugs
- [ ] Build automation framework
- [ ] Run performance tests
- [ ] Complete security review
- [ ] Document findings and recommendations

## 🎯 Success Tips

1. **Prioritize high-risk areas** (auth, file upload, real-time updates)
2. **Focus on user impact** rather than just technical details
3. **Document assumptions** and limitations clearly
4. **Test edge cases** and error conditions
5. **Keep it realistic** - 6-8 hours total effort

## 📞 Need Help?

- Check `/docs/api-reference.md` for endpoint details
- Review `/templates/` for test case formats
- Examine `/automation-starters/` for framework examples
- Test the mock API at http://localhost:3001

**Happy Testing!** 🧪