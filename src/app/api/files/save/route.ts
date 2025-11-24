import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import fs from "node:fs/promises";
import path from "node:path";
import { prisma } from "@/lib/prisma";
import { ensureWorkspace, safeJoin } from "@/lib/projects";

export async function POST(req: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const { projectId, path: filePath, content } = await req.json();
    
    if (!projectId || !filePath || content === undefined) {
      return NextResponse.json({ ok: false, error: "projectId, path, and content required" }, { status: 400 });
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
    
    // Ensure directory exists
    const dir = path.dirname(fullPath);
    await fs.mkdir(dir, { recursive: true });
    
    // Write file
    await fs.writeFile(fullPath, content, "utf8");
    
    // Log usage with proper userId - temporarily disabled to fix schema issues
    /*
    try {
      await prisma.usageLog.create({
        data: {
          projectId,
          userId: session.user.id,
          tool: "CURSOR",
          action: "file_save",
          metadata: { filePath, size: content.length }
        }
      });
    } catch (error) {
      console.error("Failed to log usage:", error);
      // Don't fail the request if logging fails
    }
    */

    return NextResponse.json({ ok: true, path: filePath, size: content.length });
  } catch (error) {
    console.error("Failed to save file:", error);
    return NextResponse.json({ ok: false, error: "Failed to save file" }, { status: 500 });
  }
}
