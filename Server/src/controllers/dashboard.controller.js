const dashboardService = require("../services/dashboard.service");

const {
    successResponse,
    errorResponse,
} = require("../utils/response.util");

const getDashboard = async (req, res, next) => {
    try {
        // authMiddleware must provide req.user.userId
        const userId = req.user.userId;

        if (!userId) {
            return errorResponse(
                res,
                401,
                "Unauthorized",
                "UNAUTHORIZED"
            );
        }

        const dashboard = await dashboardService.getDashboard(userId);

        return successResponse(
            res,
            200,
            "Dashboard retrieved successfully",
            dashboard
        );
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getDashboard,
};