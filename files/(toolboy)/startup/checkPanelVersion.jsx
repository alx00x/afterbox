// checkPanelVersion.jsx
// 
// Name: checkPanelVersion
// Version: 1.0
// Author: Aleksandar Kocic
// 
// Description:     
// This check panel version.
//  

(function checkPanelVersion(thisObj) {

    // Define main variables
    var cpvData = new Object();
    cpvData.scriptNameShort = "CPV";
    cpvData.scriptName = "Check Panel Version";
    cpvData.scriptVersion = "1.0";
    cpvData.scriptTitle = cpvData.scriptName + " v" + cpvData.scriptVersion;

    cpvData.strUpdateToolboy = { en: "You are using an older version of toolboy panel. Please update as soon as possible!" }

    // Localize
    function checkPanelVersion_localize(strVar) {
        return strVar["en"];
    }

    // Helper functions

    // Prototype startsWith
    if (typeof String.prototype.startsWith != 'function') {
        String.prototype.startsWith = function (str) {
            return this.slice(0, str.length) == str;
        };
    }

    // Main Functions
    //
    function checkPanelVersion_main() {
        // get toolboy version from prefs file
        var currentVersion;
        if (app.settings.haveSetting("Toolboy", "Version")) {
            var currentVersion = parseFloat(app.settings.getSetting("Toolboy", "Version"));
        } else {
            var currentVersion = 0.0;
        }

        // get version from panelVersion.txt
        var latestVersion;
        var startupFolder = new Folder(Folder.appPackage.fullName + "/Scripts/ScriptUI Panels/(toolboy)/startup");
        var panelVersionFile = new File(startupFolder.fsName + "/panelVersion.txt");
        if (panelVersionFile.exists == true) {
            // read file
            var file = panelVersionFile;
            if (file && file.open("r")) {
                while (!file.eof) {
                    var line = file.readln();
                    if (line.startsWith("Version=")) {
                        var readVersion = line.split("=")[1].replace(/['"]+/g, '');
                        latestVersion = parseFloat(readVersion);
                    }
                }
            }
            file.close();
        } else {
            latestVersion = 999.9;
        }

        // compare
        if (currentVersion < latestVersion) {
            alert(checkPanelVersion_localize(cpvData.strUpdateToolboy));
        }
    }

    // Init
    //
    app.beginUndoGroup(cpvData.scriptName);
    checkPanelVersion_main();
    app.endUndoGroup();
})(this);