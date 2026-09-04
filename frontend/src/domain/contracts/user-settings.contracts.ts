import type { Theme } from "../enums/theme";
import type { CurrencyCode } from "../enums/currency";
import type { LanguageCode } from "../enums/language";
import type { UserSettings } from "../models/user-settings";
import type {
  ApiSuccessResponse,
  ApiSuccessResponseWithoutMessage,
} from "../api/api-response";

export type GetUserSettingsResponse = ApiSuccessResponseWithoutMessage<UserSettings>;
export type CreateUserSettingsResponse = ApiSuccessResponse<UserSettings>;
export type UpdateUserSettingsResponse = ApiSuccessResponse<UserSettings>;

interface UserSettingsInput {
  theme?: Theme;
  preferredCurrency?: CurrencyCode;
  language?: LanguageCode;
  emailNotifications?: boolean;
  budgetAlerts?: boolean;
}

export type CreateUserSettingsRequest = UserSettingsInput;
export type UpdateUserSettingsRequest = UserSettingsInput;
