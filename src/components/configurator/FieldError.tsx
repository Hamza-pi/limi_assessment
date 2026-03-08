// Shared inline field-error message for all configurator form fields.
// Using role="alert" ensures screen readers announce validation errors
// as soon as they appear without requiring focus.

interface FieldErrorProps {
  message?: string;
}

export function FieldError({ message }: FieldErrorProps) {
  if (!message) return null;
  return (
    <p role="alert" className="mt-1 text-xs text-destructive">
      {message}
    </p>
  );
}
