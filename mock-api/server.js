const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const multer = require('multer');
const WebSocket = require('ws');
const http = require('http');
const path = require('path');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Configuration
const PORT = process.env.PORT || 3001;
const JWT_SECRET = 'test-secret-key-for-assignment';

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.static('public'));

// In-memory storage
const users = [
  {
    id: uuidv4(),
    email: 'analyst@test.com',
    password: 'TestPass123!',
    role: 'Analyst',
    name: 'Test Analyst'
  },
  {
    id: uuidv4(),
    email: 'admin@test.com',
    password: 'AdminPass123!',
    role: 'Admin',
    name: 'Test Admin'
  }
];

const jobs = new Map();
const answers = [];
const companies = ['Nokia', 'Apple Inc', 'Microsoft Corporation', 'Google', 'Amazon'];

// Rate limiting for AIML service
const aimlRateLimit = new Map();
const AIML_RATE_LIMIT = 10; // requests per minute

// Multer configuration for file uploads
const upload = multer({
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed'), false);
    }
  }
});

// WebSocket connections
const wsConnections = new Map();

// Helper functions
function generateToken(user) {
  return jwt.sign(
    { userId: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '1h' }
  );
}

function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized - No token provided' });
  }

  const token = authHeader.substring(7);
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Unauthorized - Invalid token' });
  }
}

function requireAdmin(req, res, next) {
  if (req.user.role !== 'Admin') {
    return res.status(403).json({ error: 'Forbidden - Admin access required' });
  }
  next();
}

function simulateAIMLProcessing(jobId) {
  const job = jobs.get(jobId);
  if (!job) return;

  // Simulate processing time
  setTimeout(() => {
    const job = jobs.get(jobId);
    if (job && job.status === 'queued') {
      job.status = 'running';
      broadcastJobUpdate(job);
      
      // Simulate processing completion
      setTimeout(() => {
        const job = jobs.get(jobId);
        if (job && job.status === 'running') {
          // Simulate occasional failures
          if (Math.random() < 0.1) {
            job.status = 'failed';
            job.error = 'AIML service timeout - please try again';
          } else {
            job.status = 'done';
            job.completedAt = new Date().toISOString();
            job.result = {
              question: job.question,
              company: job.company,
              answer: generateAnswer(job.question, job.company),
              confidence: generateConfidence(),
              timestamp: new Date().toISOString()
            };
            
            // Add to answers history
            answers.unshift(job.result);
            if (answers.length > 10) {
              answers.pop();
            }
          }
          broadcastJobUpdate(job);
        }
      }, Math.random() * 5000 + 2000); // 2-7 seconds processing
    }
  }, Math.random() * 2000 + 1000); // 1-3 seconds queue time
}

function generateAnswer(question, company) {
  const templates = [
    `${company}'s Scope 1 emissions for 2023 were approximately ${Math.floor(Math.random() * 100000)} tCO2e, representing a ${Math.floor(Math.random() * 20)}% ${Math.random() > 0.5 ? 'increase' : 'decrease'} from the previous year.`,
    `${company} has committed to achieving carbon neutrality by ${2030 + Math.floor(Math.random() * 20)}, with interim targets of ${Math.floor(Math.random() * 50 + 30)}% reduction by 2030.`,
    `${company}'s sustainability initiatives include renewable energy adoption (${Math.floor(Math.random() * 100)}% renewable by 2030), waste reduction programs, and water conservation measures.`,
    `According to ${company}'s latest ESG report, their environmental score improved by ${Math.floor(Math.random() * 30)}% year-over-year, driven by enhanced ${Math.random() > 0.5 ? 'energy efficiency' : 'waste management'} practices.`
  ];
  
  return templates[Math.floor(Math.random() * templates.length)];
}

function generateConfidence() {
  // Occasionally return invalid confidence for testing
  if (Math.random() < 0.05) {
    return 1.2; // Invalid confidence > 1
  }
  return Math.round((Math.random() * 0.4 + 0.6) * 100) / 100; // 0.6-1.0 range
}

function broadcastJobUpdate(job) {
  const update = {
    jobId: job.jobId,
    status: job.status,
    timestamp: new Date().toISOString()
  };
  
  wsConnections.forEach((ws, userId) => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(update));
    }
  });
}

function checkAIMLRateLimit(ip) {
  const now = Date.now();
  const windowStart = now - 60000; // 1 minute window
  
  if (!aimlRateLimit.has(ip)) {
    aimlRateLimit.set(ip, []);
  }
  
  const requests = aimlRateLimit.get(ip);
  const recentRequests = requests.filter(timestamp => timestamp > windowStart);
  
  if (recentRequests.length >= AIML_RATE_LIMIT) {
    return false;
  }
  
  recentRequests.push(now);
  aimlRateLimit.set(ip, recentRequests);
  return true;
}

// Routes

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Mock API server is running' });
});

// Authentication
app.post('/api/v1/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }
  
  const user = users.find(u => u.email === email && u.password === password);
  
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  
  const token = generateToken(user);
  
  res.json({
    token,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name
    },
    expiresIn: 3600
  });
});

app.post('/api/v1/auth/logout', verifyToken, (req, res) => {
  res.json({ message: 'Logout successful' });
});

