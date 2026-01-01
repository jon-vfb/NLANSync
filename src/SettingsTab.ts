import { App, PluginSettingTab, Setting, Notice } from 'obsidian';
import NLANSyncPlugin from '../main';

export interface NLANSyncSettings {
  lanEnabled: boolean;
  lanDeviceIp: string;
  lanDevicePort: number;
  lanDeviceName: string;

  autoSyncEnabled: boolean;
  autoSyncInterval: number; // in milliseconds
  syncOnSave: boolean;

  syncFilter: string; // glob pattern for files to sync
}

export const DEFAULT_SETTINGS: NLANSyncSettings = {
  lanEnabled: false,
  lanDeviceIp: '',
  lanDevicePort: 7777,
  lanDeviceName: 'My Device',

  autoSyncEnabled: false,
  autoSyncInterval: 300000, // 5 minutes
  syncOnSave: true,

  syncFilter: '**/*.md',
};

export class NLANSyncSettingTab extends PluginSettingTab {
  plugin: NLANSyncPlugin;

  constructor(app: App, plugin: NLANSyncPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;

    containerEl.empty();

    containerEl.createEl('h1', { text: 'NLANSync - Sync Settings' });

    // LAN Sync Section
    containerEl.createEl('h2', { text: 'LAN Sync' });

    new Setting(containerEl)
      .setName('Enable LAN Sync')
      .setDesc('Sync notes with devices on your local network')
      .addToggle(toggle =>
        toggle
          .setValue(this.plugin.settings.lanEnabled)
          .onChange(async value => {
            this.plugin.settings.lanEnabled = value;
            await this.plugin.saveSettings();
            this.display();
          })
      );

    if (this.plugin.settings.lanEnabled) {
      new Setting(containerEl)
        .setName('Device Name')
        .setDesc('How other devices will see this device')
        .addText(text =>
          text
            .setPlaceholder('My Obsidian Vault')
            .setValue(this.plugin.settings.lanDeviceName)
            .onChange(async value => {
              this.plugin.settings.lanDeviceName = value;
              await this.plugin.saveSettings();
            })
        );

      new Setting(containerEl)
        .setName('Connect to Device')
        .setDesc('Enter the IP address of another device to sync with')
        .addText(text =>
          text
            .setPlaceholder('192.168.1.100')
            .setValue(this.plugin.settings.lanDeviceIp)
            .onChange(async value => {
              this.plugin.settings.lanDeviceIp = value;
              await this.plugin.saveSettings();
            })
        )
        .addButton(button =>
          button
            .setButtonText('Connect')
            .onClick(async () => {
              if (!this.plugin.settings.lanDeviceIp) {
                new Notice('Please enter a device IP address');
                return;
              }
              const success = await this.plugin.connectToLANDevice(
                this.plugin.settings.lanDeviceIp,
                this.plugin.settings.lanDevicePort
              );
              if (success) {
                new Notice('Connected to device!');
              } else {
                new Notice('Failed to connect to device');
              }
            })
        );

      new Setting(containerEl)
        .setName('LAN Sync Devices')
        .setDesc('Devices connected via LAN')
        .addButton(button =>
          button
            .setButtonText('Refresh')
            .onClick(() => {
              this.display();
            })
        );

      const devices = this.plugin.getConnectedDevices();
      if (devices.length > 0) {
        containerEl.createEl('div', {
          cls: 'nlansync-devices-list',
          text: `Connected: ${devices.map(d => d.name).join(', ')}`,
        });
      }
    }

    // Auto Sync Section
    containerEl.createEl('h2', { text: 'Sync Settings' });

    new Setting(containerEl)
      .setName('Sync on Save')
      .setDesc('Automatically sync when a note is saved')
      .addToggle(toggle =>
        toggle
          .setValue(this.plugin.settings.syncOnSave)
          .onChange(async value => {
            this.plugin.settings.syncOnSave = value;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName('Auto-Sync')
      .setDesc('Enable periodic automatic sync')
      .addToggle(toggle =>
        toggle
          .setValue(this.plugin.settings.autoSyncEnabled)
          .onChange(async value => {
            this.plugin.settings.autoSyncEnabled = value;
            await this.plugin.saveSettings();
            if (value) {
              this.plugin.startAutoSync();
            } else {
              this.plugin.stopAutoSync();
            }
          })
      );

    if (this.plugin.settings.autoSyncEnabled) {
      new Setting(containerEl)
        .setName('Sync Interval (seconds)')
        .setDesc('How often to sync (minimum 30 seconds)')
        .addText(text =>
          text
            .setPlaceholder('300')
            .setValue((this.plugin.settings.autoSyncInterval / 1000).toString())
            .onChange(async value => {
              const seconds = parseInt(value) || 300;
              const interval = Math.max(30, seconds) * 1000;
              this.plugin.settings.autoSyncInterval = interval;
              await this.plugin.saveSettings();
              this.plugin.restartAutoSync();
            })
        );
    }

    new Setting(containerEl)
      .setName('File Filter')
      .setDesc('Only sync files matching this pattern (e.g., **/*.md)')
      .addText(text =>
        text
          .setValue(this.plugin.settings.syncFilter)
          .onChange(async value => {
            this.plugin.settings.syncFilter = value || '**/*.md';
            await this.plugin.saveSettings();
          })
      );

    // Manual Sync Button
    containerEl.createEl('h2', { text: 'Manual Sync' });

    new Setting(containerEl)
      .setName('Sync Now')
      .setDesc('Manually trigger a full sync')
      .addButton(button =>
        button
          .setButtonText('Sync All')
          .onClick(async () => {
            new Notice('Starting sync...');
            await this.plugin.performFullSync();
          })
      );
  }
}
