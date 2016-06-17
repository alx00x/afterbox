#include "(eipixTools)/update/json.js"
// eipixTools.jsx
//
// Name: eipixTools
// Version: 3.6
// Author: Aleksandar Kocic
// Based on: Launch Pad.jsx script by After Effects crew
//
// Description:
// This is a heavely modified script originally created by Jeff Almasol.
// It provides a button launcher for scripts located in:
// \Support Files\Scripts\ScriptUI Panels\(eipixTools)\sets\
//
// Button icons must be 30x30 PNG image or smaller.
//
// Note: This version of the script requires After Effects CS4
// or later.


(function eipixTools(thisObj)
{
	// Global variables
	var eipixToolsData = new Object();
	eipixToolsData.scriptName = "Eipix Tools";
	eipixToolsData.version = "3.6";
	eipixToolsData.thisScriptsFolder = new Folder((new File($.fileName)).path);
	eipixToolsData.scriptsPath = eipixToolsData.thisScriptsFolder.fsName + "\\(eipixTools)\\sets\\";
	eipixToolsData.etcPath = eipixToolsData.thisScriptsFolder.fsName + "\\(eipixTools)\\etc\\";
	eipixToolsData.updatePath = eipixToolsData.thisScriptsFolder.fsName + "\\(eipixTools)\\update\\";
	eipixToolsData.tempPath = eipixToolsData.thisScriptsFolder.fsName + "\\(eipixTools)\\temp\\";

	eipixToolsData.scriptsFolderAlert = "Scripts folder was not found at the expected location.";

	eipixToolsData.errConnection = "Could not establish connection to repository. Please, check your internet connection.";
	eipixToolsData.errCouldNotUpdate = "Failed to perform update. Reverting to previous version.";
	eipixToolsData.errUpdate = "Update failed.";
	eipixToolsData.strConfirmUpdate = "There is an update available. Do you wish to download it?";
	eipixToolsData.strUpdate = "Update successful! You are now on commit:\n";
	eipixToolsData.strCurrentHash = "Your current version hash is:\n";

	eipixToolsData.strOptions = "Options";
	eipixToolsData.strCheckForUpdates = "Check For Updates";
	eipixToolsData.strRepoURL = "Repo URL";
	eipixToolsData.strIgnoreList = "Ignore list";
	eipixToolsData.strChoose = "Choose";

	eipixToolsData.strVersion = "Version";
	eipixToolsData.strHash = "Hash";
	eipixToolsData.strDate = "Date";

	eipixToolsData.strBtnSave = "Save";
	eipixToolsData.strBtnCancel = "Cancel";

	eipixToolsData.ChooseTitle = "Select to Ignore";
	eipixToolsData.strBtnOk = "Ok";

	eipixToolsData.strSettings = "...";
	eipixToolsData.strSettingsTip = "Settings";
	eipixToolsData.strHelp = "?";
	eipixToolsData.strHelpTip = "Help";
	eipixToolsData.settingsTitle = eipixToolsData.scriptName + " Settings";
	eipixToolsData.strHelpText = eipixToolsData.scriptName + " " + eipixToolsData.version + "\n" +
		"This script provides a button launcher for scripts located in:\n" +
		eipixToolsData.scriptsPath + "\n" +
		"\n";
	eipixToolsData.strErrCantLaunchScript = "Could not launch %s because it no longer exists on disk."
	eipixToolsData.strErrMinAE90 = "This script requires Adobe After Effects CS4 or later.";
	eipixToolsData.strErrAccessDenied = "Unable to write files on disc.\n" +
		"Go to Edit > Preferences > General and make sure\n" +
		"\"Allow Scripts to Write Files and Access Network\" is checked.\n" +
		"\n";
    eipixToolsData.strErrNoSettings = "Repo URL is not defined. Update Aborted.";
	eipixToolsData.btnSize = 36;

	eipixToolsData.localHash
	eipixToolsData.localDate
	eipixToolsData.commitHash;
	eipixToolsData.commitDate;

	eipixToolsData.update;
	eipixToolsData.repoURL;
	eipixToolsData.ignoreList;

	// Production steps of ECMA-262, Edition 5, 15.4.4.14
	// Reference: http://es5.github.io/#x15.4.4.14
	if (!Array.prototype.indexOf) {
	    Array.prototype.indexOf = function(searchElement, fromIndex) {
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
	function netCheck() {
		//check repository connection
		var cmdLineToExecute = "PING -n 1 www.github.com";
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
		//get local sha
        if (app.settings.haveSetting("EipixTools", "Commit Hash")) {
            eipixToolsData.localHash = app.settings.getSetting("EipixTools", "Commit Hash");
        }
        if (app.settings.haveSetting("EipixTools", "Commit Date")) {
            eipixToolsData.localDate = app.settings.getSetting("EipixTools", "Commit Date");
        }
		//var shaFile = new File(eipixToolsData.updatePath + "sha");
		//shaFile.open("r");
		//eipixToolsData.commitHash = shaFile.read();
		//shaFile.close();
	}


	// isUpdateNeeded()
	// Function for checking if scripts are up to date
	function isUpdateNeeded() {
		//get latest commit sha
		var repoURL = app.settings.getSetting("EipixTools", "Repo URL");
		var latestCommitCommand = "\"" + eipixToolsData.updatePath + "curl.exe" + "\"" + " -s -k -X GET " + repoURL + "/git/refs/heads/deploy";
		var latestCommitResponse = system.callSystem(latestCommitCommand);
		var latestCommitJSON = JSON.parse(latestCommitResponse);
		var localSha = eipixToolsData.localHash;

		//check if able to pull data from github repo
		if (latestCommitJSON.object == undefined) {
			alert(eipixToolsData.errCouldNotUpdate);
			return false;
		} else {
			var repoSha = latestCommitJSON.object.sha;

			//get latest commit date
			var latestShaCommand = "\"" + eipixToolsData.updatePath + "curl.exe" + "\"" + " -s -k -X GET " + repoURL + "/commits/" + repoSha;
			var latestShaResponse = system.callSystem(latestShaCommand);
			var latestShaJSON = JSON.parse(latestShaResponse);
			var localDate = eipixToolsData.localDate;
			var latestCommitDate = latestShaJSON.commit.author.date;

			eipixToolsData.commitHash = repoSha;
			eipixToolsData.commitDate = latestCommitDate;

			//compare
			if (localSha == repoSha) {
				return false;
			} else {
				return true;
			}
		}
	}


	// updateFromGithub()
	// Clean the eipixTools folder and update
	function updateFromGithub() {
		var tempFolder = new Folder(eipixToolsData.tempPath);
		if (tempFolder.exists == true) {
			system.callSystem("cmd.exe /c rmdir /s /q \"" + tempFolder.fsName + "\"");
			system.callSystem("cmd.exe /c mkdir \"" + tempFolder.fsName + "\"");
		} else {
			system.callSystem("cmd.exe /c mkdir \"" + tempFolder.fsName + "\"");
		}

        if (app.settings.haveSetting("EipixTools", "Repo URL")) {
            var repoURL = app.settings.getSetting("EipixTools", "Repo URL");
        } else {
            alert(eipixToolsData.strErrNoSettings);
            return;
        }

		var downloadUpdateCommand = "(eipixTools)/update/curl.exe -L -k -s " + repoURL + "/zipball/deploy -o (eipixTools)/update/deploy.zip";
        var downloadUpdateResponse = system.callSystem(downloadUpdateCommand);

		var unzipUpdateCommand = "\"" + eipixToolsData.updatePath + "unzip.vbs\" " + "\"" + eipixToolsData.updatePath + "deploy.zip" + "\"" + " " + "\"" + tempFolder.fsName + "\"";
        var unzipUpdateResponse = system.callSystem("cmd.exe /c \"" + unzipUpdateCommand + "\"");

		var deleteZipCommand = "del " + "\"" + eipixToolsData.updatePath + "deploy.zip" + "\"";
		var deleteZipResponse = system.callSystem("cmd.exe /c \"" + deleteZipCommand + "\"");

		//get extracted folder
		var extractedArray = tempFolder.getFiles();
		var extractedFolderPath = extractedArray[0].fsName;

		//delete etc and sets from (eipixTools)
		system.callSystem("cmd.exe /c rmdir /s /q \"" + eipixToolsData.etcPath + "\"");
		system.callSystem("cmd.exe /c rmdir /s /q \"" + eipixToolsData.scriptsPath + "\"");

		//replace etc and sets in (eipixTools)
		var tempEtcPath = extractedFolderPath + "\\files\\(eipixTools)\\etc"
		var tempSetsPath = extractedFolderPath + "\\files\\(eipixTools)\\sets"

		system.callSystem("robocopy -e \"" + tempEtcPath + "\" \"" + eipixToolsData.etcPath.substring(0, eipixToolsData.etcPath.length - 1) + "\"");
		system.callSystem("robocopy -e \"" + tempSetsPath + "\" \"" + eipixToolsData.scriptsPath.substring(0, eipixToolsData.scriptsPath.length - 1) + "\"");

		//delete temp folder
		system.callSystem("cmd.exe /c rmdir /s /q \"" + tempFolder.fsName + "\"");

		//update hash (eipixToolsData.commitHash)
		app.settings.saveSetting("EipixTools", "Commit Hash", eipixToolsData.commitHash);
		app.settings.saveSetting("EipixTools", "Commit Date", eipixToolsData.commitDate);
		//var hashFile = new File(eipixToolsData.updatePath + "sha");
		//hashFile.open("w");
		//hashFile.write(eipixToolsData.commitHash);
		//hashFile.close();

		//alert message
		alert(eipixToolsData.strUpdate + eipixToolsData.commitHash + "\n" + eipixToolsData.commitDate);
	}


	// getScriptsInSubfolders()
	// Function for getting jsx files in subfolders
	function getScriptsInSubfolders(theFolder) {
		var ignoreFilesList = app.settings.getSetting("EipixTools", "Ignore List");
		var ignoreFiles = ignoreFilesList.split(',');

		var scriptFileList = theFolder.getFiles();
		for (var i = 0; i < scriptFileList.length; i++) {
			var scriptFile = scriptFileList[i];

			var ignore = false;
			if (scriptFile instanceof File && scriptFile.name.match(/\.jsx$/i)) {
				var scriptFileName = scriptFile.toString().split(/(\\|\/)/g).pop();
				if (ignoreFiles.indexOf(scriptFileName) != -1) {
					ignore = true;
				}
			}

			if (scriptFile instanceof Folder) {
				getScriptsInSubfolders(scriptFile);
			} else if (scriptFile instanceof File && scriptFile.name.match(/\.jsx$/i)) {
				if (ignore == false) {
					loadFiles.push(scriptFile);
				}
			}
		}
	    return loadFiles;
	}


	// eipixTools_buildUI()
	// Function for creating the user interface
	function eipixTools_buildUI(thisObj) {
		var pal = (thisObj instanceof Panel) ? thisObj : new Window("palette", eipixToolsData.scriptName, [200, 200, 600, 200], {
			resizeable: true
		});
		if (pal != null) {
			pal.bounds.width = (eipixToolsData.btnSize + 5) * 10 + 5;
			pal.bounds.height = (eipixToolsData.btnSize + 5) * 1 + 5;
			pal.scriptBtns = null;
			eipixTools_rebuildButtons(pal);
			pal.onResize = eipixTools_doResizePanel;
			pal.onResizing = eipixTools_doResizePanel;
		}
		return pal;
	}

    // Build Settings UI
    function eipixTools_buildSettingsUI(thisObj) {
        var pal = new Window("dialog", eipixToolsData.settingsTitle, undefined, {resizeable:true });
        if (pal !== null) {
            var res =
                "group { \
                    orientation:'column', alignment:['fill','fill'], \
                    vers: Panel { \
                        alignment:['fill','top'], \
                        text: '" + eipixToolsData.strVersion + "', alignment:['fill','top'] \
                        dte: Group { \
                            alignment:['fill','top'], \
                            txt1: StaticText { text:'" + eipixToolsData.strDate + ":', preferredSize:[80,20] }, \
                            txt2: StaticText { text:'', preferredSize:[300,20] }, \
                        }, \
                        sha: Group { \
                            alignment:['fill','top'], \
                            txt1: StaticText { text:'" + eipixToolsData.strHash + ":', preferredSize:[80,20] }, \
                            txt2: StaticText { text:'" + eipixToolsData.localHash + "', preferredSize:[300,20] }, \
                        }, \
                    }, \
                    opts: Panel { \
                        alignment:['fill','top'], \
                        text: '" + eipixToolsData.strOptions + "', alignment:['fill','top'] \
                        dnu: Group { \
                            alignment:['fill','top'], \
                            txt: StaticText { text:'', preferredSize:[80,20] }, \
                            box: Checkbox { text:'" + eipixToolsData.strCheckForUpdates + "', alignment:['fill','top'] }, \
                        }, \
                        rpo: Group { \
                            alignment:['fill','top'], \
                            txt: StaticText { text:'" + eipixToolsData.strRepoURL + "', preferredSize:[80,20] }, \
                            fld: EditText { alignment:['fill','center'], preferredSize:[300,20] },  \
                        }, \
                        ign: Group { \
                            alignment:['fill','top'], \
                            txt: StaticText { text:'" + eipixToolsData.strIgnoreList + "', preferredSize:[80,20] }, \
                            fld: EditText { alignment:['fill','center'], preferredSize:[240,20] },  \
                            btn: Button { text:'" + eipixToolsData.strChoose + "', alignment:['center','bottom'], preferredSize:[-1,20] }, \
                        }, \
                    }, \
                    sepr: Group { \
                        orientation:'row', alignment:['fill','top'], \
                        rule: Panel { height: 2, alignment:['fill','center'] }, \
                    }, \
                    cmds: Group { \
                        alignment:['fill','top'], \
                        saveBtn: Button { text:'" + eipixToolsData.strBtnSave + "', alignment:['center','bottom'], preferredSize:[-1,20] }, \
                        cancelBtn: Button { text:'" + eipixToolsData.strBtnCancel + "', alignment:['center','bottom'], preferredSize:[-1,20] }, \
                    }, \
                }, \
            }";
            pal.grp = pal.add(res);

            pal.layout.layout(true);
            pal.grp.minimumSize = pal.grp.size;

            pal.grp.vers.dte.txt2.text = eipixToolsData.localDate.slice(0,10) + " " + eipixToolsData.localDate.slice(11,16);

            if (app.settings.haveSetting("EipixTools", "Update")) {
                var updateSetting = (app.settings.getSetting("EipixTools", "Update") === "false") ? false : true;
                pal.grp.opts.dnu.box.value = updateSetting;
            }

            if (app.settings.haveSetting("EipixTools", "Repo URL")) {
                var repoSetting = app.settings.getSetting("EipixTools", "Repo URL");
                pal.grp.opts.rpo.fld.text = repoSetting;
            }

            if (app.settings.haveSetting("EipixTools", "Ignore List")) {
                var ignoreSetting = app.settings.getSetting("EipixTools", "Ignore List");
                pal.grp.opts.ign.fld.text = ignoreSetting;
            }

			pal.grp.opts.ign.btn.onClick = eipixTools_doChooseUI;
            pal.grp.cmds.saveBtn.onClick = eipixTools_doConfigureSave;
            pal.grp.cmds.cancelBtn.onClick = eipixTools_doConfigureCancel;
        }
        return pal;
    }

    // Settings UI
    var eipixTools_settingsPal;
    function eipixTools_doSettingsUI() {
        eipixTools_settingsPal = eipixTools_buildSettingsUI(thisObj);
        if (eipixTools_settingsPal !== null) {
            if (eipixTools_settingsPal instanceof Window) {
                // Show the palette
                eipixTools_settingsPal.center();
                eipixTools_settingsPal.show();
            } else {
                eipixTools_settingsPal.layout.layout(true);
            }
        }
    }

    // Build Choose UI
    function eipixTools_buildChooseUI(thisObj) {
        var pal = new Window("dialog", eipixToolsData.ChooseTitle, undefined, {resizeable:false });
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
                        okBtn: Button { text:'" + eipixToolsData.strBtnOk + "', alignment:['center','bottom'], preferredSize:[-1,20] }, \
                    }, \
                }, \
            }";
            pal.grp = pal.add(res);

            pal.layout.layout(true);
            pal.grp.minimumSize = pal.grp.size;

            for (var i = 0; i < eipixToolsData.scripts.length; i++) {
            	var insertScript = eipixToolsData.scripts[i].toString().split(/(\\|\/)/g).pop();
            	var insertScriptPath = eipixToolsData.scripts[i].toString();
            	var scriptIcon = new File((insertScriptPath.substring(0, insertScriptPath.length - 3)) + "png");
            	var selectionItems = pal.grp.list.lst.add("item", insertScript);
            	if (scriptIcon.exists) {
            		selectionItems.image = scriptIcon;
            	}
            }

            pal.grp.cmds.okBtn.onClick = eipixTools_doChoose;
        }
        return pal;
    }

    // Choose UI
    var eipixTools_choosePal;
    function eipixTools_doChooseUI() {
        eipixTools_choosePal = eipixTools_buildChooseUI(thisObj);
        if (eipixTools_choosePal !== null) {
            if (eipixTools_choosePal instanceof Window) {
                // Show the palette
                eipixTools_choosePal.center();
                eipixTools_choosePal.show();
            } else {
                eipixTools_choosePal.layout.layout(true);
            }
        }
    }

	// Choose files to ignore
    function eipixTools_doChoose() {
    	//gather choosen
    	var selectionList = eipixTools_choosePal.grp.list.lst.selection;
    	var ignoreListSelection = [];

    	//push into array
    	if (selectionList != null) {
    		//insert
			for (var i = 0; i < selectionList.length; i++) {
				ignoreListSelection.push(selectionList[i].text);
			}

			//insert choosen into field
			var ignoreBoxText = eipixTools_settingsPal.grp.opts.ign.fld.text;
			if (ignoreBoxText != "") {
				var ignoredScripts = ignoreBoxText.split(',');
			} else {
				var ignoredScripts = [];
			}

			for (var i = 0; i < ignoreListSelection.length; i++) {
				ignoredScripts.push(ignoreListSelection[i]);
			}
    		eipixTools_settingsPal.grp.opts.ign.fld.text = ignoredScripts;
		}

		//close
    	eipixTools_choosePal.close();
    }

    // Save settings
    function eipixTools_doConfigureSave() {
        //save update setting
        var updateSetting = eipixTools_settingsPal.grp.opts.dnu.box.value.toString();
        app.settings.saveSetting("EipixTools", "Update", updateSetting);

        //save repo setting
        var repoSetting = eipixTools_settingsPal.grp.opts.rpo.fld.text;
        app.settings.saveSetting("EipixTools", "Repo URL", repoSetting);

        //save ignorelist setting
        var ignorelistSetting = eipixTools_settingsPal.grp.opts.ign.fld.text;
        app.settings.saveSetting("EipixTools", "Ignore List", ignorelistSetting);

        //close config
        eipixTools_settingsPal.close();
    }

    // Configure Cancel
    function eipixTools_doConfigureCancel() {
        eipixTools_settingsPal.close();
    }


	// eipixTools_filterJSXFiles()
	// Function for filtering .jsx files that are not the current file. Used with the Folder.getFiles() function.
	function eipixTools_filterJSXFiles(file) {
		return ((file.name.match(/.jsx(bin)?$/) != null) && (file.name != (new File($.fileName)).name));
	}


	// eipixTools_rebuildButtons()
	// Function for creating/recreating the button layout
	function eipixTools_rebuildButtons(palObj) {
		var topEdge = 4;
		var leftEdge = 4;
		var btnSize = eipixToolsData.btnSize;
		var btnIconFile, defBtnIconFile;

		// Remove the existing buttons (all of them)
		if (palObj.btnGroup != undefined) {
			while (palObj.btnGroup.children.length > 0)
				palObj.btnGroup.remove(0);
			palObj.remove(0);
		}

		// Add buttons for scripts
		//alert("Folder.current = "+eipixToolsData.thisScriptsFolder.toString());
		defBtnIconFile = new File(eipixToolsData.thisScriptsFolder.fsName + "/eipixTools_jsx-icon.png");
		if (!defBtnIconFile.exists) {
			defBtnIconFile = null;
		}

		palObj.scriptBtns = undefined;
		palObj.scriptBtns = new Array();

		// Place controls in a group container to get the panel background love
		palObj.btnGroup = palObj.add("group", [0, 0, palObj.bounds.width, palObj.bounds.height]);

		for (var i = 0; i < eipixToolsData.scripts.length; i++) {
			// If there's a corresponding .png file, use it as an iconbutton instead of a regular text button
			btnIconFile = new File(File(eipixToolsData.scripts[i]).fsName.replace(/.jsx(bin)?$/, ".png"));
			if (btnIconFile.exists) {
				palObj.scriptBtns[i] = palObj.btnGroup.add("iconbutton", [leftEdge, topEdge, leftEdge + btnSize, topEdge + btnSize], btnIconFile, {
					style: "toolbutton"
				});
			} else if (defBtnIconFile != null) {
				palObj.scriptBtns[i] = palObj.btnGroup.add("iconbutton", [leftEdge, topEdge, leftEdge + btnSize, topEdge + btnSize], defBtnIconFile, {
					style: "toolbutton"
				});
			} else {
				palObj.scriptBtns[i] = palObj.btnGroup.add("button", [leftEdge, topEdge, leftEdge + btnSize, topEdge + btnSize], eipixToolsData.scripts[i].name.replace(/.jsx$/, "").replace(/%20/g, " "));
			}
			palObj.scriptBtns[i].scriptFile = eipixToolsData.scripts[i].fsName; // Store file name with button (sneaky that JavaScript is)
			palObj.scriptBtns[i].helpTip = File(eipixToolsData.scripts[i]).name.replace(/.jsx(bin)?$/, "").replace(/%20/g, " ");
			palObj.scriptBtns[i].onClick = function() {
				var scriptFile = new File(this.scriptFile);
				if (scriptFile.exists) {
					scriptFile.open("r");
					var scriptContent = scriptFile.read();
					scriptFile.close();
					eval(scriptContent);
					//aftereffects.executeScript(scriptContent);
					//$.evalFile(scriptFile);
				} else {
					alert(eipixToolsData.strErrCantLaunchScript.replace(/%s/, this.scriptFile), eipixToolsData.scriptName);
				}
			}
			leftEdge += (btnSize + 5);
		}

		// Add the settings and help buttons
		var settingsBtnIconFile = new File(eipixToolsData.thisScriptsFolder.fsName + "/(eipixTools)/eipixTools_settings.png");
		if (settingsBtnIconFile.exists) {
			palObj.settingsBtn = palObj.btnGroup.add("iconbutton", [leftEdge, topEdge, leftEdge + btnSize, topEdge + btnSize / 2], settingsBtnIconFile, {
				style: "toolbutton"
			});
		} else {
			palObj.settingsBtn = palObj.btnGroup.add("button", [leftEdge, topEdge, leftEdge + btnSize, topEdge + btnSize / 2], eipixToolsData.strSettings);
		}
		palObj.settingsBtn.helpTip = eipixToolsData.strSettingsTip;
		palObj.settingsBtn.onClick = function() {
			// Get the scripts in the selected scripts folder
			//prompt(eipixToolsData.strCurrentHash, eipixToolsData.commitHash);
			eipixTools_doSettingsUI();
		}

		var helpBtnIconFile = new File(eipixToolsData.thisScriptsFolder.fsName + "/(eipixTools)/eipixTools_help.png");
		if (helpBtnIconFile.exists) {
			palObj.helpBtn = palObj.btnGroup.add("iconbutton", [leftEdge, topEdge + btnSize / 2, leftEdge + btnSize, topEdge + btnSize], helpBtnIconFile, {
				style: "toolbutton"
			});
		} else {
			palObj.helpBtn = palObj.btnGroup.add("button", [leftEdge, topEdge + btnSize / 2, leftEdge + btnSize, topEdge + btnSize], eipixToolsData.strHelp);
		}
		palObj.helpBtn.helpTip = eipixToolsData.strHelpTip;
		palObj.helpBtn.onClick = function() {
			alert(eipixToolsData.strHelpText, eipixToolsData.strHelpTip);
		}
	}


	// eipixTools_doResizePanel()
	// Callback function for laying out the buttons in the panel
	function eipixTools_doResizePanel() {
		var btnSize = eipixToolsData.btnSize;
		var btnOffset = btnSize + 5;
		var maxRightEdge = eipixToolsPal.size.width - btnSize;
		var leftEdge = 5;
		var topEdge = 5;

		// Reset the background group container's bounds
		eipixToolsPal.btnGroup.bounds = [0, 0, eipixToolsPal.size.width, eipixToolsPal.size.height];

		// Reset each button's layer bounds
		for (var i = 0; i < eipixToolsData.scripts.length; i++) {
			eipixToolsPal.scriptBtns[i].bounds = [leftEdge, topEdge, leftEdge + btnSize, topEdge + btnSize];

			leftEdge += btnOffset;

			// Create a new row if no more columns available in the current row of buttons
			if (leftEdge > maxRightEdge) {
				leftEdge = 5;
				topEdge += btnOffset;
			}
		}

		// The settings and help buttons go into the next "slot"
		eipixToolsPal.settingsBtn.bounds = [leftEdge, topEdge, leftEdge + btnSize, topEdge + btnSize / 2];
		eipixToolsPal.helpBtn.bounds = [leftEdge, topEdge + btnSize / 2, leftEdge + btnSize, topEdge + btnSize];
	}


	// Init Configuration
	//
    function eipixTools_initSettings() {
        if (!(app.settings.haveSetting("EipixTools", "Commit Hash"))) {
            app.settings.saveSetting("EipixTools", "Commit Hash", "073f406dc3851e887a4c42b34dbbb67a0d11a986");
        }
        if (!(app.settings.haveSetting("EipixTools", "Commit Date"))) {
            app.settings.saveSetting("EipixTools", "Commit Date", "2015-04-28T09:35:12Z");
        }
        if (!(app.settings.haveSetting("EipixTools", "Update"))) {
            app.settings.saveSetting("EipixTools", "Update", "true");
        }
        if (!(app.settings.haveSetting("EipixTools", "Repo URL"))) {
            app.settings.saveSetting("EipixTools", "Repo URL", "https://api.github.com/repos/koaleksa/eipix-tools");
        }
        if (!(app.settings.haveSetting("EipixTools", "Ignore List"))) {
            app.settings.saveSetting("EipixTools", "Ignore List", "");
        }
    }

	// main:
	//
	if (parseFloat(app.version) < 9) {
		alert(eipixToolsData.strErrMinAE90, eipixToolsData.scriptName);
		return;
	} else if (isNetworkAccessAllowed() == false) {
		alert(eipixToolsData.strErrAccessDenied);
		return;
	} else {
		// set settings
		eipixTools_initSettings();

		// Get local hash
		getLocalVersion();

		// Update check
		var updateEnabled = (app.settings.getSetting("EipixTools", "Update") === "false") ? false : true;
		if (updateEnabled == true) {
			if (netCheck() == true) {
				if (isUpdateNeeded() == true) {
					var confirmPrompt = confirm(eipixToolsData.scriptName + ":\n" + eipixToolsData.strConfirmUpdate);
					if (confirmPrompt == true) {
					    updateFromGithub();
					}
				}
			} else {
				alert(eipixToolsData.errConnection);
			}
		}

		// Get ignore list
		var ignoreListSetting = app.settings.getSetting("EipixTools", "Ignore List");
		eipixToolsData.ignoreList = [ignoreListSetting];

		// Gather scripts
		eipixToolsData.scripts = [];
		eipixToolsData.setsFolder = new Folder(eipixToolsData.scriptsPath);
		var loadFiles = [];
		eipixToolsData.scripts = getScriptsInSubfolders(eipixToolsData.setsFolder);
		// Build buttons

		// Show the UI
		var eipixToolsPal = eipixTools_buildUI(thisObj);
		if (eipixToolsPal != null) {
			if (eipixToolsPal instanceof Window) {
				// Center the palette
				eipixToolsPal.center();
				// Show the UI
				eipixToolsPal.show();
			} else {
				eipixTools_doResizePanel();
			}
		}
	}
})(this);
