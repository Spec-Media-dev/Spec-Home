const fs = require('fs');
let content = fs.readFileSync('src/app/dashboard-admin/(protected)/property-specs/page.tsx', 'utf8');

// Remove category state
content = content.replace(/  const \[selectedCategory, setSelectedCategory\] = useState<string>\("All"\);\n/, '');
content = content.replace(/  const \[category, setCategory\] = useState\("Architecture & Design"\);\n/, '  const [labelAr, setLabelAr] = useState("");\n');
content = content.replace(/  const \[highlight, setHighlight\] = useState\(true\);\n/, '  const [valueAr, setValueAr] = useState("");\n');

// Remove extra imports
content = content.replace(/  CheckCircle2,\n/, '');
content = content.replace(/  Star,\n/, '');
content = content.replace(/  Filter,\n/, '');

// Update table cols in toggleHighlight mapping
content = content.replace(/  const toggleHighlight = async \(spec: PropertySpecRow\) => {[\s\S]*?  };/m, '');
content = content.replace(/                  <Star size={14} className={spec\.highlight \? "fill-current" : ""} \/>\n                  <span>{spec\.highlight \? "Highlighted" : "Standard"}<\/span>/, 
`                  <span>{(spec.value_ar === "true") ? "Highlighted" : "Standard"}</span>`); // Wait, remove Highlight entirely
content = content.replace(/<button\n                    onClick={\(\) => toggleHighlight\(spec\)}\n[\s\S]*?<\/button>/m, '');


// Fix handleSave
content = content.replace(/  const handleSave = async \(e: React\.FormEvent\) => {[\s\S]*?refreshData\(\);\n  };/m, 
`  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!specKey || !specValue || !propertyId) return;

    if (editingSpec) {
      await supabase.from('property_specs').update({
        property_id: propertyId,
        label_en: specKey,
        value_en: specValue,
        label_ar: labelAr,
        value_ar: valueAr
      }).eq('id', editingSpec.id);
    } else {
      await supabase.from('property_specs').insert({
        property_id: propertyId,
        label_en: specKey,
        value_en: specValue,
        label_ar: labelAr,
        value_ar: valueAr
      });
    }

    setIsModalOpen(false);
    refreshData();
  };`);

// Remove category filter from filteredSpecs
content = content.replace(/  const filteredSpecs = specs\.filter\(\(s\) => {[\s\S]*?  }\);/m, 
`  const filteredSpecs = specs.filter((s) => {
    const matchesProperty = selectedPropertyId === "All" || s.property_id === selectedPropertyId;
    const matchesSearch =
      s.label_en.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.value_en.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (properties.find(p => p.id === s.property_id)?.title_en || "Property").toLowerCase().includes(searchTerm.toLowerCase());
    return matchesProperty && matchesSearch;
  });`);

// Fix modal open fields
content = content.replace(/    setCategory\(spec\.category\);\n    setHighlight\(spec\.highlight\);/, 
`    setLabelAr(spec.label_ar || "");
    setValueAr(spec.value_ar || "");`);
content = content.replace(/    setCategory\("Architecture & Design"\);\n    setHighlight\(true\);/, 
`    setLabelAr("");
    setValueAr("");`);

// Fix preset handler
content = content.replace(/  const handleApplyPreset = \(preset: any\) => {[\s\S]*?  };/m, '');

// Remove Categories from JSX Dropdown
content = content.replace(/          {\/\* Category Filter \*\/}
          <select
            value={selectedCategory}
            onChange={\(e\) => setSelectedCategory\(e\.target\.value\)}
            className="bg-\[#1c1c1c\] border border-\[#2f2f2f\] text-neutral-300 text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-accent cursor-pointer"
          >
            <option value="All">All Categories<\/option>
            <option value="Architecture & Design">Architecture & Design<\/option>
            <option value="Interior Features">Interior Features<\/option>
            <option value="Amenities & Leisure">Amenities & Leisure<\/option>
            <option value="Smart Home & Tech">Smart Home & Tech<\/option>
            <option value="Security & Privacy">Security & Privacy<\/option>
          <\/select>/, '');

// Fix Table Headers
content = content.replace(/                  <th className="px-4 py-3 text-left font-medium text-neutral-400 w-1\/5">Category<\/th>\n                  <th className="px-4 py-3 text-left font-medium text-neutral-400">Attribute \(EN\)<\/th>\n                  <th className="px-4 py-3 text-left font-medium text-neutral-400">Value \(EN\)<\/th>\n                  <th className="px-4 py-3 text-center font-medium text-neutral-400 w-24">Highlight<\/th>/,
`                  <th className="px-4 py-3 text-left font-medium text-neutral-400">Label (EN)</th>
                  <th className="px-4 py-3 text-left font-medium text-neutral-400">Label (AR)</th>
                  <th className="px-4 py-3 text-left font-medium text-neutral-400">Value (EN)</th>
                  <th className="px-4 py-3 text-left font-medium text-neutral-400">Value (AR)</th>`);

