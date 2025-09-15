const adoService = require('../src/services/adoService');

async function testADOIntegration() {
  console.log('🚀 Testing ADO Integration Service...\n');
  
  try {
    // Test 1: Test without initialization (should fail)
    console.log('Test 1: Testing without initialization...');
    try {
      await adoService.getProjects();
      console.log('❌ Should have failed without initialization');
    } catch (error) {
      console.log('✅ Correctly failed without initialization:', error.message);
    }
    
    // Test 2: Test with dummy credentials (will fail but show structure)
    console.log('\nTest 2: Testing with dummy credentials...');
    adoService.initialize('demo-org', 'dummy-token');
    
    try {
      await adoService.testConnection();
    } catch (error) {
      console.log('✅ Expected failure with dummy credentials:', error.message);
    }
    
    // Test 3: Test work item transformation
    console.log('\nTest 3: Testing work item transformation...');
    const sampleWorkItem = {
      fields: {
        'System.Id': 12345,
        'System.Title': 'Sample Bug Fix',
        'System.Description': 'Fix critical login issue',
        'System.State': 'Active',
        'System.WorkItemType': 'Bug',
        'System.AssignedTo': {
          displayName: 'John Doe',
          uniqueName: 'john@company.com'
        },
        'System.CreatedDate': '2025-09-10T09:00:00Z',
        'System.ChangedDate': '2025-09-15T14:30:00Z',
        'Microsoft.VSTS.Common.Priority': 1,
        'Microsoft.VSTS.Common.Severity': '1 - Critical',
        'System.Tags': 'urgent; security'
      },
      _links: {
        html: {
          href: 'https://dev.azure.com/demo-org/_workitems/edit/12345'
        }
      }
    };
    
    const transformed = adoService.transformWorkItem(sampleWorkItem);
    console.log('✅ Work item transformation successful:');
    console.log(JSON.stringify(transformed, null, 2));
    
    // Test 4: Test WIQL query building
    console.log('\nTest 4: Testing WIQL query building...');
    const query = adoService.buildWIQLQuery('TestProject', {
      assignedToMe: true,
      states: ['Active', 'New'],
      workItemTypes: ['Bug', 'Task']
    });
    console.log('✅ WIQL Query built successfully:');
    console.log(query);
    
    console.log('\n🎉 ADO Integration Service tests completed!');
    console.log('\n📋 Next steps for full integration:');
    console.log('1. Set up Azure AD app registration');
    console.log('2. Configure OAuth scopes for ADO access');
    console.log('3. Test with real ADO organization and token');
    console.log('4. Implement Microsoft Graph API for Teams/Email context');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  testADOIntegration();
}

module.exports = { testADOIntegration };