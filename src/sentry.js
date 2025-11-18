import * as Sentry from "@sentry/react";

// Get APP environment
const isProduction = process.env.REACT_APP_MODE === "production";
const DSN_KEY = process.env.REACT_APP_SENTRY_DSN_KEY || null;

// Initialize Sentry
Sentry.init({
  dsn: DSN_KEY,
  tracesSampleRate: 1.0,
  sendDefaultPii: true,
  environment: process.env.REACT_APP_MODE,
  enabled: isProduction && DSN_KEY // Only enable in production
});

// Capture Exceptions
export const SentryCaptureException = (errorTitle = "", exception, context = {}) => {
  if (isProduction && DSN_KEY) {
    if (exception instanceof Error && errorTitle) {
      exception.name = errorTitle;
    }
    return Sentry.captureException(exception, context);
  }
};

export default Sentry;
