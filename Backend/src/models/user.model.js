const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true,"this username already exists"],
        unique: true
    },
    email: {
        type: String,
        required: [true,"this email already exists"],
        unique: true
    },
    password: {
        type: String,
        required: true
    }
})
const User = mongoose.model("User", userSchema);

module.exports = User;