// Fix Table Rows
content = content.replace(/                  <td className="px-4 py-3 border-b border-\[#222222\]">\n                    <span className="inline-flex items-center gap-1\.5 px-2 py-1 rounded bg-\[#222222\] text-\[10px\] font-mono text-neutral-300 border border-\[#333333\]">\n                      {spec\.category}\n                    <\/span>\n                  <\/td>\n                  <td className="px-4 py-3 border-b border-\[#222222\]">\n                    <span className="text-white font-medium">{spec\.specKey}<\/span>\n                  <\/td>\n                  <td className="px-4 py-3 border-b border-\[#222222\]">\n                    <span className="text-neutral-300">{spec\.specValue}<\/span>\n                  <\/td>\n                  <td className="px-4 py-3 border-b border-\[#222222\] text-center">\n[\s\S]*?                  <\/td>/g, 
`                  <td className="px-4 py-3 border-b border-[#222222]">
                    <span className="text-white font-medium">{spec.label_en}</span>
                  </td>
                  <td className="px-4 py-3 border-b border-[#222222]">
                    <span className="text-neutral-300" dir="rtl">{spec.label_ar}</span>
                  </td>
                  <td className="px-4 py-3 border-b border-[#222222]">
                    <span className="text-neutral-300">{spec.value_en}</span>
                  </td>
                  <td className="px-4 py-3 border-b border-[#222222]">
                    <span className="text-neutral-300" dir="rtl">{spec.value_ar}</span>
                  </td>`);

// Fix Form inputs
content = content.replace(/              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">\n                <div>\n                  <label className="block text-neutral-300 font-medium mb-1">Category \*<\/label>\n                  <select\n                    required\n                    value={category}\n                    onChange={\(e\) => setCategory\(e\.target\.value\)}\n                    className="w-full bg-\[#1c1c1c\] border border-\[#333333\] rounded-lg px-3\.5 py-2\.5 text-white focus:outline-none focus:border-accent cursor-pointer"\n                  >\n                    <option value="Architecture & Design">Architecture & Design<\/option>\n                    <option value="Interior Features">Interior Features<\/option>\n                    <option value="Amenities & Leisure">Amenities & Leisure<\/option>\n                    <option value="Smart Home & Tech">Smart Home & Tech<\/option>\n                    <option value="Security & Privacy">Security & Privacy<\/option>\n                  <\/select>\n                <\/div>\n\n                <div className="flex items-center gap-2 pt-6">\n                  <label className="flex items-center gap-2 text-neutral-300 cursor-pointer">\n                    <input\n                      type="checkbox"\n                      checked={highlight}\n                      onChange={\(e\) => setHighlight\(e\.target\.checked\)}\n                      className="w-4 h-4 rounded border-neutral-700 bg-neutral-900 text-accent focus:ring-accent"\n                    \/>\n                    <span>Highlight as Key Feature<\/span>\n                  <\/label>\n                <\/div>\n              <\/div>/, 
`              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-neutral-300 font-medium mb-1">Label (Arabic)</label>
                  <input
                    type="text"
                    value={labelAr}
                    onChange={(e) => setLabelAr(e.target.value)}
                    dir="rtl"
                    className="w-full bg-[#1c1c1c] border border-[#333333] rounded-lg px-3.5 py-2.5 text-white focus:outline-none focus:border-accent"
                  />
                </div>
                <div>
                  <label className="block text-neutral-300 font-medium mb-1">Value (Arabic)</label>
                  <input
                    type="text"
                    value={valueAr}
                    onChange={(e) => setValueAr(e.target.value)}
                    dir="rtl"
                    className="w-full bg-[#1c1c1c] border border-[#333333] rounded-lg px-3.5 py-2.5 text-white focus:outline-none focus:border-accent"
                  />
                </div>
              </div>`);

content = content.replace(/Attribute Name/, 'Label (English)');
content = content.replace(/Value \/ Feature/, 'Value (English)');
content = content.replace(/specKey/g, 'labelEn');
content = content.replace(/specValue/g, 'valueEn');
content = content.replace(/setSpecKey/g, 'setLabelEn');
content = content.replace(/setSpecValue/g, 'setValueEn');
content = content.replace(/const \[labelEn, setLabelEn\] = useState\(""\);\n  const \[valueEn, setValueEn\] = useState\(""\);/, 
  'const [labelEn, setLabelEn] = useState("");\n  const [valueEn, setValueEn] = useState("");');

fs.writeFileSync('src/app/dashboard-admin/(protected)/property-specs/page.tsx', content);
console.log('Specs UI updated!');
