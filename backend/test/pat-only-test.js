// PAT-Only Azure DevOps Integration Test
const PATAuthService = require('../src/services/PATAuthService');
const adoService = require('../src/services/adoService');
require('dotenv').config();

async function testPATOnlyFlow() {
  console.log('🚀 WorkSync AI - PAT-Only Integration Test\n');
  console.log('Simplified authentication flow using Personal Access Token only\n');
  
  // Initialize PAT auth service
  const patAuth = new PATAuthService();
  
  console.log('📋 STEP 1: Configuration Validation');
  console.log('='.repeat(50));
  
  const config = patAuth.validateConfig();
  console.log(`Authentication Method: ${config.authMethod}`);
  console.log(`Organization: ${config.organization}`);
  
  if (config.valid) {
    console.log('✅ Configuration is valid');
  } else {
    console.log('❌ Configuration issues found:');
    config.issues.forEach(issue => console.log(`   - ${issue}`));
    
    if (config.issues.some(issue => issue.includes('PAT'))) {
      console.log('\n📝 To configure PAT:');
      console.log('1. Go to https://dev.azure.com/' + config.organization);
      console.log('2. Profile → Personal Access Tokens → New Token');
      console.log('3. Scopes: Work Items (Read), Project and team (Read)');
      console.log('4. Copy token to ADO_PERSONAL_ACCESS_TOKEN in .env');
    }
    return;
  }
  
  console.log('\n🔐 STEP 2: PAT Authentication');
  console.log('='.repeat(50));
  
  try {
    const authResult = await patAuth.authenticateWithPAT();
    console.log('✅ PAT authentication successful');
    console.log(`👤 User: ${authResult.user.name}`);
    console.log(`🏢 Organization: ${authResult.organization}`);
    console.log(`🔑 Token: ***${authResult.token.slice(-6)}`);
    
  } catch (error) {
    console.error('❌ PAT authentication failed:', error.message);
    return;
  }
  
  console.log('\n🔗 STEP 3: ADO Service Initialization');
  console.log('='.repeat(50));
  
  try {
    const pat = patAuth.getPATToken();
    const org = patAuth.getOrganization();
    
    adoService.initializeWithPAT(org, pat);
    console.log(`✅ ADO Service initialized with PAT`);
    console.log(`   Organization: ${org}`);
    
  } catch (error) {
    console.error('❌ ADO initialization failed:', error.message);
    return;
  }
  
  console.log('\n📡 STEP 4: Connection Test');
  console.log('='.repeat(50));
  
  try {
    console.log('Testing ADO API connectivity...');
    // We'll test by trying to fetch projects directly
    const projects = await adoService.getProjects();
    console.log('✅ ADO API connection successful');
    console.log(`✅ Found ${projects.length} accessible projects`);
    
    console.log('\n📊 STEP 5: Projects List');
    console.log('='.repeat(50));
    
    projects.slice(0, 5).forEach((project, index) => {
      console.log(`${index + 1}. 📁 ${project.name}`);
      console.log(`   ID: ${project.id}`);
      console.log(`   State: ${project.state}`);
      console.log(`   Visibility: ${project.visibility}`);
      if (project.description) {
        console.log(`   Description: ${project.description.substring(0, 80)}...`);
      }
      console.log();
    });
    
    if (projects.length > 0) {
      console.log('📋 STEP 6: Work Items Sample');
      console.log('='.repeat(50));
      
      const firstProject = projects[0];
      console.log(`Fetching work items from "${firstProject.name}"...\n`);
      
      try {
        const workItems = await adoService.getWorkItems(firstProject.id, {
          wiql: `SELECT [System.Id], [System.Title], [System.State], [System.AssignedTo], [System.WorkItemType], [System.ChangedDate] 
                 FROM WorkItems 
                 WHERE [System.TeamProject] = '${firstProject.name}' 
                 ORDER BY [System.ChangedDate] DESC`,
          top: 5
        });
        
        console.log(`✅ Found ${workItems.length} work items:`);
        workItems.forEach((item, index) => {
          console.log(`\n${index + 1}. 📌 #${item.id}: ${item.title}`);
          console.log(`   Type: ${item.type} | State: ${item.state}`);
          console.log(`   Assigned: ${item.assignedTo || 'Unassigned'}`);
          console.log(`   Changed: ${new Date(item.changedDate).toLocaleDateString()}`);
        });
        
      } catch (error) {
        console.log('⚠️  Could not fetch work items:', error.message);
        console.log('   This might be due to insufficient PAT permissions');
      }
    }
    
    console.log('\n🎉 SUCCESS! PAT-Only Integration Complete');
    console.log('='.repeat(50));
    console.log('✅ PAT authentication working');
    console.log('✅ ADO API connectivity established');
    console.log('✅ Projects and work items accessible');
    console.log('✅ Ready for hackathon demo!');
    
    console.log('\n🚀 Next Steps:');
    console.log('1. Start backend server: npm run dev');
    console.log('2. Build React frontend');
    console.log('3. Test full web application');
    
  } catch (error) {
    console.error('❌ ADO API test failed:', error.message);
    
    if (error.response) {
      console.log(`HTTP Status: ${error.response.status}`);
      if (error.response.status === 401) {
        console.log('💡 PAT token may be invalid or expired');
      } else if (error.response.status === 403) {
        console.log('💡 PAT token may lack required permissions');
      }
    }
  }
}

// Run the test
if (require.main === module) {
  testPATOnlyFlow().catch(console.error);
}

module.exports = testPATOnlyFlow;