const express = require('express');
const cookieParser = require('cookie-parser');
const app = express();
const cors = require('cors');
app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}))


const Authrouter = require('./routes/auth.routes');
const interviewRouter = require('./routes/interview.routes');
app.use('/api/auth', Authrouter);
app.use('/api/interview', interviewRouter);
module.exports = app;