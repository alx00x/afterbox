#include "(toolboy)/update/json.js";
// toolboy.jsx
//
// Name: Toolboy for After Effects
// Version: 5.0
// Author: Aleksandar Kocic
// Based on: Launch Pad.jsx script by After Effects crew
//
// Description:
// This is a heavely modified script originally created by Jeff Almasol.
// It provides a button launcher for scripts located in:
// \Support Files\Scripts\ScriptUI Panels\(toolboy)\sets\
//
// Button icons must be 30x30 PNG image or smaller.
//
// Note: This version of the script requires After Effects CS4
// or later.


(function toolboy(thisObj) {
    // Global variables
    var toolboyData = new Object();
    toolboyData.scriptName = "Toolboy";
    toolboyData.version = "4.2";
    toolboyData.thisScriptsFolder = new Folder((new File($.fileName)).path);
    toolboyData.etcPath = toolboyData.thisScriptsFolder.fsName + "\\(toolboy)\\etc\\";
    toolboyData.helpersPath = toolboyData.thisScriptsFolder.fsName + "\\(toolboy)\\helpers\\";
    toolboyData.imagesPath = toolboyData.thisScriptsFolder.fsName + "\\(toolboy)\\images\\";
    toolboyData.scriptsPath = toolboyData.thisScriptsFolder.fsName + "\\(toolboy)\\sets\\";
    toolboyData.startupPath = toolboyData.thisScriptsFolder.fsName + "\\(toolboy)\\startup\\";
    toolboyData.updatePath = toolboyData.thisScriptsFolder.fsName + "\\(toolboy)\\update\\";
    toolboyData.tempPath = toolboyData.thisScriptsFolder.fsName + "\\(toolboy)\\temp\\";

    toolboyData.scriptsFolderAlert = "Scripts folder was not found at the expected location.";

    toolboyData.errConnection = "Could not establish connection to repository. Please, check your internet connection.";
    toolboyData.errCouldNotUpdate = "Failed to perform update.";
    toolboyData.errUpdate = "Update failed.";
    toolboyData.strConfirmUpdate = "There is an update available. Do you wish to download it?";
    toolboyData.strCurrentHash = "Your current version hash is:\n";

    toolboyData.strOptions = "Options";
    toolboyData.strCheckForUpdates = "Check For Updates";
    toolboyData.strRepoURL = "Repo URL";
    toolboyData.strIgnoreList = "Ignore list";
    toolboyData.strChoose = "Choose";

    toolboyData.strInfo = "Info";
    toolboyData.strVersion = "Version";
    toolboyData.strUpdate = "Update";
    toolboyData.strHash = "Hash";
    toolboyData.strDate = "Date";

    toolboyData.strBtnSave = "Save";
    toolboyData.strBtnCancel = "Cancel";

    toolboyData.ChooseTitle = "Select to Ignore";
    toolboyData.strBtnOk = "Ok";

    toolboyData.strSettings = "...";
    toolboyData.strSettingsTip = "Settings";
    toolboyData.strHelp = "?";
    toolboyData.strHelpTip = "Help";
    toolboyData.settingsTitle = toolboyData.scriptName + " Settings";
    toolboyData.strHelpText = toolboyData.scriptName + " " + toolboyData.version + "\n" +
        "This script provides a button launcher for scripts located in:\n" +
        toolboyData.scriptsPath + "\n" +
        "\n";
    toolboyData.strErrCantLaunchScript = "Could not launch %s because it no longer exists on disk."
    toolboyData.strErrMinAE90 = "This script requires Adobe After Effects CS4 or later.";
    toolboyData.strErrAccessDenied = "Unable to write files on disc.\n" +
        "Go to Edit > Preferences > General and make sure\n" +
        "\"Allow Scripts to Write Files and Access Network\" is checked.\n" +
        "\n";
    toolboyData.strErrNoSettings = "Repo URL is not defined. Update Aborted.";
    toolboyData.btnSize = 36;

    // init
    toolboyData.scripts;
    toolboyData.startupScripts;

    toolboyData.repoDomain;
    toolboyData.repoFullDomain;
    toolboyData.repoOwner;
    toolboyData.repoProject;
    toolboyData.repoBranch = "deploy";

    toolboyData.repoURL = "https://github.com/koaleksa/toolboy-ae";

    toolboyData.localCount;
    toolboyData.localHash;
    toolboyData.localDate;
    toolboyData.commitCount;
    toolboyData.commitHash;
    toolboyData.commitDate;

    toolboyData.update;
    toolboyData.ignoreList;

    Object.size = function (obj) {
        var size = 0, key;
        for (key in obj) {
            if (obj.hasOwnProperty(key)) size++;
        }
        return size;
    };

    // Production steps of ECMA-262, Edition 5, 15.4.4.14
    // Reference: http://es5.github.io/#x15.4.4.14
    if (!Array.prototype.indexOf) {
        Array.prototype.indexOf = function (searchElement, fromIndex) {
            var k;
            if (this == null) {
                throw new TypeError('"this" is null or not defined');
            }
            var O = Object(this);
            var len = O.length >>> 0;
            if (len === 0) {
                return -1;
            }
            var n = +fromIndex || 0;

            if (Math.abs(n) === Infinity) {
                n = 0;
            }
            if (n >= len) {
                return -1;
            }
            k = Math.max(n >= 0 ? n : len - Math.abs(n), 0);
            while (k < len) {
                if (k in O && O[k] === searchElement) {
                    return k;
                }
                k++;
            }
            return -1;
        };
    }

    // isNetworkAccessAllowed()
    // Function for checking if network access is enabled
    function isNetworkAccessAllowed() {
        var securitySetting = app.preferences.getPrefAsLong("Main Pref Section", "Pref_SCRIPTING_FILE_NETWORK_SECURITY");
        if (securitySetting != 1) {
            return false;
        } else if (securitySetting == 1) {
            return true;
        }
    }


    // netCheck()
    // Function for checking if scripts are up to date
    function netCheck(url) {
        //check repository connection
        var cmdLineToExecute = "PING -n 1 " + url;
        var netCheck = system.callSystem(cmdLineToExecute);
        if (netCheck.indexOf("Reply from ") == -1) {
            return false;
        } else {
            return true;
        }
    }


    // getLocalVersion()
    // Function to get current update hash
    function getLocalVersion() {
        //get local version
        if (app.settings.haveSetting("Toolboy", "Commit Count")) {
            toolboyData.localCount = app.settings.getSetting("Toolboy", "Commit Count");
        }
        if (app.settings.haveSetting("Toolboy", "Commit Hash")) {
            toolboyData.localHash = app.settings.getSetting("Toolboy", "Commit Hash");
        }
        if (app.settings.haveSetting("Toolboy", "Commit Date")) {
            toolboyData.localDate = app.settings.getSetting("Toolboy", "Commit Date");
        }
    }


    // isUpdateNeeded()
    // Function for checking if scripts are up to date
    function isUpdateNeeded(url) {
        var splitURL = url.split("/");

        toolboyData.repoDomain = splitURL[2];
        toolboyData.repoFullDomain = splitURL[0] + "//" + splitURL[2];
        toolboyData.repoOwner = splitURL[3];
        toolboyData.repoProject = splitURL[4];

        //get latest commit sha
        var latestCommitCommand = "\"" + toolboyData.updatePath + "curl.exe" + "\"" + " -s -k -X GET " + "\"https://api." + toolboyData.repoDomain + "/repos/" + toolboyData.repoOwner + "/" + toolboyData.repoProject + "/git/refs/heads/" + toolboyData.repoBranch;

        var latestCommitResponse = system.callSystem(latestCommitCommand);
        try {
            var latestCommitJSON = JSON.parse(latestCommitResponse);;
        } catch(err) {
            alert(toolboyData.errCouldNotUpdate + "\n\n" + err.toString());
            return false;
        }
        
        var localSha = toolboyData.localHash;

        //check if able to pull data from github repo
        if (latestCommitJSON.object == undefined) {
            alert(toolboyData.errCouldNotUpdate);
            return false;
        } else {

            //update global variables
            var repoSha = latestCommitJSON.object.sha;
            var latestCommitDate = latestCommitJSON.created_at;

            //get commit count on branch
            var count = 0;
            var perpage_last_sha = repoSha;
            var repoCommitCount = 0;
            while (count != 1) {
                var getAllCommitsCommand = "\"" + toolboyData.updatePath + "curl.exe" + "\"" + " -s -k -X GET " + "\"" + "\"https://api." + toolboyData.repoDomain + "/repos/" + toolboyData.repoOwner + "/" + toolboyData.repoProject + "/commits?per_page=100&sha=" + perpage_last_sha + "\"";
                var getAllCommitsResponse = system.callSystem(getAllCommitsCommand);
                try {
                    var getAllCommitsJSON = JSON.parse(getAllCommitsResponse);
                } catch(err) {
                    alert(toolboyData.errCouldNotUpdate + "\n\n" + err.toString());
                    return false;
                }
                var repoCommits = Object.size(getAllCommitsJSON);
                count = repoCommits;
                
                perpage_last_sha = getAllCommitsJSON[Object.size(getAllCommitsJSON)].sha;
                
                if (count > 1) {
                    repoCommitCount = repoCommitCount + repoCommits;
                }
            }

            toolboyData.commitCount = repoCommitCount;
            toolboyData.commitHash = repoSha;
            toolboyData.commitDate = latestCommitDate;

            //compare
            if (localSha != repoSha) {
                return true;
            } else {
                return false;
            }
        }
    }


    // updateFromGitHub()
    // Clean the toolboy folder and update
    function updateFromGitHub() {
        var tempFolder = new Folder(toolboyData.tempPath);
        if (tempFolder.exists == true) {
            system.callSystem("cmd.exe /c rmdir /s /q \"" + tempFolder.fsName + "\"");
            system.callSystem("cmd.exe /c mkdir \"" + tempFolder.fsName + "\"");
        } else {
            system.callSystem("cmd.exe /c mkdir \"" + tempFolder.fsName + "\"");
        }

        var downloadUpdateCommand = "(toolboy)/update/curl.exe -L -k -s " + toolboyData.repoFullDomain + "/" + toolboyData.repoOwner + "/" + toolboyData.repoProject + "/repository/" + toolboyData.repoBranch + "/archive.zip" + " -o (toolboy)/update/deploy.zip";
        var downloadUpdateResponse = system.callSystem(downloadUpdateCommand);

        var unzipUpdateCommand = "\"" + toolboyData.updatePath + "unzip.vbs\" " + "\"" + toolboyData.updatePath + "deploy.zip" + "\"" + " " + "\"" + tempFolder.fsName + "\"";
        var unzipUpdateResponse = system.callSystem("cmd.exe /c \"" + unzipUpdateCommand + "\"");

        var deleteZipCommand = "del " + "\"" + toolboyData.updatePath + "deploy.zip" + "\"";
        var deleteZipResponse = system.callSystem("cmd.exe /c \"" + deleteZipCommand + "\"");

        //get extracted folder
        var extractedArray = tempFolder.getFiles();
        var extractedFolderPath = extractedArray[0].fsName;

        //delete from (toolboy)
        var currentSetsFolder = new Folder(toolboyData.scriptsPath);
        var currentHelpersFolder = new Folder(toolboyData.helpersPath);
        var currentImagesFolder = new Folder(toolboyData.imagesPath);
        var currentStartupFolder = new Folder(toolboyData.startupPath);

        if (currentSetsFolder.exists == true) {
            system.callSystem("cmd.exe /c rmdir /s /q \"" + currentSetsFolder.fsName + "\"");
        }
        if (currentHelpersFolder.exists == true) {
            system.callSystem("cmd.exe /c rmdir /s /q \"" + currentHelpersFolder.fsName + "\"");
        }
        if (currentImagesFolder.exists == true) {
            system.callSystem("cmd.exe /c rmdir /s /q \"" + currentImagesFolder.fsName + "\"");
        }
        if (currentStartupFolder.exists == true) {
            system.callSystem("cmd.exe /c rmdir /s /q \"" + currentStartupFolder.fsName + "\"");
        }

        //replace in (toolboy)
        var tempSetsFolder = new Folder(extractedFolderPath + "\\files\\(toolboy)\\sets");
        var tempHelpersFolder = new Folder(extractedFolderPath + "\\files\\(toolboy)\\helpers");
        var tempImagesFolder = new Folder(extractedFolderPath + "\\files\\(toolboy)\\images");
        var tempStartupFolder = new Folder(extractedFolderPath + "\\files\\(toolboy)\\startup");

        if (tempSetsFolder.exists == true) {
            system.callSystem("robocopy -e \"" + tempSetsFolder.fsName + "\" \"" + toolboyData.scriptsPath.substring(0, toolboyData.scriptsPath.length - 1) + "\"");
        }
        if (tempHelpersFolder.exists == true) {
            system.callSystem("robocopy -e \"" + tempHelpersFolder.fsName + "\" \"" + toolboyData.helpersPath.substring(0, toolboyData.helpersPath.length - 1) + "\"");
        }
        if (tempImagesFolder.exists == true) {
            system.callSystem("robocopy -e \"" + tempImagesFolder.fsName + "\" \"" + toolboyData.imagesPath.substring(0, toolboyData.imagesPath.length - 1) + "\"");
        }
        if (tempStartupFolder.exists == true) {
            system.callSystem("robocopy -e \"" + tempStartupFolder.fsName + "\" \"" + toolboyData.startupPath.substring(0, toolboyData.startupPath.length - 1) + "\"");
        }

        //delete temp folder
        system.callSystem("cmd.exe /c rmdir /s /q \"" + tempFolder.fsName + "\"");

        //update preferences
        app.settings.saveSetting("Toolboy", "Version", toolboyData.version);
        app.settings.saveSetting("Toolboy", "Commit Count", toolboyData.commitCount);
        app.settings.saveSetting("Toolboy", "Commit Hash", toolboyData.commitHash);
        app.settings.saveSetting("Toolboy", "Commit Date", toolboyData.commitDate);

        //alert message
        alert("Update successful!\n\nYou are now on version: v" + toolboyData.version + "." + toolboyData.commitCount + "\n\n" + "Commit: " + toolboyData.commitHash + "\nDate: " + toolboyData.commitDate.slice(0, 10) + " " + toolboyData.commitDate.slice(11, 16));
    }


    // scanSubFolders() // folder object, RegExp or string  
    // Function for files recursively
    function scanSubFolders(tFolder, mask) {
        var sFolders = new Array();
        var allFiles = new Array();
        sFolders[0] = tFolder;
        for (var j = 0; j < sFolders.length; j++) { // loop through folders               
            var procFiles = sFolders[j].getFiles();
            for (var i = 0; i < procFiles.length; i++) { // loop through this folder contents   
                if (procFiles[i] instanceof File) {
                    if (mask == undefined) allFiles.push(procFiles[i]);// if no search mask collect all files  
                    if (procFiles[i].fullName.search(mask) != -1) allFiles.push(procFiles[i]); // otherwise only those that match mask  
                } else if (procFiles[i] instanceof Folder) {
                    sFolders.push(procFiles[i]);// store the subfolder  
                    scanSubFolders(procFiles[i], mask);// search the subfolder  
                }
            }
        }
        return [allFiles, sFolders];
    }

    // getScriptsInSubfolders()
    // Function for getting jsx files in subfolders and filtering by ignore list
    function getScriptsInFolder(folder) {
        var loadFiles = [];
        var allScripts = scanSubFolders(folder, /\.(jsx)$/i)[0];
        var ignoreFilesList = app.settings.getSetting("Toolboy", "Ignore List");
        var ignoreFiles = ignoreFilesList.split(',');
        for (var i = 0; i < allScripts.length; i++) {
            var scriptFile = allScripts[i];
            var ignore = false;
            var scriptFileName = scriptFile.toString().split(/(\\|\/)/g).pop();
            if (ignoreFiles.indexOf(scriptFileName) != -1) {
                ignore = true;
            }
            if (ignore == false) {
                loadFiles.push(scriptFile);
            }
        }
        return loadFiles;
    }


    // toolboy_buildUI()
    // Function for creating the user interface
    function toolboy_buildUI(thisObj) {
        var pal = (thisObj instanceof Panel) ? thisObj : new Window("palette", toolboyData.scriptName, [200, 200, 600, 200], {
            resizeable: true
        });
        if (pal != null) {
            pal.bounds.width = (toolboyData.btnSize + 5) * 10 + 5;
            pal.bounds.height = (toolboyData.btnSize + 5) * 1 + 5;
            pal.scriptBtns = null;
            toolboy_rebuildButtons(pal);
            pal.onResize = toolboy_doResizePanel;
            pal.onResizing = toolboy_doResizePanel;
        }
        return pal;
    }

    // Build Settings UI
    function toolboy_buildSettingsUI(thisObj) {
        var pal = new Window("dialog", toolboyData.settingsTitle, undefined, { resizeable: true });
        if (pal !== null) {
            var res =
                "group { \
                    orientation:'column', alignment:['fill','fill'], \
                    vers: Panel { \
                        alignment:['fill','top'], \
                        text: '" + toolboyData.strInfo + "', alignment:['fill','top'] \
                        et: Group { \
                            alignment:['fill','top'], \
                            txt1: StaticText { text:'" + toolboyData.strVersion + ":', preferredSize:[80,20] }, \
                            txt2: StaticText { text:'', preferredSize:[300,20] }, \
                        }, \
                        dte: Group { \
                            alignment:['fill','top'], \
                            txt1: StaticText { text:'" + toolboyData.strDate + ":', preferredSize:[80,20] }, \
                            txt2: StaticText { text:'', preferredSize:[300,20] }, \
                        }, \
                        sha: Group { \
                            alignment:['fill','top'], \
                            txt1: StaticText { text:'" + toolboyData.strHash + ":', preferredSize:[80,20] }, \
                            txt2: StaticText { text:'" + toolboyData.localHash + "', preferredSize:[300,20] }, \
                        }, \
                    }, \
                    opts: Panel { \
                        alignment:['fill','top'], \
                        text: '" + toolboyData.strOptions + "', alignment:['fill','top'] \
                        dnu: Group { \
                            alignment:['fill','top'], \
                            txt: StaticText { text:'', preferredSize:[80,20] }, \
                            box: Checkbox { text:'" + toolboyData.strCheckForUpdates + "', alignment:['fill','top'] }, \
                        }, \
                        rpo: Group { \
                            alignment:['fill','top'], \
                            txt: StaticText { text:'" + toolboyData.strRepoURL + "', preferredSize:[80,20] }, \
                            fld: EditText { alignment:['fill','center'], preferredSize:[300,20] },  \
                        }, \
                        ign: Group { \
                            alignment:['fill','top'], \
                            txt: StaticText { text:'" + toolboyData.strIgnoreList + "', preferredSize:[80,20] }, \
                            fld: EditText { alignment:['fill','center'], preferredSize:[240,20] },  \
                            btn: Button { text:'" + toolboyData.strChoose + "', alignment:['center','bottom'], preferredSize:[-1,20] }, \
                        }, \
                    }, \
                    sepr: Group { \
                        orientation:'row', alignment:['fill','top'], \
                        rule: Panel { height: 2, alignment:['fill','center'] }, \
                    }, \
                    cmds: Group { \
                        alignment:['fill','top'], \
                        saveBtn: Button { text:'" + toolboyData.strBtnSave + "', alignment:['center','bottom'], preferredSize:[-1,20] }, \
                        cancelBtn: Button { text:'" + toolboyData.strBtnCancel + "', alignment:['center','bottom'], preferredSize:[-1,20] }, \
                    }, \
                }, \
            }";
            pal.grp = pal.add(res);

            pal.layout.layout(true);
            pal.grp.minimumSize = pal.grp.size;

            var displayCount;
            if (toolboyData.commitCount == undefined) {
                displayCount = toolboyData.localCount;
            } else {
                displayCount = toolboyData.commitCount;
            }
            pal.grp.vers.et.txt2.text = "v" + toolboyData.version + "." + displayCount;

            pal.grp.vers.dte.txt2.text = toolboyData.localDate.slice(0, 10) + " " + toolboyData.localDate.slice(11, 16);

            if (app.settings.haveSetting("Toolboy", "Update")) {
                var updateSetting = (app.settings.getSetting("Toolboy", "Update") === "false") ? false : true;
                pal.grp.opts.dnu.box.value = updateSetting;
            }

            if (app.settings.haveSetting("Toolboy", "Repo URL")) {
                var repoSetting = app.settings.getSetting("Toolboy", "Repo URL");
                pal.grp.opts.rpo.fld.text = repoSetting;
            }

            if (app.settings.haveSetting("Toolboy", "Ignore List")) {
                var ignoreSetting = app.settings.getSetting("Toolboy", "Ignore List");
                pal.grp.opts.ign.fld.text = ignoreSetting;
            }

            pal.grp.opts.ign.btn.onClick = toolboy_doChooseUI;
            pal.grp.cmds.saveBtn.onClick = toolboy_doConfigureSave;
            pal.grp.cmds.cancelBtn.onClick = toolboy_doConfigureCancel;
        }
        return pal;
    }

    // Settings UI
    var toolboy_settingsPal;
    function toolboy_doSettingsUI() {
        toolboy_settingsPal = toolboy_buildSettingsUI(thisObj);
        if (toolboy_settingsPal !== null) {
            if (toolboy_settingsPal instanceof Window) {
                // Show the palette
                toolboy_settingsPal.center();
                toolboy_settingsPal.show();
            } else {
                toolboy_settingsPal.layout.layout(true);
            }
        }
    }

    // Build Choose UI
    function toolboy_buildChooseUI(thisObj) {
        var pal = new Window("dialog", toolboyData.ChooseTitle, undefined, { resizeable: false });
        if (pal !== null) {
            var res =
                "group { \
                    orientation:'column', alignment:['fill','fill'], \
                    list: Panel { \
                        alignment:['fill','top'], \
                        lst: ListBox { alignment:['fill','fill'], size:[250,400], properties:{numberOfColumns:1, showHeaders:false, columnTitles: ['Number', 'Script'], columnWidths:[30,200], multiselect: true} }, \
                    }, \
                    sepr: Group { \
                        orientation:'row', alignment:['fill','top'], \
                        rule: Panel { height: 2, alignment:['fill','center'] }, \
                    }, \
                    cmds: Group { \
                        alignment:['fill','top'], \
                        okBtn: Button { text:'" + toolboyData.strBtnOk + "', alignment:['center','bottom'], preferredSize:[-1,20] }, \
                    }, \
                }, \
            }";
            pal.grp = pal.add(res);

            pal.layout.layout(true);
            pal.grp.minimumSize = pal.grp.size;

            for (var i = 0; i < toolboyData.scripts.length; i++) {
                var insertScript = toolboyData.scripts[i].toString().split(/(\\|\/)/g).pop();
                var insertScriptPath = toolboyData.scripts[i].toString();
                var scriptIcon = new File((insertScriptPath.substring(0, insertScriptPath.length - 3)) + "png");
                var selectionItems = pal.grp.list.lst.add("item", insertScript);
                if (scriptIcon.exists) {
                    selectionItems.image = scriptIcon;
                }
            }

            pal.grp.cmds.okBtn.onClick = toolboy_doChoose;
        }
        return pal;
    }

    // Choose UI
    var toolboy_choosePal;
    function toolboy_doChooseUI() {
        toolboy_choosePal = toolboy_buildChooseUI(thisObj);
        if (toolboy_choosePal !== null) {
            if (toolboy_choosePal instanceof Window) {
                // Show the palette
                toolboy_choosePal.center();
                toolboy_choosePal.show();
            } else {
                toolboy_choosePal.layout.layout(true);
            }
        }
    }

    // Choose files to ignore
    function toolboy_doChoose() {
        //gather choosen
        var selectionList = toolboy_choosePal.grp.list.lst.selection;
        var ignoreListSelection = [];

        //push into array
        if (selectionList != null) {
            //insert
            for (var i = 0; i < selectionList.length; i++) {
                ignoreListSelection.push(selectionList[i].text);
            }

            //insert choosen into field
            var ignoreBoxText = toolboy_settingsPal.grp.opts.ign.fld.text;
            if (ignoreBoxText != "") {
                var ignoredScripts = ignoreBoxText.split(',');
            } else {
                var ignoredScripts = [];
            }

            for (var i = 0; i < ignoreListSelection.length; i++) {
                ignoredScripts.push(ignoreListSelection[i]);
            }
            toolboy_settingsPal.grp.opts.ign.fld.text = ignoredScripts;
        }

        //close
        toolboy_choosePal.close();
    }

    // Save settings
    function toolboy_doConfigureSave() {
        //save update setting
        var updateSetting = toolboy_settingsPal.grp.opts.dnu.box.value.toString();
        app.settings.saveSetting("Toolboy", "Update", updateSetting);

        //save repo setting
        var repoSetting = toolboy_settingsPal.grp.opts.rpo.fld.text;
        app.settings.saveSetting("Toolboy", "Repo URL", repoSetting);

        //save ignorelist setting
        var ignorelistSetting = toolboy_settingsPal.grp.opts.ign.fld.text;
        app.settings.saveSetting("Toolboy", "Ignore List", ignorelistSetting);

        //close config
        toolboy_settingsPal.close();
    }

    // Configure Cancel
    function toolboy_doConfigureCancel() {
        toolboy_settingsPal.close();
    }


    // toolboy_filterJSXFiles()
    // Function for filtering .jsx files that are not the current file. Used with the Folder.getFiles() function.
    function toolboy_filterJSXFiles(file) {
        return ((file.name.match(/.jsx(bin)?$/) != null) && (file.name != (new File($.fileName)).name));
    }


    // toolboy_rebuildButtons()
    // Function for creating/recreating the button layout
    function toolboy_rebuildButtons(palObj) {
        var topEdge = 4;
        var leftEdge = 4;
        var btnSize = toolboyData.btnSize;
        var btnIconFile, defBtnIconFile;

        // Remove the existing buttons (all of them)
        if (palObj.btnGroup != undefined) {
            while (palObj.btnGroup.children.length > 0)
                palObj.btnGroup.remove(0);
            palObj.remove(0);
        }

        // Add buttons for scripts
        //alert("Folder.current = "+toolboyData.thisScriptsFolder.toString());
        defBtnIconFile = new File(toolboyData.thisScriptsFolder.fsName + "/toolboy_jsx-icon.png");
        if (!defBtnIconFile.exists) {
            defBtnIconFile = null;
        }

        palObj.scriptBtns = undefined;
        palObj.scriptBtns = new Array();

        // Place controls in a group container to get the panel background love
        palObj.btnGroup = palObj.add("group", [0, 0, palObj.bounds.width, palObj.bounds.height]);

        for (var i = 0; i < toolboyData.scripts.length; i++) {
            // If there's a corresponding .png file, use it as an iconbutton instead of a regular text button
            btnIconFile = new File(File(toolboyData.scripts[i]).fsName.replace(/.jsx(bin)?$/, ".png"));
            if (btnIconFile.exists) {
                palObj.scriptBtns[i] = palObj.btnGroup.add("iconbutton", [leftEdge, topEdge, leftEdge + btnSize, topEdge + btnSize], btnIconFile, {
                    style: "toolbutton"
                });
            } else if (defBtnIconFile != null) {
                palObj.scriptBtns[i] = palObj.btnGroup.add("iconbutton", [leftEdge, topEdge, leftEdge + btnSize, topEdge + btnSize], defBtnIconFile, {
                    style: "toolbutton"
                });
            } else {
                palObj.scriptBtns[i] = palObj.btnGroup.add("button", [leftEdge, topEdge, leftEdge + btnSize, topEdge + btnSize], toolboyData.scripts[i].name.replace(/.jsx$/, "").replace(/%20/g, " "));
            }
            palObj.scriptBtns[i].scriptFile = toolboyData.scripts[i].fsName; // Store file name with button (sneaky that JavaScript is)
            palObj.scriptBtns[i].helpTip = File(toolboyData.scripts[i]).name.replace(/.jsx(bin)?$/, "").replace(/%20/g, " ");
            palObj.scriptBtns[i].onClick = function () {
                var scriptFile = new File(this.scriptFile);
                if (scriptFile.exists) {
                    scriptFile.open("r");
                    var scriptContent = scriptFile.read();
                    scriptFile.close();

                    var first8Char = scriptContent.substring(0, 8);
                    if (first8Char == "#include") {
                        $.evalFile(scriptFile);
                    } else {
                        eval(scriptContent);
                    }

                    //aftereffects.executeScript(scriptContent);
                } else {
                    alert(toolboyData.strErrCantLaunchScript.replace(/%s/, this.scriptFile), toolboyData.scriptName);
                }
            }
            leftEdge += (btnSize + 5);
        }

        // Add the settings and help buttons
        var settingsBtnIconFile = new File(toolboyData.thisScriptsFolder.fsName + "/(toolboy)/images/toolboy_settings.png");
        if (settingsBtnIconFile.exists) {
            palObj.settingsBtn = palObj.btnGroup.add("iconbutton", [leftEdge, topEdge, leftEdge + btnSize, topEdge + btnSize / 2], settingsBtnIconFile, {
                style: "toolbutton"
            });
        } else {
            palObj.settingsBtn = palObj.btnGroup.add("button", [leftEdge, topEdge, leftEdge + btnSize, topEdge + btnSize / 2], toolboyData.strSettings);
        }
        palObj.settingsBtn.helpTip = toolboyData.strSettingsTip;
        palObj.settingsBtn.onClick = function () {
            // Get the scripts in the selected scripts folder
            //prompt(toolboyData.strCurrentHash, toolboyData.commitHash);
            toolboy_doSettingsUI();
        }

        var helpBtnIconFile = new File(toolboyData.thisScriptsFolder.fsName + "/(toolboy)/images/toolboy_help.png");
        if (helpBtnIconFile.exists) {
            palObj.helpBtn = palObj.btnGroup.add("iconbutton", [leftEdge, topEdge + btnSize / 2, leftEdge + btnSize, topEdge + btnSize], helpBtnIconFile, {
                style: "toolbutton"
            });
        } else {
            palObj.helpBtn = palObj.btnGroup.add("button", [leftEdge, topEdge + btnSize / 2, leftEdge + btnSize, topEdge + btnSize], toolboyData.strHelp);
        }
        palObj.helpBtn.helpTip = toolboyData.strHelpTip;
        palObj.helpBtn.onClick = function () {
            // alert(toolboyData.strHelpText, toolboyData.strHelpTip);

            var os = system.osName;
            if (!os.length) {
                os = $.os;
            }
            app_os = (os.indexOf("Win") != -1) ? "Win" : "Mac"

            var url = "https://github.com/koaleksa/eipix-tools/wiki";

            if (app_os == "Win") {
                system.callSystem("explorer " + url);
            } else {
                system.callSystem("open " + url);
            }
        }
    }


    // toolboy_doResizePanel()
    // Callback function for laying out the buttons in the panel
    function toolboy_doResizePanel() {
        var btnSize = toolboyData.btnSize;
        var btnOffset = btnSize + 5;
        var maxRightEdge = toolboyPal.size.width - btnSize;
        var leftEdge = 5;
        var topEdge = 5;

        // Reset the background group container's bounds
        toolboyPal.btnGroup.bounds = [0, 0, toolboyPal.size.width, toolboyPal.size.height];

        // Reset each button's layer bounds
        for (var i = 0; i < toolboyData.scripts.length; i++) {
            toolboyPal.scriptBtns[i].bounds = [leftEdge, topEdge, leftEdge + btnSize, topEdge + btnSize];

            leftEdge += btnOffset;

            // Create a new row if no more columns available in the current row of buttons
            if (leftEdge > maxRightEdge) {
                leftEdge = 5;
                topEdge += btnOffset;
            }
        }

        // The settings and help buttons go into the next "slot"
        toolboyPal.settingsBtn.bounds = [leftEdge, topEdge, leftEdge + btnSize, topEdge + btnSize / 2];
        toolboyPal.helpBtn.bounds = [leftEdge, topEdge + btnSize / 2, leftEdge + btnSize, topEdge + btnSize];
    }


    // Init Configuration
    //
    function toolboy_initSettings() {
        if (!(app.settings.haveSetting("Toolboy", "Version"))) {
            app.settings.saveSetting("Toolboy", "Version", "0.0");
        }
        if (!(app.settings.haveSetting("Toolboy", "Commit Count"))) {
            app.settings.saveSetting("Toolboy", "Commit Count", "");
        }
        if (!(app.settings.haveSetting("Toolboy", "Commit Hash"))) {
            app.settings.saveSetting("Toolboy", "Commit Hash", "");
        }
        if (!(app.settings.haveSetting("Toolboy", "Commit Date"))) {
            app.settings.saveSetting("Toolboy", "Commit Date", "");
        }
        if (!(app.settings.haveSetting("Toolboy", "Update"))) {
            app.settings.saveSetting("Toolboy", "Update", "true");
        }
        if (!(app.settings.haveSetting("Toolboy", "Repo URL"))) {
            app.settings.saveSetting("Toolboy", "Repo URL", "");
        }
        if (!(app.settings.haveSetting("Toolboy", "Ignore List"))) {
            app.settings.saveSetting("Toolboy", "Ignore List", "");
        }
    }

    // main:
    //
    if (parseFloat(app.version) < 9) {
        alert(toolboyData.strErrMinAE90, toolboyData.scriptName);
        return;
    } else if (isNetworkAccessAllowed() == false) {
        alert(toolboyData.strErrAccessDenied);
        return;
    } else {
        // set settings
        toolboy_initSettings();

        // Get local hash
        getLocalVersion();

        // Update check
        var updateEnabled = (app.settings.getSetting("Toolboy", "Update") === "false") ? false : true;

        if (parseFloat(app.settings.getSetting("Toolboy", "Version")) < parseFloat(toolboyData.version)) {
            var repoURL = toolboyData.repoURL;
            app.settings.saveSetting("Toolboy", "Repo URL", toolboyData.repoURL);
            app.settings.saveSetting("Toolboy", "Version", toolboyData.version);
        } else {
            var repoURL = app.settings.getSetting("Toolboy", "Repo URL");
        }

        var repoDoman = repoURL.split("/")[2];
        if (updateEnabled == true) {
            if (netCheck(repoDoman) == true) {
                if (isUpdateNeeded(repoURL) == true) {
                    var confirmPrompt = confirm(toolboyData.scriptName + ":\n" + toolboyData.strConfirmUpdate);
                    if (confirmPrompt == true) {
                        alert("Update is needed.")
                        // updateFromGitHub();
                    }
                }
            } else {
                alert(toolboyData.errConnection);
            }
        }

        // Get ignore list
        var ignoreListSetting = app.settings.getSetting("Toolboy", "Ignore List");
        toolboyData.ignoreList = [ignoreListSetting];

        // Gather regular scripts
        var setsFolder = new Folder(toolboyData.scriptsPath);
        toolboyData.scripts = getScriptsInFolder(setsFolder);

        // Gather startup scripts
        var startupFolder = new Folder(toolboyData.startupPath);
        toolboyData.startupScripts = getScriptsInFolder(startupFolder);

        // Execute startup scripts
        for (var z = 0; z < toolboyData.startupScripts.length; z++) {
            var startupScriptFile = new File(toolboyData.startupScripts[z]);
            if (startupScriptFile.exists) {
                $.evalFile(startupScriptFile);
            }
        }

        // Show the UI
        var toolboyPal = toolboy_buildUI(thisObj);
        if (toolboyPal != null) {
            if (toolboyPal instanceof Window) {
                // Center the palette
                toolboyPal.center();
                // Show the UI
                toolboyPal.show();
            } else {
                toolboy_doResizePanel();
            }
        }
    }
})(this);
