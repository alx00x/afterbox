// eipixTools.jsx
// 
// Name: eipixTools
// Version: 1.1
// Based on: Launch Pad.jsx script by After Effects crew
// 
// Description:
// This is a modified script originally created by Jeff Almasol.
// It provides a button launcher for scripts located in:
// \Support Files\Scripts\ScriptUI Panels\(eipixTools)
// 
// Button icons must be 30x30 PNG image or smaller.
//  
// Note: This version of the script requires After Effects CS4 
// or later.


{

	function eipixTools(thisObj) {
		var eipixToolsData = new Object();
		eipixToolsData.scriptName = "Eipix Tools";
		eipixToolsData.version = "1.1";
		eipixToolsData.scriptsPath = Folder.startup.fsName + "\\Scripts\\ScriptUI Panels\\(eipixTools)\\";
		eipixToolsData.scriptsFolderAlert = "Scripts folder was not found at the expected location.";

		eipixToolsData.strSettings = "...";
		eipixToolsData.strSettingsTip = "Settings";
		eipixToolsData.strHelp = "?";
		eipixToolsData.strHelpTip = "Help";
		eipixToolsData.settingsTitle = eipixToolsData.scriptName + " Settings";
		eipixToolsData.settingsScripts = "Scripts (listed in order of appearance):"
		eipixToolsData.strSelScriptsFolder = "Select the scripts folder to use";
		eipixToolsData.strAboutTitle = "About " + eipixToolsData.scriptName;
		eipixToolsData.strAbout = eipixToolsData.scriptName + " " + eipixToolsData.version + "\n" +
			"This script provides a button launcher for scripts located in:\n" +
			eipixToolsData.scriptsPath
			"\n";
		eipixToolsData.strRefreshPanel = "Please close and then reopen the script to refresh the panel's script buttons.";
		eipixToolsData.strErrCantLaunchScript = "Could not launch script '%s' because it no longer exists on disk."
		eipixToolsData.strErrMinAE90 = "This script requires Adobe After Effects CS4 or later.";

		eipixToolsData.btnSize = 36;


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
			if (!defBtnIconFile.exists)
				defBtnIconFile = null;

			palObj.scriptBtns = undefined;
			palObj.scriptBtns = new Array();

			// Place controls in a group container to get the panel background love
			palObj.btnGroup = palObj.add("group", [0, 0, palObj.bounds.width, palObj.bounds.height]);

			for (var i = 0; i < eipixToolsData.scripts.length; i++) {
				// If there's a corresponding .png file, use it as an iconbutton instead of a regular text button
				btnIconFile = new File(File(eipixToolsData.scripts[i]).fsName.replace(/.jsx(bin)?$/, ".png"));
				if (btnIconFile.exists)
					palObj.scriptBtns[i] = palObj.btnGroup.add("iconbutton", [leftEdge, topEdge, leftEdge + btnSize, topEdge + btnSize], btnIconFile, {
						style: "toolbutton"
					});
				else if (defBtnIconFile != null)
					palObj.scriptBtns[i] = palObj.btnGroup.add("iconbutton", [leftEdge, topEdge, leftEdge + btnSize, topEdge + btnSize], defBtnIconFile, {
						style: "toolbutton"
					});
				else
					palObj.scriptBtns[i] = palObj.btnGroup.add("button", [leftEdge, topEdge, leftEdge + btnSize, topEdge + btnSize], eipixToolsData.scripts[i].name.replace(/.jsx$/, "").replace(/%20/g, " "));
				palObj.scriptBtns[i].scriptFile = eipixToolsData.scripts[i].fsName; // Store file name with button (sneaky that JavaScript is)
				palObj.scriptBtns[i].helpTip = File(eipixToolsData.scripts[i]).name.replace(/.jsx(bin)?$/, "").replace(/%20/g, " ") + "\n\n(" + eipixToolsData.scripts[i].fsName + ")";
				palObj.scriptBtns[i].onClick = function() {
					var scriptFile = new File(this.scriptFile);
					if (scriptFile.exists) {
						scriptFile.open("r");
						var scriptContent = scriptFile.read();
						scriptFile.close();
						eval(scriptContent);
						//aftereffects.executeScript(scriptContent);
						//$.evalFile(scriptFile);
					} else
						alert(eipixToolsData.strErrCantLaunchScript.replace(/%s/, this.scriptFile.fsName), eipixToolsData.scriptName);
				}

				leftEdge += (btnSize + 5);
			}

			// Add the settings and help buttons
			var settingsBtnIconFile = new File(eipixToolsData.thisScriptsFolder.fsName + "/eipixTools_settings.png");
			if (settingsBtnIconFile.exists)
				palObj.settingsBtn = palObj.btnGroup.add("iconbutton", [leftEdge, topEdge, leftEdge + btnSize, topEdge + btnSize / 2], settingsBtnIconFile, {
					style: "toolbutton"
				});
			else
				palObj.settingsBtn = palObj.btnGroup.add("button", [leftEdge, topEdge, leftEdge + btnSize, topEdge + btnSize / 2], eipixToolsData.strSettings);
			palObj.settingsBtn.helpTip = eipixToolsData.strSettingsTip;
			palObj.settingsBtn.onClick = function() {
				// Get the scripts in the selected scripts folder
				var scriptsFolder = Folder.selectDialog(eipixToolsData.strSelScriptsFolder, Folder(eipixToolsData.scriptsFolder));
				if ((scriptsFolder != null) && scriptsFolder.exists) {
					eipixToolsData.scriptsFolder = scriptsFolder;
					// Get all scripts in the selected folder, but not this one, cuz that would be weird :-)
					eipixToolsData.scripts = scriptsFolder.getFiles(eipixTools_filterJSXFiles);

					// Remember the scripts folder for the next session
					app.settings.saveSetting("Adobe", "eipixTools_scriptsFolder", eipixToolsData.scriptsFolder.fsName);

					// Refresh the palette
					eipixTools_rebuildButtons(eipixToolsPal);
					eipixTools_doResizePanel();

					// Refreshing the panel's buttons while it's open is not working as expected right now, so it's safer to reopen the panel/palette.
					//alert(eipixToolsData.strRefreshPanel, eipixToolsData.strAboutTitle);
				}
			}

			var helpBtnIconFile = new File(eipixToolsData.thisScriptsFolder.fsName + "/help.png");
			if (helpBtnIconFile.exists)
				palObj.helpBtn = palObj.btnGroup.add("iconbutton", [leftEdge, topEdge + btnSize / 2, leftEdge + btnSize, topEdge + btnSize], helpBtnIconFile, {
					style: "toolbutton"
				});
			else
				palObj.helpBtn = palObj.btnGroup.add("button", [leftEdge, topEdge + btnSize / 2, leftEdge + btnSize, topEdge + btnSize], eipixToolsData.strHelp);
			palObj.helpBtn.helpTip = eipixToolsData.strHelpTip;
			palObj.helpBtn.onClick = function() {
				alert(eipixToolsData.strAbout, eipixToolsData.strAboutTitle);
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
		} else {
			// Keep track of this script's folder so we know where to find the icons used by the script
			eipixToolsData.thisScriptsFolder = new Folder((new File($.fileName)).path);

			// Use the last defined script folder, or ask the user for one (if not previously defined)
			eipixToolsData.scripts = new Array();
			if (app.settings.haveSetting("Adobe", "eipixTools_scriptsFolder")) {
				eipixToolsData.scriptsFolder = new Folder(app.settings.getSetting("Adobe", "eipixTools_scriptsFolder").toString());
				if ((eipixToolsData.scriptsFolder != null) && eipixToolsData.scriptsFolder.exists)
					eipixToolsData.scripts = eipixToolsData.scriptsFolder.getFiles(eipixTools_filterJSXFiles);
			} else {
				eipixToolsData.scriptsFolder = new Folder(Folder.startup.fsName + "\\Scripts\\ScriptUI Panels\\(eipixTools)\\");
				if ((eipixToolsData.scriptsFolder != null) && eipixToolsData.scriptsFolder.exists) {
					eipixToolsData.scripts = eipixToolsData.scriptsFolder.getFiles(eipixTools_filterJSXFiles);

					// Remember the scripts folder for the next session
					app.settings.saveSetting("Adobe", "eipixTools_scriptsFolder", eipixToolsData.scriptsFolder.fsName);
				} else {
					alert(eipixToolsData.scriptsFolderAlert);
					eipixToolsData.scriptsFolder = Folder.selectDialog(eipixToolsData.strSelScriptsFolder, new Folder(Folder.startup.fsName + "\\Scripts\\ScriptUI Panels\\"));
					if ((eipixToolsData.scriptsFolder != null) && eipixToolsData.scriptsFolder.exists) {
						eipixToolsData.scripts = eipixToolsData.scriptsFolder.getFiles(eipixTools_filterJSXFiles);

						// Remember the scripts folder for the next session
						app.settings.saveSetting("Adobe", "eipixTools_scriptsFolder", eipixToolsData.scriptsFolder.fsName);
					}
				}
			}

			// Build and show the UI
			var eipixToolsPal = eipixTools_buildUI(thisObj);
			if (eipixToolsPal != null) {
				if (eipixToolsPal instanceof Window) {
					// Center the palette
					eipixToolsPal.center();

					// Show the UI
					eipixToolsPal.show();
				} else
					eipixTools_doResizePanel();
			}
		}
	}


	eipixTools(this);
}