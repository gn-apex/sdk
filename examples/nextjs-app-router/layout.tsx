// app/layout.tsx
//
// Root layout wiring NexusProvider into a Next.js App Router project.
// This example gates analytics + push behind a simple consent flag stored
// in a cookie your own consent-management UI would set — replace
// `readConsentCookie()` with whatever your CMP / consent banner produces.

import { NexusProvider } from "@gnapex/sdk/react";
import { cookies } from "next/headers";
import "./globals.css";

function readConsentCookie(): boolean {
  // Example only: treat an explicit "granted" cookie as consent.
  // Everything else (missing cookie, "denied") is treated as NOT consented,
  // which is the safer default for a production consent flow.
  const consent = cookies().get("analytics_consent")?.value;
  return consent === "granted";
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const hasConsent = readConsentCookie();

  return (
    <html lang="en">
      <body>
        <NexusProvider
          projectId={process.env.NEXT_PUBLIC_GNAPEX_ID}
          hasConsent={hasConsent}
          autoPromptPush={false} // prompt explicitly from your own notifications UI instead
        >
          {children}
        </NexusProvider>
      </body>
    </html>
  );
}
