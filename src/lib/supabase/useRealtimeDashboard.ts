"use client";

import { useState, useEffect, useCallback } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { getFullDashboardData } from "@/app/actions/dashboard";
import {
  updateEnquiryStatus as serverUpdateEnquiryStatus,
  deleteEnquiry as serverDeleteEnquiry,
} from "@/app/actions/enquiries";
import { deleteProperty as serverDeleteProperty } from "@/app/actions/properties";
import { deleteProject as serverDeleteProject } from "@/app/actions/projects";
import { deletePropertyImage as serverDeleteImage } from "@/app/actions/property-images";
import { deletePropertySpec as serverDeleteSpec } from "@/app/actions/property-specs";
import { deleteAdmin as serverDeleteAdmin } from "@/app/actions/admin";
import type {
  ProjectRow,
  PropertyRow,
  PropertyImageRow,
  PropertySpecRow,
  AdminProfileRow,
  EnquiryRow,
  SiteSettingsRow,
  SeoSettingsRow,
  PageSeoRow,
} from "@/lib/supabase/types";

export function useRealtimeDashboard() {
  const [projects, setProjects] = useState<ProjectRow[]>([]);
  const [properties, setProperties] = useState<PropertyRow[]>([]);
  const [images, setImages] = useState<PropertyImageRow[]>([]);
  const [specs, setSpecs] = useState<PropertySpecRow[]>([]);
  const [admins, setAdmins] = useState<AdminProfileRow[]>([]);
  const [enquiries, setEnquiries] = useState<EnquiryRow[]>([]);
  const [siteSettings, setSiteSettings] = useState<SiteSettingsRow | null>(null);
  const [seoSettings, setSeoSettings] = useState<SeoSettingsRow | null>(null);
  const [pageSeoList, setPageSeoList] = useState<PageSeoRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [lastSync, setLastSync] = useState<Date>(new Date());
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const supabase = getSupabaseBrowserClient();

  // 1. Initial Full Data Fetch — Via Service Role Server Action to bypass client RLS on enquiries and admins
  const fetchAllData = useCallback(async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const data = await getFullDashboardData();

      setProjects(data.projects || []);
      setProperties(data.properties || []);
      setImages(data.images || []);
      setSpecs(data.specs || []);
      setAdmins(data.admins || []);
      setEnquiries(data.enquiries || []);
      setSiteSettings(data.siteSettings || null);
      setSeoSettings(data.seoSettings || null);
      setPageSeoList(data.pageSeoList || []);

      setIsConnected(true);
      setLastSync(new Date());
    } catch (err: any) {
      console.error("Database fetch error:", err);
      setErrorMessage(err?.message || "Failed to load database");
    } finally {
      setLoading(false);
    }
  }, []);

  // 2. Realtime WebSocket Subscription with unique channel instance
  useEffect(() => {
    fetchAllData();

    // Unique channel per subscription to prevent channel collision
    const channelName = `dashboard-realtime-${Math.random().toString(36).slice(2, 9)}`;
    const channel = supabase.channel(channelName);

    channel
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "enquiries" },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setEnquiries((prev) => {
              if (prev.some((e) => e.id === payload.new.id)) return prev;
              return [payload.new as EnquiryRow, ...prev];
            });
          } else if (payload.eventType === "UPDATE") {
            setEnquiries((prev) =>
              prev.map((e) => (e.id === payload.new.id ? (payload.new as EnquiryRow) : e))
            );
          } else if (payload.eventType === "DELETE") {
            setEnquiries((prev) => prev.filter((e) => e.id !== payload.old.id));
          }
          setLastSync(new Date());
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "properties" },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setProperties((prev) => {
              if (prev.some((p) => p.id === payload.new.id)) return prev;
              return [payload.new as PropertyRow, ...prev];
            });
          } else if (payload.eventType === "UPDATE") {
            setProperties((prev) =>
              prev.map((p) => (p.id === payload.new.id ? (payload.new as PropertyRow) : p))
            );
          } else if (payload.eventType === "DELETE") {
            setProperties((prev) => prev.filter((p) => p.id !== payload.old.id));
          }
          setLastSync(new Date());
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "projects" },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setProjects((prev) => {
              if (prev.some((p) => p.id === payload.new.id)) return prev;
              return [payload.new as ProjectRow, ...prev];
            });
          } else if (payload.eventType === "UPDATE") {
            setProjects((prev) =>
              prev.map((p) => (p.id === payload.new.id ? (payload.new as ProjectRow) : p))
            );
          } else if (payload.eventType === "DELETE") {
            setProjects((prev) => prev.filter((p) => p.id !== payload.old.id));
          }
          setLastSync(new Date());
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "property_images" },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setImages((prev) => {
              if (prev.some((img) => img.id === payload.new.id)) return prev;
              return [...prev, payload.new as PropertyImageRow];
            });
          } else if (payload.eventType === "UPDATE") {
            setImages((prev) =>
              prev.map((img) => (img.id === payload.new.id ? (payload.new as PropertyImageRow) : img))
            );
          } else if (payload.eventType === "DELETE") {
            setImages((prev) => prev.filter((img) => img.id !== payload.old.id));
          }
          setLastSync(new Date());
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "property_specs" },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setSpecs((prev) => {
              if (prev.some((s) => s.id === payload.new.id)) return prev;
              return [...prev, payload.new as PropertySpecRow];
            });
          } else if (payload.eventType === "UPDATE") {
            setSpecs((prev) =>
              prev.map((s) => (s.id === payload.new.id ? (payload.new as PropertySpecRow) : s))
            );
          } else if (payload.eventType === "DELETE") {
            setSpecs((prev) => prev.filter((s) => s.id !== payload.old.id));
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
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "seo_settings" },
        (payload) => {
          if (payload.eventType === "UPDATE" || payload.eventType === "INSERT") {
            setSeoSettings(payload.new as SeoSettingsRow);
          }
          setLastSync(new Date());
        }
      )
      .subscribe((status) => {
        setIsConnected(status === "SUBSCRIBED");
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchAllData, supabase]);

  // 3. Fast Mutations with Optimistic Updates + Service Role Execution
  const updateEnquiryStatus = async (id: string, status: EnquiryRow["status"]) => {
    setEnquiries((prev) => prev.map((e) => (e.id === id ? { ...e, status } : e)));
    try {
      const res = await serverUpdateEnquiryStatus(id, status);
      if (!res.success) throw new Error(res.error);
    } catch (err: any) {
      console.error("Failed to update enquiry status:", err.message);
      fetchAllData();
    }
  };

  const deleteEnquiry = async (id: string) => {
    setEnquiries((prev) => prev.filter((e) => e.id !== id));
    try {
      const res = await serverDeleteEnquiry(id);
      if (!res.success) throw new Error(res.error);
    } catch (err: any) {
      console.error("Failed to delete enquiry:", err.message);
      fetchAllData();
    }
  };

  const deleteProperty = async (id: string) => {
    setProperties((prev) => prev.filter((p) => p.id !== id));
    try {
      const res = await serverDeleteProperty(id);
      if (!res.success) throw new Error(res.error);
    } catch (err: any) {
      console.error("Failed to delete property:", err.message);
      fetchAllData();
    }
  };

  const deleteProject = async (id: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== id));
    try {
      const res = await serverDeleteProject(id);
      if (!res.success) throw new Error(res.error);
    } catch (err: any) {
      console.error("Failed to delete project:", err.message);
      fetchAllData();
    }
  };

  const deleteAdmin = async (id: string) => {
    setAdmins((prev) => prev.filter((a) => a.id !== id));
    try {
      const res = await serverDeleteAdmin(id);
      if (!res.success) throw new Error(res.error);
    } catch (err: any) {
      console.error("Failed to delete admin:", err.message);
      fetchAllData();
    }
  };

  const deleteImage = async (id: string) => {
    setImages((prev) => prev.filter((i) => i.id !== id));
    try {
      const res = await serverDeleteImage(id);
      if (!res.success) throw new Error(res.error);
    } catch (err: any) {
      console.error("Failed to delete image:", err.message);
      fetchAllData();
    }
  };

  const deleteSpec = async (id: string) => {
    setSpecs((prev) => prev.filter((s) => s.id !== id));
    try {
      const res = await serverDeleteSpec(id);
      if (!res.success) throw new Error(res.error);
    } catch (err: any) {
      console.error("Failed to delete spec:", err.message);
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
    seoSettings,
    pageSeoList,
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
