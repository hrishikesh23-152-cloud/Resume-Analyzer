const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

 const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL)
    console.log("Database connected to server")
  } catch (error) {
    console.log("Error connecting to database", error)
  }
}
module.exports = connectDB;