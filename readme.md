# OpenSourceIn

A browser extension that makes it easy for you to open source files you are viewing in the browser from an online service (eg https://dev.azure.com/, https://github.com/, https://chromium-review.googlesource.com/, or https://source.chromium.org/chromium) and open the corresponding local source file.
You can use the Options UI to map specific URIs to local folders.
It works in Edge and Chrome.

## Setup

1. Install the extension from your browser's extension store.
2. Open the options page by right-clicking the extension icon in the toolbar and selecting `Options`.
   - If you only plan to use the extension with a single project, you can set the `Default Local Path` to the root folder of your project, and press `Save`. This will be used as the base folder for all file mappings.
   - If you have multiple projects, you can add a new mapping for each project. You can either do this manually by pressing the `Add Project` button for each project or you can open tabs to the different projects you want to map and then press the `Auto Add Projects From Tabs` button. In either case, you need to set the `Local File Path` for each project listing.
3. Press the `Save` button to save your changes to the options.
4. Reload any tab you want to use the extension with that was open before installing the extension.

## Usage

To use the extension, click the extension icon in the toolbar. This will open a popup with a list of files that are available to open for the current tab. Press a link to open the file in your editor. If you have only one file available, it will automatically open.

## Options
- **Add Project**: Press this button to add a new project to the list. You will need to fill in the `Project Name`, `Repo Name`, and `Local File Path` for the new project.
- **Remove**: Press this button to remove the selected project from the list.
- **Default Local Path**: The default local path to use for any project that does not have a specific mapping in the Projects list. This should be the base folder of your local source.
- **Projects**: A list of projects that you want to map. Each project has a `Project Name`, `Repo Name`, and `Local File Path`. The `Project Name` and `Repo Name` identify the project in the list, and the `Local File Path` is the local path to the root folder of the project.
- **Auto Add Projects From Tabs**: Press this button to automatically add a mapping for each project it finds from the open tabs. This will only work if the tab URL matches one of the supported URL patterns so make sure you are on a search page, or file view page and not the project's main page.
- **Custom URL Template**: This is the URL template that will be used to open the corresponding local file. By default it is the VS Code protocol handler which will open the file in VS Code. The following variables are supported:
    - `{localPath}`: The local path to the file. This is the path that will be used to open the file in the editor.

- **Auto Open Single File**: If this is checked (the default) then if there is only one file found on the current page, it will automatically open that file in the editor. If this is not checked, you will need to select the file from the list of files before it will open.
- **Save**: Press this button to save your changes. If you don't press this button, your changes will not be saved.