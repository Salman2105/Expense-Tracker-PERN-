import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ChangePasswordRequest, UpdateProfileRequest } from "../../../domain/contracts/user.contracts";
import { queryKeys } from "../../../lib/query-keys";
import { userService } from "../../../services/user.service";
export const useProfile = () => useQuery({ queryKey: queryKeys.profile, queryFn: () => userService.getProfile(), staleTime: 300_000 });
export const useUpdateProfile = () => { const client = useQueryClient(); return useMutation({ mutationFn: (payload: UpdateProfileRequest) => userService.updateProfile(payload), onSuccess: (response) => client.setQueryData(queryKeys.profile, response) }); };
export const useUploadProfilePicture = () => { const client = useQueryClient(); return useMutation({ mutationFn: (file: File) => userService.uploadProfilePicture(file), onSuccess: (response) => client.setQueryData(queryKeys.profile, response) }); };
export const useChangePassword = () => useMutation({ mutationFn: (payload: ChangePasswordRequest) => userService.changePassword(payload) });