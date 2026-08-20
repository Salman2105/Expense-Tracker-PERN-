const prisma = require("../../config/prisma");
const authService = require("../services/auth.service");

const {
    successResponse,
    errorResponse,
} = require("../utils/response.util");

/**
 * Validate registration request body
 */
const validateRegisterInput = (body) => {
    if (!body || typeof body !== "object" || Array.isArray(body)) {
        return "Request body must be a valid JSON object";
    }

    const { username, email, password } = body;

    // Required fields
    if (username === undefined || username === null || username === "") {
        return "Username is required";
    }

    if (email === undefined || email === null || email === "") {
        return "Email is required";
    }

    if (password === undefined || password === null || password === "") {
        return "Password is required";
    }

    // Data types
    if (typeof username !== "string") {
        return "Username must be a string";
    }

    if (typeof email !== "string") {
        return "Email must be a string";
    }

    if (typeof password !== "string") {
        return "Password must be a string";
    }

    // Trim validation
    const trimmedUsername = username.trim();
    const trimmedEmail = email.trim();

    if (!trimmedUsername) {
        return "Username cannot be empty";
    }

    if (!trimmedEmail) {
        return "Email cannot be empty";
    }

    if (!password.trim()) {
        return "Password cannot be empty";
    }

    // Username validation
    if (trimmedUsername.length < 3) {
        return "Username must be at least 3 characters long";
    }

    if (trimmedUsername.length > 50) {
        return "Username must not exceed 50 characters";
    }

    // Allow letters, numbers, underscore, dot and hyphen
    const usernameRegex = /^[a-zA-Z0-9_.-]+$/;

    if (!usernameRegex.test(trimmedUsername)) {
        return "Username may only contain letters, numbers, underscores, dots and hyphens";
    }

    // Email validation
    if (trimmedEmail.length > 254) {
        return "Email must not exceed 254 characters";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(trimmedEmail)) {
        return "Please provide a valid email address";
    }

    // Password validation
    if (password.length < 8) {
        return "Password must be at least 8 characters long";
    }

    if (password.length > 128) {
        return "Password must not exceed 128 characters";
    }

    return null;
};

/**
 * Validate login request body
 */
const validateLoginInput = (body) => {
    if (!body || typeof body !== "object" || Array.isArray(body)) {
        return "Request body must be a valid JSON object";
    }

    const { email, password } = body;

    if (email === undefined || email === null || email === "") {
        return "Email is required";
    }

    if (password === undefined || password === null || password === "") {
        return "Password is required";
    }

    if (typeof email !== "string") {
        return "Email must be a string";
    }

    if (typeof password !== "string") {
        return "Password must be a string";
    }

    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
        return "Email cannot be empty";
    }

    if (!password.trim()) {
        return "Password cannot be empty";
    }

    if (trimmedEmail.length > 254) {
        return "Email must not exceed 254 characters";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(trimmedEmail)) {
        return "Please provide a valid email address";
    }

    if (password.length > 128) {
        return "Password must not exceed 128 characters";
    }

    return null;
};

/**
 * Register user
 */
const register = async (req, res) => {
    try {
        const validationError = validateRegisterInput(req.body);

        if (validationError) {
            return errorResponse(
                res,
                400,
                validationError,
                "VALIDATION_ERROR"
            );
        }

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
        const validationError = validateLoginInput(req.body);

        if (validationError) {
            return errorResponse(
                res,
                400,
                validationError,
                "VALIDATION_ERROR"
            );
        }

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

module.exports = {
    register,
    login,
    getMe,
    logout,
};