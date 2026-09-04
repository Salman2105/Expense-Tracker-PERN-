import { http, HttpResponse } from "msw";

import { API_ENDPOINTS } from "../../api/endpoints";

const apiUrl = (path: string) => `*${path}`;

export const handlers = [
  http.get(apiUrl(API_ENDPOINTS.AUTH.ME), () => HttpResponse.json({
    success: true,
    message: "Authenticated user retrieved successfully",
    data: {
      userId: "00000000-0000-4000-8000-000000000001",
      username: "testuser",
      email: "testuser@example.com",
      status: "ACTIVE",
      profilePicture: null,
      deletedAt: null,
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
    },
  })),
];

export const errorHandlers = {
  validation: http.get(apiUrl(API_ENDPOINTS.DASHBOARD.BASE), () => HttpResponse.json({ success: false, message: "Invalid request", error: { code: "VALIDATION_ERROR" } }, { status: 400 })),
  unauthorized: http.get(apiUrl(API_ENDPOINTS.DASHBOARD.BASE), () => HttpResponse.json({ success: false, message: "Authentication token is required", error: { code: "AUTHENTICATION_REQUIRED" } }, { status: 401 })),
  forbidden: http.get(apiUrl(API_ENDPOINTS.DASHBOARD.BASE), () => HttpResponse.json({ success: false, message: "Access denied", error: { code: "FORBIDDEN" } }, { status: 403 })),
  notFound: http.get(apiUrl(API_ENDPOINTS.DASHBOARD.BASE), () => HttpResponse.json({ success: false, message: "Resource not found", error: { code: "NOT_FOUND" } }, { status: 404 })),
  server: http.get(apiUrl(API_ENDPOINTS.DASHBOARD.BASE), () => HttpResponse.json({ success: false, message: "Internal server error", error: { code: "INTERNAL_ERROR" } }, { status: 500 })),
  network: http.get(apiUrl(API_ENDPOINTS.DASHBOARD.BASE), () => HttpResponse.error()),
};