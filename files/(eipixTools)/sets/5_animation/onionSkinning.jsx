// onionSkinning.jsx
// 
// Name: onionSkinning
// Version: 0.1
// Author: Aleksandar Kocic
// 
// Description:     
// This script sets up a primitive onion skinning preview.
//  

(function onionSkinning(thisObj) {
    if (app.project.activeItem == null) {
        alert("Please, select your composition.");
        return;
    }

    // Define main variables
    var onsData = new Object();

    onsData.scriptNameShort = "ONS";
    onsData.scriptName = "Onion Skinning";
    onsData.scriptVersion = "0.1";
    onsData.scriptTitle = onsData.scriptName + " v" + onsData.scriptVersion;

    onsData.strMinAE = {en: "This script requires Adobe After Effects CS4 or later."};
    onsData.strActiveCompErr = {en: "Please select a composition."};

    onsData.strSetup = {en: "Setup"};
    onsData.strCleanUp = {en: "Clean Up"};
    onsData.strGetLayers = {en: "Select Background Layers"};
    onsData.strWarning = {en: "Warning: Selecting no background layers may result in unusable setup. Do you wish to proceed?"};

    onsData.strHelp = {en: "?"};
    onsData.strHelpTitle = {en: "Help"};
    onsData.strErr = {en: "Something went wrong."};
    onsData.strHelpText = {en: "This script sets up a primitive onion skinning preview."};

    // Define project variables
    onsData.activeItem = app.project.activeItem;

    // Localize
    function onionSkinning_localize(strVar) {
        return strVar["en"];
    }

    // Build UI
    function onionSkinning_buildUI(thisObj) {
        var pal = new Window("palette", onsData.scriptName, undefined, {resizeable:true});
        if (pal !== null) {
            var res =
                "group { \
                    orientation:'column', alignment:['fill','fill'], \
                    header: Group { \
                        alignment:['fill','top'], \
                        title: StaticText { text:'" + onsData.scriptNameShort + " v" + onsData.scriptVersion + "', alignment:['fill','center'] }, \
                        help: Button { text:'" + onionSkinning_localize(onsData.strHelp) + "', maximumSize:[30,20], alignment:['right','center'] }, \
                    }, \
                    glBtn: Button { text:'" + onionSkinning_localize(onsData.strGetLayers) + "', minimumSize:[200,20] }, \
                    lst: Group { \
                        orientation:'row', alignment:['left','fill'], \
                        dispElemList: ListBox { alignment:['fill','fill'], size:[200,120], properties:{numberOfColumns:2, showHeaders:true, columnTitles: ['#', 'Name'], columnWidths:[20,177]} }, \
                    }, \
                    sepr: Group { \
                        orientation:'row', alignment:['fill','top'], \
                        rule: Panel { height: 2, alignment:['fill','center'] }, \
                    }, \
                    suBtn: Button { text:'" + onionSkinning_localize(onsData.strSetup) + "', minimumSize:[200,20] }, \
                    cuBtn: Button { text:'" + onionSkinning_localize(onsData.strCleanUp) + "', minimumSize:[200,20] }, \
                }, \
            }";
            pal.grp = pal.add(res);

            pal.layout.layout(true);
            pal.grp.minimumSize = pal.grp.size;
            pal.layout.resize();
            pal.onResizing = pal.onResize = function() {
                this.layout.resize();
            }

            pal.grp.header.help.onClick = function() {
                alert(onsData.scriptTitle + "\n" + onionSkinning_localize(onsData.strHelpText), onionSkinning_localize(onsData.strHelpTitle));
            }

            pal.grp.glBtn.onClick = onionSkinning_doGetLayers;
            pal.grp.suBtn.onClick = onionSkinning_doSetup;
            pal.grp.cuBtn.onClick = onionSkinning_doCleanUp;

            pal.grp.cuBtn.onContextmenu = onionSkinning_doStuff;
        }

        return pal;
    }

    //Get background layers
    function onionSkinning_doStuff() {
        alert("why hello there");
    }

    // Main Functions:
    //
    function onionSkinning_main() {
    }

    // Button Functions:
    //

    //Get background layers
    function onionSkinning_doGetLayers() {
        //code
    }

    // Setup
    function onionSkinning_doSetup() {
        //code
    }

    // Cleanup
    function onionSkinning_doCleanUp() {
        //code
    }

    // Main code:
    //

    // Warning
    if (parseFloat(app.version) < 9.0) {
        alert(onionSkinning_localize(onsData.strMinAE));
    } else {
        // Build and show the floating palette
        var onsPal = onionSkinning_buildUI(thisObj);
        if (onsPal !== null) {
            if (onsPal instanceof Window) {
                // Show the palette
                onsPal.center();
                onsPal.show();
            } else {
                onsPal.layout.layout(true);
            }
        }
    }
})(this);