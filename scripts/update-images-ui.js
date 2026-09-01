const fs = require('fs');
let content = fs.readFileSync('src/app/dashboard-admin/(protected)/property-images/page.tsx', 'utf8');

// Remove category and caption from State
content = content.replace(/  const \[selectedCategory, setSelectedCategory\] = useState<string>\("All"\);\n/, '');
content = content.replace(/  const \[category, setCategory\] = useState\("Exterior"\);\n/, '');
content = content.replace(/  const \[caption, setCaption\] = useState\(""\);\n/, '');

// Remove category and caption reset from handleAddImage
content = content.replace(/      setCaption\(""\);\n/, '');

// Update filteredImages logic
content = content.replace(/  const filteredImages = images\.filter\(\(img\) => {[\s\S]*?  }\);/m, 
`  const filteredImages = images.filter((img) => {
    const matchesProperty = selectedPropertyId === "All" || img.property_id === selectedPropertyId;
    const matchesSearch = (properties.find(p => p.id === img.property_id)?.title_en || "Unknown").toLowerCase().includes(searchTerm.toLowerCase());
    return matchesProperty && matchesSearch;
  });`);

// Update the Category filter JSX
content = content.replace(/          {\/\* Category Dropdown Filter \*\/}
          <select
            value={selectedCategory}
            onChange={\(e\) => setSelectedCategory\(e\.target\.value\)}
            className="bg-\[#1c1c1c\] border border-\[#2f2f2f\] text-neutral-300 text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-accent cursor-pointer"
          >
            <option value="All">All Categories<\/option>
            <option value="Exterior">Exterior<\/option>
            <option value="Interior">Interior<\/option>
            <option value="Living Room">Living Room<\/option>
            <option value="Bedroom">Bedroom<\/option>
            <option value="Bathroom">Bathroom<\/option>
          <\/select>/, '');

// Update search placeholder
content = content.replace(/placeholder="Search images by caption, title..."/, 'placeholder="Search images by property title..."');

// Update Grid Items
content = content.replace(/<div className="font-semibold text-white truncate text-sm">"Exterior View"<\/div>\n                      <div className="text-xs text-neutral-400 mt-0\.5 truncate flex items-center gap-1\.5">\n                        <span className="px-1\.5 py-0\.5 rounded bg-\[#262626\] text-\[10px\]">"Exterior"<\/span>\n                        <span className="truncate">{\(properties\.find\(p => p\.id === img\.property_id\)\?\.title_en \|\| "Unknown"\)}<\/span>\n                      <\/div>/,
`<div className="font-semibold text-white truncate text-sm">{(properties.find(p => p.id === img.property_id)?.title_en || "Unknown")}</div>
                      <div className="text-xs text-neutral-400 mt-0.5 truncate flex items-center gap-1.5">
                        <span className="px-1.5 py-0.5 rounded bg-[#262626] text-[10px]">Order: {img.display_order}</span>
                      </div>`);

// Update Form
content = content.replace(/              <div>\n                <label className="block text-neutral-300 font-medium mb-1">Image Category \*<\/label>\n                <select\n                  required\n                  value={category}\n                  onChange={\(e\) => setCategory\(e\.target\.value\)}\n                  className="w-full bg-\[#1c1c1c\] border border-\[#333333\] rounded-lg px-3\.5 py-2\.5 text-white focus:outline-none focus:border-accent"\n                >\n                  <option value="Exterior">Exterior<\/option>\n                  <option value="Interior">Interior<\/option>\n                  <option value="Living Room">Living Room<\/option>\n                  <option value="Bedroom">Bedroom<\/option>\n                  <option value="Bathroom">Bathroom<\/option>\n                  <option value="Kitchen">Kitchen<\/option>\n                  <option value="Amenities">Amenities<\/option>\n                <\/select>\n              <\/div>\n\n              <div>\n                <label className="block text-neutral-300 font-medium mb-1">Caption \/ Alt Text<\/label>\n                <input\n                  type="text"\n                  value={caption}\n                  onChange={\(e\) => setCaption\(e\.target\.value\)}\n                  className="w-full bg-\[#1c1c1c\] border border-\[#333333\] rounded-lg px-3\.5 py-2\.5 text-white focus:outline-none focus:border-accent"\n                  placeholder="e\.g\., Sunset view from master balcony"\n                \/>\n              <\/div>/, '');

fs.writeFileSync('src/app/dashboard-admin/(protected)/property-images/page.tsx', content);
console.log('Images UI updated!');
