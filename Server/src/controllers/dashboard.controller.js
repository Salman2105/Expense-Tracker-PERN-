const dashboardService = require("../services/dashboard.service");

const {
    successResponse,
    errorResponse,
} = require("../utils/response.util");

const getDashboard = async (req, res) => {
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
        console.error("Get dashboard error:", error);

        const statusCode = error.statusCode || 500;

        return errorResponse(
            res,
            statusCode,
            statusCode === 500
                ? "Failed to fetch dashboard data"
                : error.message,
            error.code || "DASHBOARD_ERROR"
        );
    }
};

module.exports = {
    getDashboard,
};