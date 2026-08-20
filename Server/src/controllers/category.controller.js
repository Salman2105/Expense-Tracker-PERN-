const categoryService = require("../services/category.service");

const {
    successResponse,
    errorResponse,
} = require("../utils/response.util");

/**
 * Create Category
 */
const createCategory = async (req, res, next) => {
    try {
        const {
            name,
            icon,
            type,
        } = req.body;

        const category = await categoryService.createCategory({
            userId: req.user.id,
            name,
            icon,
            type,
        });

        return successResponse(
            res,
            201,
            "Category created successfully",
            category
        );
    } catch (error) {
        console.error(
            "Create category error:",
            error.message
        );

        return errorResponse(
            res,
            error.statusCode || 500,
            error.statusCode
                ? error.message
                : "Failed to create category",
            error.code || "CREATE_CATEGORY_ERROR"
        );
    }
};

/**
 * Get Categories
 */
const getCategories = async (req, res, next) => {
    try {
        const categories =
            await categoryService.getCategories(
                req.user.id
            );

        return successResponse(
            res,
            200,
            "Categories retrieved successfully",
            categories
        );
    } catch (error) {
        console.error(
            "Get categories error:",
            error.message
        );

        return errorResponse(
            res,
            error.statusCode || 500,
            error.statusCode
                ? error.message
                : "Failed to fetch categories",
            error.code || "GET_CATEGORIES_ERROR"
        );
    }
};

/**
 * Update Category
 */
const updateCategory = async (req, res, next) => {
    try {
        const { categoryId } = req.params;

        const {
            name,
            icon,
            type,
        } = req.body;

        const category =
            await categoryService.updateCategory({
                categoryId,
                userId: req.user.id,
                name,
                icon,
                type,
            });

        return successResponse(
            res,
            200,
            "Category updated successfully",
            category
        );
    } catch (error) {
        console.error(
            "Update category error:",
            error.message
        );

        return errorResponse(
            res,
            error.statusCode || 500,
            error.statusCode
                ? error.message
                : "Failed to update category",
            error.code || "UPDATE_CATEGORY_ERROR"
        );
    }
};

/**
 * Delete Category
 */
const deleteCategory = async (req, res) => {
    try {
        const { categoryId } = req.params;

        const result =
            await categoryService.deleteCategory({
                categoryId,
                userId: req.user.id,
            });

        return successResponse(
            res,
            200,
            "Category deleted successfully",
            result
        );
    } catch (error) {
        console.error(
            "Delete category error:",
            error.message
        );

        return errorResponse(
            res,
            error.statusCode || 500,
            error.statusCode
                ? error.message
                : "Failed to delete category",
            error.code || "DELETE_CATEGORY_ERROR"
        );
    }
};

module.exports = {
    createCategory,
    getCategories,
    updateCategory,
    deleteCategory,
};