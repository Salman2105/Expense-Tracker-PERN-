const userService = require("../services/user.service");

const {
    successResponse,
    errorResponse,
} = require("../utils/response.util");

const getMyProfile = async (req, res) => {
    try {
        const userId = req.user.id;

        const user = await userService.getUserProfile(userId);

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
            "User profile retrieved successfully",
            user
        );
    } catch (error) {
        console.error("Get profile error:", error);

        return errorResponse(
            res,
            500,
            "Failed to get user profile",
            "GET_PROFILE_ERROR"
        );
    }
};

const updateMyProfile = async (req, res) => {
    try {
        const userId = req.user.id;

        const {
            username,
            profilePicture,
        } = req.body;

        const updatedUser = await userService.updateUserProfile(
            userId,
            {
                username,
                profilePicture,
            }
        );

        return successResponse(
            res,
            200,
            "Profile updated successfully",
            updatedUser
        );
    } catch (error) {
        console.error("Update profile error:", error);

        if (error.code === "P2002") {
            return errorResponse(
                res,
                409,
                "Username is already taken",
                "USERNAME_ALREADY_TAKEN"
            );
        }

        if (error.code === "P2025") {
            return errorResponse(
                res,
                404,
                "User not found",
                "USER_NOT_FOUND"
            );
        }

        return errorResponse(
            res,
            500,
            "Failed to update user profile",
            "UPDATE_PROFILE_ERROR"
        );
    }
};

const changePassword = async (req, res) => {
    try {
        const userId = req.user.id;

        const {
            currentPassword,
            newPassword,
        } = req.body;

        await userService.changeUserPassword(
            userId,
            currentPassword,
            newPassword
        );

        return successResponse(
            res,
            200,
            "Password changed successfully"
        );
    } catch (error) {
        if (error.code === "INVALID_CURRENT_PASSWORD") {
            return errorResponse(
                res,
                400,
                "Current password is incorrect",
                "INVALID_CURRENT_PASSWORD"
            );
        }

        if (error.code === "SAME_PASSWORD") {
            return errorResponse(
                res,
                400,
                "New password must be different from current password",
                "SAME_PASSWORD"
            );
        }

        console.error("Change password error:", error);

        if (error.code === "USER_NOT_FOUND") {
            return errorResponse(
                res,
                404,
                "User not found",
                "USER_NOT_FOUND"
            );
        }

        return errorResponse(
            res,
            500,
            "Failed to change password",
            "CHANGE_PASSWORD_ERROR"
        );
    }
};

module.exports = {
    getMyProfile,
    updateMyProfile,
    changePassword,
};