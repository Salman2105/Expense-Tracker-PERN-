const categoryService = require("../services/category.service");

const { successResponse } = require("../utils/response.util");

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
        next(error);
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
        next(error);
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
        next(error);
    }
};

/**
 * Delete Category
 */
const deleteCategory = async (req, res, next) => {
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
        next(error);
    }
};

module.exports = {
    createCategory,
    getCategories,
    updateCategory,
    deleteCategory,
};
