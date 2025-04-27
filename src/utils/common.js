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

export async function sourceFileToLocalPath(sourceFile) {
    const {localRootPath} = await getSettings();
    return `${localPathToUrlPart(localRootPath)}${sourceFile}`;
}

// Function to map a source file to a URI based on the stored template
export async function sourceFileToVSCodeUrl(sourceFile) {
    const {customUrlTemplate} = await getSettings();
    const localPath = await sourceFileToLocalPath(sourceFile);
    const uri = customUrlTemplate.replace('{localSourcePath}', encodeURIComponent(localPath));
    return uri;
}

export async function ensureDefaultSettings() {
    const items = await chrome.storage.sync.get(['localRootPath', 'customUrlTemplate']);
    if (!items.localRootPath) {
        await chrome.storage.sync.set({ localRootPath: 'Q:\\cr\\src' });
    }
    if (!items.customUrlTemplate) {
        await chrome.storage.sync.set({ customUrlTemplate: 'vscode://file/{localSourcePath}' });
    }
}

export async function getSettings() {
    return await chrome.storage.sync.get(['localRootPath', 'customUrlTemplate']);
}