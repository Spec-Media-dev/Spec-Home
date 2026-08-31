"use client";

// Types matching the 7 database collections from the user's schema
export interface AdminProfile {
  id: string;
  fullName: string;
  email: string;
  role: "Super Admin" | "Property Manager" | "Content Editor" | "Sales Agent";
  avatar: string;
  status: "Active" | "Inactive";
  lastActive: string;
  phone?: string;
}

export interface Enquiry {
  id: string;
  name: string;
  email: string;
  phone: string;
  propertyTitle?: string;
  projectTitle?: string;
  type: "General" | "Property Viewing" | "Investment Consultation" | "VIP Request";
  message: string;
  date: string;
  status: "New" | "Contacted" | "In Progress" | "Closed";
  priority: "High" | "Medium" | "Low";
}

export interface Project {
  id: string;
  title: string;
  slug: string;
  developer: string;
  location: string;
  startingPrice: string;
  units: number;
  completionDate: string;
  status: "Under Construction" | "Ready / Handover" | "Launching Soon" | "Sold Out";
  heroImage: string;
  description: string;
  featured: boolean;
}

export interface Property {
  id: string;
  title: string;
  slug: string;
  projectId?: string;
  projectName?: string;
  type: "Villa" | "Penthouse" | "Luxury Apartment" | "Mansion" | "Townhouse";
  location: string;
  price: string;
  numericPrice: number;
  bedrooms: number;
  bathrooms: number;
  areaSqFt: number;
  status: "Published" | "Draft" | "Sold" | "Reserved";
  featured: boolean;
  coverImage: string;
  description: string;
}

export interface PropertyImage {
  id: string;
  propertyId: string;
  propertyTitle: string;
  url: string;
  category: "Exterior" | "Interior" | "Living Room" | "Master Suite" | "Pool & Garden" | "View" | "Floorplan";
  caption: string;
  isCover: boolean;
  order: number;
}

export interface PropertySpec {
  id: string;
  propertyId: string;
  propertyTitle: string;
  category: "Architecture & Design" | "Luxury Features" | "Smart Home" | "Facilities & Amenities" | "Technical";
  specKey: string;
  specValue: string;
  highlight: boolean;
}

export interface SiteSettings {
  siteName: string;
  siteTagline: string;
  metaDescription: string;
  contactEmail: string;
  contactPhone: string;
  whatsappNumber: string;
  officeAddress: string;
  currency: string;
  instagramUrl: string;
  linkedinUrl: string;
  youtubeUrl: string;
  maintenanceMode: boolean;
  announcementBanner: string;
  enableVipInquiries: boolean;
}

// Initial Seed Data for all 7 Tables
export const initialAdminProfiles: AdminProfile[] = [
  {
    id: "adm-1",
    fullName: "Alexander Wright",
    email: "alexander@spechome.com",
    role: "Super Admin",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=300&auto=format&fit=crop",
    status: "Active",
    lastActive: "Just now",
    phone: "+971 50 111 2233",
  },
  {
    id: "adm-2",
    fullName: "Elena Rostova",
    email: "elena.r@spechome.com",
    role: "Property Manager",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=300&auto=format&fit=crop",
    status: "Active",
    lastActive: "15 mins ago",
    phone: "+971 52 444 5566",
  },
  {
    id: "adm-3",
    fullName: "Tariq Mansoor",
    email: "tariq.m@spechome.com",
    role: "Sales Agent",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=300&auto=format&fit=crop",
    status: "Active",
    lastActive: "2 hours ago",
    phone: "+971 55 777 8899",
  },
  {
    id: "adm-4",
    fullName: "Sophia Chen",
    email: "sophia.c@spechome.com",
    role: "Content Editor",
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=300&auto=format&fit=crop",
    status: "Inactive",
    lastActive: "3 days ago",
    phone: "+971 56 333 1122",
  },
];

