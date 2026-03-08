"use client";

// Client wrapper — next/dynamic with ssr:false is only allowed in Client Components.
import nextDynamic from "next/dynamic";

const ConfiguratorSheet = nextDynamic(
  () =>
    import("@/components/configurator/ConfiguratorSheet").then(
      (m) => m.ConfiguratorSheet,
    ),
  { ssr: false, loading: () => null },
);

export function ConfiguratorSheetLoader() {
  return <ConfiguratorSheet />;
}
