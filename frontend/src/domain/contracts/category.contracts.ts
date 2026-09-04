import type { CategoryType } from "../enums/category-type";
import type { Category } from "../models/category";
import type { ApiSuccessResponse } from "../api/api-response";

export type CategoryResponse = ApiSuccessResponse<Category>;
export type CategoryListResponse = ApiSuccessResponse<Category[]>;

export interface CreateCategoryRequest {
  name: string;
  icon: string;
  type: CategoryType;
}

export interface UpdateCategoryRequest {
  name?: string;
  icon?: string;
  type?: CategoryType;
}
