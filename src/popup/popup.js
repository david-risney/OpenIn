import { sourceFileToVSCodeUrl, getSettings } from '../utils/common.js';

// Update createSourcePathLink to handle async
async function createSourcePathLink(entry) {
    const link = document.createElement('a');
    try {
        const vscodeUrl = await sourceFileToVSCodeUrl(entry);
        link.href = vscodeUrl;
    } catch (error) {
        console.error('Error generating VS Code URL:', error);
        link.href = '#'; // Fallback in case of error
    }
    link.textContent = `${entry.repo} ${entry.remotePath}`;
    link.target = '_blank';
    return link;
}

// Update DOMContentLoaded event listener to handle async
async function populateFilePaths(entries) {
    const fileList = document.getElementById('file-list');
    fileList.innerHTML = '';

    for (const entry of entries) {
        const link = await createSourcePathLink(entry);
        const listItem = document.createElement('li');
        listItem.appendChild(link);
        fileList.appendChild(listItem);
    }

    if (entries.length == 0) {
        const noFilesMessage = document.createElement('li');
        noFilesMessage.textContent = 'No source files found.';
        fileList.appendChild(noFilesMessage);
    }
}

document.addEventListener('DOMContentLoaded', async (event) => {
    console.log('Getting source paths...');
    const response = await chrome.runtime.sendMessage({ action: 'getSourceFilePaths' });
    console.log(`Received source file paths from background script:`, response);
    if (response && response.sourceFilePaths && response.sourceFilePaths.length > 0) {
        await populateFilePaths(response.sourceFilePaths);

        if (response.sourceFilePaths.length == 1) {
            if ((await getSettings()).autoOpenSingleFile) {
                const firstEntry = response.sourceFilePaths[0];
                try {
                    const vscodeUrl = await sourceFileToVSCodeUrl(firstEntry);
                    window.open(vscodeUrl, '_blank');
                } catch (error) {
                    console.error('Error opening first source path:', error);
                }
            }
        }
    }
});

document.getElementById('settings-button').addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
});
