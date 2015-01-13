// onionSkinning.jsx
// 
// Name: onionSkinning
// Version: 0.2
// Author: Aleksandar Kocic
// 
// Description:     
// This script sets up a primitive onion skinning preview.
//  

(function onionSkinning(thisObj) {
    // Check active comp
    if (app.project.activeItem == null) {
        alert("Please, select your composition.");
        return;
    }

    // Define main variables
    var onsData = new Object();

    onsData.scriptNameShort = "ONS";
    onsData.scriptName = "Onion Skinning";
    onsData.scriptVersion = "0.2";
    onsData.scriptTitle = onsData.scriptName + " v" + onsData.scriptVersion;

    onsData.strMinAE = {en: "This script requires Adobe After Effects CS6 or later."};
    onsData.strActiveCompErr = {en: "Please select a composition."};
    onsData.strMargine = {en: "Margine"};
    onsData.strBefore = {en: "Before"};
    onsData.strAfter = {en: "After"};

    onsData.strHelp = {en: "?"};
    onsData.strHelpTitle = {en: "Help"};
    onsData.strHelpText = {en: "This script sets up a primitive onion skinning preview."};

    // Define project variables
    onsData.activeItem = app.project.activeItem;

    // Localize
    function onionSkinning_localize(strVar) {
        return strVar["en"];
    }

    // Main Functions
    //
    function onionSkinning_main() {
        //add adjustment layer
        //move to top
        //add slider
        //add echo one
        //add echo two
    }

    // Init
    //
    if (parseFloat(app.version) < 11.0) {
        alert(onionSkinning_localize(onsData.strMinAE));
    } else {
        app.beginUndoGroup(onsData.scriptName);
        onionSkinning_main();
        app.endUndoGroup();
    }
})(this);