#include "(eipixTools)/update/json.js"
// eipixTools.jsx
// 
// Name: eipixTools
// Version: 3.3
// Author: Aleksandar Kocic
// Based on: Launch Pad.jsx script by After Effects crew
// 
// Description:
// This is a modified script originally created by Jeff Almasol.
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
	eipixToolsData.version = "3.3";
	eipixToolsData.thisScriptsFolder = new Folder((new File($.fileName)).path);
	eipixToolsData.scriptsPath = eipixToolsData.thisScriptsFolder.fsName + "\\(eipixTools)\\sets\\";
	eipixToolsData.etcPath = eipixToolsData.thisScriptsFolder.fsName + "\\(eipixTools)\\etc\\";
	eipixToolsData.updatePath = eipixToolsData.thisScriptsFolder.fsName + "\\(eipixTools)\\update\\";
	eipixToolsData.tempPath = eipixToolsData.thisScriptsFolder.fsName + "\\(eipixTools)\\temp\\";

	eipixToolsData.scriptsFolderAlert = "Scripts folder was not found at the expected location.";

	eipixToolsData.errConnection = "Could not establish connection to repository. Please, check your internet connection.";
	eipixToolsData.errUpdate = "Update failed.";
	eipixToolsData.strConfirmUpdate = "There is an update available. Do you wish to download it?";
	eipixToolsData.strUpdate = "Update successful! You are now on commit:\n";
	eipixToolsData.strCurrentHash = "Your current version hash is:\n";

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
	eipixToolsData.btnSize = 36;

	eipixToolsData.commitHash;


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


	// currentVersionHash()
	// Function to get current update hash
	function currentVersionHash() {
		//get local sha
		var shaFile = new File(eipixToolsData.updatePath + "sha");
		shaFile.open("r");
		eipixToolsData.commitHash = shaFile.read();
		shaFile.close();
	}


	// isUpdateNeeded()
	// Function for checking if scripts are up to date
	function isUpdateNeeded() {
		//get latest commit sha
		var latestCommitCommand = "\"" + eipixToolsData.updatePath + "curl.exe" + "\"" + " -s -X GET https://api.github.com/repos/koaleksa/eipix-tools/git/refs/heads/deploy";
		var latestCommitResponse = system.callSystem(latestCommitCommand);
		var latestCommitJSON = JSON.parse(latestCommitResponse);
		var localSha = eipixToolsData.commitHash;
		var repoSha = latestCommitJSON.object.sha;

		//compare
		if (localSha == repoSha) {
			return false;
		} else {
			eipixToolsData.commitHash = repoSha;
			return true;
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

		var downloadUpdateCommand = "(eipixTools)/update/curl.exe -L -k -s https://api.github.com/repos/koaleksa/eipix-tools/zipball/deploy -o (eipixTools)/update/deploy.zip";
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
		var hashFile = new File(eipixToolsData.updatePath + "sha");
		hashFile.open("w");
		hashFile.write(eipixToolsData.commitHash);
		hashFile.close();

		//alert message
		alert(eipixToolsData.strUpdate + eipixToolsData.commitHash);
	}


	// getScriptsInSubfolders()
	// Function for getting jsx files in subfolders
	function getScriptsInSubfolders(theFolder) {
		var myFileList = theFolder.getFiles();
		for (var i = 0; i < myFileList.length; i++) {
			var myFile = myFileList[i];
			if (myFile instanceof Folder) {
				getScriptsInSubfolders(myFile);
			} else if (myFile instanceof File && myFile.name.match(/\.jsx$/i)) {
				myFiles.push(myFile);
			}
		}
	    return myFiles;
	}


	// eipixTools_buildUI()
	// Function for creating the user interface
	function eipixTools_buildUI(thisObj) {
		var pal = (thisObj instanceof Panel) ? thisObj : new Window("palette", eipixToolsData.scriptName, [200, 200, 600, 500], {
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
			prompt(eipixToolsData.strCurrentHash, eipixToolsData.commitHash);
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


	// main:
	// 
	if (parseFloat(app.version) < 9) {
		alert(eipixToolsData.strErrMinAE90, eipixToolsData.scriptName);
		return;
	} else if (isNetworkAccessAllowed() == false) {
		alert(eipixToolsData.strErrAccessDenied);
		return;
	} else {
		// Get local update hash
		currentVersionHash();

		// Update check
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

		// Gather scripts
		eipixToolsData.scripts = [];
		eipixToolsData.setsFolder = new Folder(eipixToolsData.scriptsPath);
		myFiles = [];
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