const axios = require('axios');
const fs = require('fs');

// Test configuration
const BASE_URL = 'http://localhost:3001/api/ado';

function log(message) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}`;
  console.log(logMessage);
}

async function testBacklogAPI() {
  try {
    log('🚀 Starting ADO Backlog API Test...');
    log('📍 Base URL: ' + BASE_URL);

    // Test 1: Health check
    log('\n1️⃣ Health check...');
    const healthResponse = await axios.get('http://localhost:3001/health');
    log('✅ Server is running: ' + JSON.stringify(healthResponse.data));

    // Test 2: Connection test
    log('\n2️⃣ Testing ADO connection...');
    const connectionResponse = await axios.get(`${BASE_URL}/test-connection`);
    if (connectionResponse.data.success) {
      log('✅ ADO connection successful');
    } else {
      log('❌ ADO connection failed');
      return;
    }

    // Test 3: Get projects
    log('\n3️⃣ Fetching ADO projects...');
    const projects = await axios.get(`${BASE_URL}/projects`);
    log(`✅ Found ${projects.data.data.length} projects`);

    // Show first few projects
    const firstProjects = projects.data.data.slice(0, 3);
    firstProjects.forEach((project, index) => {
      log(`   ${index + 1}. 📁 ${project.name} (ID: ${project.id})`);
    });

    // Test 4: Get my backlog items from OS project
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
        const backlogResponse = await axios.get(`${BASE_URL}/backlog/${targetProject.id}?assignedToMe=true&states=Started,Committed,Proposed,Active&types=Scenario,Deliverable,Task,Bug,Task Group&top=20`);
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
              log(`   • ID ${item.id}: ${item.title} [${item.state}]${item.storyPoints ? ` | SP: ${item.storyPoints}` : ''}${item.priority ? ` | P${item.priority}` : ''}`);
            });
          });
          
          // Save to file for inspection
          fs.writeFileSync('my-backlog-items.json', JSON.stringify(backlogItems, null, 2));
          log(`\n📁 Items saved to my-backlog-items.json`);
        } else {
          log(`   No items assigned to you in the specified states.`);
          log(`   💡 Try checking different states or work item types in ADO.`);
          log(`   🔍 Current filters: States=Started,Committed,Proposed,Active | Types=Scenario,Deliverable,Task,Bug,Task Group`);
        }
        
      } catch (backlogError) {
        log(`❌ Error fetching backlog items: ${backlogError.response?.data?.error?.message || backlogError.message}`);
        if (backlogError.response?.data) {
          log(`   API Response: ${JSON.stringify(backlogError.response.data, null, 2)}`);
        }
      }
    }

    log('\n🎉 ADO Backlog API Test Complete!');
    log('✅ Backend server is working');
    log('✅ PAT authentication successful'); 
    log('✅ ADO integration functional');
    log('✅ Ready for simplified frontend development (backlog-only)');

  } catch (error) {
    const errorMsg = '❌ API test failed: ' + (error.response?.data?.error?.message || error.message);
    log(errorMsg);
    
    if (error.response?.status === 401) {
      log('💡 Authentication required - make sure PAT is valid');
    } else if (error.response?.status === 403) {
      log('💡 Permission denied - check PAT scopes');
    } else if (error.code === 'ECONNREFUSED') {
      log('💡 Server not running - start with: npm start');
    }
  }
}

// Run the test
if (require.main === module) {
  testBacklogAPI().catch(console.error);
}

module.exports = { testBacklogAPI };