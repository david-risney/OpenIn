// import common functions from common.js
import { getSettings, setSettings, areEntriesEqual } from '../utils/common.js';
const projects = [];

// JavaScript for the options/settings page
// Save options to Chrome storage
async function saveOptions(event) {
    event.preventDefault();

    const defaultLocalPath = document.getElementById('default-local-path').value;
    const customUrlTemplate = document.getElementById('custom-url-template').value;
    const autoOpenSingleFile = !!document.getElementById('auto-open-single-file').checked;

    await setSettings({ defaultLocalPath, customUrlTemplate, projects, autoOpenSingleFile });
    alert('Options saved successfully!');
}
document.getElementById('save-button').addEventListener('click', saveOptions);

// projects is an array of project objects:
// [ { project: 'Project Name', repo: 'Repo Name', localPath: 'C:/path/to/project1' } ]
// Options page has an in memory copy of the projects array which is kept in sync with 
// the HTML list of projects. When the user presses the 'save options' button, the projects
// array is saved to Chrome storage.
function projectListToHtml(projects) {
    // Empty out list
    const projectList = document.getElementById('project-list');
    projectList.innerHTML = '';

    // Use template project-template and fill in for each project in projects
    const projectTemplate = document.getElementById('project-template');
    projects.forEach(project => {
        const projectItem = projectTemplate.content.cloneNode(true);
        let e = projectItem.querySelector('.project-name');
        e.value = project.project;
        e.addEventListener('change', () => { project.project = e.value; });

        e = projectItem.querySelector('.repo-name');
        e.value = project.repo;
        e.addEventListener('change', () => { project.repo = e.value; });

        e = projectItem.querySelector('.local-path');
        e.value = project.localPath;
        e.addEventListener('change', () => { project.localPath = e.value; });

        projectItem.querySelector('.remove-project-button').addEventListener('click', () => {
            const index = projects.indexOf(project);
            if (index > -1) {
                projects.splice(index, 1);
            }
            projectListToHtml(projects);
        });

        projectList.appendChild(projectItem);
    });
}

async function addProject() {
    const project = "Project";
    const repo = "Repo";
    const localPath = "C:\\";

    projects.push({ project, repo, localPath });
    projectListToHtml(projects);
}
document.getElementById('add-project-button').addEventListener('click', addProject);

// The function returns a new array with a subset of the original array, with only unique
// entries based on the callback function.
// callback takes two args, and returns true if they should be considered equal.
function filterUniqueArray(array, callback) {
    const uniqueEntries = array.filter((entry, index, self) => {
        return index === self.findIndex((e) => {
            return callback(e, entry);
        });
    });
    return uniqueEntries;
}

async function autoAddProjectsFromTabs() {
    // Get all source files from all tabs via background.js send message of getEntriesFromAllTabs
    const response = await chrome.runtime.sendMessage({ action: 'getEntriesFromAllTabs' });
    const uniqueEntries = filterUniqueArray(response.sourceFilePaths, areEntriesEqual);

    uniqueEntries.filter(entry => {
        return !projects.some(p => areEntriesEqual(p, entry));
    }).forEach(entry => {
        const project = entry.project || "Unnamed Project";
        const repo = entry.repo || "Unnamed Repo";
        const localPath = entry.localPath || "C:\\";
        projects.push({ project, repo, localPath });
    });
    projectListToHtml(projects);
}
document.getElementById('auto-add-projects-from-tabs').addEventListener('click', autoAddProjectsFromTabs);

// Restore options from Chrome storage
async function restoreOptions() {
    const items = await getSettings();
    if (items.defaultLocalPath) {
        document.getElementById('default-local-path').value = items.defaultLocalPath;
    }
    if (items.customUrlTemplate) {
        document.getElementById('custom-url-template').value = items.customUrlTemplate;
    }
    {
        const autoOpenSingleFileCheckbox = document.getElementById('auto-open-single-file');
        if (items.autoOpenSingleFile) {
            autoOpenSingleFileCheckbox.setAttribute('checked', 'checked');
        } else {
            autoOpenSingleFileCheckbox.removeAttribute('checked');
        }
    }
    if (items.projects) {
        projects.splice(0, projects.length); // Clear the existing projects array
        projects.push(...items.projects);
        projectListToHtml(projects);
    }
}
document.addEventListener('DOMContentLoaded', restoreOptions);