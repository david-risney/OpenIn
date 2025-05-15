import { ensureDefaultSettings } from '../utils/common.js';

// Background script for handling extension events
console.log('Background script loaded');

chrome.runtime.onInstalled.addListener(async (details) => {
    console.log('Extension installed or updated');

    // Ensure default settings are set
    await ensureDefaultSettings();

    // Open the options page in a new tab if the extension is newly installed
    if (details.reason === 'install') {
        chrome.tabs.create({ url: chrome.runtime.getURL('options/options.html') + '?first-run' });
    }
});

// Listen for messages from popup.js
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    switch (message.action) {
        case 'getSourceFilePaths': {
            setTimeout(async () => {
                console.log('Received request for source file paths from popup.js');

                // Query the active tab to get the source file paths from the content script
                const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
                if (tabs.length > 0) {
                    try {
                    const response = await chrome.tabs.sendMessage(tabs[0].id, { action: 'getSourceFilePaths' });
                    // if (chrome.runtime.lastError) {
                    //     console.error('Error sending message to content script:', chrome.runtime.lastError);
                    //     sendResponse({ sourceFilePaths: [] });
                    // } else {
                        console.log('Received source file paths from content script:', response.sourceFilePaths);
                        sendResponse(response);
                    // }
                    }
                    catch (error) {
                        console.error('Error sending message to content script:', error, tabs);
                        sendResponse({ sourceFilePaths: [] });
                    }
                } else {
                    console.warn('No active tab found');
                    sendResponse({ sourceFilePaths: [] });
                }
            }, 0);

            // Return true to indicate that the response will be sent asynchronously
            return true;
        }
        case 'getEntriesFromAllTabs': {
            setTimeout(async () => {
                console.log('Received request for all source files from tabs');
                const tabs = await chrome.tabs.query({});
                const sourceFilePaths = [];
                for (let tabIdx = 0; tabIdx < tabs.length; ++tabIdx) {
                    const tab = tabs[tabIdx];
                    if (tab.id) {
                        try {
                        const response = await chrome.tabs.sendMessage(tab.id, { action: 'getSourceFilePaths' });
                        // if (chrome.runtime.lastError) {
                        //     console.error('Error sending message to content script:', chrome.runtime.lastError);
                        // } else {
                            console.log(`Received source file paths from tab ${tabIdx}:`, response.sourceFilePaths);
                            sourceFilePaths.push(...response.sourceFilePaths);
                        // }
                        }
                        catch (error) {
                            console.error(`Error sending message to tab ${tabIdx}:`, error);
                        }
                    } else {
                        console.warn(`Tab ${tabIdx} does not have a valid ID`);
                    }
                }
                sendResponse({ sourceFilePaths });
            }, 0);

            // Return true to indicate that the response will be sent asynchronously
            return true;
        }
    }
});
