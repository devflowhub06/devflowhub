export interface ToolAdapter {
  connect(projectId: string): Promise<{ connected: boolean; info?: any }>
  status(projectId: string): Promise<{ status: 'connected' | 'disconnected' | 'error'; details?: any }>
  sync(projectId: string, payload?: any): Promise<{ success: boolean; details?: any }>
  open(projectId: string, resource?: string): Promise<{ url?: string; success: boolean }>
}

export class ReplitAdapter implements ToolAdapter {
  async connect(projectId: string) { return { connected: true } }
  async status(projectId: string) { return { status: 'connected' } }
  async sync(projectId: string, payload?: any) { return { success: true } }
  async open(projectId: string, resource?: string) { return { success: true } }
}

export class CursorAdapter implements ToolAdapter {
  async connect(projectId: string) { return { connected: true } }
  async status(projectId: string) { return { status: 'connected' } }
  async sync(projectId: string, payload?: any) { return { success: true } }
  async open(projectId: string, resource?: string) { return { success: true } }
}

export class V0Adapter implements ToolAdapter {
  async connect(projectId: string) { return { connected: true } }
  async status(projectId: string) { return { status: 'connected' } }
  async sync(projectId: string, payload?: any) { return { success: true } }
  async open(projectId: string, resource?: string) { return { success: true } }
}

export class BoltAdapter implements ToolAdapter {
  async connect(projectId: string) { return { connected: true } }
  async status(projectId: string) { return { status: 'connected' } }
  async sync(projectId: string, payload?: any) { return { success: true } }
  async open(projectId: string, resource?: string) { return { success: true } }
}

export const providerAdapter = {
  replit: new ReplitAdapter(),
  cursor: new CursorAdapter(),
  v0: new V0Adapter(),
  bolt: new BoltAdapter(),
}