export const initialEnquiries: Enquiry[] = [
  {
    id: "enq-101",
    name: "Lord Henry Cavendish",
    email: "h.cavendish@mayfaircapital.co.uk",
    phone: "+44 20 7946 0912",
    propertyTitle: "Palm Signature Villa 12",
    projectTitle: "The Palm Signature Villas",
    type: "VIP Request",
    message: "Seeking a private beachfront estate on Palm Jumeirah with yacht dock. Prepared for cash settlement within 30 days.",
    date: "Today, 14:20",
    status: "New",
    priority: "High",
  },
  {
    id: "enq-102",
    name: "Dr. Fatima Al-Hashimi",
    email: "fatima.hashimi@emirateshealth.ae",
    phone: "+971 50 889 1234",
    propertyTitle: "Sky Penthouse Triplex",
    projectTitle: "The Sapphire Residences",
    type: "Property Viewing",
    message: "Would like to schedule a private sunset viewing for the top-floor triplex this coming Friday.",
    date: "Today, 11:15",
    status: "In Progress",
    priority: "High",
  },
  {
    id: "enq-103",
    name: "Maximilian Vane",
    email: "m.vane@genevaprivate.ch",
    phone: "+41 22 710 4420",
    propertyTitle: "Marina Crest Duplex Penthouse",
    projectTitle: "Oasis Palm Heights",
    type: "Investment Consultation",
    message: "Requesting ROI prospectus and rental yield projections for luxury duplex units in Dubai Marina.",
    date: "Yesterday",
    status: "Contacted",
    priority: "Medium",
  },
  {
    id: "enq-104",
    name: "Amara Dubois",
    email: "amara.dubois@luxgroup.fr",
    phone: "+33 6 12 34 56 78",
    propertyTitle: "Dubai Hills Fairway Mansion",
    projectTitle: "The Hills Reserve",
    type: "General",
    message: "Inquiring about handover dates and payment milestone schedules for golf-facing mansions.",
    date: "Aug 29, 2026",
    status: "Closed",
    priority: "Low",
  },
];

export const initialProjects: Project[] = [
  {
    id: "proj-1",
    title: "The Sapphire Residences",
    slug: "the-sapphire-residences",
    developer: "SPEC Signature Developments",
    location: "Downtown Dubai",
    startingPrice: "AED 9,500,000",
    units: 48,
    completionDate: "Q4 2027",
    status: "Under Construction",
    heroImage: "https://images.unsplash.com/photo-1546412414-e1885259563a?q=80&w=1200&auto=format&fit=crop",
    description: "Ultra-luxury architectural icon rising 65 storeys in the heart of Downtown Dubai with direct Burj Khalifa views.",
    featured: true,
  },
  {
    id: "proj-2",
    title: "The Palm Signature Villas",
    slug: "palm-signature-villas",
    developer: "SPEC Waterfront",
    location: "Palm Jumeirah, Frond N",
    startingPrice: "AED 32,000,000",
    units: 14,
    completionDate: "Q2 2027",
    status: "Under Construction",
    heroImage: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=1200&auto=format&fit=crop",
    description: "Private bespoke beachfront estates designed by world-renowned Italian architects with private berths.",
    featured: true,
  },
  {
    id: "proj-3",
    title: "Oasis Palm Heights",
    slug: "oasis-palm-heights",
    developer: "Emaar & SPEC Joint Venture",
    location: "Dubai Marina",
    startingPrice: "AED 4,800,000",
    units: 120,
    completionDate: "Ready / Handover",
    status: "Ready / Handover",
    heroImage: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=1200&auto=format&fit=crop",
    description: "Waterfront living refined. Direct marina boardwalk access with 5-star concierge and infinity pool club.",
    featured: false,
  },
  {
    id: "proj-4",
    title: "The Hills Reserve",
    slug: "the-hills-reserve",
    developer: "SPEC Estates",
    location: "Dubai Hills Estate",
    startingPrice: "AED 18,500,000",
    units: 24,
    completionDate: "Q1 2028",
    status: "Launching Soon",
    heroImage: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?q=80&w=1200&auto=format&fit=crop",
    description: "Frontline 18-hole championship golf course mansions surrounded by lush landscaped parklands.",
    featured: true,
  },
];