// Question & Answer API
app.post('/api/v1/qa', verifyToken, (req, res) => {
  const { question, company } = req.body;
  
  if (!question || !company) {
    return res.status(400).json({ error: 'Question and company are required' });
  }
  
  if (question.length === 0) {
    return res.status(400).json({ error: 'Question cannot be empty' });
  }
  
  if (question.length > 10000) {
    return res.status(413).json({ error: 'Question too long - maximum 10,000 characters' });
  }
  
  const jobId = uuidv4();
  const job = {
    jobId,
    question,
    company,
    status: 'queued',
    submittedAt: new Date().toISOString(),
    userId: req.user.userId
  };
  
  jobs.set(jobId, job);
  
  // Start processing simulation
  simulateAIMLProcessing(jobId);
  
  res.status(202).json({
    jobId,
    status: 'queued',
    submittedAt: job.submittedAt
  });
});

app.get('/api/v1/qa/:jobId', verifyToken, (req, res) => {
  const { jobId } = req.params;
  
  // Validate UUID format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(jobId)) {
    return res.status(400).json({ error: 'Invalid job ID format' });
  }
  
  const job = jobs.get(jobId);
  
  if (!job) {
    return res.status(404).json({ error: 'Job not found' });
  }
  
  const response = {
    jobId: job.jobId,
    status: job.status,
    submittedAt: job.submittedAt
  };
  
  if (job.completedAt) {
    response.completedAt = job.completedAt;
  }
  
  if (job.result) {
    response.result = job.result;
  }
  
  if (job.error) {
    response.error = job.error;
  }
  
  res.json(response);
});

app.get('/api/v1/qa', verifyToken, (req, res) => {
  const userAnswers = answers.filter(answer => true); // In real app, filter by user
  res.json({
    answers: userAnswers.slice(0, 10)
  });
});

// File Upload API
app.post('/api/v1/admin/companies/upload', verifyToken, requireAdmin, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  
  const fileContent = req.file.buffer.toString();
  const lines = fileContent.split('\n').filter(line => line.trim());
  
  if (lines.length === 0) {
    return res.status(400).json({ error: 'File is empty' });
  }
  
  const header = lines[0].toLowerCase();
  if (!header.includes('companyname') || !header.includes('isin') || !header.includes('sector')) {
    return res.status(400).json({ 
      error: 'Invalid CSV format - Expected columns: companyName, isin, sector',
      details: { expectedColumns: ['companyName', 'isin', 'sector'] }
    });
  }
  
  const errors = [];
  const processedRows = lines.length - 1; // Exclude header
  
  // Simulate some validation errors
  if (processedRows > 5) {
    errors.push({ row: 3, message: 'Invalid ISIN format' });
  }
  
  res.json({
    message: 'File uploaded successfully',
    processedRows,
    errors
  });
}, (error, req, res, next) => {
  if (error.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ error: 'File too large - maximum size is 2MB' });
  }
  if (error.message === 'Only CSV files are allowed') {
    return res.status(415).json({ error: 'Unsupported file type - only CSV files are allowed' });
  }
  res.status(400).json({ error: error.message });
});

// AIML Service
app.post('/aiml/answer', (req, res) => {
  const { question, company } = req.body;
  
  if (!question || !company) {
    return res.status(400).json({ error: 'Question and company are required' });
  }
  
  // Check rate limit
  const clientIp = req.ip || req.connection.remoteAddress;
  if (!checkAIMLRateLimit(clientIp)) {
    return res.status(429).json({ 
      error: 'Too Many Requests - Rate limit exceeded',
      retryAfter: 60
    });
  }
  
  // Simulate occasional server errors
  if (Math.random() < 0.05) {
    return res.status(500).json({ error: 'Internal server error' });
  }
  
  // Simulate processing time
  setTimeout(() => {
    res.json({
      answer: generateAnswer(question, company),
      confidence: generateConfidence()
    });
  }, Math.random() * 1000 + 500); // 0.5-1.5 second response
});

// WebSocket handling
wss.on('connection', (ws, req) => {
  console.log('WebSocket connection established');
  
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      if (data.type === 'auth' && data.token) {
        try {
          const decoded = jwt.verify(data.token, JWT_SECRET);
          wsConnections.set(decoded.userId, ws);
          ws.send(JSON.stringify({ type: 'auth', status: 'success' }));
        } catch (error) {
          ws.send(JSON.stringify({ type: 'auth', status: 'error', message: 'Invalid token' }));
        }
      }
    } catch (error) {
      console.log('Invalid WebSocket message:', error.message);
    }
  });
  
  ws.on('close', () => {
    // Remove connection from map
    for (const [userId, connection] of wsConnections.entries()) {
      if (connection === ws) {
        wsConnections.delete(userId);
        break;
      }
    }
    console.log('WebSocket connection closed');
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    details: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Start server
server.listen(PORT, () => {
  console.log(`🚀 Mock API Server running on http://localhost:${PORT}`);
  console.log(`📚 API Documentation: Check docs/api-reference.md`);
  console.log(`🔧 WebSocket endpoint: ws://localhost:${PORT}`);
  console.log(`👤 Test Users:`);
  console.log(`   Analyst: analyst@test.com / TestPass123!`);
  console.log(`   Admin: admin@test.com / AdminPass123!`);
  console.log(`⏹️  Press Ctrl+C to stop`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down server...');
  server.close(() => {
    console.log('✅ Server stopped');
    process.exit(0);
  });
});