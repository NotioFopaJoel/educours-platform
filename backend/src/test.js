// test.js dans backend/
console.log('Test started');
require('dotenv').config();
console.log('Dotenv loaded');
console.log('PORT:', process.env.PORT);
console.log('MONGODB_URI:', process.env.MONGODB_URI);