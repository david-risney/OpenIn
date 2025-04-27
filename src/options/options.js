// JavaScript for the options/settings page
// Save options to Chrome storage
function saveOptions(event) {
    event.preventDefault();

    const localRootPath = document.getElementById('local-root-path').value;
    let customUrlTemplate = document.getElementById('custom-url-template').value;

    chrome.storage.sync.set({
        localRootPath,
        customUrlTemplate
    }, () => {
        alert('Options saved successfully!');
    });
}

// Restore options from Chrome storage
function restoreOptions() {
    chrome.storage.sync.get(['localRootPath', 'customUrlTemplate'], (items) => {
        if (items.localRootPath) {
            document.getElementById('local-root-path').value = items.localRootPath;
        }
        if (items.customUrlTemplate) {
            document.getElementById('custom-url-template').value = items.customUrlTemplate;
        }
    });
}

// Event listeners
document.addEventListener('DOMContentLoaded', restoreOptions);
document.getElementById('options-form').addEventListener('submit', saveOptions);