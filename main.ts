import {
  App,
  Plugin,
  PluginManifest,
  TFile,
  TFolder,
  Vault,
  Notice,
  FileSystemAdapter,
  requestUrl,
} from 'obsidian';
import { LANSyncService, SyncDevice } from './src/services/LANSyncService';
import { NLANSyncSettingTab, NLANSyncSettings, DEFAULT_SETTINGS } from './src/SettingsTab';
import * as fs from 'fs';
import * as path from 'path';

declare global {
  interface Window {
    nlansyncPlugin?: any;
  }
}

export default class NLANSyncPlugin extends Plugin {
  settings: NLANSyncSettings;
  lanService: LANSyncService | null = null;
  private autoSyncInterval: NodeJS.Timer | null = null;
  private syncInProgress: boolean = false;

  async onload() {
    console.log('Loading NLANSync plugin...');

    // Load settings
    await this.loadSettings();

    // Initialize services
    if (this.settings.lanEnabled) {
      this.initializeLANService();
    }

    // Add settings tab
    this.addSettingTab(new NLANSyncSettingTab(this.app, this));

    // Register file events for sync on save
    if (this.settings.syncOnSave) {
      this.registerEvent(
        this.app.vault.on('modify', (file: TFile) => {
          if (file instanceof TFile && this.shouldSyncFile(file)) {
            this.syncFile(file);
          }
        })
      );
    }

    // Register delete event
    this.registerEvent(
      this.app.vault.on('delete', (file: TFile) => {
        if (file instanceof TFile && this.shouldSyncFile(file)) {
          this.handleFileDelete(file);
        }
      })
    );

    // Add ribbon icon for sync
    this.addRibbonIcon('sync', 'Sync Now', async () => {
      await this.performFullSync();
    });

    // Add command for sync via command palette
    this.addCommand({
      id: 'nlansync-sync-now',
      name: 'Sync vault now',
      callback: async () => {
        await this.performFullSync();
      },
    });

    // Start auto-sync if enabled
    if (this.settings.autoSyncEnabled) {
      this.startAutoSync();
    }

    // Make plugin accessible globally for debugging
    window.nlansyncPlugin = this;

    new Notice('NLANSync plugin loaded! Check settings to configure sync.');
  }

  onunload() {
    console.log('Unloading NLANSync plugin...');
    this.stopAutoSync();
  }

  async loadSettings() {
    const data = await this.loadData();
    this.settings = Object.assign({}, DEFAULT_SETTINGS, data);
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }

  private initializeLANService() {
    const deviceId = this.generateDeviceId();
    this.lanService = new LANSyncService(deviceId, this.settings.lanDeviceName);
  }

  async connectToLANDevice(ip: string, port: number): Promise<boolean> {
    if (!this.lanService) {
      this.initializeLANService();
    }

    return this.lanService!.connectToDevice(ip, port);
  }

  getConnectedDevices(): SyncDevice[] {
    if (!this.lanService) {
      return [];
    }
    return this.lanService.getKnownDevices();
  }

  async performFullSync() {
    if (this.syncInProgress) {
      new Notice('Sync already in progress');
      return;
    }

    this.syncInProgress = true;
    new Notice('Starting full sync...');

    try {
      const files = this.getFilesToSync();
      console.log(`Found ${files.length} files to sync`);
      let syncedCount = 0;

      // Sync to LAN devices
      if (this.settings.lanEnabled && this.lanService) {
        const devices = this.lanService.getKnownDevices();
        for (const device of devices) {
          try {
            const success = await this.lanService.syncWithDevice(device.id, files);
            if (success) {
              syncedCount++;
            }
          } catch (error) {
            console.error(`Failed to sync with ${device.name}:`, error);
          }
        }
      }

      new Notice(`Sync complete! ${syncedCount} devices synchronized.`);
    } catch (error) {
      console.error('Full sync failed:', error);
      new Notice('Sync failed. Check console for details.');
    } finally {
      this.syncInProgress = false;
    }
  }

  private async syncFile(file: TFile) {
    if (this.syncInProgress) {
      return;
    }

    try {
      // Sync to LAN
      if (this.settings.lanEnabled && this.lanService) {
        const devices = this.lanService.getKnownDevices();
        for (const device of devices) {
          try {
            await this.lanService.syncWithDevice(device.id, [
              {
                path: file.path,
                name: file.name,
                content: await this.app.vault.read(file),
              },
            ]);
          } catch (error) {
            console.error(`Failed to sync ${file.path} to ${device.name}:`, error);
          }
        }
      }
    } catch (error) {
      console.error(`Failed to sync file ${file.path}:`, error);
    }
  }

  private async handleFileDelete(file: TFile) {
    // Handle file deletion sync
    console.log('File deleted:', file.path);
    // TODO: Implement deletion sync to Google Drive and LAN
  }

  private getFilesToSync(): TFile[] {
    const files: TFile[] = [];
    const walkVault = (folder: TFolder) => {
      for (const child of folder.children) {
        if (child instanceof TFile) {
          if (this.shouldSyncFile(child)) {
            files.push(child);
          }
        } else if (child instanceof TFolder) {
          walkVault(child);
        }
      }
    };

    walkVault(this.app.vault.getRoot());
    return files;
  }

  private shouldSyncFile(file: TFile): boolean {
    // Exclude system files and folders
    const excludePatterns = [
      '.obsidian',
      '.git',
      '.DS_Store',
      'Thumbs.db',
      '.gitignore',
      'node_modules',
    ];

    // Check if file path contains any excluded patterns
    for (const pattern of excludePatterns) {
      if (file.path.includes(pattern)) {
        return false;
      }
    }

    // Sync all file types except excluded ones
    return true;
  }

  startAutoSync() {
    if (this.autoSyncInterval) {
      clearInterval(this.autoSyncInterval);
    }

    this.autoSyncInterval = setInterval(() => {
      this.performFullSync();
    }, this.settings.autoSyncInterval);

    console.log('Auto-sync started with interval:', this.settings.autoSyncInterval);
  }

  stopAutoSync() {
    if (this.autoSyncInterval) {
      clearInterval(this.autoSyncInterval);
      this.autoSyncInterval = null;
      console.log('Auto-sync stopped');
    }
  }

  restartAutoSync() {
    this.stopAutoSync();
    if (this.settings.autoSyncEnabled) {
      this.startAutoSync();
    }
  }

  private generateDeviceId(): string {
    // Generate a unique device ID (you might want to store this persistently)
    const stored = localStorage.getItem('nlansync-device-id');
    if (stored) {
      return stored;
    }

    const deviceId = 'device-' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('nlansync-device-id', deviceId);
    return deviceId;
  }
}
