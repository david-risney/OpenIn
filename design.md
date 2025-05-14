# Design Document for OpenSourceIn Browser Extension

## Overview

The OpenSourceIn browser extension is designed to enhance developer productivity by adding an 'Open in VS Code' button to source code pages on specific websites. This button allows users to open the corresponding local file in VS Code. The extension supports Edge and Chrome browsers and uses the latest extension manifest version (Manifest V3).

## Features
- Adds 'Open in VS Code' buttons to pages displaying source code from:
  - https://dev.azure.com/microsoft/Edge/
  - https://source.chromium.org/chromium
  - https://issues.chromium.org/
- Provides a settings UI for users to map URIs to local paths.
- Allows users to configure CSS selectors to identify the 'copy path' button on supported pages.

## Tools and Libraries
- **Jest**: For unit testing.
- **ESLint**: For code linting.
- **Prettier**: For code formatting.

## Folder Structure
```
OpenSourceIn/
├── src/
│   ├── background/
│   │   └── background.js       # Background script for handling extension events
│   ├── content/
│   │   └── content.js          # Content script for injecting buttons into pages
│   ├── popup/
│   │   ├── popup.html          # HTML for the settings popup
│   │   ├── popup.js            # JavaScript for the settings popup
│   │   └── popup.css           # CSS for the settings popup
│   ├── options/
│   │   ├── options.html        # HTML for the options/settings page
│   │   ├── options.js          # JavaScript for the options/settings page
│   │   └── options.css         # CSS for the options/settings page
│   └── utils/
│       └── uriMapper.js        # Utility for mapping URIs to local paths
├── tests/                      # Unit tests
├── manifest.json               # Extension manifest file
├── package.json                # NPM package configuration
├── .eslintrc.js                # ESLint configuration
├── .prettierrc                 # Prettier configuration
└── README.md                   # Project documentation
```

## Build and Run Instructions

### Prerequisites
- Node.js and npm installed.
- Chrome or Edge browser installed.

### Commands
1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Run the Extension**:
   - Open Chrome or Edge.
   - Navigate to `chrome://extensions/` or `edge://extensions/`.
   - Enable "Developer mode".
   - Click "Load unpacked" and select the `src/` folder.

3. **Test the Extension**:
   ```bash
   npm test
   ```

4. **Lint the Code**:
   ```bash
   npm run lint
   ```

5. **Format the Code**:
   ```bash
   npm run format
   ```

## Future Enhancements
- Add support for additional websites.
- Provide more advanced URI mapping options.
- Add localization support for multiple languages.