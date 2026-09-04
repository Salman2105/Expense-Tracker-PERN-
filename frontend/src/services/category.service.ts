import apiClient from "../api/client";
import { API_ENDPOINTS } from "../api/endpoints";
import type {
  ApiSuccessResponse,
  DeleteResponseData,
} from "../domain/api/api-response";
import type {
  CategoryListResponse,
  CategoryResponse,
  CreateCategoryRequest,
  UpdateCategoryRequest,
} from "../domain/contracts/category.contracts";

export const categoryService = {
  getCategories: async (): Promise<CategoryListResponse> => {
    const response = await apiClient.get<CategoryListResponse>(
      API_ENDPOINTS.CATEGORIES.BASE,
    );

    return response.data;
  },

  createCategory: async (
    payload: CreateCategoryRequest,
  ): Promise<CategoryResponse> => {
    const response = await apiClient.post<CategoryResponse>(
      API_ENDPOINTS.CATEGORIES.BASE,
      payload,
    );

    return response.data;
  },

  updateCategory: async (
    categoryId: string,
    payload: UpdateCategoryRequest,
  ): Promise<CategoryResponse> => {
    const response = await apiClient.patch<CategoryResponse>(
      API_ENDPOINTS.CATEGORIES.byId(categoryId),
      payload,
    );

    return response.data;
  },

  deleteCategory: async (
    categoryId: string,
  ): Promise<ApiSuccessResponse<DeleteResponseData>> => {
    const response = await apiClient.delete<ApiSuccessResponse<DeleteResponseData>>(
      API_ENDPOINTS.CATEGORIES.byId(categoryId),
    );

    return response.data;
  },
};
