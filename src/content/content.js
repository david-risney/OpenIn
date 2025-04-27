// Example usage in content.js
const console = window.console.context ? window.console.context('openin') : window.console;
console.log('Content script loaded');

// Does a series of selectors with each one running on the results of the previous.
// Additionally if the element is a shadow root then the next selector runs on the shadow root document.
function querySelectorsAllFromElements(elements, selectors) {
    if (selectors.length === 0) {
        return elements;
    }

    const selector = selectors[0];
    const allFoundElements = [];

    elements.forEach(element => {
        const foundElements = element.querySelectorAll(selector);
        const foundWithShadowRootElements = Array.from(foundElements).map(
            el => el.shadowRoot ? [el, el.shadowRoot] : [el]).flat();

        allFoundElements.push(...foundWithShadowRootElements);

        // console.log(`Found ${foundWithShadowRootElements.length} elements for selector "${selector}" in element:`, element, foundWithShadowRootElements);
    });

    return querySelectorsAllFromElements(allFoundElements, selectors.slice(1));
}

function querySelectorsAll(selectors) {
    return querySelectorsAllFromElements([document.body.parentElement], selectors);
}

const mapping = {
    "chromium-review.googlesource.com": [
        {
            "title": "Gerrit CL change view",
            "groupSelectors": ["gr-app#pg-app", "gr-app-element#app-element", "gr-change-view", "gr-file-list#fileList", "a.pathLink"],
            "remotePathSelector": "span.fullFileName",
            "remotePathValuePath": {"kind": "attribute", "path": "title"}
        },
        {
            "title": "Gerrit CL diff view",
            "groupSelectors": ["gr-app#pg-app", "gr-app-element#app-element", "gr-diff-view", "gr-dropdown-list#dropdown", "gr-button.dropdown-trigger"],
            "remotePathSelector": "span#triggerText",
            "remotePathValuePath": {"kind": "textContent"}
        }
    ]
}

function getSourceFiles() {
    let sourceFiles = [];
    const currentHost = window.location.host;
    const currentMappings = mapping[currentHost];

    if (currentMappings && currentMappings.length > 0) {
        currentMappings.forEach(currentMapping => {
            const groups = querySelectorsAll(currentMapping.groupSelectors);
            if (groups.length === 0) {
                console.error(`No groups found for mapping: ${currentMapping.title}`);
            }
            groups.forEach(group => {
                function getRemotePathValue() {
                    let remotePathValue = null;
                    const remotePath = group.querySelector(currentMapping.remotePathSelector);
                    if (remotePath) {
                        switch (currentMapping.remotePathValuePath.kind) {
                            case "textContent":
                                remotePathValue = remotePath.textContent.trim();
                                break;
                            case "attribute":
                                remotePathValue = remotePath.getAttribute(currentMapping.remotePathValuePath.path).trim();
                                break;
                            default:
                                console.error(`Unknown remote path value path kind: ${currentMapping.remotePathValuePath.kind}`);
                        }
                    }
                    if (remotePathValue == "Commit message") {
                        remotePathValue = null;
                    }
                    return remotePathValue;
                }
                sourceFiles.push(getRemotePathValue());
            });
        });
    }

    return sourceFiles.filter(path => path != null && path.length > 0);
}

// Listen for messages from the background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    switch (message.action) {
        case 'getSourceFilePaths': {
            console.log('Received request for source file paths from background script');

            const sourceFilePaths = getSourceFiles();

            sendResponse({ sourceFilePaths });
            break;
        }
        default: {
            console.error(`Unknown action: ${message.action}`);
        }
    }
});
