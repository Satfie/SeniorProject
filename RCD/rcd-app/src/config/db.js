const mongoose = require('mongoose');
// Set strictQuery explicitly to avoid Mongoose deprecation warnings in production
mongoose.set('strictQuery', true);

const dbURI = process.env.DB_URI || 'mongodb://localhost:27017/sportsdb';

const connectDB = async () => {
    try {
        await mongoose.connect(dbURI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('MongoDB connected successfully');
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
};

module.exports = connectDB;