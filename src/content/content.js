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
            "title": {"literal": "Gerrit CL change view"},
            "project": {"literal": "Chromium"},
            "repo": {"literal": "Chromium"},
            "remotePath": {
                "html": {
                    "groupSelectors": ["gr-app#pg-app", "gr-app-element#app-element", "gr-change-view", "gr-file-list#fileList", "a.pathLink"],
                    "remotePathSelector": "span.fullFileName",
                    "remotePathValuePath": {"kind": "attribute", "path": "title"}
                }
            }
        },
        {
            "title": {"literal": "Gerrit CL diff view" },
            "project": {"literal": "Chromium"},
            "repo": {"literal": "Chromium"},
            "remotePath": {
                "html": {
                    "groupSelectors": ["gr-app#pg-app", "gr-app-element#app-element", "gr-diff-view", "gr-dropdown-list#dropdown", "gr-button.dropdown-trigger"],
                    "remotePathSelector": "span#triggerText",
                    "remotePathValuePath": {"kind": "textContent"}
                }
            }
        },
    ],
    "source.chromium.org": [
        {
            "title": {"literal": "Google Code search results list"},
            "project": {"literal": "Chromium"},
            "repo": {"literal": "Chromium"},
            "remotePath": { 
                "html": { 
                    "groupSelectors": [".result-path"],
                    "remotePathSelector": "div",
                    "remotePathValuePath": {"kind": "textContent"}
                }
            },
        },
        {
            "title": {"literal": "Google Code search result page"},
            "project": {"literal": "Chromium"},
            "repo": {"literal": "Chromium"},
            "remotePath": {
                "html": {
                    "groupSelectors": ["#skiplink-navigation-target"],
                    "remotePathSelector": null,
                    "remotePathValuePath": {"kind": "textContent"}
                }
            }
        }
    ],

    // ADO:
    //       https://dev.azure.com/{organization}
    //       https://{organization}.azure.com
    //          Search: /{Project}/_search?result=x/y/{Repo}/{branch/commit}//{sourcePath}
    //          Explore: /{Project}/_git/{Repo}?path=/{sourcePath}&version={branch/commit}
    "dev.azure.com": [
        {
            "title": {"literal": "Azure DevOps search results"},
            "project": {"urlpattern": { "pathname": "/:project/*" }},
            "repo": {"urlquery": { "result": "[^/]+/[^/]+/(?<repo>[^/]+)" }},
            "remotePath": {"urlquery": { "result": "[^/]+/[^/]+/(?<repo>[^/]+)/[^/]+//(?<remotePath>.*)" }}
        },
        {
            "title": {"literal": "Azure DevOps file view"},
            "project": {"urlpattern": { "pathname": "/:project/*" }},
            "repo": {"urlpattern": { "pathname": "/:project/_git/:repo" }},
            "remotePath": {"urlquery": { "path": "/(?<remotePath>.*)" }}
        }
    ],

    // GitHub:
    //       Explore: https://github.com/{User}/{Repo}/blob/{branch/commit}/{sourcePath}
    //       Search:  https://github.com/search?q=repo%3Adavid-risney%2FPwshProfile%20cmdletbinding&type=code, *[data-testid = link-to-search-result] .textContent
    "github.com": [
        {
            "title": {"literal": "GitHub file view"},
            "project": {"urlpattern": { "pathname": "/:project/:repo/*" }},
            "repo": {"urlpattern": { "pathname": "/:project/:repo/*" }},
            "remotePath": {"urlpattern": { "pathname": "/:project/:repo/blob/:commit/:remotePath+" }}
        },
        {
            "title": {"literal": "GitHub search results"},
            "project": {"urlpattern": { "pathname": "/:user/:repo/*" }},
            "repo": {"urlquery": { "result": "[^/]+/[^/]+/(?<repo>[^/]+)" }},
            "remotePath": {
                "html": {
                    "groupSelectors": ['*[data-testid = link-to-search-result]'],
                    "remotePathSelector": null,
                    "remotePathValuePath": {"kind": "textContent"}
                }
            }
        }
    ]
}

