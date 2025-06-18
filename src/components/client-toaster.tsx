
"use client";

import dynamic from 'next/dynamic';

// Dynamically import the ShadCNToaster with SSR disabled.
// This ensures it's only loaded and rendered on the client-side.
const DynamicShadCNToaster = dynamic(
  () => import('@/components/ui/toaster').then((mod) => mod.Toaster),
  { ssr: false }
);

export function ClientToaster() {
  // Render the dynamically imported Toaster.
  // It will only render on the client after the component mounts.
  return <DynamicShadCNToaster />;
}
