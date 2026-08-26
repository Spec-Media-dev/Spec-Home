import { GoogleAnalytics } from "@next/third-parties/google";

export function Analytics() {
  const gaId = process.env.NEXT_PUBLIC_GA_ID;

  return gaId ? <GoogleAnalytics gaId={gaId} /> : null;
}
