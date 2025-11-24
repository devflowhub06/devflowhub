# DevFlowHub Workspace Service (Scaffold)

> 🚧 **Status:** foundation scaffold — ready for infra integration.  
> This service will run alongside DevFlowHub to provide persistent workspaces, terminals, previews, and AI execution contexts.

## Why this exists

The Next.js app deployed on Vercel cannot host long-lived processes or writable filesystems, which is why the in-product terminal/preview break in production. The workspace service offloads those responsibilities to a durable runtime (e.g. Fly Machines, Railway, ECS/Fargate, k3s). Once provisioned, the marketing/frontend app proxies editor traffic here.

## What’s included right now

- Fastify server with:
  - `/healthz` and `/version` routes for monitoring
  - `/workspaces` placeholder endpoints (`POST /`, `GET /:id`, `DELETE /:id`) returning mock responses
  - `/terminal/:workspaceId` WebSocket stub that echoes commands and keeps connection open (handy for initial wiring)
  - `/preview/:workspaceId` SSE stub that streams fake status updates
- `workspace-service/package.json` + `tsconfig.json` + `Dockerfile` scaffold.
- `.env.example` describing required secrets (Tailscale/Fly tokens, S3 bucket, etc.) — see below.

The stubs let the Next.js app connect end-to-end while infra work spins up real containers.

## Quick start (local dev)

```bash
cd workspace-service
cp .env.example .env        # fill in local paths
pnpm install                # or npm/yarn
pnpm dev                    # starts Fastify with hot reload
```

### Endpoints

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/healthz` | basic liveness probe |
| POST | `/workspaces` | creates workspace skeleton (returns mock data) |
| GET | `/workspaces/:id` | fetches workspace summary (mock) |
| DELETE | `/workspaces/:id` | tears down workspace (mock) |
| WS | `/terminal/:workspaceId` | bidirectional terminal stub |
| GET (SSE) | `/preview/:workspaceId` | emits preview status messages |

## Infra TODO (next steps)

1. **Choose runner**: Fly Machines / Railway / ECS Fargate / k3s cluster.
2. **Implement `WorkspaceOrchestrator`** inside `src/services/workspace-orchestrator.ts`:
   - Provision container (Docker image with Node, pnpm, git, build tools).
   - Mount persistent volume (or sync repo to S3 + git mirror).
   - Expose ports via WireGuard/Cloudflared tunnel.
3. **Wire terminal**:
   - Replace WebSocket echo with PTY streaming (`node-pty` or `xterm-headless`).
   - Forward commands to container via SSH or gRPC.
4. **Wire preview proxy**:
   - Watch container for open ports, register them, send updates to SSE clients.
   - Add HTTP reverse proxy endpoint for `/preview/:workspaceId/*`.
5. **Security**:
   - Issue signed workspace tokens (Next.js app requests from `/api/workspaces`).
   - Enforce per-user isolation, TTLs, resource limits.

## Deployment

Example Fly.io deploy:

```bash
fly launch --no-deploy
fly secrets set WORKSPACE_JWT_SECRET=...
fly secrets set STORAGE_S3_ACCESS_KEY=...
fly deploy
```

Or Docker:

```bash
docker build -t devflowhub/workspace-service .
docker run --env-file .env -p 8080:8080 devflowhub/workspace-service
```

## Roadmap alignment

This scaffold satisfies **Phase 1** of the “Next-Gen Workspace Architecture Roadmap” in `TECH_STACK_ARCHITECTURE.md`. Once live, we can move terminal/preview calls in the Next.js app to the new endpoints.

---

_Questions? Ping the #workspace-runtime channel or open an issue in this directory._ 

