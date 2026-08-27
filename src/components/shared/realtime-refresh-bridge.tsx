"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

import type { Dataset } from "@/lib/cache/datasets";
import {
  ADMIN_REFRESH_CHANNEL,
  parsePublicRefreshMessage,
  parseRefreshMessage,
  PUBLIC_REFRESH_CHANNEL,
  REFRESH_EVENT,
} from "@/lib/realtime/channels";
import {
  adminRouteNeeds,
  publicRouteNeeds,
} from "@/lib/realtime/route-relevance";
import { createClient } from "@/lib/supabase/browser";

/**
 * The single Realtime subscription in the application.
 *
 * There is deliberately no per-card, per-row, or per-form subscription: one
 * channel per scope, one debounce, one `router.refresh()`. `router.refresh()`
 * re-runs the server render and reconciles — it does not reload the document,
 * so scroll position, focus, and unsaved form state all survive.
 *
 * A refresh event is only ever a hint. It causes a re-fetch through the normal
 * RLS-guarded path and nothing else, so a forged message cannot mutate data or
 * expose anything the viewer could not already read.
 */

export type RefreshScope = "public" | "admin";

/** Coalesces the burst of events a single multi-table mutation produces. */
const DEBOUNCE_MS = 350;

/**
 * Process-wide subscription registry. React StrictMode mounts effects twice in
 * development, and a scope could in principle be rendered by two layouts; this
 * keeps exactly one channel per scope either way.
 */
const active = new Map<string, { count: number; dispose: () => void }>();
const listeners = new Map<string, Set<(payload: unknown) => void>>();

function subscribe(channelName: string, onMessage: (payload: unknown) => void) {
  const existing = active.get(channelName);
  if (existing) {
    existing.count += 1;
    listeners.get(channelName)?.add(onMessage);
    return () => release(channelName, onMessage);
  }

  const listenerSet = new Set([onMessage]);
  listeners.set(channelName, listenerSet);

  const client = createClient();
  const channel = client
    .channel(channelName, { config: { broadcast: { self: false } } })
    .on("broadcast", { event: REFRESH_EVENT }, (message) => {
      for (const listener of listenerSet) listener(message.payload);
    })
    .subscribe();

  active.set(channelName, {
    count: 1,
    dispose: () => {
      void client.removeChannel(channel);
      listeners.delete(channelName);
    },
  });

  return () => release(channelName, onMessage);
}

function release(channelName: string, onMessage: (payload: unknown) => void) {
  listeners.get(channelName)?.delete(onMessage);

  const entry = active.get(channelName);
  if (!entry) return;

  entry.count -= 1;
  if (entry.count <= 0) {
    entry.dispose();
    active.delete(channelName);
  }
}

/** Tears every channel down — used when an admin session ends. */
export function closeAllRefreshChannels() {
  for (const [name, entry] of active) {
    entry.dispose();
    active.delete(name);
  }
  listeners.clear();
}

export function RealtimeRefreshBridge({ scope }: { scope: RefreshScope }) {
  const router = useRouter();
  const pathname = usePathname();

  // Lets the subscription callback read the live pathname without taking it as
  // a dependency, which would tear down and re-open the channel on every
  // navigation. Written in an effect, never during render.
  const pathnameRef = useRef(pathname);
  useEffect(() => {
    pathnameRef.current = pathname;
  }, [pathname]);

  useEffect(() => {
    const channelName =
      scope === "admin" ? ADMIN_REFRESH_CHANNEL : PUBLIC_REFRESH_CHANNEL;

    const parse =
      scope === "admin" ? parseRefreshMessage : parsePublicRefreshMessage;

    const needs = scope === "admin" ? adminRouteNeeds : publicRouteNeeds;

    let timer: ReturnType<typeof setTimeout> | null = null;
    const pending = new Set<Dataset>();
    let disposed = false;

    const flush = () => {
      timer = null;
      if (disposed || pending.size === 0) return;
      pending.clear();
      router.refresh();
    };

    const unsubscribe = subscribe(channelName, (payload) => {
      const message = parse(payload);
      if (!message) return;
      if (!needs(message.dataset, pathnameRef.current)) return;

      pending.add(message.dataset);
      if (timer) clearTimeout(timer);
      timer = setTimeout(flush, DEBOUNCE_MS);
    });

    return () => {
      disposed = true;
      if (timer) clearTimeout(timer);
      unsubscribe();
    };
  }, [router, scope]);

  return null;
}
