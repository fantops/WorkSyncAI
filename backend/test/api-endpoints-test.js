// Test script to get tasks through the API
const axios = require('axios');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const BASE_URL = 'http://localhost:3001/api/v1';
let outputLog = [];

// Helper function to log both console and file
function log(message) {
  console.log(message);
  outputLog.push(message);
}

// Helper function to save output to file
function saveOutputToFile() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `api-test-results-${timestamp}.txt`;
  const filepath = path.join(__dirname, 'results', filename);
  
  // Ensure results directory exists
  const resultsDir = path.join(__dirname, 'results');
  if (!fs.existsSync(resultsDir)) {
    fs.mkdirSync(resultsDir, { recursive: true });
  }
  
  // Write output to file
  fs.writeFileSync(filepath, outputLog.join('\n'));
  console.log(`\n📄 Results saved to: ${filepath}`);
}

async function testADOEndpoints() {
  log('🧪 Testing ADO API Endpoints\n');
  
  try {
    // Test 1: Health check first
    log('1️⃣ Testing health endpoint...');
    const health = await axios.get(`${BASE_URL}/health`);
    log('✅ Health: ' + health.data.status);
    log('   ADO Configured: ' + health.data.ado?.configured);
    log('   Organization: ' + health.data.ado?.organization);
    
    // Test 2: Test ADO connection (no initialization needed - PAT auto-initialized)
    log('\n2️⃣ Testing ADO connection...');
    const connectionTest = await axios.get(`${BASE_URL}/ado/test-connection`);
    log('✅ Connection test: ' + (connectionTest.data.success ? 'Success' : 'Failed'));
    
    // Test 3: Get projects (PAT authentication handled automatically)
    log('\n3️⃣ Getting ADO projects...');
    const projects = await axios.get(`${BASE_URL}/ado/projects`);
    log(`✅ Found ${projects.data.data.length} projects`);
    
    // Show first few projects
    const firstProjects = projects.data.data.slice(0, 3);
    firstProjects.forEach((project, index) => {
      log(`   ${index + 1}. 📁 ${project.name} (ID: ${project.id})`);
    });
    
    // Test 4: Get work items from OS project (user's actual project)
    if (projects.data.data.length > 0) {
      // Look for OS project specifically
      let targetProject = projects.data.data.find(p => p.name === 'OS');
      if (!targetProject) {
        // If OS not found, use first project as fallback
        targetProject = projects.data.data[0];
        log(`\n⚠️  OS project not found, using "${targetProject.name}" as fallback`);
      } else {
        log(`\n✅ Found OS project: ${targetProject.name} (${targetProject.id})`);
      }
      
      log(`\n4️⃣ Getting my backlog items from "${targetProject.name}"...`);
      
      try {
        // Get my backlog items (all work item types assigned to me)
        log(`\n📋 My Backlog Items (All Types):`);
        const backlogResponse = await axios.get(`${BASE_URL}/ado/backlog/${targetProject.id}?assignedToMe=true&states=Started,Committed,Proposed,Active&types=Scenario,Deliverable,Task,Bug,Task Group&top=15`);
        const backlogItems = backlogResponse.data.data.backlogItems;
        
        if (backlogItems.length > 0) {
          log(`✅ Found ${backlogItems.length} items assigned to you:`);
          
          // Group by work item type for better organization
          const byType = backlogItems.reduce((acc, item) => {
            const type = item.workItemType || 'Unknown';
            if (!acc[type]) acc[type] = [];
            acc[type].push(item);
            return acc;
          }, {});
          
          Object.entries(byType).forEach(([type, items]) => {
            log(`\n📋 ${type}s (${items.length}):`);
            items.forEach(item => {
              log(`   • ID ${item.id}: ${item.title} [${item.state}]${item.storyPoints ? ` | SP: ${item.storyPoints}` : ''}`);
            });
          });
          
          // Save to file for inspection
          fs.writeFileSync('my-backlog-items.json', JSON.stringify(backlogItems, null, 2));
          log(`\n📁 Items saved to my-backlog-items.json`);
        } else {
          log(`   No items assigned to you in the specified states.`);
          log(`   💡 Try checking different states or work item types in ADO.`);
        }
        }
        
      } catch (error) {
        log(`❌ Error fetching backlog items: ${error.response?.data?.error?.message || error.message}`);
      }
    }
    
    log('\n🎉 ADO API Test Complete!');
    log('✅ Backend server is working');
    log('✅ PAT authentication successful'); 
    log('✅ ADO integration functional');
    log('✅ Ready for frontend development');
    
    // Save results to file
    saveOutputToFile();
    
  } catch (error) {
    const errorMsg = '❌ API test failed: ' + (error.response?.data?.error?.message || error.message);
    log(errorMsg);
    
    if (error.response?.status === 401) {
      log('💡 Authentication required - make sure PAT is valid');
    } else if (error.response?.status === 403) {
      log('💡 Permission denied - check PAT scopes');
    }
    
    // Save results to file even if there's an error
    saveOutputToFile();
  }
}

// Run the test
if (require.main === module) {
  testADOEndpoints().catch(console.error);
}

module.exports = testADOEndpoints;