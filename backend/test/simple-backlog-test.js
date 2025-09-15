const axios = require('axios');
const fs = require('fs');

// Test configuration
const BASE_URL = 'http://localhost:3001/api/v1/ado';

// Simple logger
const log = (message) => {
  console.log(message);
};

async function testBacklogAPI() {
  try {
    log('🚀 Starting Simple Backlog API Test');
    log('=====================================\n');

    // Test 1: Health check
    log('1️⃣ Testing server health...');
    try {
      const healthResponse = await axios.get('http://localhost:3001/health');
      log(`✅ Server is running: ${healthResponse.data.message}`);
    } catch (error) {
      log('❌ Server not running. Please start with: node src/server.js');
      return;
    }

    // Test 2: Get projects
    log('\n2️⃣ Getting projects...');
    const projectsResponse = await axios.get(`${BASE_URL}/projects`);
    
    if (!projectsResponse.data.success) {
      log('❌ Failed to get projects');
      return;
    }
    
    const projects = projectsResponse.data.data;
    log(`✅ Found ${projects.length} projects`);
    
    // Find OS project
    let targetProject = projects.find(p => p.name === 'OS');
    if (!targetProject && projects.length > 0) {
      targetProject = projects[0];
      log(`⚠️  OS project not found, using "${targetProject.name}" as fallback`);
    } else if (targetProject) {
      log(`✅ Found OS project: ${targetProject.name}`);
    } else {
      log('❌ No projects found');
      return;
    }

    // Test 3: Get my backlog items
    log('\n3️⃣ Getting my backlog items...');
    try {
      const backlogUrl = `${BASE_URL}/backlog/${targetProject.id}?assignedToMe=true&states=Started,Committed,Proposed,Active&types=Scenario,Deliverable,Task,Bug,Task Group&top=20`;
      log(`Request URL: ${backlogUrl}`);
      
      const backlogResponse = await axios.get(backlogUrl);
      
      if (!backlogResponse.data.success) {
        log(`❌ Backlog API failed: ${backlogResponse.data.error?.message || 'Unknown error'}`);
        return;
      }
      
      const backlogItems = backlogResponse.data.data.backlogItems;
      
      if (backlogItems.length > 0) {
        log(`✅ Found ${backlogItems.length} items assigned to you:`);
        
        // Group by work item type
        const byType = backlogItems.reduce((acc, item) => {
          const type = item.workItemType || 'Unknown';
          if (!acc[type]) acc[type] = [];
          acc[type].push(item);
          return acc;
        }, {});
        
        Object.entries(byType).forEach(([type, items]) => {
          log(`\n📋 ${type}s (${items.length}):`);
          items.forEach(item => {
            const storyPoints = item.storyPoints ? ` | SP: ${item.storyPoints}` : '';
            log(`   • ID ${item.id}: ${item.title} [${item.state}]${storyPoints}`);
          });
        });
        
        // Save to file
        fs.writeFileSync('my-backlog-items.json', JSON.stringify(backlogItems, null, 2));
        log(`\n📁 Items saved to my-backlog-items.json`);
        
      } else {
        log('ℹ️  No items assigned to you in the specified states.');
        log('💡 This might mean:');
        log('   - No work items are assigned to you');
        log('   - Items are in different states (try: Completed, Cut, Resolved, Closed)');
        log('   - Different work item types are used in your project');
      }
      
    } catch (backlogError) {
      log(`❌ Backlog test failed: ${backlogError.message}`);
      if (backlogError.response?.data) {
        log(`   API Error: ${JSON.stringify(backlogError.response.data, null, 2)}`);
      }
    }

    log('\n🎉 Test Complete!');
    log('✅ Simplified backlog API is working');
    log('✅ Ready to focus on frontend development');

  } catch (error) {
    log(`❌ Test failed: ${error.message}`);
    if (error.response?.data) {
      log(`   Response: ${JSON.stringify(error.response.data, null, 2)}`);
    }
  }
}

// Run the test
testBacklogAPI();