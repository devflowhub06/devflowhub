// DevFlowHub AI-powered project
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get('/', (req, res) => {
  res.json({ 
    message: 'Hello from DevFlowHub! 🚀',
    project: 'AI-powered development',
    timestamp: new Date().toISOString()
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', uptime: process.uptime() });
});

app.listen(PORT, () => {
  console.log('🚀 Server running on port ' + PORT);
  console.log('📱 Health check: http://localhost:' + PORT + '/health');
});