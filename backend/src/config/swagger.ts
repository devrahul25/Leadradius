/**
 * Minimal hand-authored OpenAPI doc. Add new routes here as you build them —
 * this is intentionally not auto-generated to keep the surface area small.
 */
export const swaggerDoc = {
  openapi: "3.0.3",
  info: {
    title: "LeadRadius AI API",
    version: "1.0.0",
    description:
      "REST API for LeadRadius AI — auth, lead search, lead management, exports, and admin.",
  },
  servers: [{ url: "/api/v1" }],
  components: {
    securitySchemes: {
      bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
    },
    schemas: {
      Error: {
        type: "object",
        properties: {
          success: { type: "boolean", example: false },
          message: { type: "string" },
          error: { type: "object" },
        },
      },
      Lead: {
        type: "object",
        properties: {
          id: { type: "integer" },
          placeId: { type: "string" },
          name: { type: "string" },
          rating: { type: "number" },
          totalReviews: { type: "integer" },
          phone: { type: "string", nullable: true },
          score: { type: "number" },
          leadLabel: { type: "string" },
        },
      },
    },
  },
  paths: {
    "/auth/register": { post: { summary: "Register new user", tags: ["Auth"], requestBody: { required: true } } },
    "/auth/login": { post: { summary: "Login", tags: ["Auth"], requestBody: { required: true } } },
    "/auth/refresh": { post: { summary: "Refresh access token", tags: ["Auth"] } },
    "/auth/logout": { post: { summary: "Logout (invalidates refresh token)", tags: ["Auth"], security: [{ bearerAuth: [] }] } },
    "/leads/search": {
      post: {
        summary: "Run a radius search and persist scored leads",
        tags: ["Leads"],
        security: [{ bearerAuth: [] }],
      },
    },
    "/leads": { get: { summary: "List saved leads (filter / sort / paginate)", tags: ["Leads"], security: [{ bearerAuth: [] }] } },
    "/leads/{id}": {
      get: { summary: "Get a lead by id", tags: ["Leads"], security: [{ bearerAuth: [] }] },
      delete: { summary: "Delete a lead", tags: ["Leads"], security: [{ bearerAuth: [] }] },
    },
    "/export/csv": { get: { summary: "Export leads as CSV", tags: ["Export"], security: [{ bearerAuth: [] }] } },
    "/export/excel": { get: { summary: "Export leads as Excel (queued)", tags: ["Export"], security: [{ bearerAuth: [] }] } },
    "/admin/users": { get: { summary: "List users", tags: ["Admin"], security: [{ bearerAuth: [] }] } },
    "/admin/search-logs": { get: { summary: "List search history", tags: ["Admin"], security: [{ bearerAuth: [] }] } },
    "/admin/queues": { get: { summary: "Queue stats", tags: ["Admin"], security: [{ bearerAuth: [] }] } },
    "/admin/system-stats": { get: { summary: "System stats", tags: ["Admin"], security: [{ bearerAuth: [] }] } },
  },
};
