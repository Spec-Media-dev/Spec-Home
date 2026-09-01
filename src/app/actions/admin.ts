"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath, unstable_noStore as noStore } from "next/cache";

export async function getAdmins() {
  noStore();
  try {
    const supabase = createAdminClient();
    const { data: usersData, error: authError } = await supabase.auth.admin.listUsers();
    if (authError) throw authError;

    const { data: profiles, error: profileError } = await supabase.from("admin_profiles").select("*");
    if (profileError) console.warn("Admin profiles fetch notice:", profileError.message);

    return usersData.users.map((u) => {
      const p = profiles?.find((profile) => profile.id === u.id) as any;
      return {
        id: u.id,
        email: u.email || "",
        fullName: p?.name || p?.full_name || u.user_metadata?.full_name || "Admin User",
        avatar: p?.avatar_path || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=300&auto=format&fit=crop",
        lastActive: u.last_sign_in_at || u.created_at || "Just now",
      };
    });
  } catch (error) {
    console.error("Error fetching admins:", error);
    return [];
  }
}

export async function addAdmin(adminData: {
  fullName: string;
  email: string;
  avatar: string;
}) {
  try {
    const supabase = createAdminClient();

    // 1. Create auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: adminData.email,
      password: "TempPassword123!",
      email_confirm: true,
      user_metadata: {
        full_name: adminData.fullName,
      },
    });

    if (authError) throw authError;

    // 2. Insert into admin_profiles (handle name or full_name column)
    let { error: profileError } = await supabase.from("admin_profiles").insert({
      id: authData.user.id,
      name: adminData.fullName,
      avatar_path: adminData.avatar,
    } as any);

    if (profileError && profileError.message.includes("name")) {
      const altRes = await supabase.from("admin_profiles").insert({
        id: authData.user.id,
        full_name: adminData.fullName,
        avatar_path: adminData.avatar,
      } as any);
      profileError = altRes.error;
    }

    if (profileError) {
      console.warn("Profile table insert note:", profileError.message);
    }

    revalidatePath("/dashboard-admin/admin-profiles");
    return { success: true };
  } catch (error: any) {
    console.error("Error adding admin:", error);
    return { success: false, error: error.message };
  }
}

export async function updateAdmin(id: string, updates: any) {
  try {
    const supabase = createAdminClient();

    // Update Auth User MetaData
    const { error: authError } = await supabase.auth.admin.updateUserById(id, {
      user_metadata: {
        full_name: updates.fullName,
      },
    });

    if (authError) throw authError;

    // Update Profile Table
    let { error: profileError } = await supabase.from("admin_profiles").update({
      name: updates.fullName,
      avatar_path: updates.avatar,
    } as any).eq("id", id);

    if (profileError && profileError.message.includes("name")) {
      const altRes = await supabase.from("admin_profiles").update({
        full_name: updates.fullName,
        avatar_path: updates.avatar,
      } as any).eq("id", id);
      profileError = altRes.error;
    }

    revalidatePath("/dashboard-admin/admin-profiles");
    return { success: true };
  } catch (error: any) {
    console.error("Error updating admin:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteAdmin(id: string) {
  try {
    const supabase = createAdminClient();
    await supabase.from("admin_profiles").delete().eq("id", id);
    const { error } = await supabase.auth.admin.deleteUser(id);
    
    if (error) throw error;
    revalidatePath("/dashboard-admin/admin-profiles");
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting admin:", error);
    return { success: false, error: error.message };
  }
}
