const express = require("express");
const authRouter = express.Router();
const loginMiddleware = require("../middleware/login");
const loginController = require("../controllers/login");
const refreshTokenController = require("../controllers/refreshToken");
const logoutController = require("../controllers/logout");
const forgotPasswordController = require("../controllers/forgotPassword");
const resetPasswordController = require("../controllers/resetPassword");
const oauthController = require("../controllers/oauth");

// Login
authRouter.post("/login", loginMiddleware, loginController);

// Refresh Token
authRouter.post("/refresh-token", refreshTokenController);

// Logout
authRouter.post("/logout", logoutController);

// Forgot Password
authRouter.post("/forgot-password", forgotPasswordController);

// Reset Password
authRouter.post("/reset-password", resetPasswordController);

// Google OAuth Authorization endpoint
authRouter.get("/auth/google", oauthController.googleRedirect);

// Google OAuth Callback endpoint
authRouter.get("/auth/google/callback", oauthController.googleCallback);

module.exports = authRouter;
