import axios, { AxiosInstance } from 'axios';
import { Notice } from 'obsidian';

export interface SyncDevice {
  id: string;
  name: string;
  ip: string;
  port: number;
  lastSync: number;
}

export interface LANSyncMessage {
  type: 'ping' | 'sync-request' | 'sync-response' | 'file-update' | 'delete';
  deviceId: string;
  deviceName: string;
  timestamp: number;
  payload?: any;
}

export class LANSyncService {
  private client: AxiosInstance;
  private deviceId: string;
  private deviceName: string;
  private port: number = 7777;
  private knownDevices: Map<string, SyncDevice> = new Map();
  private messageCallbacks: ((message: LANSyncMessage) => void)[] = [];

  constructor(deviceId: string, deviceName: string) {
    this.deviceId = deviceId;
    this.deviceName = deviceName;
    this.client = axios.create({
      timeout: 5000,
    });
  }

  /**
   * Connect to a device via IP address
   */
  async connectToDevice(ip: string, port: number = 7777): Promise<boolean> {
    try {
      const response = await this.client.post(
        `http://${ip}:${port}/api/ping`,
        {
          deviceId: this.deviceId,
          deviceName: this.deviceName,
          timestamp: Date.now(),
        },
        { timeout: 3000 }
      );

      if (response.status === 200 && response.data.success) {
        const device: SyncDevice = {
          id: response.data.deviceId,
          name: response.data.deviceName,
          ip,
          port,
          lastSync: Date.now(),
        };
        this.knownDevices.set(device.id, device);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to connect to device:', error);
      return false;
    }
  }

  /**
   * Send a sync request to a connected device
   */
  async syncWithDevice(deviceId: string, files: any[]): Promise<boolean> {
    const device = this.knownDevices.get(deviceId);
    if (!device) {
      console.error('Device not found:', deviceId);
      return false;
    }

    try {
      const message: LANSyncMessage = {
        type: 'sync-request',
        deviceId: this.deviceId,
        deviceName: this.deviceName,
        timestamp: Date.now(),
        payload: { files },
      };

      const response = await this.client.post(
        `http://${device.ip}:${device.port}/api/sync`,
        message
      );

      if (response.status === 200) {
        device.lastSync = Date.now();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Sync failed with device:', error);
      return false;
    }
  }

  /**
   * Get all known devices
   */
  getKnownDevices(): SyncDevice[] {
    return Array.from(this.knownDevices.values());
  }

  /**
   * Remove a device from known devices
   */
  removeDevice(deviceId: string): void {
    this.knownDevices.delete(deviceId);
  }

  /**
   * Register callback for incoming messages
   */
  onMessage(callback: (message: LANSyncMessage) => void): void {
    this.messageCallbacks.push(callback);
  }

  /**
   * Handle incoming message (called from main plugin)
   */
  handleIncomingMessage(message: LANSyncMessage): void {
    this.messageCallbacks.forEach(callback => callback(message));
  }
}
