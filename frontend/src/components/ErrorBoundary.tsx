// src/components/ErrorBoundary.tsx
import { ErrorBoundary } from "react-error-boundary";

export const ErrorFallback = ({ error }: { error: Error }) => (
  <div role="alert" className="p-4 text-red-500">
    <p>Something went wrong:</p>
    <pre>{error.message}</pre>
  </div>
);

export const CustomErrorBoundary = ({ children }: { children: React.ReactNode }) => (
  <ErrorBoundary FallbackComponent={ErrorFallback}>
    {children}
  </ErrorBoundary>
);