"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type {
  ProjectRow,
  PropertyRow,
  PropertyImageRow,
  PropertySpecRow,
  AdminProfileRow,
  EnquiryRow,
  SiteSettingsRow,
} from "@/lib/supabase/types";
import { AdminStore } from "@/lib/adminStore";

export function useRealtimeDashboard() {
  const [projects, setProjects] = useState<ProjectRow[]>([]);
  const [properties, setProperties] = useState<PropertyRow[]>([]);
  const [images, setImages] = useState<PropertyImageRow[]>([]);
  const [specs, setSpecs] = useState<PropertySpecRow[]>([]);
  const [admins, setAdmins] = useState<AdminProfileRow[]>([]);
  const [enquiries, setEnquiries] = useState<EnquiryRow[]>([]);
  const [siteSettings, setSiteSettings] = useState<SiteSettingsRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [lastSync, setLastSync] = useState<Date>(new Date());

  const supabase = getSupabaseBrowserClient();
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  // 1. Initial Full Data Fetch
  const fetchAllData = useCallback(async () => {
    try {
      const [
        { data: projectsData },
        { data: propertiesData },
        { data: imagesData },
        { data: specsData },
        { data: adminsData },
        { data: enquiriesData },
        { data: settingsData },
      ] = await Promise.all([
        supabase.from("projects").select("*").order("created_at", { ascending: false }),
        supabase.from("properties").select("*").order("created_at", { ascending: false }),
        supabase.from("property_images").select("*").order("display_order", { ascending: true }),
        supabase.from("property_specs").select("*").order("created_at", { ascending: true }),
        supabase.from("admin_profiles").select("*").order("created_at", { ascending: false }),
        supabase.from("enquiries").select("*").order("created_at", { ascending: false }),
        supabase.from("site_settings").select("*").limit(1).maybeSingle(),
      ]);

      if (projectsData && projectsData.length > 0) {
        setProjects(projectsData);
      } else {
        // Fallback to store
        const storeProjects = AdminStore.getProjects().map((p) => ({
          id: p.id,
          slug: p.slug,
          name_en: p.title,
          name_ar: p.title,
          description_en: p.description,
          description_ar: p.description,
          location_en: p.location,
          location_ar: p.location,
          cover_image_path: p.heroImage,
          is_published: true,
          is_featured: p.featured,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }));
        setProjects(storeProjects as any);
      }

      if (propertiesData && propertiesData.length > 0) {
        setProperties(propertiesData);
      } else {
        // Fallback to store
        const storeProps = AdminStore.getProperties().map((p) => ({
          id: p.id,
          project_id: p.projectId || "a0000000-0000-0000-0000-000000000001",
          slug: p.slug,
          reference_code: `SHP-${p.id.slice(0, 5)}`,
          title_en: p.title,
          title_ar: p.title,
          description_en: p.description,
          description_ar: p.description,
          price: p.numericPrice,
          bedrooms: p.bedrooms,
          bathrooms: p.bathrooms,
          area_sqft: p.areaSqFt,
          property_type_en: p.type,
          property_type_ar: p.type,
          status: (p.status.toLowerCase() === "published" ? "available" : p.status.toLowerCase()) as any,
          is_published: p.status === "Published",
          is_featured: p.featured,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }));
        setProperties(storeProps as any);
      }

      if (imagesData) setImages(imagesData);
      if (specsData) setSpecs(specsData);
      if (adminsData) setAdmins(adminsData);
      if (enquiriesData) setEnquiries(enquiriesData);
      if (settingsData) setSiteSettings(settingsData);

      setIsConnected(true);
      setLastSync(new Date());
    } catch (err) {
      console.warn("Realtime Dashboard sync using memory cache:", err);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  // 2. Realtime WebSocket Subscription (Zero-lag postgres_changes)
  useEffect(() => {
    fetchAllData();

    // Create a unified high-performance Supabase channel
    const channel = supabase
      .channel("admin-realtime-hub")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "enquiries" },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setEnquiries((prev) => [payload.new as EnquiryRow, ...prev]);
          } else if (payload.eventType === "UPDATE") {
            setEnquiries((prev) =>
              prev.map((item) => (item.id === payload.new.id ? (payload.new as EnquiryRow) : item))
            );
          } else if (payload.eventType === "DELETE") {
            setEnquiries((prev) => prev.filter((item) => item.id !== payload.old.id));
          }
          setLastSync(new Date());
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "properties" },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setProperties((prev) => [payload.new as PropertyRow, ...prev]);
          } else if (payload.eventType === "UPDATE") {
            setProperties((prev) =>
              prev.map((item) => (item.id === payload.new.id ? (payload.new as PropertyRow) : item))
            );
          } else if (payload.eventType === "DELETE") {
            setProperties((prev) => prev.filter((item) => item.id !== payload.old.id));
          }
          setLastSync(new Date());
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "projects" },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setProjects((prev) => [payload.new as ProjectRow, ...prev]);
          } else if (payload.eventType === "UPDATE") {
            setProjects((prev) =>
              prev.map((item) => (item.id === payload.new.id ? (payload.new as ProjectRow) : item))
            );
          } else if (payload.eventType === "DELETE") {
            setProjects((prev) => prev.filter((item) => item.id !== payload.old.id));
          }
          setLastSync(new Date());
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "property_images" },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setImages((prev) => [...prev, payload.new as PropertyImageRow]);
          } else if (payload.eventType === "UPDATE") {
            setImages((prev) =>
              prev.map((item) => (item.id === payload.new.id ? (payload.new as PropertyImageRow) : item))
            );
          } else if (payload.eventType === "DELETE") {
            setImages((prev) => prev.filter((item) => item.id !== payload.old.id));
          }
          setLastSync(new Date());
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "property_specs" },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setSpecs((prev) => [...prev, payload.new as PropertySpecRow]);
          } else if (payload.eventType === "UPDATE") {
            setSpecs((prev) =>
              prev.map((item) => (item.id === payload.new.id ? (payload.new as PropertySpecRow) : item))
            );
          } else if (payload.eventType === "DELETE") {
            setSpecs((prev) => prev.filter((item) => item.id !== payload.old.id));
          }
          setLastSync(new Date());
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "site_settings" },
        (payload) => {
          if (payload.eventType === "UPDATE" || payload.eventType === "INSERT") {
            setSiteSettings(payload.new as SiteSettingsRow);
          }
          setLastSync(new Date());
        }
      )
      .subscribe((status) => {
        setIsConnected(status === "SUBSCRIBED");
      });

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [fetchAllData, supabase]);

  // 3. Fast Mutations with Instant Optimistic UI + Database Sync
  const updateEnquiryStatus = async (id: string, status: EnquiryRow["status"]) => {
    setEnquiries((prev) => prev.map((e) => (e.id === id ? { ...e, status } : e)));
    try {
      await supabase.from("enquiries").update({ status }).eq("id", id);
    } catch (err) {
      console.error("Failed to update enquiry status:", err);
    }
  };

  const deleteEnquiry = async (id: string) => {
    setEnquiries((prev) => prev.filter((e) => e.id !== id));
    try {
      await supabase.from("enquiries").delete().eq("id", id);
    } catch (err) {
      console.error("Failed to delete enquiry:", err);
    }
  };

  const deleteProperty = async (id: string) => {
    setProperties((prev) => prev.filter((p) => p.id !== id));
    try {
      await supabase.from("properties").delete().eq("id", id);
    } catch (err) {
      console.error("Failed to delete property:", err);
    }
  };

  const deleteProject = async (id: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== id));
    try {
      await supabase.from("projects").delete().eq("id", id);
    } catch (err) {
      console.error("Failed to delete project:", err);
    }
  };

  return {
    projects,
    properties,
    images,
    specs,
    admins,
    enquiries,
    siteSettings,
    loading,
    isConnected,
    lastSync,
    refreshData: fetchAllData,
    updateEnquiryStatus,
    deleteEnquiry,
    deleteProperty,
    deleteProject,
  };
}
