#include "(afterbox)/update/json2.js";
// afterbox.jsx
//
// Name: AfterBox for After Effects
// Version: 5.1
// Author: Aleksandar Kocic
// Based on: Launch Pad.jsx script by After Effects crew
//
// Description:
// This is a heavely modified script originally created by Jeff Almasol.
// It provides a button launcher for scripts located in:
// \Support Files\Scripts\ScriptUI Panels\(afterbox)\sets\
//
// Button icons must be 30x30 PNG image or smaller.
//
// Note: This version of the script requires After Effects CS4
// or later.


(function afterbox(thisObj) {
    // Global variables
    var afterboxData = new Object();
    afterboxData.scriptName = "AfterBox";
    afterboxData.version = "5.1";
    afterboxData.thisScriptsFolder = new Folder((new File($.fileName)).path);
    afterboxData.etcPath = afterboxData.thisScriptsFolder.fsName + "\\(afterbox)\\etc\\";
    afterboxData.helpersPath = afterboxData.thisScriptsFolder.fsName + "\\(afterbox)\\helpers\\";
    afterboxData.imagesPath = afterboxData.thisScriptsFolder.fsName + "\\(afterbox)\\images\\";
    afterboxData.scriptsPath = afterboxData.thisScriptsFolder.fsName + "\\(afterbox)\\sets\\";
    afterboxData.startupPath = afterboxData.thisScriptsFolder.fsName + "\\(afterbox)\\startup\\";
    afterboxData.updatePath = afterboxData.thisScriptsFolder.fsName + "\\(afterbox)\\update\\";
    afterboxData.tempPath = afterboxData.thisScriptsFolder.fsName + "\\(afterbox)\\temp\\";

    afterboxData.scriptsFolderAlert = "Scripts folder was not found at the expected location.";

    afterboxData.errConnection = "Could not establish connection to repository. Please, check your internet connection.";
    afterboxData.errCouldNotUpdate = "Could not perform the update. Please try later...";
    afterboxData.errUpdate = "Update failed.";
    afterboxData.strConfirmUpdate = "There is an update available. Do you wish to download it?";
    afterboxData.strCurrentHash = "Your current version hash is:\n";

    afterboxData.strOptions = "Options";
    afterboxData.strCheckForUpdates = "Check For Updates";
    afterboxData.strRepoURL = "Repo URL";
    afterboxData.strIgnoreList = "Ignore list";
    afterboxData.strChoose = "Choose";

    afterboxData.strInfo = "Info";
    afterboxData.strVersion = "Version";
    afterboxData.strUpdate = "Update";
    afterboxData.strHash = "Hash";
    afterboxData.strDate = "Date";

    afterboxData.strBtnSave = "Save";
    afterboxData.strBtnCancel = "Cancel";

    afterboxData.ChooseTitle = "Select to Ignore";
    afterboxData.strBtnOk = "Ok";

    afterboxData.strSettings = "...";
    afterboxData.strSettingsTip = "Settings";
    afterboxData.strHelp = "?";
    afterboxData.strHelpTip = "Help";
    afterboxData.settingsTitle = afterboxData.scriptName + " Settings";
    afterboxData.strHelpText = afterboxData.scriptName + " " + afterboxData.version + "\n" +
        "This script provides a button launcher for scripts located in:\n" +
        afterboxData.scriptsPath + "\n" +
        "\n";
    afterboxData.strErrCantLaunchScript = "Could not launch %s because it no longer exists on disk."
    afterboxData.strErrMinAE90 = "This script requires Adobe After Effects CS4 or later.";
    afterboxData.strErrAccessDenied = "Unable to write files on disc.\n" +
        "Go to Edit > Preferences > General and make sure\n" +
        "\"Allow Scripts to Write Files and Access Network\" is checked.\n" +
        "\n";
    afterboxData.strErrNoSettings = "Repo URL is not defined. Update Aborted.";
    afterboxData.btnSize = 36;

    // init
    afterboxData.scripts;
    afterboxData.startupScripts;

    afterboxData.repoDomain;
    afterboxData.repoFullDomain;
    afterboxData.repoOwner;
    afterboxData.repoProject;
    afterboxData.repoSha;
    afterboxData.repoBranch = "deploy";

    afterboxData.repoURL = "https://github.com/koaleksa/afterbox";

    afterboxData.localCount;
    afterboxData.localHash;
    afterboxData.localDate;
    afterboxData.commitCount;
    afterboxData.commitHash;
    afterboxData.commitDate;

    afterboxData.update;
    afterboxData.ignoreList;

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
        if (app.settings.haveSetting("AfterBox", "Commit Count")) {
            afterboxData.localCount = app.settings.getSetting("AfterBox", "Commit Count");
        }
        if (app.settings.haveSetting("AfterBox", "Commit Hash")) {
            afterboxData.localHash = app.settings.getSetting("AfterBox", "Commit Hash");
        }
        if (app.settings.haveSetting("AfterBox", "Commit Date")) {
            afterboxData.localDate = app.settings.getSetting("AfterBox", "Commit Date");
        }
    }


    // isUpdateNeeded()
    // Function for checking if scripts are up to date
    function isUpdateNeeded(url) {
        var localSha = afterboxData.localHash;
        var splitURL = url.split("/");

        afterboxData.repoDomain = splitURL[2];
        afterboxData.repoFullDomain = splitURL[0] + "//" + splitURL[2];
        afterboxData.repoOwner = splitURL[3];
        afterboxData.repoProject = splitURL[4];

        //get latest commit sha
        var latestCommitCommand = "\"" + afterboxData.updatePath + "curl.exe" + "\"" + " -s -k -X GET " + "\"https://api." + afterboxData.repoDomain + "/repos/" + afterboxData.repoOwner + "/" + afterboxData.repoProject + "/git/ref/heads/" + afterboxData.repoBranch;
        var latestCommitResponse = system.callSystem(latestCommitCommand);
        try {
            var latestCommitJSON = JSON.parse(latestCommitResponse);;
        } catch(err) {
            alert(afterboxData.errCouldNotUpdate + "\n\n" + err.toString());
            return false;
        }

        //check if able to pull data from github repo
        if (latestCommitJSON.message != undefined) {
            alert(afterboxData.errCouldNotUpdate);
            return false;
        } else {
            //update global variables
            var repoSha = latestCommitJSON.object.sha;
            afterboxData.repoSha = repoSha

            //compare
            if (localSha != repoSha) {
                return true;
            } else {
                return false;
            }
        }
    }

    // getUpdateData()
    // Function for getting update data
    function getUpdateData() {
        var repoSha = afterboxData.repoSha;

        //get latest commit date
        var latestCommitCommand = "\"" + afterboxData.updatePath + "curl.exe" + "\"" + " -s -k -X GET " + "\"https://api." + afterboxData.repoDomain + "/repos/" + afterboxData.repoOwner + "/" + afterboxData.repoProject + "/commits/" + repoSha;
        var latestCommitResponse = system.callSystem(latestCommitCommand);
        try {
            var latestCommitJSON = JSON.parse(latestCommitResponse);;
        } catch (err) {
            alert(afterboxData.errCouldNotUpdate + "\n\n" + err.toString());
            return false;
        }
        //check if able to pull data from github repo
        if (latestCommitJSON.message != undefined) {
            alert(afterboxData.errCouldNotUpdate);
            return false;
        }
        var latestCommitDate = latestCommitJSON.commit.author.date;

        //get commit count on branch
        var count = 0;
        var perpage_last_sha = repoSha;
        var repoCommitCount = 1;
        while (count != 1) {
            var getAllCommitsCommand = "\"" + afterboxData.updatePath + "curl.exe" + "\"" + " -s -k -X GET " + "\"" + "\"https://api." + afterboxData.repoDomain + "/repos/" + afterboxData.repoOwner + "/" + afterboxData.repoProject + "/commits?per_page=100&sha=" + perpage_last_sha + "\"";
            var getAllCommitsResponse = system.callSystem(getAllCommitsCommand);
            try {
                var getAllCommitsJSON = JSON.parse(getAllCommitsResponse);
            } catch (err) {
                alert(afterboxData.errCouldNotUpdate + "\n\n" + err.toString());
                return false;
            }
            var repoCommits = Object.size(getAllCommitsJSON);
            count = repoCommits;
            perpage_last_sha = getAllCommitsJSON[repoCommits - 1].sha;

            if (count > 1) {
                repoCommitCount = repoCommitCount + repoCommits - 1;
            }
        }

        afterboxData.commitDate = latestCommitDate;
        afterboxData.commitCount = repoCommitCount;
        afterboxData.commitHash = repoSha;
        return true;
    }


    // updateFromGitHub()
    // Clean the afterbox folder and update
    function updateFromGitHub() {
        var tempFolder = new Folder(afterboxData.tempPath);
        if (tempFolder.exists == true) {
            system.callSystem("cmd.exe /c rmdir /s /q \"" + tempFolder.fsName + "\"");
            system.callSystem("cmd.exe /c mkdir \"" + tempFolder.fsName + "\"");
        } else {
            system.callSystem("cmd.exe /c mkdir \"" + tempFolder.fsName + "\"");
        }

        var downloadUpdateCommand = "(afterbox)/update/curl.exe -L -k -s " + afterboxData.repoURL + "/zipball/deploy -o (afterbox)/update/deploy.zip";
        var downloadUpdateResponse = system.callSystem(downloadUpdateCommand);

        var unzipUpdateCommand = "\"" + afterboxData.updatePath + "unzip.vbs\" " + "\"" + afterboxData.updatePath + "deploy.zip" + "\"" + " " + "\"" + tempFolder.fsName + "\"";
        var unzipUpdateResponse = system.callSystem("cmd.exe /c \"" + unzipUpdateCommand + "\"");

        var deleteZipCommand = "del " + "\"" + afterboxData.updatePath + "deploy.zip" + "\"";
        var deleteZipResponse = system.callSystem("cmd.exe /c \"" + deleteZipCommand + "\"");

        //get extracted folder
        var extractedArray = tempFolder.getFiles();
        var extractedFolderPath = extractedArray[0].fsName;

        //delete from (afterbox)
        var currentSetsFolder = new Folder(afterboxData.scriptsPath);
        var currentHelpersFolder = new Folder(afterboxData.helpersPath);
        var currentImagesFolder = new Folder(afterboxData.imagesPath);
        var currentStartupFolder = new Folder(afterboxData.startupPath);

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

        //replace in (afterbox)
        var tempSetsFolder = new Folder(extractedFolderPath + "\\files\\(afterbox)\\sets");
        var tempHelpersFolder = new Folder(extractedFolderPath + "\\files\\(afterbox)\\helpers");
        var tempImagesFolder = new Folder(extractedFolderPath + "\\files\\(afterbox)\\images");
        var tempStartupFolder = new Folder(extractedFolderPath + "\\files\\(afterbox)\\startup");

        if (tempSetsFolder.exists == true) {
            system.callSystem("robocopy -e \"" + tempSetsFolder.fsName + "\" \"" + afterboxData.scriptsPath.substring(0, afterboxData.scriptsPath.length - 1) + "\"");
        }
        if (tempHelpersFolder.exists == true) {
            system.callSystem("robocopy -e \"" + tempHelpersFolder.fsName + "\" \"" + afterboxData.helpersPath.substring(0, afterboxData.helpersPath.length - 1) + "\"");
        }
        if (tempImagesFolder.exists == true) {
            system.callSystem("robocopy -e \"" + tempImagesFolder.fsName + "\" \"" + afterboxData.imagesPath.substring(0, afterboxData.imagesPath.length - 1) + "\"");
        }
        if (tempStartupFolder.exists == true) {
            system.callSystem("robocopy -e \"" + tempStartupFolder.fsName + "\" \"" + afterboxData.startupPath.substring(0, afterboxData.startupPath.length - 1) + "\"");
        }

        //delete temp folder
        system.callSystem("cmd.exe /c rmdir /s /q \"" + tempFolder.fsName + "\"");

        //update preferences
        app.settings.saveSetting("AfterBox", "Version", afterboxData.version);
        app.settings.saveSetting("AfterBox", "Commit Count", afterboxData.commitCount);
        app.settings.saveSetting("AfterBox", "Commit Hash", afterboxData.commitHash);
        app.settings.saveSetting("AfterBox", "Commit Date", afterboxData.commitDate);

        //alert message
        alert("Update successful!\n\nYou are now on version: v" + afterboxData.version + "." + afterboxData.commitCount + "\n\n" + "Commit: " + afterboxData.commitHash + "\nDate: " + afterboxData.commitDate.slice(0, 10) + " " + afterboxData.commitDate.slice(11, 16));
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
        var ignoreFilesList = app.settings.getSetting("AfterBox", "Ignore List");
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


    // afterbox_buildUI()
    // Function for creating the user interface
    function afterbox_buildUI(thisObj) {
        var pal = (thisObj instanceof Panel) ? thisObj : new Window("palette", afterboxData.scriptName, [200, 200, 600, 200], {
            resizeable: true
        });
        if (pal != null) {
            pal.bounds.width = (afterboxData.btnSize + 5) * 10 + 5;
            pal.bounds.height = (afterboxData.btnSize + 5) * 1 + 5;
            pal.scriptBtns = null;
            afterbox_rebuildButtons(pal);
            pal.onResize = afterbox_doResizePanel;
            pal.onResizing = afterbox_doResizePanel;
        }
        return pal;
    }

    // Build Settings UI
    function afterbox_buildSettingsUI(thisObj) {
        var pal = new Window("dialog", afterboxData.settingsTitle, undefined, { resizeable: true });
        if (pal !== null) {
            var res =
                "group { \
                    orientation:'column', alignment:['fill','fill'], \
                    vers: Panel { \
                        alignment:['fill','top'], \
                        text: '" + afterboxData.strInfo + "', alignment:['fill','top'] \
                        et: Group { \
                            alignment:['fill','top'], \
                            txt1: StaticText { text:'" + afterboxData.strVersion + ":', preferredSize:[80,20] }, \
                            txt2: StaticText { text:'', preferredSize:[300,20] }, \
                        }, \
                        dte: Group { \
                            alignment:['fill','top'], \
                            txt1: StaticText { text:'" + afterboxData.strDate + ":', preferredSize:[80,20] }, \
                            txt2: StaticText { text:'', preferredSize:[300,20] }, \
                        }, \
                        sha: Group { \
                            alignment:['fill','top'], \
                            txt1: StaticText { text:'" + afterboxData.strHash + ":', preferredSize:[80,20] }, \
                            txt2: StaticText { text:'" + afterboxData.localHash + "', preferredSize:[300,20] }, \
                        }, \
                    }, \
                    opts: Panel { \
                        alignment:['fill','top'], \
                        text: '" + afterboxData.strOptions + "', alignment:['fill','top'] \
                        dnu: Group { \
                            alignment:['fill','top'], \
                            txt: StaticText { text:'', preferredSize:[80,20] }, \
                            box: Checkbox { text:'" + afterboxData.strCheckForUpdates + "', alignment:['fill','top'] }, \
                        }, \
                        rpo: Group { \
                            alignment:['fill','top'], \
                            txt: StaticText { text:'" + afterboxData.strRepoURL + "', preferredSize:[80,20] }, \
                            fld: EditText { alignment:['fill','center'], preferredSize:[300,20] },  \
                        }, \
                        ign: Group { \
                            alignment:['fill','top'], \
                            txt: StaticText { text:'" + afterboxData.strIgnoreList + "', preferredSize:[80,20] }, \
                            fld: EditText { alignment:['fill','center'], preferredSize:[240,20] },  \
                            btn: Button { text:'" + afterboxData.strChoose + "', alignment:['center','bottom'], preferredSize:[-1,20] }, \
                        }, \
                    }, \
                    sepr: Group { \
                        orientation:'row', alignment:['fill','top'], \
                        rule: Panel { height: 2, alignment:['fill','center'] }, \
                    }, \
                    cmds: Group { \
                        alignment:['fill','top'], \
                        saveBtn: Button { text:'" + afterboxData.strBtnSave + "', alignment:['center','bottom'], preferredSize:[-1,20] }, \
                        cancelBtn: Button { text:'" + afterboxData.strBtnCancel + "', alignment:['center','bottom'], preferredSize:[-1,20] }, \
                    }, \
                }, \
            }";
            pal.grp = pal.add(res);

            pal.layout.layout(true);
            pal.grp.minimumSize = pal.grp.size;

            var displayCount;
            if (afterboxData.commitCount == undefined) {
                displayCount = afterboxData.localCount;
            } else {
                displayCount = afterboxData.commitCount;
            }
            pal.grp.vers.et.txt2.text = "v" + afterboxData.version + "." + displayCount;

            pal.grp.vers.dte.txt2.text = afterboxData.localDate.slice(0, 10) + " " + afterboxData.localDate.slice(11, 16);

            if (app.settings.haveSetting("AfterBox", "Update")) {
                var updateSetting = (app.settings.getSetting("AfterBox", "Update") === "false") ? false : true;
                pal.grp.opts.dnu.box.value = updateSetting;
            }

            if (app.settings.haveSetting("AfterBox", "Repo URL")) {
                var repoSetting = app.settings.getSetting("AfterBox", "Repo URL");
                pal.grp.opts.rpo.fld.text = repoSetting;
            }

            if (app.settings.haveSetting("AfterBox", "Ignore List")) {
                var ignoreSetting = app.settings.getSetting("AfterBox", "Ignore List");
                pal.grp.opts.ign.fld.text = ignoreSetting;
            }

            pal.grp.opts.ign.btn.onClick = afterbox_doChooseUI;
            pal.grp.cmds.saveBtn.onClick = afterbox_doConfigureSave;
            pal.grp.cmds.cancelBtn.onClick = afterbox_doConfigureCancel;
        }
        return pal;
    }

    // Settings UI
    var afterbox_settingsPal;
    function afterbox_doSettingsUI() {
        afterbox_settingsPal = afterbox_buildSettingsUI(thisObj);
        if (afterbox_settingsPal !== null) {
            if (afterbox_settingsPal instanceof Window) {
                // Show the palette
                afterbox_settingsPal.center();
                afterbox_settingsPal.show();
            } else {
                afterbox_settingsPal.layout.layout(true);
            }
        }
    }

    // Build Choose UI
    function afterbox_buildChooseUI(thisObj) {
        var pal = new Window("dialog", afterboxData.ChooseTitle, undefined, { resizeable: false });
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
                        okBtn: Button { text:'" + afterboxData.strBtnOk + "', alignment:['center','bottom'], preferredSize:[-1,20] }, \
                    }, \
                }, \
            }";
            pal.grp = pal.add(res);

            pal.layout.layout(true);
            pal.grp.minimumSize = pal.grp.size;

            for (var i = 0; i < afterboxData.scripts.length; i++) {
                var insertScript = afterboxData.scripts[i].toString().split(/(\\|\/)/g).pop();
                var insertScriptPath = afterboxData.scripts[i].toString();
                var scriptIcon = new File((insertScriptPath.substring(0, insertScriptPath.length - 3)) + "png");
                var selectionItems = pal.grp.list.lst.add("item", insertScript);
                if (scriptIcon.exists) {
                    selectionItems.image = scriptIcon;
                }
            }

            pal.grp.cmds.okBtn.onClick = afterbox_doChoose;
        }
        return pal;
    }

    // Choose UI
    var afterbox_choosePal;
    function afterbox_doChooseUI() {
        afterbox_choosePal = afterbox_buildChooseUI(thisObj);
        if (afterbox_choosePal !== null) {
            if (afterbox_choosePal instanceof Window) {
                // Show the palette
                afterbox_choosePal.center();
                afterbox_choosePal.show();
            } else {
                afterbox_choosePal.layout.layout(true);
            }
        }
    }

    // Choose files to ignore
    function afterbox_doChoose() {
        //gather choosen
        var selectionList = afterbox_choosePal.grp.list.lst.selection;
        var ignoreListSelection = [];

        //push into array
        if (selectionList != null) {
            //insert
            for (var i = 0; i < selectionList.length; i++) {
                ignoreListSelection.push(selectionList[i].text);
            }

            //insert choosen into field
            var ignoreBoxText = afterbox_settingsPal.grp.opts.ign.fld.text;
            if (ignoreBoxText != "") {
                var ignoredScripts = ignoreBoxText.split(',');
            } else {
                var ignoredScripts = [];
            }

            for (var i = 0; i < ignoreListSelection.length; i++) {
                ignoredScripts.push(ignoreListSelection[i]);
            }
            afterbox_settingsPal.grp.opts.ign.fld.text = ignoredScripts;
        }

        //close
        afterbox_choosePal.close();
    }

    // Save settings
    function afterbox_doConfigureSave() {
        //save update setting
        var updateSetting = afterbox_settingsPal.grp.opts.dnu.box.value.toString();
        app.settings.saveSetting("AfterBox", "Update", updateSetting);

        //save repo setting
        var repoSetting = afterbox_settingsPal.grp.opts.rpo.fld.text;
        app.settings.saveSetting("AfterBox", "Repo URL", repoSetting);

        //save ignorelist setting
        var ignorelistSetting = afterbox_settingsPal.grp.opts.ign.fld.text;
        app.settings.saveSetting("AfterBox", "Ignore List", ignorelistSetting);

        //close config
        afterbox_settingsPal.close();
    }

    // Configure Cancel
    function afterbox_doConfigureCancel() {
        afterbox_settingsPal.close();
    }


    // afterbox_filterJSXFiles()
    // Function for filtering .jsx files that are not the current file. Used with the Folder.getFiles() function.
    function afterbox_filterJSXFiles(file) {
        return ((file.name.match(/.jsx(bin)?$/) != null) && (file.name != (new File($.fileName)).name));
    }


    // afterbox_rebuildButtons()
    // Function for creating/recreating the button layout
    function afterbox_rebuildButtons(palObj) {
        var topEdge = 4;
        var leftEdge = 4;
        var btnSize = afterboxData.btnSize;
        var btnIconFile, defBtnIconFile;

        // Remove the existing buttons (all of them)
        if (palObj.btnGroup != undefined) {
            while (palObj.btnGroup.children.length > 0)
                palObj.btnGroup.remove(0);
            palObj.remove(0);
        }

        // Add buttons for scripts
        //alert("Folder.current = "+afterboxData.thisScriptsFolder.toString());
        defBtnIconFile = new File(afterboxData.thisScriptsFolder.fsName + "/afterbox_jsx-icon.png");
        if (!defBtnIconFile.exists) {
            defBtnIconFile = null;
        }

        palObj.scriptBtns = undefined;
        palObj.scriptBtns = new Array();

        // Place controls in a group container to get the panel background love
        palObj.btnGroup = palObj.add("group", [0, 0, palObj.bounds.width, palObj.bounds.height]);

        for (var i = 0; i < afterboxData.scripts.length; i++) {
            // If there's a corresponding .png file, use it as an iconbutton instead of a regular text button
            btnIconFile = new File(File(afterboxData.scripts[i]).fsName.replace(/.jsx(bin)?$/, ".png"));
            if (btnIconFile.exists) {
                palObj.scriptBtns[i] = palObj.btnGroup.add("iconbutton", [leftEdge, topEdge, leftEdge + btnSize, topEdge + btnSize], btnIconFile, {
                    style: "toolbutton"
                });
            } else if (defBtnIconFile != null) {
                palObj.scriptBtns[i] = palObj.btnGroup.add("iconbutton", [leftEdge, topEdge, leftEdge + btnSize, topEdge + btnSize], defBtnIconFile, {
                    style: "toolbutton"
                });
            } else {
                palObj.scriptBtns[i] = palObj.btnGroup.add("button", [leftEdge, topEdge, leftEdge + btnSize, topEdge + btnSize], afterboxData.scripts[i].name.replace(/.jsx$/, "").replace(/%20/g, " "));
            }
            palObj.scriptBtns[i].scriptFile = afterboxData.scripts[i].fsName; // Store file name with button (sneaky that JavaScript is)
            palObj.scriptBtns[i].helpTip = File(afterboxData.scripts[i]).name.replace(/.jsx(bin)?$/, "").replace(/%20/g, " ");
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
                    alert(afterboxData.strErrCantLaunchScript.replace(/%s/, this.scriptFile), afterboxData.scriptName);
                }
            }
            leftEdge += (btnSize + 5);
        }

        // Add the settings and help buttons
        var settingsBtnIconFile = new File(afterboxData.thisScriptsFolder.fsName + "/(afterbox)/images/settings.png");
        if (settingsBtnIconFile.exists) {
            palObj.settingsBtn = palObj.btnGroup.add("iconbutton", [leftEdge, topEdge, leftEdge + btnSize, topEdge + btnSize / 2], settingsBtnIconFile, {
                style: "toolbutton"
            });
        } else {
            palObj.settingsBtn = palObj.btnGroup.add("button", [leftEdge, topEdge, leftEdge + btnSize, topEdge + btnSize / 2], afterboxData.strSettings);
        }
        palObj.settingsBtn.helpTip = afterboxData.strSettingsTip;
        palObj.settingsBtn.onClick = function () {
            // Get the scripts in the selected scripts folder
            //prompt(afterboxData.strCurrentHash, afterboxData.commitHash);
            afterbox_doSettingsUI();
        }

        var helpBtnIconFile = new File(afterboxData.thisScriptsFolder.fsName + "/(afterbox)/images/help.png");
        if (helpBtnIconFile.exists) {
            palObj.helpBtn = palObj.btnGroup.add("iconbutton", [leftEdge, topEdge + btnSize / 2, leftEdge + btnSize, topEdge + btnSize], helpBtnIconFile, {
                style: "toolbutton"
            });
        } else {
            palObj.helpBtn = palObj.btnGroup.add("button", [leftEdge, topEdge + btnSize / 2, leftEdge + btnSize, topEdge + btnSize], afterboxData.strHelp);
        }
        palObj.helpBtn.helpTip = afterboxData.strHelpTip;
        palObj.helpBtn.onClick = function () {
            // alert(afterboxData.strHelpText, afterboxData.strHelpTip);

            var os = system.osName;
            if (!os.length) {
                os = $.os;
            }
            app_os = (os.indexOf("Win") != -1) ? "Win" : "Mac"

            var url = "https://github.com/koaleksa/afterbox/wiki";

            if (app_os == "Win") {
                system.callSystem("explorer " + url);
            } else {
                system.callSystem("open " + url);
            }
        }
    }


    // afterbox_doResizePanel()
    // Callback function for laying out the buttons in the panel
    function afterbox_doResizePanel() {
        var btnSize = afterboxData.btnSize;
        var btnOffset = btnSize + 5;
        var maxRightEdge = afterboxPal.size.width - btnSize;
        var leftEdge = 5;
        var topEdge = 5;

        // Reset the background group container's bounds
        afterboxPal.btnGroup.bounds = [0, 0, afterboxPal.size.width, afterboxPal.size.height];

        // Reset each button's layer bounds
        for (var i = 0; i < afterboxData.scripts.length; i++) {
            afterboxPal.scriptBtns[i].bounds = [leftEdge, topEdge, leftEdge + btnSize, topEdge + btnSize];

            leftEdge += btnOffset;

            // Create a new row if no more columns available in the current row of buttons
            if (leftEdge > maxRightEdge) {
                leftEdge = 5;
                topEdge += btnOffset;
            }
        }

        // The settings and help buttons go into the next "slot"
        afterboxPal.settingsBtn.bounds = [leftEdge, topEdge, leftEdge + btnSize, topEdge + btnSize / 2];
        afterboxPal.helpBtn.bounds = [leftEdge, topEdge + btnSize / 2, leftEdge + btnSize, topEdge + btnSize];
    }


    // Init Configuration
    //
    function afterbox_initSettings() {
        if (!(app.settings.haveSetting("AfterBox", "Version"))) {
            app.settings.saveSetting("AfterBox", "Version", "0.0");
        }
        if (!(app.settings.haveSetting("AfterBox", "Commit Count"))) {
            app.settings.saveSetting("AfterBox", "Commit Count", "");
        }
        if (!(app.settings.haveSetting("AfterBox", "Commit Hash"))) {
            app.settings.saveSetting("AfterBox", "Commit Hash", "");
        }
        if (!(app.settings.haveSetting("AfterBox", "Commit Date"))) {
            app.settings.saveSetting("AfterBox", "Commit Date", "");
        }
        if (!(app.settings.haveSetting("AfterBox", "Update"))) {
            app.settings.saveSetting("AfterBox", "Update", "true");
        }
        if (!(app.settings.haveSetting("AfterBox", "Repo URL"))) {
            app.settings.saveSetting("AfterBox", "Repo URL", "");
        }
        if (!(app.settings.haveSetting("AfterBox", "Ignore List"))) {
            app.settings.saveSetting("AfterBox", "Ignore List", "");
        }
    }

    // main:
    //
    if (parseFloat(app.version) < 9) {
        alert(afterboxData.strErrMinAE90, afterboxData.scriptName);
        return;
    } else if (isNetworkAccessAllowed() == false) {
        alert(afterboxData.strErrAccessDenied);
        return;
    } else {
        // set settings
        afterbox_initSettings();

        // Get local hash
        getLocalVersion();

        // Update check
        var updateEnabled = (app.settings.getSetting("AfterBox", "Update") === "false") ? false : true;

        if (parseFloat(app.settings.getSetting("AfterBox", "Version")) < parseFloat(afterboxData.version)) {
            var repoURL = afterboxData.repoURL;
            app.settings.saveSetting("AfterBox", "Repo URL", afterboxData.repoURL);
            app.settings.saveSetting("AfterBox", "Version", afterboxData.version);
        } else {
            var repoURL = app.settings.getSetting("AfterBox", "Repo URL");
        }

        var repoDoman = repoURL.split("/")[2];
        if (updateEnabled == true) {
            if (netCheck(repoDoman) == true) {
                if (isUpdateNeeded(repoURL) == true) {
                    var confirmPrompt = confirm(afterboxData.scriptName + ":\n" + afterboxData.strConfirmUpdate);
                    if (confirmPrompt == true) {
                        if (getUpdateData() == true) {
                            updateFromGitHub();
                        }
                    }
                }
            } else {
                alert(afterboxData.errConnection);
            }
        }

        // Get ignore list
        var ignoreListSetting = app.settings.getSetting("AfterBox", "Ignore List");
        afterboxData.ignoreList = [ignoreListSetting];

        // Gather regular scripts
        var setsFolder = new Folder(afterboxData.scriptsPath);
        afterboxData.scripts = getScriptsInFolder(setsFolder);

        // Gather startup scripts
        var startupFolder = new Folder(afterboxData.startupPath);
        afterboxData.startupScripts = getScriptsInFolder(startupFolder);

        // Execute startup scripts
        for (var z = 0; z < afterboxData.startupScripts.length; z++) {
            var startupScriptFile = new File(afterboxData.startupScripts[z]);
            if (startupScriptFile.exists) {
                $.evalFile(startupScriptFile);
            }
        }

        // Show the UI
        var afterboxPal = afterbox_buildUI(thisObj);
        if (afterboxPal != null) {
            if (afterboxPal instanceof Window) {
                // Center the palette
                afterboxPal.center();
                // Show the UI
                afterboxPal.show();
            } else {
                afterbox_doResizePanel();
            }
        }
    }
})(this);
