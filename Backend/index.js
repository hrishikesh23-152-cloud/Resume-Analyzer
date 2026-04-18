const app = require('./src/app');
const dotenv = require('dotenv');
const connectDB = require('./src/config/db');
dotenv.config();
const PORT = process.env.PORT || 3000;

const StartServer = async () => {
    try{
        await connectDB()
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`)
        })  
    } catch (error) {
        console.log("Error starting the server", error)     
    }
    }
    StartServer()