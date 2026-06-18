import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import fs from "fs";
import path from "path";
import crypto from "crypto";

export const dynamic = "force-dynamic";

const UPLOADS_DIR = path.join(process.cwd(), "public", "uploads");

// Ensure uploads folder exists
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

export async function POST(request: NextRequest) {
  try {
    // Admin role protection: only authorized users can upload
    const session = await getServerSession(authOptions);
    if (!session || !["ADMIN", "SUPER_ADMIN", "WEBSITE_MANAGER"].includes(session.user?.role as string)) {
      return NextResponse.json(
        { error: { message: "Unauthorized. Admin credentials required." } },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: { message: "No file provided in form data." } },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    
    // File validation
    const maxSizeBytes = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSizeBytes) {
      return NextResponse.json(
        { error: { message: "File size exceeds maximum limit of 5MB." } },
        { status: 400 }
      );
    }

    const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"];
    if (!allowedMimeTypes.includes(file.type)) {
      return NextResponse.json(
        { error: { message: "Invalid file type. Only JPEG, PNG, WEBP, GIF, and SVG are allowed." } },
        { status: 400 }
      );
    }

    // Generate unique filename to avoid overwrites
    const fileExtension = path.extname(file.name) || ".png";
    const randomName = crypto.randomBytes(16).toString("hex");
    const uniqueFileName = `${randomName}${fileExtension}`;
    const filePath = path.join(UPLOADS_DIR, uniqueFileName);

    // Save to local filesystem
    fs.writeFileSync(filePath, buffer);

    const publicUrl = `/uploads/${uniqueFileName}`;

    return NextResponse.json({
      url: publicUrl,
      fileName: uniqueFileName,
      originalName: file.name,
      sizeBytes: file.size,
      mimeType: file.type
    });
  } catch (error) {
    console.error("File upload error:", error);
    return NextResponse.json(
      { error: { message: "Failed to upload file due to an internal server error." } },
      { status: 500 }
    );
  }
}