export const initialProperties: Property[] = [
  {
    id: "prop-1",
    title: "Palm Signature Villa 12",
    slug: "palm-signature-villa-12",
    projectId: "proj-2",
    projectName: "The Palm Signature Villas",
    type: "Villa",
    location: "Palm Jumeirah, Frond N",
    price: "AED 45,000,000",
    numericPrice: 45000000,
    bedrooms: 6,
    bathrooms: 8,
    areaSqFt: 11500,
    status: "Published",
    featured: true,
    coverImage: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=1200&auto=format&fit=crop",
    description: "Modern organic beachfront sanctuary with custom marble craftsmanship, infinity pool, and private 30m private beach.",
  },
  {
    id: "prop-2",
    title: "Sky Penthouse Triplex",
    slug: "sky-penthouse-triplex",
    projectId: "proj-1",
    projectName: "The Sapphire Residences",
    type: "Penthouse",
    location: "Downtown Dubai",
    price: "AED 28,000,000",
    numericPrice: 28000000,
    bedrooms: 5,
    bathrooms: 6,
    areaSqFt: 8200,
    status: "Published",
    featured: true,
    coverImage: "https://images.unsplash.com/photo-1546412414-e1885259563a?q=80&w=1200&auto=format&fit=crop",
    description: "Spanning three full floors with private rooftop cantilevered glass pool overlooking the Burj Khalifa fountain.",
  },
  {
    id: "prop-3",
    title: "Marina Crest Duplex Penthouse",
    slug: "marina-crest-duplex",
    projectId: "proj-3",
    projectName: "Oasis Palm Heights",
    type: "Luxury Apartment",
    location: "Dubai Marina",
    price: "AED 12,400,000",
    numericPrice: 12400000,
    bedrooms: 4,
    bathrooms: 5,
    areaSqFt: 4600,
    status: "Published",
    featured: false,
    coverImage: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=1200&auto=format&fit=crop",
    description: "Panoramic double-height ceilings framing superyachts and Arabian Gulf sunsets.",
  },
  {
    id: "prop-4",
    title: "Dubai Hills Fairway Mansion",
    slug: "dubai-hills-fairway-mansion",
    projectId: "proj-4",
    projectName: "The Hills Reserve",
    type: "Mansion",
    location: "Dubai Hills Estate",
    price: "AED 34,500,000",
    numericPrice: 34500000,
    bedrooms: 7,
    bathrooms: 9,
    areaSqFt: 14200,
    status: "Draft",
    featured: false,
    coverImage: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?q=80&w=1200&auto=format&fit=crop",
    description: "Gated ultra-private estate with subterranean 6-car gallery showroom, wine cellar, and wellness spa.",
  },
];

export const initialPropertyImages: PropertyImage[] = [
  {
    id: "img-1",
    propertyId: "prop-1",
    propertyTitle: "Palm Signature Villa 12",
    url: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=1200&auto=format&fit=crop",
    category: "Exterior",
    caption: "Sunset view over private infinity pool & beach",
    isCover: true,
    order: 1,
  },
  {
    id: "img-2",
    propertyId: "prop-1",
    propertyTitle: "Palm Signature Villa 12",
    url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1200&auto=format&fit=crop",
    category: "Living Room",
    caption: "Double volume grand salon with custom chandelier",
    isCover: false,
    order: 2,
  },
  {
    id: "img-3",
    propertyId: "prop-2",
    propertyTitle: "Sky Penthouse Triplex",
    url: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=1200&auto=format&fit=crop",
    category: "View",
    caption: "Panoramic skyline sunset from 65th floor terrace",
    isCover: true,
    order: 1,
  },
  {
    id: "img-4",
    propertyId: "prop-2",
    propertyTitle: "Sky Penthouse Triplex",
    url: "https://images.unsplash.com/photo-1546412414-e1885259563a?q=80&w=1200&auto=format&fit=crop",
    category: "Interior",
    caption: "Minimalist Italian marble kitchen & wine display",
    isCover: false,
    order: 2,
  },
  {
    id: "img-5",
    propertyId: "prop-3",
    propertyTitle: "Marina Crest Duplex Penthouse",
    url: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=1200&auto=format&fit=crop",
    category: "Exterior",
    caption: "Direct views of Dubai Marina yacht harbor",
    isCover: true,
    order: 1,
  },
  {
    id: "img-6",
    propertyId: "prop-4",
    propertyTitle: "Dubai Hills Fairway Mansion",
    url: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?q=80&w=1200&auto=format&fit=crop",
    category: "Pool & Garden",
    caption: "Lush landscaped Zen gardens and private putting green",
    isCover: true,
    order: 1,
  },
];

