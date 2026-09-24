const express = require('express');
const cookieParser = require('cookie-parser');
const app = express();
const cors = require('cors');

app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "https://resume-analyzer-kqqa.onrender.com"
        
    ],
    credentials: true
}));

const Authrouter = require('./routes/auth.routes');
const interviewRouter = require('./routes/interview.routes');

app.use('/api/auth', Authrouter);
app.use('/api/interview', interviewRouter);

module.exports = app;
