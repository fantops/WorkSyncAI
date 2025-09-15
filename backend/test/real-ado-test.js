// Real Azure DevOps API Test - No Demo Mode
const adoService = require('../src/services/adoService');
require('dotenv').config();

async function testRealADOAccess() {
  console.log('🚀 Testing REAL Azure DevOps Access\n');
  
  const organization = process.env.ADO_DEFAULT_ORGANIZATION;
  const pat = process.env.ADO_PERSONAL_ACCESS_TOKEN;
  const authMethod = process.env.ADO_AUTH_METHOD;
  
  console.log('📋 Configuration:');
  console.log(`   Organization: ${organization}`);
  console.log(`   Auth Method: ${authMethod}`);
  console.log(`   PAT Configured: ${pat ? 'Yes (***' + pat.slice(-4) + ')' : 'No'}`);
  console.log();
  
  if (authMethod === 'PAT' && !pat) {
    console.log('❌ ERROR: PAT authentication selected but no token provided');
    console.log('\n📝 To get a Personal Access Token:');
    console.log('1. Go to https://dev.azure.com/microsoft');
    console.log('2. Click your profile → Personal Access Tokens');
    console.log('3. Create new token with Work Items (Read & Write) scope');
    console.log('4. Copy token to ADO_PERSONAL_ACCESS_TOKEN in .env file');
    return;
  }
  
  if (!pat || pat === 'your-pat-token-here') {
    console.log('⚠️  Please set your Personal Access Token in .env file:');
    console.log('   ADO_PERSONAL_ACCESS_TOKEN=your-actual-pat-token');
    console.log('\n📝 How to get PAT:');
    console.log('1. Go to https://dev.azure.com/microsoft');
    console.log('2. Click your profile picture → Personal Access Tokens');
    console.log('3. Click "New Token"');
    console.log('4. Select scopes: Work Items (Read), Project and team (Read)');
    console.log('5. Copy the token and paste it in your .env file');
    return;
  }
  
  try {
    console.log('🔗 Initializing ADO Service...');
    adoService.initializeWithPAT(organization, pat);
    
    console.log('📡 Testing connection...');
    const connectionTest = await adoService.testConnection();
    console.log('✅ Connection successful:', connectionTest);
    
    console.log('\n📊 Fetching real projects...');
    const projects = await adoService.getProjects();
    console.log(`✅ Found ${projects.length} projects:`);
    
    projects.slice(0, 5).forEach(project => {
      console.log(`   📁 ${project.name} (ID: ${project.id})`);
      if (project.description) {
        console.log(`      Description: ${project.description.substring(0, 80)}...`);
      }
    });
    
    if (projects.length > 0) {
      const firstProject = projects[0];
      console.log(`\n📋 Fetching work items from "${firstProject.name}"...`);
      
      try {
        const workItems = await adoService.getWorkItems(firstProject.id, {
          wiql: `SELECT [System.Id], [System.Title], [System.AssignedTo], [System.State] 
                 FROM WorkItems 
                 WHERE [System.TeamProject] = '${firstProject.name}' 
                 ORDER BY [System.ChangedDate] DESC`,
          top: 10
        });
        
        console.log(`✅ Found ${workItems.length} work items:`);
        workItems.forEach(item => {
          console.log(`   📌 #${item.id}: ${item.title}`);
          console.log(`      State: ${item.state} | Assigned: ${item.assignedTo || 'Unassigned'}`);
          console.log(`      Type: ${item.type} | Changed: ${item.changedDate}`);
          console.log();
        });
        
      } catch (error) {
        console.log('⚠️  Could not fetch work items (may need additional permissions):', error.message);
      }
    }
    
    console.log('🎉 SUCCESS! Real Azure DevOps integration working!');
    console.log('\n🔧 Next steps:');
    console.log('1. Start the backend server: npm run dev');
    console.log('2. Test API endpoints with real ADO data');
    console.log('3. Build the frontend React app');
    
  } catch (error) {
    console.error('❌ Error accessing Azure DevOps:', error.message);
    
    if (error.response) {
      console.log(`   Status: ${error.response.status}`);
      console.log(`   Message: ${error.response.data?.message || 'Unknown error'}`);
      
      if (error.response.status === 401) {
        console.log('\n💡 Troubleshooting:');
        console.log('   - Check if PAT token is valid and not expired');
        console.log('   - Ensure PAT has required scopes (Work Items, Project)');
        console.log('   - Verify organization name is correct');
      } else if (error.response.status === 403) {
        console.log('\n💡 Troubleshooting:');
        console.log('   - PAT may not have sufficient permissions');
        console.log('   - Check organization access permissions');
      }
    }
  }
}

// Run the test
if (require.main === module) {
  testRealADOAccess().catch(console.error);
}

module.exports = testRealADOAccess;