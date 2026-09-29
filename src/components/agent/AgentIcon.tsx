// GENERATED — edit in dashboard/, then run scripts/sync-shared.mjs

/* ------------------------------------------------------------------ */
/* AGENT ICON — maps agents.ts icon names to lucide icons.             */
/* SOURCE OF TRUTH: edit in dashboard/, then run                       */
/* `node scripts/sync-shared.mjs`.                                     */
/* ------------------------------------------------------------------ */

import {
  BookOpenText,
  CalendarCheck,
  ChartNoAxesCombined,
  Funnel,
  PenLine,
  Swords,
  UserRoundCheck,
  type LucideIcon,
} from "lucide-react";
import type { AgentIconName } from "../../lib/agents";

export const agentIcons: Record<AgentIconName, LucideIcon> = {
  lead: UserRoundCheck,
  seo: ChartNoAxesCombined,
  content: PenLine,
  conversion: Funnel,
  competitor: Swords,
  booking: CalendarCheck,
  rag: BookOpenText,
};

export default function AgentIcon({
  name,
  size = 20,
  className,
}: {
  name: AgentIconName;
  size?: number;
  className?: string;
}) {
  const Icon = agentIcons[name];
  return <Icon size={size} strokeWidth={1.8} className={className} aria-hidden="true" />;
}
