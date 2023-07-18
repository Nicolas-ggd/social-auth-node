const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const ConnectDatabase = async() => {
    try {
        await mongoose.connect(process.env.MONGO_URL, {
            useUnifiedTopology: true,
            useNewUrlParser: true
        });
        console.log('MongoDB is Connected');
    } catch(err) {
        console.log(err.message);
        process.exit();
    }
};

module.exports = ConnectDatabase;