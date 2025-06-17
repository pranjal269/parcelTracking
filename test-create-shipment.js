// Test script to create a shipment with recipient phone number
const axios = require('axios');

const createShipment = async () => {
  try {
    const response = await axios.post('http://localhost:8080/api/shipment', {
      recipientName: 'Test Recipient',
      recipientPhoneNumber: '9876543210',
      deliveryAddress: '123 Test Street, Test City',
      weight: 1.5,
      packageType: 'General',
      specialInstructions: 'Test instructions',
      userId: 19
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Shipment created successfully:');
    console.log(response.data);
  } catch (error) {
    console.error('Error creating shipment:');
    console.error(error.response?.data || error.message);
  }
};

createShipment(); 