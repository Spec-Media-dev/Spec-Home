"use server";

import { createClient } from "@supabase/supabase-js";
import { revalidatePath, unstable_noStore as noStore } from "next/cache";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

export async function getAdmins() {
  noStore();
  try {
    const { data: usersData, error: authError } = await supabase.auth.admin.listUsers();
    if (authError) throw authError;

    const { data: profiles, error: profileError } = await supabase.from("admin_profiles").select("*");
    if (profileError) throw profileError;

    return usersData.users.map((u) => {
      const p = profiles?.find((profile) => profile.id === u.id);
      return {
        id: u.id,
        email: u.email || "",
        fullName: p?.full_name || u.user_metadata?.full_name || "Unknown Admin",
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
    // 1. Create auth user (Default password since it's an admin dashboard)
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: adminData.email,
      password: "TempPassword123!",
      email_confirm: true,
      user_metadata: {
        full_name: adminData.fullName,
      },
    });

    if (authError) throw authError;

    // 2. Insert into admin_profiles
    const { error: profileError } = await supabase.from("admin_profiles").insert({
      id: authData.user.id,
      full_name: adminData.fullName,
      avatar_path: adminData.avatar,
    });

    if (profileError) {
      // Rollback auth user if profile creation fails
      await supabase.auth.admin.deleteUser(authData.user.id);
      throw profileError;
    }

    revalidatePath("/dashboard-admin/(protected)/admin-profiles");
    return { success: true };
  } catch (error: any) {
    console.error("Error adding admin:", error);
    return { success: false, error: error.message };
  }
}

export async function updateAdmin(id: string, updates: any) {
  try {
    // Update Auth User MetaData
    const { error: authError } = await supabase.auth.admin.updateUserById(id, {
      user_metadata: {
        full_name: updates.fullName,
      },
    });

    if (authError) throw authError;

    // Update Profile Table
    const { error: profileError } = await supabase.from("admin_profiles").update({
      full_name: updates.fullName,
      avatar_path: updates.avatar,
    }).eq("id", id);

    if (profileError) throw profileError;

    revalidatePath("/dashboard-admin/(protected)/admin-profiles");
    return { success: true };
  } catch (error: any) {
    console.error("Error updating admin:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteAdmin(id: string) {
  try {
    // Deleting the auth user automatically deletes the profile if FK is set to CASCADE
    // If not, we delete both manually.
    await supabase.from("admin_profiles").delete().eq("id", id);
    const { error } = await supabase.auth.admin.deleteUser(id);
    
    if (error) throw error;
    revalidatePath("/dashboard-admin/(protected)/admin-profiles");
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting admin:", error);
    return { success: false, error: error.message };
  }
}

export async function toggleAdminStatus(id: string, currentStatus: string) {
  try {
    const nextStatus = currentStatus === "Active" ? "Inactive" : "Active";
    const { error } = await supabase.auth.admin.updateUserById(id, {
      user_metadata: { status: nextStatus },
    });
    if (error) throw error;
    revalidatePath("/dashboard-admin/(protected)/admin-profiles");
    return { success: true };
  } catch (error: any) {
    console.error("Error toggling admin status:", error);
    return { success: false, error: error.message };
  }
}
