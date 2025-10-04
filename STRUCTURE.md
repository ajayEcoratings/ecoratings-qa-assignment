# 📁 Assignment Structure

```
ecoratings-qa-assignment/
├── 📖 README.md                    # Main assignment instructions
├── 🚀 QUICKSTART.md                # Quick start guide (3 steps)
├── 📊 evaluation-criteria.md       # How your work will be evaluated
├── 
├── 🔧 mock-api/                    # Mock server (START HERE)
│   ├── README.md                   # Server documentation
│   ├── package.json                # Dependencies
│   ├── server.js                   # Mock API server
│   └── public/index.html           # Basic frontend page
├── 
├── 📚 docs/                        # API Documentation
│   ├── api-spec.yaml               # OpenAPI specification
│   └── api-reference.md            # Endpoint details & examples
├── 
├── 📝 templates/                   # Test case templates & examples
│   ├── test-plan-template.md       # Test plan format
│   ├── ui-test-cases-template.md   # UI test case examples
│   ├── api-test-cases-template.md  # API test case examples
│   ├── sample-ui-test-cases.csv    # Sample test cases
│   ├── sample-api-test-cases.csv   # Sample API tests
│   └── sample-bug-reports.csv      # Bug report examples
├── 
├── 🤖 automation-starters/         # Framework examples
│   ├── playwright/                 # UI automation framework
│   │   ├── README.md               # Setup instructions
│   │   ├── package.json            # Dependencies
│   │   ├── playwright.config.ts    # Configuration
│   │   └── tests/
│   │       ├── example.spec.ts     # Simple example
│   │       └── ui-tests.spec.ts    # Comprehensive examples
│   └── api-pytest/                 # API automation framework
│       ├── README.md               # Setup instructions
│       ├── requirements.txt        # Python dependencies
│       ├── pytest.ini             # Configuration
│       └── test_api.py             # Comprehensive API tests
├── 
├── ⚡ perf/                        # Performance testing
│   ├── README.md                   # k6 setup & usage
│   └── nlq_load_test.js            # Load testing script
└── 
└── 📁 submission/                  # Your deliverables go here
    ├── manual/                     # Manual testing results
    ├── automation/                 # Automation scripts
    │   ├── ui/                     # UI tests (Playwright/Cypress)
    │   └── api/                    # API tests (pytest/Postman)
    └── perf/                       # Performance test results
```

## 🎯 What You Need to Focus On

### Essential Files (Must Review):
- ✅ `README.md` - Complete assignment overview  
- ✅ `QUICKSTART.md` - How to get started in 3 steps
- ✅ `mock-api/` - Start the server first!
- ✅ `docs/` - API endpoints and specifications

### Helpful Resources:
- 📝 `templates/` - Test case formats and examples
- 🤖 `automation-starters/` - Framework setup examples  
- ⚡ `perf/` - Performance testing template

### Your Work Goes Here:
- 📁 `submission/` - All your test deliverables

## 🚀 Quick Start
1. **Start server:** `cd mock-api && npm install && npm start`
2. **Read:** `README.md` for full assignment details
3. **Begin testing!** API is ready at http://localhost:3001

---
*Total Time: 6-8 hours | Self-contained environment | No external dependencies*