import Wordmark from "@/components/Wordmark";
import { cn } from "@/lib/cn";

interface PoweredByProps {
  className?: string;
}

/**
 * "Powered by BeBooked" footer line.
 * Used on client-facing pages: [slug], b/[code], b/[code]/confirmed.
 */
export function PoweredBy({ className }: PoweredByProps) {
  return (
    <div className={cn("text-xs text-muted text-center", className)}>
      Powered by{" "}
      <Wordmark size="xs" className="align-middle" />
    </div>
  );
}
