// Simple Express-like server for handling LAN sync requests
// This runs on the Obsidian device to receive sync requests from other devices

export interface LANServerConfig {
  port: number;
  deviceId: string;
  deviceName: string;
}

export interface LANServerHandler {
  onSyncRequest: (data: any) => Promise<any>;
  onFileUpdate: (file: any) => Promise<void>;
  onFileDelete: (filePath: string) => Promise<void>;
}

export class SimpleLANServer {
  private config: LANServerConfig;
  private handler: LANServerHandler | null = null;
  private server: any = null; // In a real implementation, this would be an actual server

  constructor(config: LANServerConfig) {
    this.config = config;
  }

  setHandler(handler: LANServerHandler): void {
    this.handler = handler;
  }

  /**
   * Start the LAN server (in desktop version)
   * For mobile, this would be handled differently
   */
  async start(): Promise<void> {
    // This is a placeholder. In desktop Electron version, you'd use:
    // const express = require('express');
    // const app = express();
    // app.post('/api/ping', this.handlePing.bind(this));
    // app.post('/api/sync', this.handleSync.bind(this));
    // app.listen(this.config.port);

    console.log(
      `LAN Server ready on port ${this.config.port} (simulated - not actually running in browser)`
    );
  }

  async stop(): Promise<void> {
    // Cleanup
    console.log('LAN Server stopped');
  }

  private async handlePing(req: any, res: any): Promise<void> {
    res.json({
      success: true,
      deviceId: this.config.deviceId,
      deviceName: this.config.deviceName,
      timestamp: Date.now(),
    });
  }

  private async handleSync(req: any, res: any): Promise<void> {
    try {
      if (this.handler) {
        const result = await this.handler.onSyncRequest(req.body);
        res.json({ success: true, result });
      } else {
        res.status(400).json({ success: false, error: 'Handler not set' });
      }
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  private async handleFileUpdate(req: any, res: any): Promise<void> {
    try {
      if (this.handler) {
        await this.handler.onFileUpdate(req.body);
        res.json({ success: true });
      } else {
        res.status(400).json({ success: false, error: 'Handler not set' });
      }
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  private async handleFileDelete(req: any, res: any): Promise<void> {
    try {
      if (this.handler) {
        await this.handler.onFileDelete(req.body.filePath);
        res.json({ success: true });
      } else {
        res.status(400).json({ success: false, error: 'Handler not set' });
      }
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
}

/**
 * Helper to get local IP address
 * Works across Windows, Mac, and Linux
 */
export function getLocalIPAddress(): string {
  const interfaces =
    require('os').networkInterfaces();

  for (const name of Object.keys(interfaces)) {
    const iface = interfaces[name];
    for (const addr of iface) {
      // Skip internal and non-IPv4 addresses
      if (addr.family === 'IPv4' && !addr.internal) {
        return addr.address;
      }
    }
  }

  return 'localhost';
}
