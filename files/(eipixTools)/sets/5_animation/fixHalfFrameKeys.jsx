// fixHalfFrameKeys.jsx
// 
// Name: fixHalfFrameKeys
// Version: 1.0
// Author: Aleksandar Kocic
// 
// Description:     
// Nudges keys on half-frames to full frame time.
//  

(function fixHalfFrameKeys(thisObj) {
    // Check active comp
    if (app.project.activeItem == null) {
        alert("Please, select your composition.");
        return;
    }

    // Define main variables
    var fhfkData = new Object();

    fhfkData.scriptNameShort = "FHFK";
    fhfkData.scriptName = "Fix Half-Frame Keys";
    fhfkData.scriptVersion = "1.0";
    fhfkData.scriptTitle = fhfkData.scriptName + " v" + fhfkData.scriptVersion;

    fhfkData.strMinAE = {en: "This script requires Adobe After Effects CS4 or later."};
    fhfkData.strActiveCompErr = {en: "Please select a composition."};
    fhfkData.strSelectedKeysErr = {en: "Select at least one key to be fixed."};

    fhfkData.strHelp = {en: "?"};
    fhfkData.strHelpTitle = {en: "Help"};
    fhfkData.strHelpText = {en: "Nudges keys on half-frames to full frame time."};

    // Define project variables
    fhfkData.activeItem = app.project.activeItem;

    // Localize
    function fixHalfFrameKeys_localize(strVar) {
        return strVar["en"];
    }

    // Main Functions
    //
    function fixHalfFrameKeys_main() {
        //code

        //

        //
        
        //
        
        //
        
    }

    // Init
    //
    if (parseFloat(app.version) < 11.0) {
        alert(fixHalfFrameKeys_localize(fhfkData.strMinAE));
    } else {
        app.beginUndoGroup(fhfkData.scriptName);
        fixHalfFrameKeys_main();
        app.endUndoGroup();
    }
})(this);