import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "../../../lib/query-keys";
import { dashboardService } from "../../../services/dashboard.service";
export const useDashboard = () => useQuery({ queryKey: queryKeys.dashboard, queryFn: () => dashboardService.getDashboard(), staleTime: 60_000 });