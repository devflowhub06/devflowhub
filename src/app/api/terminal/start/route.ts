import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { spawn } from "node:child_process";
import { prisma } from "@/lib/prisma";
import { ensureWorkspace } from "@/lib/projects";

// Store active terminal sessions
const sessions = new Map<string, {
  process: ReturnType<typeof spawn>;
  output: string[];
  cwd: string;
}>();

export async function POST(req: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const { projectId, cmd = "npm", args = ["run", "dev"] } = await req.json();
    
    if (!projectId) {
      return NextResponse.json({ ok: false, error: "projectId required" }, { status: 400 });
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

    const cwd = await ensureWorkspace(projectId);
    const sessionId = `${projectId}-${Date.now()}`;
    
    // Kill existing session for this project
    const existingSession = Array.from(sessions.entries()).find(([key]) => key.startsWith(projectId));
    if (existingSession) {
      existingSession[1].process.kill("SIGKILL");
      sessions.delete(existingSession[0]);
    }

    // Start new process
    const child = spawn(cmd, args, { 
      cwd, 
      shell: true,
      stdio: ['pipe', 'pipe', 'pipe']
    });

    const terminalSession = {
      process: child,
      output: [],
      cwd
    };

    sessions.set(sessionId, terminalSession);

    // Capture output
    child.stdout?.on('data', (data) => {
      const output = data.toString();
      terminalSession.output.push(`[OUT] ${output}`);
      console.log(`Terminal ${sessionId}:`, output);
    });

    child.stderr?.on('data', (data) => {
      const output = data.toString();
      terminalSession.output.push(`[ERR] ${output}`);
      console.error(`Terminal ${sessionId} Error:`, output);
    });

    child.on('close', (code) => {
      terminalSession.output.push(`[END] Process exited with code ${code}`);
      sessions.delete(sessionId);
    });

    // Log usage with proper userId - temporarily disabled to fix schema issues
    /*
    try {
      await prisma.usageLog.create({
        data: {
          projectId,
          userId: session.user.id,
          tool: "CURSOR",
          action: "terminal_start",
          metadata: { command: `${cmd} ${args.join(' ')}`, sessionId }
        }
      });
    } catch (error) {
      console.error("Failed to log usage:", error);
      // Don't fail the request if logging fails
    }
    */

    return NextResponse.json({ 
      ok: true, 
      sessionId,
      message: `Started ${cmd} ${args.join(' ')} in ${cwd}`
    });

  } catch (error) {
    console.error("Failed to start terminal:", error);
    return NextResponse.json({ ok: false, error: "Failed to start terminal" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get("projectId");

    if (!projectId) {
      return NextResponse.json({ ok: false, error: "projectId required" }, { status: 400 });
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

    // Find active session for this project
    const terminalSession = Array.from(sessions.entries()).find(([key]) => key.startsWith(projectId));

    if (!terminalSession) {
      return NextResponse.json({ ok: false, status: "no_session" });
    }

    return NextResponse.json({
      ok: true,
      sessionId: terminalSession[0],
      output: terminalSession[1].output.slice(-50), // Last 50 lines
      cwd: terminalSession[1].cwd,
      pid: terminalSession[1].process.pid
    });
  } catch (error) {
    console.error("Failed to get terminal status:", error);
    return NextResponse.json({ ok: false, error: "Failed to get terminal status" }, { status: 500 });
  }
}
