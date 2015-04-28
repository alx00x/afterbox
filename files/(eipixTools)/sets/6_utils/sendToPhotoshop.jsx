// sendToPhotoshop.jsx
// 
// Name: sendToPhotoshop
// Version: 0.0
// Author: Aleksandar Kocic
// 
// Description:     
// This script generates a PSD from composition for external editing and
// provides a basic interface for live updating.
// 

(function sendToPhotoshop(thisObj) {
    if (app.project.file == null) {
        alert("Save the project first.");
        return;
    }

    if (app.project.activeItem == null) {
        alert("Please, select your composition.");
        return;
    }

    // Define main variables
    var s2psData = new Object();

    s2psData.scriptNameShort = "STPS";
    s2psData.scriptName = "Send To Photoshop";
    s2psData.scriptVersion = "0.0";
    s2psData.scriptTitle = s2psData.scriptName + " v" + s2psData.scriptVersion;

    s2psData.strMinAE = {en: "This script requires Adobe After Effects CS4 or later."};
    s2psData.strActiveCompErr = {en: "Please select a composition."};

    s2psData.strHelp = {en: "?"};
    s2psData.strHelpTitle = {en: "Help"};
    s2psData.strErr = {en: "Something went wrong."};
    s2psData.strHelpText = {en: "This script generates a PSD from composition for external editing and provides a basic interface for live updating."};

    // Define project variables
    s2psData.outputQuality = "Best Settings";
    s2psData.outputTemplateVid = "Lossless";
    s2psData.outputTemplateImg = "PNG Sequence";
    s2psData.activeItem = app.project.activeItem;
    s2psData.activeItemFrames = app.project.activeItem.duration * app.project.activeItem.frameRate;
    s2psData.projectFolder = app.project.file.parent;
    s2psData.outputPath;

    // Localize
    function sendToPhotoshop_localize(strVar) {
        return strVar["en"];
    }

    // Main Functions:
    //

    function sendToPhotoshop() {
        //code
    }

    function sendToPhotoshop_main() {      
        sendToPhotoshop();
    }

    // Main code:
    //

    // Warning
    if (parseFloat(app.version) < 9.0) {
        alert(sendToPhotoshop_localize(s2psData.strMinAE));
    } else {
        sendToPhotoshop_main();
    }
})(this);