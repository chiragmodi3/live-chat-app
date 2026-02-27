"use client";

import { ClerkProvider } from "@clerk/nextjs";
import { ConvexProvider } from "convex/react";
import { convex } from "../lib/convexClient";

export default function Providers({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <ConvexProvider client={convex}>{children}</ConvexProvider>
    </ClerkProvider>
  );
}