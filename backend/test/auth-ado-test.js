// Test script for Microsoft Authentication + ADO integration
const MicrosoftAuthService = require('../src/services/MicrosoftAuthService');
const adoService = require('../src/services/adoService'); // Import singleton instance
require('dotenv').config();

async function testAuthentication() {
  console.log('🚀 Testing WorkSync AI Authentication Flow\n');
  
  // Initialize auth service
  const authService = new MicrosoftAuthService();
  
  // Validate configuration
  const config = authService.validateConfig();
  console.log('📋 Configuration Check:');
  if (config.valid) {
    console.log('✅ Configuration is valid');
  } else {
    console.log('❌ Configuration issues:');
    config.issues.forEach(issue => console.log(`   - ${issue}`));
  }
  console.log();

  // Test ADO Service initialization
  console.log('🔧 Testing ADO Service:');
  
  try {
    if (process.env.DEMO_MODE === 'true') {
      console.log('🎭 Demo Mode: Using simulated authentication');
      
      // Simulate authentication for demo
      const demoToken = await authService.getDemoToken();
      const organization = process.env.ADO_DEFAULT_ORGANIZATION || 'microsoft';
      
      // Initialize ADO service with demo data
      adoService.initialize(organization, demoToken);
      console.log(`✅ ADO Service initialized with organization: ${organization}`);
      
      // Test connection (will fail but show the flow)
      console.log('\n📡 Testing ADO Connection (demo mode):');
      console.log('   Note: This will fail in demo mode but shows the authentication flow');
      
      try {
        await adoService.testConnection();
      } catch (error) {
        console.log(`   Expected demo error: ${error.message}`);
      }
      
    } else {
      console.log('🔐 Real Authentication Mode:');
      console.log('   This will open a browser window for Microsoft authentication...');
      
      try {
        const userToken = await authService.getUserAccessToken();
        console.log('✅ User authenticated successfully');
        
        const organization = process.env.ADO_DEFAULT_ORGANIZATION || 'microsoft';
        adoService.initialize(organization, userToken);
        
        const connectionTest = await adoService.testConnection();
        console.log('✅ ADO connection successful:', connectionTest);
        
        // Try to get projects
        const projects = await adoService.getProjects();
        console.log(`✅ Found ${projects.length} projects`);
        
      } catch (error) {
        console.log('❌ Authentication failed:', error.message);
      }
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
  
  console.log('\n🎯 Next Steps:');
  console.log('1. For local testing: Set DEMO_MODE=true in .env');
  console.log('2. For real demo: User will authenticate via browser');
  console.log('3. For Azure deployment: Managed identity handles app-level auth');
}

// Run the test
if (require.main === module) {
  testAuthentication().catch(console.error);
}

module.exports = testAuthentication;