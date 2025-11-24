/**
 * WebSocket service for real-time deployment logs
 */

export interface LogMessage {
  type: 'log' | 'status' | 'error' | 'complete'
  message: string
  timestamp: number
  level?: 'info' | 'warn' | 'error' | 'debug'
  metadata?: Record<string, any>
}

export interface DeploymentStatus {
  deployId: string
  status: 'pending' | 'deploying' | 'success' | 'failed' | 'cancelled'
  progress?: number
  url?: string
  error?: string
}

export class DeploymentWebSocket {
  private ws: WebSocket | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 1000
  private isConnecting = false
  private isManualClose = false

  constructor(
    private projectId: string,
    private deployId: string,
    private onLog: (log: LogMessage) => void,
    private onStatusChange: (status: DeploymentStatus) => void,
    private onError: (error: string) => void,
    private onConnect: () => void,
    private onDisconnect: () => void
  ) {}

  connect(): void {
    if (this.isConnecting || (this.ws && this.ws.readyState === WebSocket.CONNECTING)) {
      return
    }

    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      return
    }

    this.isConnecting = true
    this.isManualClose = false

    try {
      // In production, this would be a WebSocket URL
      const wsUrl = `ws://localhost:3000/api/deployer/${this.projectId}/deploy/${this.deployId}/logs/ws`
      
      this.ws = new WebSocket(wsUrl)

      this.ws.onopen = () => {
        console.log('WebSocket connected')
        this.isConnecting = false
        this.reconnectAttempts = 0
        this.onConnect()
      }

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          
          if (data.type === 'log') {
            this.onLog(data as LogMessage)
          } else if (data.type === 'status') {
            this.onStatusChange(data as DeploymentStatus)
          } else if (data.type === 'error') {
            this.onError(data.message || 'Unknown error')
          }
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error)
        }
      }

      this.ws.onclose = (event) => {
        console.log('WebSocket disconnected:', event.code, event.reason)
        this.isConnecting = false
        this.onDisconnect()

        if (!this.isManualClose && this.reconnectAttempts < this.maxReconnectAttempts) {
          this.reconnectAttempts++
          console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`)
          setTimeout(() => {
            this.connect()
          }, this.reconnectDelay * this.reconnectAttempts)
        }
      }

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error)
        this.isConnecting = false
        this.onError('Connection error')
      }

    } catch (error) {
      console.error('Failed to create WebSocket connection:', error)
      this.isConnecting = false
      this.onError('Failed to connect')
    }
  }

  disconnect(): void {
    this.isManualClose = true
    
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
  }

  send(message: any): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message))
    }
  }

  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN
  }

  getReconnectAttempts(): number {
    return this.reconnectAttempts
  }
}

/**
 * Mock WebSocket for development/testing
 */
export class MockDeploymentWebSocket {
  private intervalId: NodeJS.Timeout | null = null
  private isConnected = false
  private logIndex = 0

  constructor(
    private projectId: string,
    private deployId: string,
    private onLog: (log: LogMessage) => void,
    private onStatusChange: (status: DeploymentStatus) => void,
    private onError: (error: string) => void,
    private onConnect: () => void,
    private onDisconnect: () => void
  ) {}

  connect(): void {
    if (this.isConnected) return

    this.isConnected = true
    this.onConnect()

    // Simulate deployment logs
    const mockLogs = [
      { type: 'log', message: '🚀 Starting deployment...', level: 'info' },
      { type: 'log', message: '📦 Installing dependencies...', level: 'info' },
      { type: 'log', message: 'npm install --production', level: 'debug' },
      { type: 'log', message: '✓ Dependencies installed successfully', level: 'info' },
      { type: 'log', message: '🔨 Building application...', level: 'info' },
      { type: 'log', message: 'next build', level: 'debug' },
      { type: 'log', message: '✓ Build completed successfully', level: 'info' },
      { type: 'log', message: '📤 Uploading to Vercel...', level: 'info' },
      { type: 'log', message: '✓ Upload completed', level: 'info' },
      { type: 'log', message: '🌐 Deploying to edge network...', level: 'info' },
      { type: 'log', message: '✓ Deployment successful!', level: 'info' },
      { type: 'log', message: '🔗 URL: https://your-app-abc123.vercel.app', level: 'info' }
    ]

    const mockStatuses = [
      { status: 'pending', progress: 0 },
      { status: 'deploying', progress: 25 },
      { status: 'deploying', progress: 50 },
      { status: 'deploying', progress: 75 },
      { status: 'deploying', progress: 90 },
      { status: 'success', progress: 100, url: 'https://your-app-abc123.vercel.app' }
    ]

    let statusIndex = 0
    let logIndex = 0

    this.intervalId = setInterval(() => {
      // Send status updates
      if (statusIndex < mockStatuses.length) {
        this.onStatusChange({
          deployId: this.deployId,
          ...mockStatuses[statusIndex]
        } as DeploymentStatus)
        statusIndex++
      }

      // Send log messages
      if (logIndex < mockLogs.length) {
        this.onLog({
          ...mockLogs[logIndex],
          timestamp: Date.now()
        } as LogMessage)
        logIndex++
      } else {
        // All logs sent, disconnect
        this.disconnect()
      }
    }, 1000)
  }

  disconnect(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = null
    }
    
    if (this.isConnected) {
      this.isConnected = false
      this.onDisconnect()
    }
  }

  send(message: any): void {
    console.log('Mock WebSocket send:', message)
  }

  isConnected(): boolean {
    return this.isConnected
  }

  getReconnectAttempts(): number {
    return 0
  }
}

// Export the appropriate WebSocket implementation based on environment
export const createDeploymentWebSocket = (
  projectId: string,
  deployId: string,
  onLog: (log: LogMessage) => void,
  onStatusChange: (status: DeploymentStatus) => void,
  onError: (error: string) => void,
  onConnect: () => void,
  onDisconnect: () => void
) => {
  // Use mock WebSocket in development
  if (process.env.NODE_ENV === 'development') {
    return new MockDeploymentWebSocket(
      projectId,
      deployId,
      onLog,
      onStatusChange,
      onError,
      onConnect,
      onDisconnect
    )
  }

  // Use real WebSocket in production
  return new DeploymentWebSocket(
    projectId,
    deployId,
    onLog,
    onStatusChange,
    onError,
    onConnect,
    onDisconnect
  )
}
