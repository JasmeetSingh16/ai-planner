// GENERATED — edit in dashboard/, then run scripts/sync-shared.mjs

"use client";

/* ------------------------------------------------------------------ */
/* CURRENT YEAR — statically rendered pages would otherwise keep the   */
/* build year; this corrects it in the browser.                        */
/* SOURCE OF TRUTH: edit in dashboard/, then run                       */
/* `node scripts/sync-shared.mjs`.                                     */
/* ------------------------------------------------------------------ */

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/** `renderedYear` is the year the server rendered with; the client then shows the real current year. */
export default function CurrentYear({ renderedYear }: { renderedYear: number }) {
  const year = useSyncExternalStore(subscribe, () => new Date().getFullYear(), () => renderedYear);
  return <>{year}</>;
}
