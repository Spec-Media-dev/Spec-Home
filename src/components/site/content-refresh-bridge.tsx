"use client";

import { RealtimeRefreshBridge } from "@/components/shared/realtime-refresh-bridge";

/**
 * Public site freshness. Mounted once, in the locale layout.
 *
 * Only public-safe datasets reach it — the sender never puts a private dataset
 * on this channel, and the receiver discards one anyway.
 */
export function ContentRefreshBridge() {
  return <RealtimeRefreshBridge scope="public" />;
}
