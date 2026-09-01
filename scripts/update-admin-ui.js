const fs = require('fs');

let adminContent = fs.readFileSync('src/app/actions/admin.ts', 'utf8');

adminContent = adminContent.replace(/        role: u.user_metadata\?\.role \|\| "Property Manager",\n        status: u\.user_metadata\?\.status \|\| "Active",\n        phone: u\.user_metadata\?\.phone \|\| "",\n/, '');

adminContent = adminContent.replace(/export async function addAdmin\(adminData: {\n  fullName: string;\n  email: string;\n  role: string;\n  phone: string;\n  avatar: string;\n  status: string;\n}\) {/m,
`export async function addAdmin(adminData: {
  fullName: string;
  email: string;
  avatar: string;
}) {`);

adminContent = adminContent.replace(/        role: adminData.role,\n        status: adminData.status,\n        phone: adminData.phone,\n/, '');
adminContent = adminContent.replace(/        role: updates.role,\n        status: updates.status,\n        phone: updates.phone,\n/, '');

fs.writeFileSync('src/app/actions/admin.ts', adminContent);
console.log('actions updated');

let uiContent = fs.readFileSync('src/app/dashboard-admin/(protected)/admin-profiles/page.tsx', 'utf8');

uiContent = uiContent.replace(/  const \[selectedRole, setSelectedRole\] = useState<string>\("All"\);\n/, '');
uiContent = uiContent.replace(/  const \[role, setRole\] = useState\("Property Manager"\);\n  const \[phone, setPhone\] = useState\(""\);\n/, '');
uiContent = uiContent.replace(/  const \[status, setStatus\] = useState<"Active" \| "Inactive">\("Active"\);\n/, '');

uiContent = uiContent.replace(/    setRole\("Property Manager"\);\n    setPhone\("\+971 50 "\);\n/, '');
uiContent = uiContent.replace(/    setStatus\("Active"\);\n/, '');

uiContent = uiContent.replace(/    setRole\(admin.role\);\n    setPhone\(admin.phone \|\| ""\);\n/, '');
uiContent = uiContent.replace(/    setStatus\(admin.status\);\n/, '');

uiContent = uiContent.replace(/        role,\n        phone,\n/, '');
uiContent = uiContent.replace(/        status,\n/, '');
uiContent = uiContent.replace(/        role,\n        phone,\n/, '');
uiContent = uiContent.replace(/        status,\n/, '');

uiContent = uiContent.replace(/  const toggleStatus = async \(admin: any\) => {[\s\S]*?  };\n\n/m, '');

uiContent = uiContent.replace(/    const matchesRole = selectedRole === "All" \|\| admin.role === selectedRole;\n    return matchesSearch && matchesRole;\n  }\);/m, 
`    return matchesSearch;
  });`);

uiContent = uiContent.replace(/        <div className="flex items-center gap-2">\n          <select\n            value={selectedRole}\n            onChange={\(e\) => setSelectedRole\(e\.target\.value\)}\n            className="bg-\[#1c1c1c\] border border-\[#2f2f2f\] text-neutral-300 text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-accent cursor-pointer"\n          >\n            <option value="All">All Roles<\/option>\n            <option value="Super Admin">Super Admin<\/option>\n            <option value="Property Manager">Property Manager<\/option>\n            <option value="Sales Agent">Sales Agent<\/option>\n            <option value="Content Editor">Content Editor<\/option>\n          <\/select>\n        <\/div>\n/m, '');

uiContent = uiContent.replace(/                <th className="px-5 py-3\.5">Admin Member<\/th>\n                <th className="px-5 py-3\.5">Assigned Role<\/th>\n                <th className="px-5 py-3\.5">Contact Details<\/th>\n                <th className="px-5 py-3\.5">Status<\/th>\n                <th className="px-5 py-3\.5">Last Active<\/th>\n                <th className="px-5 py-3\.5 text-right">Actions<\/th>\n/m,
`                <th className="px-5 py-3.5">Admin Member</th>
                <th className="px-5 py-3.5">Last Active</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
`);

