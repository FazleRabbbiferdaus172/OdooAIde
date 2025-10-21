import { defineManifest } from '@crxjs/vite-plugin'
import pkg from './package.json'

export default defineManifest({
  manifest_version: 3,
  name: pkg.name,
  version: pkg.version,
  icons: {
    48: 'public/logo.png',
  },
  permissions: [
    'sidePanel',
    "activeTab",
    "scripting"],

  host_permissions: [
    "http://*/*",
    "https://*/*"
  ],

  action: {
    default_icon: {
      48: 'public/logo.png',
    },
    // default_popup: 'src/popup/index.html',
  },
  
  side_panel: {
    default_path: 'src/sidepanel/index.html',
  },
  background: {
    service_worker: 'src/background/open_side_panel.js',
  },
  content_scripts: [
    {
      matches: [
        "http://*/*",
        "https://*/*"
      ],
      js: ["src/content/main.js"]
    }
  ]
})
