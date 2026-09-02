import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const folder = (formData.get("folder") as string) || "projects";

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file provided" },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const cleanFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const targetFolder = folder.replace(/^\/+|\/+$/g, "");
    const filePath = `${targetFolder}/${Date.now()}-${cleanFileName}`;

    const contentType = file.type || "image/jpeg";

    const { error: uploadError } = await supabase.storage
      .from("media")
      .upload(filePath, buffer, {
        contentType,
        upsert: true,
      });

    if (uploadError) {
      console.error("[api/upload] Storage Error:", uploadError.message);
      return NextResponse.json(
        { success: false, error: uploadError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      path: filePath,
      url: filePath,
    });
  } catch (err: any) {
    console.error("[api/upload] Server Error:", err);
    return NextResponse.json(
      { success: false, error: err?.message || "Upload failed" },
      { status: 500 }
    );
  }
}
