import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import axios from "axios";
import type { PropsWithChildren } from "react";

const queryClient = new QueryClient({ defaultOptions: { queries: { staleTime: 60_000, gcTime: 300_000, refetchOnWindowFocus: false, retry: (count, error) => (!axios.isAxiosError(error) || ![400, 401, 403, 404, 409].includes(error.response?.status ?? 0)) && count < 2 } } });

export function QueryProvider({ children }: PropsWithChildren) {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}