uiContent = uiContent.replace(/                  {\/\* Role \*\/}\n                  <td className="px-5 py-4 whitespace-nowrap">\n                    <span\n                      className={`inline-flex items-center gap-1\.5 px-2\.5 py-1 rounded-full text-xs font-medium \${\n                        admin\.role === "Super Admin"\n                          \? "bg-purple-500\/15 text-purple-300 border border-purple-500\/30"\n                          : admin\.role === "Property Manager"\n                          \? "bg-blue-500\/15 text-blue-300 border border-blue-500\/30"\n                          : admin\.role === "Sales Agent"\n                          \? "bg-amber-500\/15 text-amber-300 border border-amber-500\/30"\n                          : "bg-emerald-500\/15 text-emerald-300 border border-emerald-500\/30"\n                      }`}\n                    >\n                      <Shield size={12} \/>\n                      {admin\.role}\n                    <\/span>\n                  <\/td>\n\n                  {\/\* Contact \*\/}\n                  <td className="px-5 py-4 whitespace-nowrap text-xs text-neutral-400 font-mono">\n                    <div className="flex flex-col gap-0\.5">\n                      <span>{admin\.phone \|\| "No phone listed"}<\/span>\n                    <\/div>\n                  <\/td>\n\n                  {\/\* Status Toggle \*\/}\n                  <td className="px-5 py-4 whitespace-nowrap">\n                    <button\n                      onClick={\(\) => toggleStatus\(admin\)}\n                      className={`inline-flex items-center gap-1\.5 px-2\.5 py-1 rounded-full text-xs font-medium transition-colors \${\n                        admin\.status === "Active"\n                          \? "bg-emerald-500\/10 text-emerald-400 border border-emerald-500\/20 hover:bg-emerald-500\/20"\n                          : "bg-neutral-800 text-neutral-400 border border-neutral-700 hover:bg-neutral-700"\n                      }`}\n                    >\n                      {admin\.status === "Active" \? \(\n                        <>\n                          <CheckCircle2 size={12} \/> Active\n                        <\/>\n                      \) : \(\n                        <>\n                          <XCircle size={12} \/> Inactive\n                        <\/>\n                      \)}\n                    <\/button>\n                  <\/td>\n/m, '');

uiContent = uiContent.replace(/              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">\n                <div>\n                  <label className="block text-neutral-300 font-medium mb-1">Email Address \*<\/label>\n                  <input\n                    type="email"\n                    required\n                    value={email}\n                    onChange={\(e\) => setEmail\(e\.target\.value\)}\n                    placeholder="tariq@spechome.com"\n                    className="w-full bg-\[#1c1c1c\] border border-\[#333333\] rounded-lg px-3\.5 py-2\.5 text-white focus:outline-none focus:border-accent"\n                  \/>\n                <\/div>\n                <div>\n                  <label className="block text-neutral-300 font-medium mb-1">Phone Number<\/label>\n                  <input\n                    type="text"\n                    value={phone}\n                    onChange={\(e\) => setPhone\(e\.target\.value\)}\n                    placeholder="\+971 50 123 4567"\n                    className="w-full bg-\[#1c1c1c\] border border-\[#333333\] rounded-lg px-3\.5 py-2\.5 text-white focus:outline-none focus:border-accent"\n                  \/>\n                <\/div>\n              <\/div>\n\n              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">\n                <div>\n                  <label className="block text-neutral-300 font-medium mb-1">Assigned Role<\/label>\n                  <select\n                    value={role}\n                    onChange={\(e\) => setRole\(e\.target\.value as AdminProfile\["role"\]\)}\n                    className="w-full bg-\[#1c1c1c\] border border-\[#333333\] rounded-lg px-3\.5 py-2\.5 text-white focus:outline-none focus:border-accent cursor-pointer"\n                  >\n                    <option value="Super Admin">Super Admin<\/option>\n                    <option value="Property Manager">Property Manager<\/option>\n                    <option value="Sales Agent">Sales Agent<\/option>\n                    <option value="Content Editor">Content Editor<\/option>\n                  <\/select>\n                <\/div>\n\n                <div>\n                  <label className="block text-neutral-300 font-medium mb-1">Status<\/label>\n                  <select\n                    value={status}\n                    onChange={\(e\) => setStatus\(e\.target\.value as "Active" \| "Inactive"\)}\n                    className="w-full bg-\[#1c1c1c\] border border-\[#333333\] rounded-lg px-3\.5 py-2\.5 text-white focus:outline-none focus:border-accent cursor-pointer"\n                  >\n                    <option value="Active">Active<\/option>\n                    <option value="Inactive">Inactive<\/option>\n                  <\/select>\n                <\/div>\n              <\/div>\n/m, 
`              <div>
                <label className="block text-neutral-300 font-medium mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tariq@spechome.com"
                  className="w-full bg-[#1c1c1c] border border-[#333333] rounded-lg px-3.5 py-2.5 text-white focus:outline-none focus:border-accent"
                />
              </div>
`);

fs.writeFileSync('src/app/dashboard-admin/(protected)/admin-profiles/page.tsx', uiContent);
console.log('UI updated');
