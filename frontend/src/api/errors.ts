import axios from "axios";

export type ApiErrorKind = "validation" | "authentication" | "forbidden" | "notFound" | "conflict" | "server" | "network" | "unknown";

export interface ApiError {
  message: string;
  code: string | null;
  status: number;
  details: unknown | null;
  kind: ApiErrorKind;
}

const getErrorKind = (status: number, isNetworkError: boolean): ApiErrorKind => {
  if (isNetworkError) return "network";
  if (status === 400) return "validation";
  if (status === 401) return "authentication";
  if (status === 403) return "forbidden";
  if (status === 404) return "notFound";
  if (status === 409) return "conflict";
  if (status >= 500) return "server";
  return "unknown";
};

export const normalizeApiError = (error: unknown): ApiError => {
  if (axios.isAxiosError(error)) {
    const response = error.response;
    const responseData = response?.data ?? {};

    const status = response?.status ?? 0;
    const safeMessage = status >= 500
      ? "The server could not complete your request. Please try again."
      : responseData?.message ?? (error.code === "ECONNABORTED" ? "The request timed out. Please try again." : !response ? "Unable to connect to the server. Please check your connection and try again." : error.message) ?? "An unexpected error occurred.";

    return {
      message:
        safeMessage,
      code:
        responseData?.error?.code ??
        responseData?.code ??
        null,
      status,
      details: responseData?.details ?? null,
      kind: getErrorKind(status, !response),
    };
  }

  if (error instanceof Error) {
    return {
      message: error.message,
      code: null,
      status: 0,
      details: null,
      kind: "unknown",
    };
  }

  return {
    message: "An unexpected error occurred.",
    code: null,
    status: 0,
    details: null,
    kind: "unknown",
  };
};  