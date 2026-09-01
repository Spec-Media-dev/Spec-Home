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
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const supabase = getSupabaseBrowserClient();
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  // 1. Initial Full Data Fetch — 100% directly from Database (NO STATIC FALLBACKS)
  const fetchAllData = useCallback(async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const [
        { data: projectsData, error: pErr },
        { data: propertiesData, error: prErr },
        { data: imagesData, error: imgErr },
        { data: specsData, error: spErr },
        { data: adminsData, error: admErr },
        { data: enquiriesData, error: enqErr },
        { data: settingsData, error: setErr },
      ] = await Promise.all([
        supabase.from("projects").select("*").order("created_at", { ascending: false }),
        supabase.from("properties").select("*").order("created_at", { ascending: false }),
        supabase.from("property_images").select("*").order("display_order", { ascending: true }),
        supabase.from("property_specs").select("*").order("created_at", { ascending: true }),
        supabase.from("admin_profiles").select("*").order("created_at", { ascending: false }),
        supabase.from("enquiries").select("*").order("created_at", { ascending: false }),
        supabase.from("site_settings").select("*").limit(1).maybeSingle(),
      ]);

      if (pErr) console.error("Projects Fetch Error:", pErr.message);
      if (prErr) console.error("Properties Fetch Error:", prErr.message);

      // Always set pure database data (even if empty array)
      setProjects(projectsData || []);
      setProperties(propertiesData || []);
      setImages(imagesData || []);
      setSpecs(specsData || []);
      setAdmins(adminsData || []);
      setEnquiries(enquiriesData || []);
      setSiteSettings(settingsData || null);

      setIsConnected(true);
      setLastSync(new Date());
    } catch (err: any) {
      console.error("Database fetch error:", err);
      setErrorMessage(err?.message || "Failed to load database");
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  // 2. Realtime WebSocket Subscription (Zero-lag postgres_changes)
  useEffect(() => {
    fetchAllData();

    // Create a unified high-performance Supabase channel with a unique name
    // to allow multiple components to use this hook concurrently without conflict
    const channelName = `admin-realtime-hub-${Math.random().toString(36).substring(2, 9)}`;
    const channel = supabase
      .channel(channelName)
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
      const { error } = await supabase.from("enquiries").update({ status }).eq("id", id);
      if (error) throw error;
    } catch (err: any) {
      console.error("Failed to update enquiry status:", err.message);
      alert(`Database update error: ${err.message}`);
      fetchAllData();
    }
  };

  const deleteEnquiry = async (id: string) => {
    setEnquiries((prev) => prev.filter((e) => e.id !== id));
    try {
      const { error } = await supabase.from("enquiries").delete().eq("id", id);
      if (error) throw error;
    } catch (err: any) {
      console.error("Failed to delete enquiry:", err.message);
      alert(`Database delete error: ${err.message}`);
      fetchAllData();
    }
  };

  const deleteProperty = async (id: string) => {
    setProperties((prev) => prev.filter((p) => p.id !== id));
    try {
      const { error } = await supabase.from("properties").delete().eq("id", id);
      if (error) throw error;
    } catch (err: any) {
      console.error("Failed to delete property:", err.message);
      alert(`Database delete error: ${err.message}`);
      fetchAllData();
    }
  };

  const deleteProject = async (id: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== id));
    try {
      const { error } = await supabase.from("projects").delete().eq("id", id);
      if (error) throw error;
    } catch (err: any) {
      console.error("Failed to delete project:", err.message);
      alert(`Database delete error: ${err.message}`);
      fetchAllData();
    }
  };

  const deleteAdmin = async (id: string) => {
    setAdmins((prev) => prev.filter((a) => a.id !== id));
    try {
      const { error } = await supabase.from("admin_profiles").delete().eq("id", id);
      if (error) throw error;
    } catch (err: any) {
      console.error("Failed to delete admin:", err.message);
      alert(`Database delete error: ${err.message}`);
      fetchAllData();
    }
  };

  const deleteImage = async (id: string) => {
    setImages((prev) => prev.filter((i) => i.id !== id));
    try {
      const { error } = await supabase.from("property_images").delete().eq("id", id);
      if (error) throw error;
    } catch (err: any) {
      console.error("Failed to delete image:", err.message);
      alert(`Database delete error: ${err.message}`);
      fetchAllData();
    }
  };

  const deleteSpec = async (id: string) => {
    setSpecs((prev) => prev.filter((s) => s.id !== id));
    try {
      const { error } = await supabase.from("property_specs").delete().eq("id", id);
      if (error) throw error;
    } catch (err: any) {
      console.error("Failed to delete spec:", err.message);
      alert(`Database delete error: ${err.message}`);
      fetchAllData();
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
    errorMessage,
    refreshData: fetchAllData,
    updateEnquiryStatus,
    deleteEnquiry,
    deleteProperty,
    deleteProject,
    deleteAdmin,
    deleteImage,
    deleteSpec,
  };
}
