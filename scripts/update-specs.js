const fs = require('fs');

let content = fs.readFileSync('src/app/dashboard-admin/(protected)/property-specs/page.tsx', 'utf8');

// Imports
content = content.replace('import { AdminStore, PropertySpec, Property } from "@/lib/adminStore";', 
`import { useRealtimeDashboard } from "@/lib/supabase/useRealtimeDashboard";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { PropertySpecRow, PropertyRow } from "@/lib/supabase/types";`);

// State declarations
content = content.replace('  const [specs, setSpecs] = useState<PropertySpec[]>([]);\n  const [properties, setProperties] = useState<Property[]>([]);', 
`  const { specs, properties, deleteSpec, refreshData } = useRealtimeDashboard();
  const supabase = getSupabaseBrowserClient();`);

// Form category typing
content = content.replace('const [category, setCategory] = useState<PropertySpec["category"]>("Architecture & Design");', 
'const [category, setCategory] = useState("Architecture & Design");');

// loadData effect
content = content.replace(/  const loadData = \(\) => {[\s\S]*?  }, \[\]\);/m, 
`  useEffect(() => {
    if (properties.length > 0 && !propertyId) {
      setPropertyId(properties[0].id);
    }
  }, [properties]);`);

// handleSave
content = content.replace(/  const handleSave = \(e: React.FormEvent\) => {[\s\S]*?  };/m, 
`  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!specKey || !specValue || !propertyId) return;

    if (editingSpec) {
      await supabase.from('property_specs').update({
        property_id: propertyId,
        label_en: specKey,
        value_en: specValue,
        label_ar: category, // Using label_ar for category
        value_ar: highlight ? "true" : "false" // Using value_ar for highlight
      }).eq('id', editingSpec.id);
    } else {
      await supabase.from('property_specs').insert({
        property_id: propertyId,
        label_en: specKey,
        value_en: specValue,
        label_ar: category, // Using label_ar for category
        value_ar: highlight ? "true" : "false" // Using value_ar for highlight
      });
    }

    setIsModalOpen(false);
    refreshData();
  };`);

// handleDelete
content = content.replace(/  const handleDelete = \(id: string\) => {[\s\S]*?  };/m, 
`  const handleDelete = async (id: string) => {
    if (confirm("Delete this specification?")) {
      await deleteSpec(id);
    }
  };`);

// toggleHighlight
content = content.replace(/  const toggleHighlight = \(spec: PropertySpec\) => {[\s\S]*?  };/m, 
`  const toggleHighlight = async (spec: PropertySpecRow) => {
    const isHigh = spec.value_ar === "true";
    await supabase.from('property_specs').update({ value_ar: isHigh ? "false" : "true" }).eq('id', spec.id);
    refreshData();
  };`);

// Maps
content = content.replace(/spec\.propertyId/g, 'spec.property_id');
content = content.replace(/spec\.specKey/g, 'spec.label_en');
content = content.replace(/spec\.specValue/g, 'spec.value_en');
content = content.replace(/spec\.category/g, 'spec.label_ar');
content = content.replace(/spec\.highlight/g, '(spec.value_ar === "true")');
content = content.replace(/spec\.propertyTitle/g, '(properties.find(p => p.id === spec.property_id)?.title_en || "Property")');

// Types in modals
content = content.replace(/const \[editingSpec, setEditingSpec\] = useState<PropertySpec \| null>\(null\);/g, 'const [editingSpec, setEditingSpec] = useState<PropertySpecRow | null>(null);');
content = content.replace(/openEditModal = \(spec: PropertySpec\)/g, 'openEditModal = (spec: PropertySpecRow)');

// handleApplyPreset typing
content = content.replace(/const handleApplyPreset = \(preset: typeof specPresets\[0\]\)/g, 'const handleApplyPreset = (preset: any)');

// Fix initial properties call
content = content.replace(/p\.title/g, 'p.title_en');

fs.writeFileSync('src/app/dashboard-admin/(protected)/property-specs/page.tsx', content);
console.log('Specs page updated!');
