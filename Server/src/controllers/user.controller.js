const userService = require("../services/user.service");

const {
    successResponse,
    errorResponse,
} = require("../utils/response.util");

const getMyProfile = async (req, res, next) => {
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
        next(error);
    }
};

const updateMyProfile = async (req, res, next) => {
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
        next(error);
    }
};

const changePassword = async (req, res, next) => {
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
        next(error);
    }
};

module.exports = {
    getMyProfile,
    updateMyProfile,
    changePassword,
};
