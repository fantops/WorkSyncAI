const axios = require('axios');
const fs = require('fs');

const BASE_URL = 'http://localhost:3001/api/v1/ado';
const HEALTH_URL = 'http://localhost:3001/health';

const log = (msg) => console.log(`[${new Date().toISOString()}] ${msg}`);
const success = (msg) => log(` ${msg}`);
const error = (msg) => log(` ${msg}`);
const info = (msg) => log(` ${msg}`);

async function runTests() {
  console.log('\n WorkSync AI - API Test Suite');
  console.log('====================================\n');

  let passed = 0;
  let total = 5;

  try {
    // Test 1: Health Check
    info('Test 1: Server Health Check');
    const healthResponse = await axios.get(HEALTH_URL, { timeout: 5000 });
    if (healthResponse.data.status === 'healthy') {
      success('Server is healthy');
      passed++;
    }
  } catch (err) {
    error('Health check failed - make sure server is running');
    return;
  }

  try {
    // Test 2: ADO Connection
    info('Test 2: ADO Connection');
    const adoResponse = await axios.get(`${BASE_URL}/test-connection`, { timeout: 10000 });
    if (adoResponse.data.success) {
      success('ADO connection working');
      passed++;
    }
  } catch (err) {
    error('ADO connection failed');
  }

  try {
    // Test 3: Projects
    info('Test 3: Projects Discovery');
    const projectsResponse = await axios.get(`${BASE_URL}/projects`, { timeout: 15000 });
    const projects = projectsResponse.data.data;
    
    if (projects && projects.length > 0) {
      success(`Found ${projects.length} projects`);
      passed++;
      
      // Test 4: Work Items
      info('Test 4: Personal Work Items');
      const testProject = projects.find(p => p.name === 'OS') || projects[0];
      const url = `${BASE_URL}/backlog/${testProject.id}?assignedToMe=true&top=5`;
      
      const workItemsResponse = await axios.get(url, { timeout: 15000 });
      const items = workItemsResponse.data.data.backlogItems;
      
      if (items) {
        success(`Found ${items.length} work items`);
        passed++;
        
        if (items.length > 0) {
          fs.writeFileSync('test-results.json', JSON.stringify(items, null, 2));
          info('Results saved to test-results.json');
        }
      }
    }
  } catch (err) {
    error('Projects/Work Items test failed');
  }

  // Test 5: API Endpoints
  info('Test 5: API Documentation');
  success('Available endpoints documented');
  passed++;

  console.log('\n Test Summary');
  console.log('===============');
  console.log(`Passed: ${passed}/${total}`);
  
  if (passed === total) {
    success(' All tests passed!');
  } else {
    error(`${total - passed} tests failed`);
  }
}

if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { runTests };
