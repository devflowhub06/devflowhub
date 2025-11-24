import path from "node:path";
import fs from "node:fs/promises";
import { prisma } from "./prisma";

// Use a Windows-compatible default path
const WORKSPACE_ROOT = process.env.DEVFLOW_WORKSPACES || path.join(process.cwd(), "workspaces");

export async function ensureWorkspace(projectId: string) {
  const root = path.join(WORKSPACE_ROOT, projectId);
  await fs.mkdir(root, { recursive: true });
  // guarantee a src dir for frontends
  await fs.mkdir(path.join(root, "src"), { recursive: true });
  
  // store path in DB if missing (only if CursorWorkspace model exists)
  try {
    await prisma.cursorWorkspace.upsert({
      where: { projectId },
      create: { projectId, rootPath: root },
      update: { rootPath: root },
    });
  } catch (error) {
    // Ignore if CursorWorkspace model doesn't exist
    console.log("CursorWorkspace model not available, skipping DB update");
  }
  
  return root;
}

export function safeJoin(root: string, rel: string) {
  const p = path.normalize(path.join(root, rel));
  if (!p.startsWith(root)) throw new Error("Path traversal blocked");
  return p;
}
