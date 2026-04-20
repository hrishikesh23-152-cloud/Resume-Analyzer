const User = require("../models/user.model")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const tokenBlacklistModel = require("../models/token.blackist.model")   


async function registerUserController(req, res) {

    const { name, email, password } = req.body

    if (!name || !email || !password) {
        return res.status(400).json({
            message: "Please provide name, email and password"
        })
    }

    const isUserAlreadyExists = await User.findOne({
        $or: [ { name }, { email } ]
    })

    if (isUserAlreadyExists) {
        return res.status(400).json({
            message: "Account already exists with this email address or name"
        })
    }

    const hash = await bcrypt.hash(password, 10)

    const user = await User.create({
        name,
        email,
        password: hash
    })

    const token = jwt.sign(
        { id: user._id, name: user.name },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
    )

    res.cookie("token", token, {
  httpOnly: true,
  secure: true,
  sameSite: "None",
  maxAge: 24 * 60 * 60 * 1000
})


    res.status(201).json({
        message: "User registered successfully",
        user: {
            id: user._id,
            name: user.name,
            email: user.email
        }
    })

}

async function loginUserController(req, res) {

    const { email, password } = req.body

    const user = await User.findOne({ email })

    if (!user) {
        return res.status(400).json({
            message: "Invalid email or password"
        })
    }

    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) {
        return res.status(400).json({
            message: "Invalid email or password"
        })
    }

    const token = jwt.sign(
        { id: user._id, username: user.username },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
    )

    res.cookie("token", token, {
  httpOnly: true,
  secure: true,
  sameSite: "None",
  maxAge: 24 * 60 * 60 * 1000
})
    res.status(200).json({
        message: "User loggedIn successfully.",
        user: {
            id: user._id,
            name: user.name,
            email: user.email
        }
    })
}


async function logoutUserController(req, res) {
    const token = req.cookies.token

    if (token) {
        await tokenBlacklistModel.create({ token })
    }

    res.clearCookie("token")

    res.status(200).json({
        message: "User logged out successfully"
    })
}

async function getMeController(req, res) {

    const user = await User.findById(req.user.id)



    res.status(200).json({
        message: "User details fetched successfully",
        user: {
            id: user._id,
            name: user.name,
            email: user.email
        }
    })

}


module.exports = {
    registerUserController,
    loginUserController,
    logoutUserController,
    getMeController
}
