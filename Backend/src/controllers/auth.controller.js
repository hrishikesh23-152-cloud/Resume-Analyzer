const User = require("../models/user.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const tokenBlacklistModel = require("../models/token.blackist.model");

const isProduction = process.env.NODE_ENV === "production" || process.env.RENDER === "true";
const cookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "None" : "Lax",
    maxAge: 24 * 60 * 60 * 1000
};

async function registerUserController(req, res) {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                message: "Please provide name, email and password"
            });
        }

        const isUserAlreadyExists = await User.findOne({
            $or: [{ name }, { email }]
        });

        if (isUserAlreadyExists) {
            return res.status(400).json({
                message: "Account already exists with this email address or name"
            });
        }

        const hash = await bcrypt.hash(password, 10);

        const user = await User.create({
            name,
            email,
            password: hash
        });

        const token = jwt.sign(
            { id: user._id, name: user.name },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        res.cookie("token", token, cookieOptions);

        res.status(201).json({
            message: "User registered successfully",
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });
    } catch (err) {
        console.error("Error in registerUserController:", err);
        res.status(500).json({ message: "Registration failed" });
    }
}

async function loginUserController(req, res) {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({
                message: "Invalid email or password"
            });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(400).json({
                message: "Invalid email or password"
            });
        }

        const token = jwt.sign(
            { id: user._id, username: user.name },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        res.cookie("token", token, cookieOptions);

        res.status(200).json({
            message: "User loggedIn successfully.",
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });
    } catch (err) {
        console.error("Error in loginUserController:", err);
        res.status(500).json({ message: "Login failed" });
    }
}

async function logoutUserController(req, res) {
    try {
        const token = req.cookies.token;

        if (token) {
            await tokenBlacklistModel.create({ token });
        }

        res.clearCookie("token", cookieOptions);

        res.status(200).json({
            message: "User logged out successfully"
        });
    } catch (err) {
        console.error("Error in logoutUserController:", err);
        res.status(500).json({ message: "Logout failed" });
    }
}

async function getMeController(req, res) {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({
            message: "User details fetched successfully",
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });
    } catch (err) {
        console.error("Error in getMeController:", err);
        res.status(500).json({ message: "Failed to fetch user details" });
    }
}

module.exports = {
    registerUserController,
    loginUserController,
    logoutUserController,
    getMeController
};
