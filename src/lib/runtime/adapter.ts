/**
 * RuntimeAdapter Interface - Abstract runtime provider for DevFlowHub Sandbox
 * Supports multiple providers: K8s, Fargate, Docker, Replit, CodeSandbox
 */

export interface RuntimeOptions {
  projectId: string
  branch: string
  userId: string
  env: Record<string, string>
  public: boolean
  ttlMinutes: number
  snapshotBeforeRun: boolean
  buildCommand?: string
  startCommand?: string
  framework?: string
}

export interface RunStatus {
  runId: string
  status: 'starting' | 'building' | 'running' | 'stopped' | 'error' | 'destroyed'
  url?: string
  startedAt?: Date
  endedAt?: Date
  health?: {
    uptime: string
    memoryMb: number
    cpuPercent: number
    pid?: number
  }
  error?: string
}

export interface LogEntry {
  timestamp: Date
  level: 'info' | 'error' | 'warn' | 'debug'
  source: 'build' | 'runtime' | 'system'
  message: string
}

export interface ExecResult {
  execId: string
  status: 'queued' | 'running' | 'completed' | 'failed'
  output?: string
  exitCode?: number
}

export abstract class RuntimeAdapter {
  abstract name: string
  abstract version: string

  /**
   * Create a new runtime instance
   */
  abstract createRun(options: RuntimeOptions): Promise<{
    runId: string
    status: string
    estimatedCost: number
    url?: string
  }>

  /**
   * Get runtime status
   */
  abstract getRunStatus(runId: string): Promise<RunStatus>

  /**
   * Stream logs from runtime
   */
  abstract streamLogs(runId: string, callback: (log: LogEntry) => void): Promise<void>

  /**
   * Execute command in runtime
   */
  abstract execCommand(runId: string, command: string): Promise<ExecResult>

  /**
   * Stop runtime
   */
  abstract stopRun(runId: string): Promise<boolean>

  /**
   * Destroy runtime and cleanup resources
   */
  abstract destroyRun(runId: string): Promise<boolean>

  /**
   * List all runs for a project
   */
  abstract listRuns(projectId: string): Promise<RunStatus[]>

  /**
   * Get runtime metrics
   */
  abstract getMetrics(runId: string): Promise<{
    cpu: number
    memory: number
    network: number
    uptime: number
  }>

  /**
   * Check adapter health and availability
   */
  abstract healthCheck(): Promise<{
    healthy: boolean
    message: string
    capabilities: string[]
  }>
}