function getUrlPatternValue(valueName, urlPatternOptions) {
    const urlPattern = new URLPattern(urlPatternOptions);
    const result = urlPattern.exec(document.location.href);
    if (result) {
        const group = result.pathname.groups[valueName];
        return decodeURI(group);
    }
    return null;
}

function getUrlQueryValue(valueName, urlQueryOptions) {
    // Handles parsing the url.search using an urlQueryOptions like { "result": "[^/]+/[^/]+/(?<repo>[^/]+)/[^/]+//(?<remotePath>[^/])" }}
    // 'result' is the name of the key of the keyvalues in the url.search and the regex is used to parse its value.
    // The valueName is used as the name of the matched group of the regex.
    // The url is the url to parse.
    const urlQuery = new URLSearchParams(document.location.search);
    const urlQueryKeyName = Object.getOwnPropertyNames(urlQueryOptions)[0];
    const urlQueryKeyValue = urlQuery.get(urlQueryKeyName)

    const regex = new RegExp(urlQueryOptions[urlQueryKeyName]);
    const match = regex.exec(urlQueryKeyValue);
    // console.log(`Parsing URL query with options:`, document.location.search, urlQueryOptions, urlQueryKeyName, urlQueryKeyValue, regex, match);
    return (match && match.groups) ? decodeURI(match.groups[valueName]) : null;
}

function getHtmlValue(valueName, htmlOptions) {
    const sourceFiles = [];
    const groups = querySelectorsAll(htmlOptions.groupSelectors);
    if (groups.length === 0) {
        console.error(`No groups found for mapping`);
    }
    groups.forEach(group => {
        let remotePathValue = null;
        let remotePath = group;
        if (htmlOptions.remotePathSelector) {
            remotePath = group.querySelector(htmlOptions.remotePathSelector);
        }
        if (remotePath) {
            switch (htmlOptions.remotePathValuePath.kind) {
                case "textContent":
                    remotePathValue = remotePath.textContent.trim();
                    break;
                case "attribute":
                    remotePathValue = remotePath.getAttribute(htmlOptions.remotePathValuePath.path).trim();
                    break;
                default:
                    console.error(`Unknown remote path value path kind: ${htmlOptions.remotePathValuePath.kind}`);
            }
        }
        if (remotePathValue == "Commit message") {
            remotePathValue = null;
        }
        sourceFiles.push(remotePathValue);
    });
    return sourceFiles;
}

function resolveValue(valueName, options) {
    if (options.urlpattern) {
        return getUrlPatternValue(valueName, options.urlpattern);
    } else if (options.urlquery) {
        return getUrlQueryValue(valueName, options.urlquery);
    } else if (options.html) {
        return getHtmlValue(valueName, options.html);
    } else if (options.literal) {
        return options.literal;
    }
    throw new Error(`Unknown value type for ${valueName}`);
}

function getSourceFiles() {
    let sourceFiles = [];
    const currentHost = window.location.host;
    const currentMappings = mapping[currentHost];

    if (currentMappings && currentMappings.length > 0) {
        currentMappings.forEach(mapping => {
            const title = resolveValue("title", mapping.title);
            const project = resolveValue("project", mapping.project);
            const repo = resolveValue("repo", mapping.repo);
            let remotePaths = resolveValue("remotePath", mapping.remotePath);
            if (!remotePaths) {
                remotePaths = [];
            } else if ((typeof remotePaths) == "string") {
                remotePaths = [remotePaths];
            }

            const entries = remotePaths.map(remotePath => { return {
                    title,
                    project,
                    repo,
                    remotePath
                };
            });

            // console.log(`Found ${entries.length} source files for mapping:`, mapping, entries);

            sourceFiles = sourceFiles.concat(entries);
        });
    }

    return sourceFiles.filter(entry => entry.remotePath != null && entry.remotePath.length > 0);
}

// Listen for messages from the background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    switch (message.action) {
        case 'getSourceFilePaths': {
            // console.log('Received request for source file paths from background script');

            const sourceFilePaths = getSourceFiles();

            // console.log('Replying with source file paths:', sourceFilePaths);

            sendResponse({ sourceFilePaths });
            break;
        }
        default: {
            console.error(`Unknown action: ${message.action}`);
        }
    }
});
