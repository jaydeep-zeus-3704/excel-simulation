import fs from 'fs';
import crypto from 'crypto';

// 1. Mock pools for generating realistic combinations
const firstNames = ['Amit', 'Priya', 'Rahul', 'Neha', 'Vikram', 'Ananya', 'Rohan', 'Sneha', 'Arjun', 'Deepika'];
const lastNames = ['Sharma', 'Verma', 'Kumar', 'Singh', 'Patel', 'Joshi', 'Mehta', 'Das', 'Reddy', 'Nair'];

/**
 * Generates a random integer within a range
 */
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Generates the mock employee dataset
 * @param {number} count - Total number of JSON objects to build
 */
function generateMockData(count = 50) {
    const data = [];

    for (let i = 0; i < count; i++) {
        // Build random parameters within reasonable bands
        const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
        const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
        const age = getRandomInt(22, 60);
        
        // Generate a standard market salary rounded neatly to thousands
        const salary = getRandomInt(40, 180) * 1000; 

        data.push({
            id: i+1, // Generates a secure, unique standard 36-character UUID string
            firstName,
            lastName,
            age,
            salary
        });
    }

    return data;
}

// Execute and save to an output file
const totalRecords = 50000; // Change this to generate more or fewer rows
const jsonOutput = generateMockData(totalRecords);

fs.writeFileSync('output.json', JSON.stringify(jsonOutput, null, 4), 'utf-8');
console.log(` Successfully generated ${totalRecords} mock records inside 'output.json'!`);
