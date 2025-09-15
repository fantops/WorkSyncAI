const axios = require('axios');

async function testWorkItems() {
  try {
    console.log('Testing work items API...');
    const response = await axios.get('http://localhost:3001/api/v1/ado/workitems/8d47e068-03c8-4cdc-aa9b-fc6929290322');
    console.log('✅ Success! Found', response.data.data?.length || 0, 'work items');
  } catch (error) {
    console.log('❌ Error:', error.response?.data?.error?.message || error.message);
  }
}

testWorkItems();