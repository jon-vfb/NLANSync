# Quick Start Guide

Get NAsync running in 5 minutes!

## Installation

### Desktop (Windows/Mac/Linux)

```bash
# 1. Clone and setup
git clone https://github.com/yourusername/obsidian-nasync.git
cd obsidian-nasync
npm install
npm run build

# 2. Copy to Obsidian
# Windows: Copy main.js, manifest.json, styles.css to:
# %appdata%\Obsidian\plugins\obsidian-nasync\

# Mac: Copy to:
# ~/Library/Application Support/Obsidian/plugins/obsidian-nasync/

# Linux: Copy to:
# ~/.config/Obsidian/plugins/obsidian-nasync/

# 3. Enable plugin
# - Restart Obsidian
# - Settings → Community Plugins → NAsync → Enable
```

### Mobile (Android)

1. Download Obsidian from Play Store
2. Settings → Community Plugins → Search "NAsync" → Install
3. Enable the plugin

## LAN Sync (Fastest Setup)

**Device 1 (Desktop)**:
1. Settings → NAsync → Enable "LAN Sync"
2. Copy your IP address (Windows: `ipconfig`)

**Device 2 (Mobile/Other)**:
1. Settings → NAsync → Enable "LAN Sync"
2. Paste Device 1's IP in "Connect to Device"
3. Click "Connect"

✅ Done! Edit a note and watch it sync.

## Key Features

| Feature | Setup | Benefit |
|---------|-------|---------|
| **LAN Sync** | 1 min | Fast, no internet needed |

| **Sync on Save** | 30 sec | Automatic backup |
| **Manual Sync** | 1 click | Full control |
| **Auto-Sync** | 2 min | Periodic backups |

## Common Commands

```
Settings → NAsync → 
  ├── LAN Sync
  │   ├── Enable LAN Sync
  │   ├── Device Name
  │   └── Connect to Device → [IP] → Connect
  └── Sync Settings
      ├── Sync on Save
      ├── Auto-Sync (interval)
      └── Sync All (manual)
```

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Can't connect LAN | Same WiFi? Firewall off? IP correct? |
| Files not syncing | Settings enabled? File matches pattern? |
| Slow performance | Reduce sync interval? Smaller files? |

[Full guides available in README.md](README.md)

## Support

- 📖 [Full Documentation](README.md)
- 📱 [Mobile Guide](MOBILE_SETUP.md)
- 🔑 [Google Drive Setup](GOOGLE_DRIVE_SETUP.md)
- 🛠️ [Development Guide](DEVELOPMENT.md)

---

**Next Step**: Read the appropriate setup guide for your use case!
