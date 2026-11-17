/*
  The single place that understands backend response formats.

  Every backend endpoint returns the standard envelope ApiResponse<T>:
    { success, data, message, errorCode, errors: [{ field, message }] }

  The axios interceptors in api.js use this file, so services, stores and
  components never see the wrapper:
    - success  -> `response.data` is already the payload (`response.apiMessage`
                  holds the backend message). `data: null` stays null;
    - failure  -> the promise rejects with an `ApiError` (see below), including
                  a 2xx response whose envelope says `success: false`.

  Bodies that are NOT an envelope are still tolerated, because the backend
  cannot always produce one: 204 No Content (empty body on success), the
  framework's own 401/403 (empty body), the login 401 ({ message }), and 5xx
  from unhandled exceptions. They are read defensively and never shown raw.
*/

const FALLBACK_MESSAGES = {
  network: "Cannot reach the server. Please check your connection.",
  timeout: "The request timed out. Please try again.",
  validation: "Some of the submitted information is invalid.",
  unauthorized: "Your session has expired. Please sign in again.",
  forbidden: "You do not have permission to do this.",
  notFound: "The requested item was not found.",
  conflict: "This conflicts with existing data.",
  rateLimited: "Too many attempts. Please try again later.",
  server: "Server error. Please try again later.",
  unknown: "Something went wrong. Please try again.",
};

const isPlainObject = (value) =>
  value !== null && typeof value === "object" && !Array.isArray(value);

const text = (value) =>
  typeof value === "string" && value.trim() ? value.trim() : null;

/*
  A body is the standard envelope when it has a boolean `success` plus at least
  one other envelope key. Requiring both avoids mistaking a legacy payload that
  merely contains a `success` field for the wrapper.
*/
export const isApiEnvelope = (body) =>
  isPlainObject(body) &&
  typeof body.success === "boolean" &&
  ["data", "message", "errorCode", "errors"].some((key) => key in body);

const getKind = (status) => {
  if (status === 400 || status === 422) return "validation";
  if (status === 401) return "unauthorized";
  if (status === 403) return "forbidden";
  if (status === 404) return "notFound";
  if (status === 409) return "conflict";
  if (status === 429) return "rateLimited";
  if (status >= 500) return "server";
  return "unknown";
};

/*
  Field errors from any known shape, as [{ field, message }]:
    envelope           [{ field, message }]
    ProblemDetails     { field: ["msg", ...] }
    Identity           [{ code, description }]
    plain string list  ["msg", ...]
*/
const readFieldErrors = (errors) => {
  if (Array.isArray(errors)) {
    return errors
      .map((item) => {
        if (typeof item === "string") return { field: "", message: item };
        return {
          field: text(item?.field) ?? text(item?.code) ?? "",
          message: text(item?.message) ?? text(item?.description),
        };
      })
      .filter((item) => item.message);
  }

  if (isPlainObject(errors)) {
    return Object.entries(errors).flatMap(([field, messages]) =>
      [messages].flat().filter(text).map((message) => ({ field, message })),
    );
  }

  return [];
};

// Reads whatever the body offers without assuming a format.
const readBody = (body) => {
  if (typeof body === "string") {
    return { message: text(body), errorCode: null, errors: [], title: null };
  }

  if (Array.isArray(body)) {
    return { message: null, errorCode: null, errors: readFieldErrors(body), title: null };
  }

  if (!isPlainObject(body)) {
    return { message: null, errorCode: null, errors: [], title: null };
  }

  return {
    message: text(body.message),
    errorCode: text(body.errorCode),
    errors: readFieldErrors(body.errors),
    title: text(body.title),
  };
};

/*
  Error thrown for every failed request (HTTP error, network error, timeout, or
  a 2xx response whose envelope says `success: false`).

    message    best human-readable text (backend message when usable)
    status     HTTP status, or null when there was no response
    kind       "network" | "timeout" | "validation" | "unauthorized" |
               "forbidden" | "notFound" | "conflict" | "rateLimited" |
               "server" | "unknown"
    errorCode  backend errorCode when provided, else null
    errors     [{ field, message }] validation details, possibly empty
*/
export class ApiError extends Error {
  constructor({ message, status = null, kind = "unknown", errorCode = null, errors = [], cause }) {
    super(message, { cause });
    this.name = "ApiError";
    this.status = status;
    this.kind = kind;
    this.errorCode = errorCode;
    this.errors = errors;
  }
}

const buildApiError = ({ status, body, cause }) => {
  const kind = getKind(status);
  const parsed = readBody(body);
  const hasEnvelope = isApiEnvelope(body);

  // Raw 5xx bodies can contain stack traces or driver text, so they are never
  // shown; a 5xx that uses the envelope carries a deliberate message.
  const trustBackendText = kind !== "server" || hasEnvelope;

  const fieldMessage = parsed.errors.map((item) => item.message).join(" ") || null;
  const message =
    (trustBackendText && (parsed.message ?? fieldMessage ?? parsed.title)) ||
    FALLBACK_MESSAGES[kind];

  return new ApiError({
    message,
    status,
    kind,
    errorCode: parsed.errorCode,
    errors: parsed.errors,
    cause,
  });
};

// Success interceptor: strips the envelope; rejects an envelope with success:false.
export const unwrapResponse = (response) => {
  const body = response.data;

  if (!isApiEnvelope(body)) return response;

  if (!body.success) {
    throw buildApiError({ status: response.status, body, cause: response });
  }

  response.apiMessage = text(body.message);
  response.data = body.data;
  return response;
};

// Error interceptor: turns any axios failure into an ApiError.
export const toApiError = (error) => {
  if (error instanceof ApiError) return error;

  if (error?.response) {
    return buildApiError({
      status: error.response.status,
      body: error.response.data,
      cause: error,
    });
  }

  // axios error without a response: timeout or no connection.
  if (error?.isAxiosError) {
    const timedOut = error.code === "ECONNABORTED" || error.code === "ETIMEDOUT";
    const kind = timedOut ? "timeout" : "network";
    return new ApiError({ message: FALLBACK_MESSAGES[kind], kind, cause: error });
  }

  return new ApiError({
    message: text(error?.message) ?? FALLBACK_MESSAGES.unknown,
    cause: error,
  });
};

export const getFallbackMessage = (kind = "unknown") =>
  FALLBACK_MESSAGES[kind] ?? FALLBACK_MESSAGES.unknown;
