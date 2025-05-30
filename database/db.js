const mongoose = require('mongoose');
const dotenv = require('dotenv');

//load the env file 
dotenv.config();    




const connectDB = async () => {
    try {
      const conn = await mongoose.connect(
        process.env.DB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      console.log(`MongoDB Connected`);
    } catch (error) {
      console.error(error.message);
      process.exit(1);
    }
  }



  module.exports = connectDB;


  