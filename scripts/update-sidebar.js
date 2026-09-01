const fs = require('fs');
let content = fs.readFileSync('src/components/AdminSidebar.tsx', 'utf8');

content = content.replace('import { AdminStore } from "@/lib/adminStore";', 'import { useRealtimeDashboard } from "@/lib/supabase/useRealtimeDashboard";');

// Remove external dbNavItems definition
content = content.replace(/export const dbNavItems = \[[\s\S]*?\];/m, '');

// Insert nav items inside the component
content = content.replace('export default function AdminSidebar() {', 
`export default function AdminSidebar() {
  const { admins, enquiries, projects, properties, images, specs } = useRealtimeDashboard();
  
  const dbNavItems = [
    {
      href: "/dashboard-admin/admin-profiles",
      aliases: ["/dashboard-admin/admin_profiles"],
      label: "admin_profiles",
      displayLabel: "Admin Profiles",
      icon: Users,
      badge: admins.length,
    },
    {
      href: "/dashboard-admin/enquiries",
      aliases: [],
      label: "enquiries",
      displayLabel: "Enquiries / Leads",
      icon: MessageSquareText,
      badge: enquiries.filter((e) => e.status === "new").length,
      badgeColor: "bg-amber-500/20 text-amber-300 border border-amber-500/30",
    },
    {
      href: "/dashboard-admin/projects",
      aliases: [],
      label: "projects",
      displayLabel: "Projects",
      icon: FolderKanban,
      badge: projects.length,
    },
    {
      href: "/dashboard-admin/properties",
      aliases: [],
      label: "properties",
      displayLabel: "Properties",
      icon: Building2,
      badge: properties.length,
    },
    {
      href: "/dashboard-admin/property-images",
      aliases: ["/dashboard-admin/property_images"],
      label: "property_images",
      displayLabel: "Property Images",
      icon: ImageIcon,
      badge: images.length,
    },
    {
      href: "/dashboard-admin/property-specs",
      aliases: ["/dashboard-admin/property_specs"],
      label: "property_specs",
      displayLabel: "Property Specs",
      icon: SlidersHorizontal,
      badge: specs.length,
    },
    {
      href: "/dashboard-admin/site-settings",
      aliases: ["/dashboard-admin/site_settings", "/dashboard-admin/settings"],
      label: "site_settings",
      displayLabel: "Site Settings",
      icon: Settings2,
      badge: null,
    },
  ];`);

// Remove counts state and effect
content = content.replace(/  const \[counts, setCounts\] = useState<{ \[key: string\]: number \| null }>\({}\);\n\n  useEffect\(\(\) => {[\s\S]*?  }, \[pathname\]\);/m, '');

// Update Reset logic
content = content.replace(/  const handleResetData = \(\) => {[\s\S]*?  };/m, 
`  const handleResetData = () => {
    alert("Reset is disabled in Live mode.");
  };`);

// Update JSX rendering to use item.badge
content = content.replace(/counts\[item\.label\] !== undefined && counts\[item\.label\] !== null/g, 'item.badge !== null');
content = content.replace(/counts\[item\.label\]/g, 'item.badge');

fs.writeFileSync('src/components/AdminSidebar.tsx', content);
console.log('Sidebar updated!');
