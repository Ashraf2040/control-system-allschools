const fs = require('fs');
const csv = require('csv-parser');
const axios = require('axios');

// Use your Clerk Secret Key
const clerkApiKey = 'sk_test_eE2ZdMoVVr5taX4XRBm7NWuBRIP0BLgCcTXRWWGQg6'; 

async function createUser(email, firstName, lastName, role, username, password) {
    try {
        const response = await axios.post(
            'https://api.clerk.dev/v1/users',
            {
                email_addresses: [{ email_address: email }],
                first_name: firstName,
                last_name: lastName,
                public_metadata: { role: role }, // Include the role in public metadata
                username: username, // Include the username
                password: password, // Include the password
                // Add other fields if necessary
            },
            {
                headers: {
                    Authorization: `Bearer ${clerkApiKey}`,
                    'Content-Type': 'application/json',
                },
            }
        );
        console.log(`User ${email} created successfully!`); // Log success
    } catch (error) {
        // Enhanced error logging to provide more context
        const errorMessage = error.response?.data?.errors || error.message;
        console.error(`Failed to create user ${email}:`, errorMessage);
    }
}

// Function to read the CSV file and process each row
function processCSV(filePath) {
    fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (row) => {
            // Destructure values from the row, expecting your CSV to have these headers
            const { first_name, last_name, role, username, password } = row; 
            const email = `${username}@example.com`; // Generate email based on username
            
            // Call createUser with the values from the CSV row
            createUser(email, first_name, last_name, role, username, password); 
        })
        .on('end', () => {
            console.log('CSV file successfully processed.'); // Log completion
        })
        .on('error', (err) => {
            console.error('Error reading the CSV file:', err.message); // Log any read errors
        });
}

// Run the CSV processing script
const csvFilePath = './users.csv'; // Path to your CSV file
processCSV(csvFilePath);
