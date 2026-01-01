# NLANSync - Obsidian LAN & Google Drive Sync Plugin

A powerful Obsidian plugin that enables seamless synchronization of your vault across multiple devices using LAN connectivity and Google Drive backup.

## Features

### 🌐 LAN Sync
- **Cross-device sync**: Sync your vault with other devices on your local network
- **IP-based connection**: Simply enter an IP address to connect to another device
- **Real-time updates**: Sync notes as you save them or manually trigger sync
- **Multi-device support**: Connect to multiple devices simultaneously

### 🚀 Google Drive Integration
- **Cloud backup**: Automatically backup your notes to Google Drive
- **OAuth 2.0 authentication**: Secure Google login with persistent session management
- **Folder organization**: Dedicated folder in Google Drive for synced notes
- **Automatic sync**: Sync on save or on a schedule

### ⚙️ Smart Sync
- **Auto-sync**: Configure automatic sync intervals
- **Sync on save**: Automatically sync when you save a note
- **Manual sync**: Trigger full sync with a single button click
- **File filtering**: Sync only files matching your pattern

## Installation

### For Desktop (Windows/Mac/Linux)

1. **Clone or download this repository**
```bash
git clone https://github.com/yourusername/obsidian-nasync.git
cd obsidian-nasync
```

2. **Install dependencies**
```bash
npm install
```

3. **Build the plugin**
```bash
npm run build
```

4. **Install in Obsidian**
   - Open Obsidian and go to Settings → Community Plugins
   - Click "Browse" and search for "NAsync" (once it's published)
   - Or copy the built files to your vault's `.obsidian/plugins/obsidian-nasync/` directory:
     - `main.js`
     - `manifest.json`
     - `styles.css` (if present)

5. **Enable the plugin**
   - Go to Settings → Community Plugins → Installed Plugins
   - Enable "NAsync"

### For Mobile (Android)

1. **Install Obsidian Mobile** from Google Play Store
2. **Install the plugin** using the same method as desktop
3. **Access plugin settings** from the mobile app to configure LAN and Google Drive sync

## Configuration

### LAN Sync Setup

1. Go to Plugin Settings → NAsync → LAN Sync
2. Enable "Enable LAN Sync"
3. Set your "Device Name" (how other devices will see you)
4. On another device, enable LAN Sync and enter this device's IP address in the "Connect to Device" field
5. Click "Connect" - you should see the device listed in "LAN Sync Devices"

**Finding your device IP:**
- **Windows**: Open Command Prompt and type `ipconfig`, look for "IPv4 Address"
- **Mac/Linux**: Open Terminal and type `ifconfig`, look for "inet" address
- **Mobile**: Go to Settings → About Phone → Network, or use a WiFi analyzer app

### Google Drive Setup

1. **Create OAuth 2.0 credentials:**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project
   - Enable the Google Drive API
   - Create OAuth 2.0 credentials (Desktop application)
   - Copy the Client ID and Client Secret

2. **Configure in Obsidian:**
   - Go to Plugin Settings → NAsync → Google Drive Sync
   - Enable "Enable Google Drive Sync"
   - Paste your Client ID and Client Secret
   - Click "Login with Google"
   - Authorize the app to access your Google Drive
   - The plugin will create a dedicated folder in your Drive

3. **Set sync folder name** (optional):
   - Default is "Obsidian-Sync"
   - Change in settings if desired

## Usage

### Manual Sync
- Click the sync icon in the Obsidian ribbon (left sidebar)
- Or go to Settings → NAsync → Manual Sync → "Sync All"

### Automatic Sync
1. Enable "Sync on Save" to sync every time you edit a note
2. Or enable "Auto-Sync" and set an interval (minimum 30 seconds)

### Sync Filter
- Use glob patterns to sync only specific files (default: `**/*.md`)
- Examples:
  - `**/*.md` - all markdown files
  - `Notes/**/*.md` - only files in Notes folder
  - `**/{work,projects}/**/*.md` - specific folders

## Architecture

### Services

#### LANSyncService
- Manages LAN connections to other devices
- Handles file transfer over HTTP
- Maintains device registry and connection status
- Supports peer-to-peer sync

#### GoogleDriveSyncService
- Manages OAuth 2.0 authentication with Google
- Handles file upload/download from Google Drive
- Creates and manages sync folders
- Supports file versioning and updates

### Main Plugin
- Integrates both sync services
- Manages sync triggers (on save, auto, manual)
- Handles file modifications and deletions
- Provides settings UI for configuration

## Development

### Project Structure
```
obsidian-nasync/
├── main.ts                  # Main plugin file
├── src/
│   ├── services/
│   │   ├── LANSyncService.ts
│   │   └── GoogleDriveSyncService.ts
│   └── SettingsTab.ts       # Settings UI
├── manifest.json            # Plugin metadata
├── package.json             # Dependencies
├── tsconfig.json            # TypeScript config
├── esbuild.config.mjs       # Build configuration
└── README.md
```

### Running in Development

```bash
npm run dev
```

This will watch for changes and rebuild automatically.

### Building for Production

```bash
npm run build
```

## Roadmap

- [ ] Incremental sync (only sync changed files)
- [ ] File conflict resolution
- [ ] Selective folder sync
- [ ] Sync history and logs
- [ ] Built-in server for easier mobile setup
- [ ] Support for other cloud providers (OneDrive, Dropbox)
- [ ] End-to-end encryption
- [ ] Bandwidth throttling

## Troubleshooting

### Can't connect via LAN
- Ensure both devices are on the same WiFi network
- Check firewall settings - port 7777 must be accessible
- Verify IP address is correct (use `ping` to test)
- Restart both devices

### Google Drive authentication fails
- Ensure Client ID and Secret are correct
- Check that Google Drive API is enabled in Cloud Console
- Confirm your Google account has Drive access
- Check browser console for detailed error messages

### Files not syncing
- Verify sync is enabled in settings
- Check file matches your sync filter pattern
- Ensure connected devices/Google Drive account is accessible
- Check Obsidian console (Ctrl+Shift+I) for error logs

## Security Notes

- **LAN Sync**: Uses plain HTTP for now. Consider using HTTPS in production
- **Google Drive**: Uses official OAuth 2.0 flow. Your login credentials are not stored
- **Refresh Tokens**: Stored locally in Obsidian data directory. Keep your device secure
- **File Encryption**: Consider encrypting sensitive files before syncing

## Contributing

Contributions are welcome! Please feel free to submit issues and pull requests.

## License

MIT License - see LICENSE file for details

## Support

For issues, questions, or feature requests, please open an issue on GitHub.

---

**Note**: This is an early version. Please test thoroughly and backup your vault before using in production.