export const initialPropertySpecs: PropertySpec[] = [
  {
    id: "spec-1",
    propertyId: "prop-1",
    propertyTitle: "Palm Signature Villa 12",
    category: "Architecture & Design",
    specKey: "Ceiling Height",
    specValue: "4.8m Double Volume Living",
    highlight: true,
  },
  {
    id: "spec-2",
    propertyId: "prop-1",
    propertyTitle: "Palm Signature Villa 12",
    category: "Luxury Features",
    specKey: "Private Beach & Berth",
    specValue: "30m frontage with 80ft yacht mooring",
    highlight: true,
  },
  {
    id: "spec-3",
    propertyId: "prop-1",
    propertyTitle: "Palm Signature Villa 12",
    category: "Smart Home",
    specKey: "Automation System",
    specValue: "Crestron Home + Lutron Palladiom Keypads",
    highlight: true,
  },
  {
    id: "spec-4",
    propertyId: "prop-2",
    propertyTitle: "Sky Penthouse Triplex",
    category: "Luxury Features",
    specKey: "Private Cantilever Pool",
    specValue: "Infinity Glass Bottom on Level 65",
    highlight: true,
  },
  {
    id: "spec-5",
    propertyId: "prop-2",
    propertyTitle: "Sky Penthouse Triplex",
    category: "Technical",
    specKey: "Private Elevator",
    specValue: "Biometric High-Speed Direct Access",
    highlight: false,
  },
  {
    id: "spec-6",
    propertyId: "prop-3",
    propertyTitle: "Marina Crest Duplex Penthouse",
    category: "Facilities & Amenities",
    specKey: "Concierge & Valet",
    specValue: "24/7 White Glove In-Residence Dining",
    highlight: false,
  },
  {
    id: "spec-7",
    propertyId: "prop-4",
    propertyTitle: "Dubai Hills Fairway Mansion",
    category: "Luxury Features",
    specKey: "Underground Showroom",
    specValue: "Climate Controlled 6-Vehicle Garage",
    highlight: true,
  },
];

export const initialSiteSettings: SiteSettings = {
  siteName: "SPEC Home Dubai",
  siteTagline: "The Pinnacle of Dubai Luxury Real Estate",
  metaDescription: "Curated portfolio of prime waterfront estates, sky penthouses, and branded residences in Dubai.",
  contactEmail: "concierge@spechome.com",
  contactPhone: "+971 4 800 7732",
  whatsappNumber: "+971 50 999 8888",
  officeAddress: "Level 42, Al Saada Tower, Downtown Dubai, UAE",
  currency: "AED",
  instagramUrl: "https://instagram.com/spechomedubai",
  linkedinUrl: "https://linkedin.com/company/spechomedubai",
  youtubeUrl: "https://youtube.com/@spechomedubai",
  maintenanceMode: false,
  announcementBanner: "Private Previews Available for Q4 2026 Signature Collections",
  enableVipInquiries: true,
};

// Storage helper functions
const getStored = <T>(key: string, fallback: T): T => {
  if (typeof window === "undefined") return fallback;
  try {
    const item = localStorage.getItem(`spechome_${key}`);
    return item ? JSON.parse(item) : fallback;
  } catch (e) {
    console.error(`Error reading ${key} from storage`, e);
    return fallback;
  }
};

const setStored = <T>(key: string, value: T): void => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(`spechome_${key}`, JSON.stringify(value));
  } catch (e) {
    console.error(`Error writing ${key} to storage`, e);
  }
};

