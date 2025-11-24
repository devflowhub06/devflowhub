import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import fs from "node:fs/promises";
import { prisma } from "@/lib/prisma";
import { ensureWorkspace, safeJoin } from "@/lib/projects";

export async function GET(req: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get("projectId");
    const filePath = searchParams.get("path");
    
    if (!projectId || !filePath) {
      return NextResponse.json({ ok: false, error: "projectId and path required" }, { status: 400 });
    }

    // Verify project belongs to user
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        userId: session.user.id
      }
    });

    if (!project) {
      return NextResponse.json({ ok: false, error: "Project not found" }, { status: 404 });
    }

    const root = await ensureWorkspace(projectId);
    const fullPath = safeJoin(root, filePath);
    
    const content = await fs.readFile(fullPath, "utf8");
    
    // Log usage with proper userId - temporarily disabled to fix schema issues
    /*
    try {
      await prisma.usageLog.create({
        data: {
          projectId,
          userId: session.user.id,
          tool: "CURSOR",
          action: "file_read",
          metadata: { filePath, size: content.length }
        }
      });
    } catch (error) {
      console.error("Failed to log usage:", error);
      // Don't fail the request if logging fails
    }
    */

    return NextResponse.json({ ok: true, content, path: filePath });
  } catch (error) {
    console.error("Failed to read file:", error);
    return NextResponse.json({ ok: false, error: "Failed to read file" }, { status: 500 });
  }
}
