const prisma = require("../../config/prisma");
const authService = require("../services/auth.service");

const {
    successResponse,
    errorResponse,
} = require("../utils/response.util");

/**
 * Register user
 */
const register = async (req, res) => {
    try {
        const username = req.body.username.trim();
        const email = req.body.email.trim().toLowerCase();
        const password = req.body.password;

        const user = await authService.registerUser({
            username,
            email,
            password,
        });

        if (user?.success === false) {
            return errorResponse(
                res,
                409,
                user.message || "User registration failed",
                user.code || "REGISTRATION_FAILED"
            );
        }

        return successResponse(
            res,
            201,
            "User registered successfully",
            user
        );
    } catch (error) {
        console.error("Register error:", error);

        return errorResponse(
            res,
            error.statusCode || 500,
            error.statusCode
                ? error.message
                : "Internal server error",
            error.code || "REGISTRATION_ERROR"
        );
    }
};

/**
 * Login user
 */
const login = async (req, res) => {
    try {
        const email = req.body.email.trim().toLowerCase();
        const password = req.body.password;

        const result = await authService.loginUser({
            email,
            password,
        });

        if (result?.success === false) {
            return errorResponse(
                res,
                401,
                result.message || "Invalid credentials",
                result.code || "INVALID_CREDENTIALS"
            );
        }

        return successResponse(
            res,
            200,
            "Login successful",
            result
        );
    } catch (error) {
        console.error("Login error:", error);

        return errorResponse(
            res,
            error.statusCode || 500,
            error.statusCode
                ? error.message
                : "Internal server error",
            error.code || "LOGIN_ERROR"
        );
    }
};

/**
 * Get current authenticated user
 */
const getMe = async (req, res) => {
    try {
        const userId = req.user?.id;

        if (!userId) {
            return errorResponse(
                res,
                401,
                "Authentication required",
                "AUTHENTICATION_REQUIRED"
            );
        }

        const user = await prisma.user.findUnique({
            where: {
                userId,
            },
            select: {
                userId: true,
                username: true,
                email: true,
                profilePicture: true,
                status: true,
                deletedAt: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        if (!user) {
            return errorResponse(
                res,
                404,
                "User not found",
                "USER_NOT_FOUND"
            );
        }

        return successResponse(
            res,
            200,
            "Current user retrieved successfully",
            {
                ...user,
            }
        );
    } catch (error) {
        console.error("Get current user error:", error);

        return errorResponse(
            res,
            error.statusCode || 500,
            error.statusCode
                ? error.message
                : "Internal server error",
            error.code || "GET_CURRENT_USER_ERROR"
        );
    }
};


const logout = async (req, res) => {
    try {
        return successResponse(
            res,
            200,
            "Logged out successfully"
        );
    } catch (error) {
        console.error("Logout error:", error);

        return errorResponse(
            res,
            error.statusCode || 500,
            error.statusCode
                ? error.message
                : "Internal server error",
            error.code || "LOGOUT_ERROR"
        );
    }
};

/**
 * Authentication test endpoint (GET /api/auth/protected)
 *
 * Note: response shape intentionally does not use successResponse() here
 * (userId at the top level, not nested under `data`) to preserve this
 * endpoint's existing, long-standing contract.
 */
const checkAuthStatus = (req, res) => {
    return res.status(200).json({
        success: true,
        message: "You are authenticated",
        userId: req.user.id,
    });
};

module.exports = {
    register,
    login,
    getMe,
    logout,
    checkAuthStatus,
};