export const AdminStore = {
  // 1. Admin Profiles
  getAdmins: (): AdminProfile[] => getStored("admin_profiles", initialAdminProfiles),
  saveAdmins: (data: AdminProfile[]) => setStored("admin_profiles", data),
  addAdmin: (admin: Omit<AdminProfile, "id">) => {
    const admins = AdminStore.getAdmins();
    const newAdmin: AdminProfile = { ...admin, id: `adm-${Date.now()}` };
    const updated = [newAdmin, ...admins];
    AdminStore.saveAdmins(updated);
    return newAdmin;
  },
  updateAdmin: (id: string, updates: Partial<AdminProfile>) => {
    const admins = AdminStore.getAdmins().map((a) => (a.id === id ? { ...a, ...updates } : a));
    AdminStore.saveAdmins(admins);
  },
  deleteAdmin: (id: string) => {
    const admins = AdminStore.getAdmins().filter((a) => a.id !== id);
    AdminStore.saveAdmins(admins);
  },

  // 2. Enquiries
  getEnquiries: (): Enquiry[] => getStored("enquiries", initialEnquiries),
  saveEnquiries: (data: Enquiry[]) => setStored("enquiries", data),
  addEnquiry: (enquiry: Omit<Enquiry, "id" | "date">) => {
    const enquiries = AdminStore.getEnquiries();
    const newEnquiry: Enquiry = {
      ...enquiry,
      id: `enq-${Date.now()}`,
      date: "Just now",
    };
    const updated = [newEnquiry, ...enquiries];
    AdminStore.saveEnquiries(updated);
    return newEnquiry;
  },
  updateEnquiryStatus: (id: string, status: Enquiry["status"]) => {
    const enquiries = AdminStore.getEnquiries().map((e) => (e.id === id ? { ...e, status } : e));
    AdminStore.saveEnquiries(enquiries);
  },
  deleteEnquiry: (id: string) => {
    const enquiries = AdminStore.getEnquiries().filter((e) => e.id !== id);
    AdminStore.saveEnquiries(enquiries);
  },

  // 3. Projects
  getProjects: (): Project[] => getStored("projects", initialProjects),
  saveProjects: (data: Project[]) => setStored("projects", data),
  addProject: (project: Omit<Project, "id">) => {
    const projects = AdminStore.getProjects();
    const newProject: Project = { ...project, id: `proj-${Date.now()}` };
    const updated = [newProject, ...projects];
    AdminStore.saveProjects(updated);
    return newProject;
  },
  updateProject: (id: string, updates: Partial<Project>) => {
    const projects = AdminStore.getProjects().map((p) => (p.id === id ? { ...p, ...updates } : p));
    AdminStore.saveProjects(projects);
  },
  deleteProject: (id: string) => {
    const projects = AdminStore.getProjects().filter((p) => p.id !== id);
    AdminStore.saveProjects(projects);
  },

  // 4. Properties
  getProperties: (): Property[] => getStored("properties", initialProperties),
  saveProperties: (data: Property[]) => setStored("properties", data),
  addProperty: (property: Omit<Property, "id">) => {
    const properties = AdminStore.getProperties();
    const newProperty: Property = { ...property, id: `prop-${Date.now()}` };
    const updated = [newProperty, ...properties];
    AdminStore.saveProperties(updated);
    return newProperty;
  },
  updateProperty: (id: string, updates: Partial<Property>) => {
    const properties = AdminStore.getProperties().map((p) => (p.id === id ? { ...p, ...updates } : p));
    AdminStore.saveProperties(properties);
  },
  deleteProperty: (id: string) => {
    const properties = AdminStore.getProperties().filter((p) => p.id !== id);
    AdminStore.saveProperties(properties);
  },

  // 5. Property Images
  getPropertyImages: (): PropertyImage[] => getStored("property_images", initialPropertyImages),
  savePropertyImages: (data: PropertyImage[]) => setStored("property_images", data),
  addImage: (image: Omit<PropertyImage, "id">) => {
    const images = AdminStore.getPropertyImages();
    const newImg: PropertyImage = { ...image, id: `img-${Date.now()}` };
    const updated = [newImg, ...images];
    AdminStore.savePropertyImages(updated);
    return newImg;
  },
  updateImage: (id: string, updates: Partial<PropertyImage>) => {
    const images = AdminStore.getPropertyImages().map((img) => (img.id === id ? { ...img, ...updates } : img));
    AdminStore.savePropertyImages(images);
  },
  deleteImage: (id: string) => {
    const images = AdminStore.getPropertyImages().filter((img) => img.id !== id);
    AdminStore.savePropertyImages(images);
  },

  // 6. Property Specs
  getPropertySpecs: (): PropertySpec[] => getStored("property_specs", initialPropertySpecs),
  savePropertySpecs: (data: PropertySpec[]) => setStored("property_specs", data),
  addSpec: (spec: Omit<PropertySpec, "id">) => {
    const specs = AdminStore.getPropertySpecs();
    const newSpec: PropertySpec = { ...spec, id: `spec-${Date.now()}` };
    const updated = [newSpec, ...specs];
    AdminStore.savePropertySpecs(updated);
    return newSpec;
  },
  updateSpec: (id: string, updates: Partial<PropertySpec>) => {
    const specs = AdminStore.getPropertySpecs().map((s) => (s.id === id ? { ...s, ...updates } : s));
    AdminStore.savePropertySpecs(specs);
  },
  deleteSpec: (id: string) => {
    const specs = AdminStore.getPropertySpecs().filter((s) => s.id !== id);
    AdminStore.savePropertySpecs(specs);
  },

  // 7. Site Settings
  getSiteSettings: (): SiteSettings => getStored("site_settings", initialSiteSettings),
  saveSiteSettings: (settings: SiteSettings) => setStored("site_settings", settings),

  // Reset Store to initial seed data
  resetAll: () => {
    if (typeof window === "undefined") return;
    localStorage.removeItem("spechome_admin_profiles");
    localStorage.removeItem("spechome_enquiries");
    localStorage.removeItem("spechome_projects");
    localStorage.removeItem("spechome_properties");
    localStorage.removeItem("spechome_property_images");
    localStorage.removeItem("spechome_property_specs");
    localStorage.removeItem("spechome_site_settings");
  },
};
