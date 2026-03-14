const mongoose = require('mongoose');
require('dotenv').config();

const testConnection = async () => {
    try {
        console.log('Testing connection to:', process.env.MONGO_URI.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@'));

        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected Successfully!');

        await mongoose.disconnect();
        process.exit(0);
    } catch (error) {
        console.error('Connection Failed:', error.message);
        process.exit(1);
    }
};

testConnection();