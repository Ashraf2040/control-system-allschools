const axios = require('axios');

const clerkApiKey = 'sk_test_eE2ZdMoVVr5taX4XRBm7NWuBRIP0BLgCcTXRWWGQg6'; // Replace with your actual key

async function testClerkKey() {
    try {
        const response = await axios.get('https://api.clerk.dev/v1/users', {
            headers: {
                Authorization: `Bearer ${clerkApiKey}`,
                'Content-Type': 'application/json',
            },
        });
        console.log('API Key is valid:', response.data);
    } catch (error) {
        console.error('Error:', error.response?.data || error.message);
    }
}

testClerkKey();
