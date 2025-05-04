import { sourceFileToLocalPath, sourceFileToVSCodeUrl, ensureDefaultSettings } from '../utils/common.js';

// Background script for handling extension events
console.log('Background script loaded');

chrome.runtime.onInstalled.addListener(async () => {
    console.log('Extension installed or updated');
    // Ensure default settings are set
    await ensureDefaultSettings();
});

// Listen for messages from popup.js
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'getSourceFilePaths') {
        console.log('Received request for source file paths from popup.js');

        // Query the active tab to get the source file paths from the content script
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs.length > 0) {
                chrome.tabs.sendMessage(tabs[0].id, { action: 'getSourceFilePaths' }, (response) => {
                    if (chrome.runtime.lastError) {
                        console.error('Error sending message to content script:', chrome.runtime.lastError);
                        sendResponse({ sourceFilePaths: [] });
                    } else {
                        console.log('Received source file paths from content script:', response.sourceFilePaths);
                        sendResponse(response);
                    }
                });
            } else {
                console.warn('No active tab found');
                sendResponse({ sourceFilePaths: [] });
            }
        });

        // Return true to indicate that the response will be sent asynchronously
        return true;
    }
});

// Listen for the user clicking the extension button
// chrome.action.onClicked.addListener((tab) => {
//     console.log('Extension button clicked');
// 
//     // Check if the Shift key is being held down
//     chrome.windows.getCurrent({ populate: true }, (window) => {
//         if (window.focused && window.type === 'normal') {
//             chrome.tabs.sendMessage(tab.id, { action: 'getSourceFilePaths' }, (response) => {
//                 if (chrome.runtime.lastError) {
//                     console.error('Error sending message to content script:', chrome.runtime.lastError);
//                 } else if (response && response.sourceFilePaths) {
//                     console.log('Received source file paths from content script:', response.sourceFilePaths);
//                     if (response.sourceFilePaths.length > 0 && window.shiftKey) {
//                         // Open the first source file path in VS Code if Shift is held
//                         openInVSCode(tab, response.sourceFilePaths[0]);
//                     } else if (response.sourceFilePaths.length > 1) {
//                         // Open the popup to let the user choose a file
//                         chrome.action.openPopup();
// 
//                         // Send the sourceFilePaths to the popup
//                         chrome.runtime.sendMessage({ action: 'setSourceFilePaths', sourceFilePaths: response.sourceFilePaths });
//                     } else {
//                         console.warn('No source file paths received from content script');
//                     }
//                 } else {
//                     console.warn('No response or source file paths received from content script');
//                 }
//             });
//         }
//     });
// });

// Update the usage of sourceFileToVSCodeUrl to handle async
// async function openInVSCode(tab, sourceFilePath) {
//     try {
//         const vscodeUrl = await sourceFileToVSCodeUrl(sourceFilePath);
//         chrome.tabs.create({ url: vscodeUrl });
//     } catch (error) {
//         console.error('Error generating VS Code URL:', error);
//     }
// }
