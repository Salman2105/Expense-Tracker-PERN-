import type { CategoryType } from "../enums/category-type";

export interface Category {
  categoryId: string;
  userId: string | null;
  name: string;
  icon: string;
  type: CategoryType;
  isDefault: boolean;
}
