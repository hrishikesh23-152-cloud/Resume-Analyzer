const express = require('express');
const authController = require("../controllers/auth.controller")
const AuthRouter = express.Router();
const authMiddleware = require('../middlewares/auth.middleware');

AuthRouter.post("/register", authController.registerUserController)

AuthRouter.post("/login", authController.loginUserController)

AuthRouter.get("/logout", authController.logoutUserController)

AuthRouter.get("/get-me", authMiddleware.authUser, authController.getMeController)

module.exports = AuthRouter;