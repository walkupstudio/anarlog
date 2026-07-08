import { type ReactNode } from "react";

export function SettingsSectionLabel({ children }: { children: ReactNode }) {
  return (
    <h2 className="text-muted-foreground font-mono text-[11px] font-medium tracking-[0.08em] uppercase">
      {children}
    </h2>
  );
}
