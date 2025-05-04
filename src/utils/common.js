
const allSettingsNames = ['defaultLocalPath', 'customUrlTemplate', 'projects', 'autoOpenSingleFile'];

// Common utility functions or constants
function localPathToUrlPart(localPath) {
    if (!localPath.endsWith('/')) {
        localPath += '/';
    }
    // Convert back slash to forward slash
    let urlPart = localPath.replace(/\\/g, '/');
    // Percent encode most characters
    urlPart = encodeURI(urlPart);
    // But that doesn't encode space or #
    urlPart = urlPart.replace(/%20/g, ' ');
    urlPart = urlPart.replace(/%23/g, '#');
    return urlPart;
}

function looseStringNormalize(str) {
    if (!str) { 
        return "";
    } else {
        return str.toLowerCase().trim();
    }
}

function looseStringIsEqual(a, b) { return looseStringNormalize(a) == looseStringNormalize(b); }

export function areEntriesEqual(a, b) {
    return looseStringIsEqual(a.repo, b.repo) &&
        looseStringIsEqual(a.project, b.project);
}

async function sourceFileToLocalPath(entry) {
    const {defaultLocalPath, projects} = await getSettings();
    let localPath = defaultLocalPath;
    const project = projects.find(p => areEntriesEqual(p, entry));
    if (project) {
        localPath = project.localPath;
    }

    return `${localPathToUrlPart(localPath)}${entry.remotePath}`;
}

// Function to map a source file to a URI based on the stored template
// Used by popup.js to create URI to open in new window to start VS Code.
export async function sourceFileToVSCodeUrl(entry) {
    const {customUrlTemplate} = await getSettings();
    const localPath = await sourceFileToLocalPath(entry);
    const uri = customUrlTemplate.replace('{localPath}', encodeURIComponent(localPath));
    return uri;
}

// Setup default values. Used by background.js on install or update.
export async function ensureDefaultSettings() {
    const items = await chrome.storage.sync.get(allSettingsNames);
    if (!items.defaultLocalPath) {
        await chrome.storage.sync.set({ defaultLocalPath: 'Q:\\cr\\src' });
    }
    if (!items.customUrlTemplate) {
        await chrome.storage.sync.set({ customUrlTemplate: 'vscode://file/{localPath}' });
    }
    if (!items.projects) {
        await chrome.storage.sync.set({ projects: [
            { project: 'Chromium', repo: 'Chromium', localPath: 'Q:\\cr\\src' }
        ] });
    }
    if (!items.autoOpenSingleFile) {
        await chrome.storage.sync.set({ autoOpenSingleFile: true });
    }
}

export async function getSettings() {
    return await chrome.storage.sync.get(allSettingsNames);
}

export async function setSettings(settings) {
    await chrome.storage.sync.set(settings);
}