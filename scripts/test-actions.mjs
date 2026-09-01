import { config } from "dotenv";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, "../.env.local") });

// Import the actual server actions / queries
import { updateSiteSettings } from "../src/app/actions/site-settings.js";
import { getSiteSettings } from "../src/lib/queries/site-settings.js";

async function testActions() {
  console.log("Testing site-settings server actions...");
  try {
    const saveRes = await updateSiteSettings({
      announcement_en: "Exclusive Palm Jumeirah Sky Villas Released",
      announcement_ar: "إطلاق فلل سكاي الحصرية في نخلة جميرا",
      tagline_en: "The Pinnacle of Dubai Luxury Real Estate",
      tagline_ar: "قمة العقارات الفاخرة في دبي",
      maintenance_mode: false,
    });
    console.log("updateSiteSettings result:", saveRes);
  } catch (err) {
    console.error("updateSiteSettings error:", err);
  }
}

testActions();
