const fs = require('fs');

let content = fs.readFileSync('src/app/dashboard-admin/(protected)/admin-profiles/page.tsx', 'utf8');

// Imports
content = content.replace('import { AdminStore, AdminProfile } from "@/lib/adminStore";', 
`import { getAdmins, addAdmin, updateAdmin, deleteAdmin, toggleAdminStatus } from "@/app/actions/admin";`);

// State declarations
content = content.replace(/  const loadAdmins = \(\) => {[\s\S]*?  };/m, 
`  const loadAdmins = async () => {
    const data = await getAdmins();
    setAdmins(data as any);
  };`);

// Type for admin array
content = content.replace(/const \[admins, setAdmins\] = useState<AdminProfile\[\]>\(\[\]\);/, 'const [admins, setAdmins] = useState<any[]>([]);');
content = content.replace(/const \[editingAdmin, setEditingAdmin\] = useState<AdminProfile \| null>\(null\);/, 'const [editingAdmin, setEditingAdmin] = useState<any | null>(null);');
content = content.replace(/const \[role, setRole\] = useState<AdminProfile\["role"\]>\("Property Manager"\);/, 'const [role, setRole] = useState("Property Manager");');
content = content.replace(/openEditModal = \(admin: AdminProfile\)/g, 'openEditModal = (admin: any)');
content = content.replace(/toggleStatus = \(admin: AdminProfile\)/g, 'toggleStatus = async (admin: any)');

// handleSave
content = content.replace(/  const handleSave = \(e: React.FormEvent\) => {[\s\S]*?loadAdmins\(\);\n  };/m, 
`  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email) return;

    if (editingAdmin) {
      await updateAdmin(editingAdmin.id, {
        fullName,
        email,
        role,
        phone,
        avatar,
        status,
      });
    } else {
      await addAdmin({
        fullName,
        email,
        role,
        phone,
        avatar: avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=300&auto=format&fit=crop",
        status,
      });
    }
    setIsModalOpen(false);
    loadAdmins();
  };`);

// handleDelete
content = content.replace(/  const handleDelete = \(id: string\) => {[\s\S]*?loadAdmins\(\);\n    }\n  };/m, 
`  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to remove this administrator?")) {
      await deleteAdmin(id);
      loadAdmins();
    }
  };`);

// toggleStatus content
content = content.replace(/    const nextStatus = admin\.status === "Active" \? "Inactive" : "Active";\n    AdminStore\.updateAdmin\(admin\.id, \{ status: nextStatus \}\);\n    loadAdmins\(\);/m, 
`    await toggleAdminStatus(admin.id, admin.status);
    loadAdmins();`);


fs.writeFileSync('src/app/dashboard-admin/(protected)/admin-profiles/page.tsx', content);
console.log('Admins page updated!');
