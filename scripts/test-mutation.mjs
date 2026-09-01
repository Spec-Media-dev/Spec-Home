import { createClient } from '@supabase/supabase-js';

const url = "https://cphgqkfpitbqmiqlfxar.supabase.co";
const anonKey = "sb_publishable_TtrG6zxtRD4VVvJ1EHKPbg_YuZNWOck";

const supabase = createClient(url, anonKey);

async function testMutation() {
  console.log("Testing Property UPDATE with anon key...");
  const { data: selectData, error: sErr } = await supabase.from('properties').select('*').limit(1);
  console.log("Select result:", { selectData, sErr });

  if (selectData && selectData.length > 0) {
    const propId = selectData[0].id;
    console.log("Attempting to UPDATE property:", propId);
    const { data: updateData, error: uErr } = await supabase
      .from('properties')
      .update({ title_en: "The Sapphire - Updated Live" })
      .eq('id', propId)
      .select();
    
    console.log("Update result:", { updateData, uErr });
  }

  console.log("\nTesting Property INSERT with anon key...");
  const { data: insertData, error: iErr } = await supabase
    .from('properties')
    .insert({
      project_id: "a0000000-0000-0000-0000-000000000001",
      slug: "test-property-live",
      reference_code: "SHP-99999",
      title_en: "Live Test Villa",
      title_ar: "فيلا تجريبية",
      price: 18000000,
      bedrooms: 4,
      bathrooms: 5,
      area_sqft: 6200,
      property_type_en: "Villa",
      property_type_ar: "فيلا",
      status: "available",
      is_published: true,
      is_featured: true,
    })
    .select();

  console.log("Insert result:", { insertData, iErr });
}

testMutation();
