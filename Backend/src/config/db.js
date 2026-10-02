const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const connectDB = async () => {
  try {
    const string = String(process.env.MONGO_URI)
    await mongoose.connect(string)
    console.log("Database connected to server")
  } catch (error) {
    console.log("Error connecting to database", error)
  }
}
module.exports = connectDB;