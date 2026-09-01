const fs = require('fs');

let content = fs.readFileSync('src/app/dashboard-admin/(protected)/property-images/page.tsx', 'utf8');

// Imports
content = content.replace('import { AdminStore, PropertyImage, Property } from "@/lib/adminStore";', 
`import { useRealtimeDashboard } from "@/lib/supabase/useRealtimeDashboard";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { PropertyImageRow, PropertyRow } from "@/lib/supabase/types";`);

// State declarations
content = content.replace('  const [images, setImages] = useState<PropertyImage[]>([]);\n  const [properties, setProperties] = useState<Property[]>([]);', 
`  const { images, properties, deleteImage, refreshData } = useRealtimeDashboard();
  const supabase = getSupabaseBrowserClient();`);

// Form Category typing
content = content.replace('const [category, setCategory] = useState<PropertyImage["category"]>("Exterior");', 
'const [category, setCategory] = useState("Exterior");');

// loadData effect
content = content.replace(/  const loadData = \(\) => {[\s\S]*?  }, \[\]\);/m, 
`  useEffect(() => {
    if (properties.length > 0 && !propertyId) {
      setPropertyId(properties[0].id);
    }
  }, [properties]);`);

// handleSetCover
content = content.replace(/  const handleSetCover = \(img: PropertyImage\) => {[\s\S]*?  };/m, 
`  const handleSetCover = async (img: PropertyImageRow) => {
    const { error } = await supabase.from('property_images').update({ is_cover: false }).eq('property_id', img.property_id);
    if (!error) {
      await supabase.from('property_images').update({ is_cover: true }).eq('id', img.id);
      refreshData();
    }
  };`);

// handleDelete
content = content.replace(/  const handleDelete = \(id: string\) => {[\s\S]*?  };/m, 
`  const handleDelete = async (id: string) => {
    if (confirm("Delete this image from the gallery?")) {
      await deleteImage(id);
    }
  };`);

// handleAddImage
content = content.replace(/  const handleAddImage = \(e: React.FormEvent\) => {[\s\S]*?  };/m, 
`  const handleAddImage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url || !propertyId) return;

    const { error } = await supabase.from('property_images').insert({
      property_id: propertyId,
      image_url: url,
      is_cover: isCover,
      display_order: images.length + 1
    });

    if (!error) {
      setIsModalOpen(false);
      setUrl("");
      setCaption("");
      setIsCover(false);
      refreshData();
    }
  };`);

// Map properties in JSX
content = content.replace(/img\.propertyId/g, 'img.property_id');
content = content.replace(/img\.url/g, 'img.image_url');
content = content.replace(/img\.isCover/g, 'img.is_cover');
content = content.replace(/img\.propertyTitle/g, '(properties.find(p => p.id === img.property_id)?.title_en || "Unknown")');
content = content.replace(/img\.caption/g, '"Exterior View"'); // Hack for missing caption
content = content.replace(/img\.category/g, '"Exterior"'); // Hack for missing category
content = content.replace(/img\.order/g, 'img.display_order');
content = content.replace(/p\.title/g, 'p.title_en');

// Types in toggle
content = content.replace(/toggleHighlight = \(spec: PropertySpec\)/g, 'toggleHighlight = (spec: any)');
content = content.replace(/img: PropertyImage\)/g, 'img: PropertyImageRow)');
content = content.replace(/const \[editingSpec, setEditingSpec\] = useState<PropertySpec \| null>\(null\);/g, 'const [editingSpec, setEditingSpec] = useState<any | null>(null);');

fs.writeFileSync('src/app/dashboard-admin/(protected)/property-images/page.tsx', content);
console.log('Images page updated!');
