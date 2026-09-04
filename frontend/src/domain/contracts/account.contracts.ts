import type { ApiSuccessResponse } from "../api/api-response";
import type { UserStatus } from "../enums/user-status";

export interface AccountStatus {
  status: UserStatus;
  deletedAt: string | null;
}

export interface DeletedAccount {
  userId: string;
  deletedAt: string;
  originalEmailHash: string;
}

export type AccountStatusResponse = ApiSuccessResponse<AccountStatus>;
export type DeleteAccountResponse = ApiSuccessResponse<DeletedAccount>;