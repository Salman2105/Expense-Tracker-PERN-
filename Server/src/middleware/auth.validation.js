const { errorResponse } = require("../utils/response.util");

const USERNAME_REGEX = /^[a-zA-Z0-9_.-]+$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const USERNAME_MIN_LENGTH = 3;
const USERNAME_MAX_LENGTH = 50;
const EMAIL_MAX_LENGTH = 254;
const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_MAX_LENGTH = 128;

/**
 * Validate registration request body.
 * Returns an error message string, or null if the body is valid.
 */
const getRegisterInputError = (body) => {
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
    if (trimmedUsername.length < USERNAME_MIN_LENGTH) {
        return `Username must be at least ${USERNAME_MIN_LENGTH} characters long`;
    }

    if (trimmedUsername.length > USERNAME_MAX_LENGTH) {
        return `Username must not exceed ${USERNAME_MAX_LENGTH} characters`;
    }

    // Allow letters, numbers, underscore, dot and hyphen
    if (!USERNAME_REGEX.test(trimmedUsername)) {
        return "Username may only contain letters, numbers, underscores, dots and hyphens";
    }

    // Email validation
    if (trimmedEmail.length > EMAIL_MAX_LENGTH) {
        return `Email must not exceed ${EMAIL_MAX_LENGTH} characters`;
    }

    if (!EMAIL_REGEX.test(trimmedEmail)) {
        return "Please provide a valid email address";
    }

    // Password validation
    if (password.length < PASSWORD_MIN_LENGTH) {
        return `Password must be at least ${PASSWORD_MIN_LENGTH} characters long`;
    }

    if (password.length > PASSWORD_MAX_LENGTH) {
        return `Password must not exceed ${PASSWORD_MAX_LENGTH} characters`;
    }

    return null;
};

/**
 * Validate login request body.
 * Returns an error message string, or null if the body is valid.
 */
const getLoginInputError = (body) => {
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

    if (trimmedEmail.length > EMAIL_MAX_LENGTH) {
        return `Email must not exceed ${EMAIL_MAX_LENGTH} characters`;
    }

    if (!EMAIL_REGEX.test(trimmedEmail)) {
        return "Please provide a valid email address";
    }

    if (password.length > PASSWORD_MAX_LENGTH) {
        return `Password must not exceed ${PASSWORD_MAX_LENGTH} characters`;
    }

    return null;
};

const validateRegisterInput = (req, res, next) => {
    const validationError = getRegisterInputError(req.body);

    if (validationError) {
        return errorResponse(res, 400, validationError, "VALIDATION_ERROR");
    }

    next();
};

const validateLoginInput = (req, res, next) => {
    const validationError = getLoginInputError(req.body);

    if (validationError) {
        return errorResponse(res, 400, validationError, "VALIDATION_ERROR");
    }

    next();
};

module.exports = {
    validateRegisterInput,
    validateLoginInput,
};
