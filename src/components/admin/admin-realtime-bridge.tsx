"use client";

import { useEffect } from "react";

import {
  closeAllRefreshChannels,
  RealtimeRefreshBridge,
} from "@/components/shared/realtime-refresh-bridge";
import { createClient } from "@/lib/supabase/browser";

/**
 * Admin console freshness. Mounted once, in the protected admin layout, so it
 * only ever exists for a signed-in administrator.
 *
 * Also watches the auth state: when the session ends the channel is closed
 * immediately rather than lingering until the component happens to unmount,
 * so signing out never leaves a subscription behind.
 */
export function AdminRealtimeBridge() {
  useEffect(() => {
    const client = createClient();

    const {
      data: { subscription },
    } = client.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") closeAllRefreshChannels();
    });

    return () => subscription.unsubscribe();
  }, []);

  return <RealtimeRefreshBridge scope="admin" />;
}
