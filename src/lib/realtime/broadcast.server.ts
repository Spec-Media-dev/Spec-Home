import "server-only";

import { createClient as createSupabaseClient } from "@supabase/supabase-js";

import {
  isPublicDataset,
  type Dataset,
} from "@/lib/cache/datasets";
import { publicEnv } from "@/lib/env";
import {
  ADMIN_REFRESH_CHANNEL,
  buildRefreshMessage,
  PUBLIC_REFRESH_CHANNEL,
  REFRESH_EVENT,
  type RefreshMessage,
} from "@/lib/realtime/channels";

/**
 * Sends sanitized refresh hints over Supabase Realtime Broadcast.
 *
 * Uses the publishable (anon) key deliberately: the service-role key stays
 * confined to the public enquiry insert, and a refresh hint needs no elevated
 * privilege because it carries no data. Broadcasting is best-effort — a failed
 * hint must never turn a successful mutation into a failed one.
 */

let cachedClient: ReturnType<typeof createSupabaseClient> | null = null;

function broadcastClient() {
  cachedClient ??= createSupabaseClient(
    publicEnv.NEXT_PUBLIC_SUPABASE_URL,
    publicEnv.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
  return cachedClient;
}

async function post(channelName: string, message: RefreshMessage) {
  const client = broadcastClient();
  const channel = client.channel(channelName);

  try {
    await channel.httpSend(REFRESH_EVENT, message);
  } catch {
    // Older Realtime servers have no /events endpoint; send() falls back to
    // the legacy REST broadcast path.
    try {
      await channel.send({
        type: "broadcast",
        event: REFRESH_EVENT,
        payload: message,
      });
    } catch {
      // Deliberately swallowed: see the note above.
    }
  } finally {
    void client.removeChannel(channel);
  }
}

/**
 * Announces that a dataset moved on.
 *
 * Public-safe datasets go to both channels so anonymous visitors and signed-in
 * admins converge. Private datasets go to the admin channel only, and even
 * there the message is just the dataset name — never a row, an id, an email,
 * or any part of the originating payload.
 */
export async function broadcastDatasetChanged(
  datasets: readonly Dataset[],
): Promise<void> {
  const unique = [...new Set(datasets)];
  if (unique.length === 0) return;

  await Promise.all(
    unique.flatMap((dataset) => {
      const message = buildRefreshMessage(dataset);
      const sends = [post(ADMIN_REFRESH_CHANNEL, message)];
      if (isPublicDataset(dataset)) {
        sends.push(post(PUBLIC_REFRESH_CHANNEL, message));
      }
      return sends;
    }),
  );
}
