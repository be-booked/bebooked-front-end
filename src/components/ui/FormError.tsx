import { cn } from "@/lib/cn";

interface FormErrorProps {
  message: string | null | undefined;
  className?: string;
}

/**
 * Consistent inline form error message.
 * Renders nothing when `message` is falsy.
 */
export function FormError({ message, className }: FormErrorProps) {
  if (!message) return null;
  return (
    <p role="alert" className={cn("text-sm text-danger", className)}>
      {message}
    </p>
  );
}
