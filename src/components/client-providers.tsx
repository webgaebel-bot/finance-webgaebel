'use client'

import { Providers } from "@/components/providers";
import { AuthGuard } from "@/components/auth-guard";

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <Providers>
      <AuthGuard>{children}</AuthGuard>
    </Providers>
  );
}
