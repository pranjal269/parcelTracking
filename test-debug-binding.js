// Test script to debug model binding
const axios = require('axios');

const testDebugBinding = async () => {
  try {
    const response = await axios.post('http://localhost:8080/api/shipment/debug', {
      recipientName: 'Test Recipient',
      recipientPhoneNumber: '9876543210',
      deliveryAddress: '123 Test Street, Test City',
      weight: 1.5,
      packageType: 'General',
      specialInstructions: 'Test instructions',
      userId: 1
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Debug response:');
    console.log(response.data);
  } catch (error) {
    console.error('Error in debug binding:');
    console.error(error.response?.data || error.message);
  }
};

testDebugBinding(); 