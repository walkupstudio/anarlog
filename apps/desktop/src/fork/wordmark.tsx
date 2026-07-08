import { cn } from "@hypr/utils";

export function RecapWordmark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "font-display font-bold tracking-tight text-foreground",
        className,
      )}
    >
      Recap
      <span aria-hidden className="text-[hsl(var(--recap-blue))]">.</span>
    </span>
  );
}
