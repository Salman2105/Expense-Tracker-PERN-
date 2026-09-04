import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { UpdateUserSettingsRequest } from "../../../domain/contracts/user-settings.contracts";
import { queryKeys } from "../../../lib/query-keys";
import { settingsService } from "../../../services/settings.service";
export const useSettings = (enabled = true) => useQuery({ queryKey: queryKeys.settings, queryFn: () => settingsService.getSettings(), staleTime: 300_000, enabled });
export const useUpdateSettings = () => { const client = useQueryClient(); return useMutation({ mutationFn: (payload: UpdateUserSettingsRequest) => settingsService.updateSettings(payload), onSuccess: (response) => client.setQueryData(queryKeys.settings, response) }); };