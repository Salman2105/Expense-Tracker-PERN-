import { useMutation, useQuery } from "@tanstack/react-query";
import { queryKeys } from "../../../lib/query-keys";
import { accountService } from "../../../services/account.service";

export const useAccountStatus = () =>
  useQuery({
    queryKey: queryKeys.accountStatus,
    queryFn: () => accountService.getAccountStatus(),
    staleTime: 300_000,
  });

export const useDeleteAccount = () =>
  useMutation({ mutationFn: () => accountService.deleteAccount() });