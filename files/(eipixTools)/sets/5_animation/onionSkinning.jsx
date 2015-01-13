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

    onsData.strMinAE = {en: "This script requires Adobe After Effects CS6 or later."};
    onsData.strActiveCompErr = {en: "Please select a composition."};
    onsData.strMargine = {en: "Margine"};
    onsData.strSetup = {en: "Setup"};
    onsData.strCleanUp = {en: "Clean Up"};
    onsData.strGetLayers = {en: "Select Background Layers"};
    onsData.strWarning = {en: "Warning: Selecting no background layers may result in unusable setup. Do you wish to proceed?"};
    onsData.strChangedActiveError = {en: "Error: Active composition has changed!"};

    onsData.strHelp = {en: "?"};
    onsData.strHelpTitle = {en: "Help"};
    onsData.strErr = {en: "Something went wrong."};
    onsData.strHelpText = {en: "This script sets up a primitive onion skinning preview."};

    // Define project variables
    onsData.activeItem = app.project.activeItem;
    onsData.activeItemID = app.project.activeItem.id;

    // Localize
    function onionSkinning_localize(strVar) {
        return strVar["en"];
    }

    // Build UI
    function onionSkinning_buildUI(thisObj) {
        var pal = new Window("palette", onsData.scriptName, undefined, {resizeable:false});
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
                    sel: Group { \
                        orientation:'row', alignment:['left','fill'], \
                        lst: ListBox { alignment:['fill','fill'], size:[200,120], properties:{numberOfColumns:2, showHeaders:true, columnTitles: ['#', 'Name'], columnWidths:[20,177]} }, \
                    }, \
                    mar: Panel { \
                        alignment:['fill','top'], \
                        text: '', alignment:['fill','top'], \
                        sld: Slider { value:4, minvalue:1, maxvalue:25, alignment:['fill','center'], preferredSize:[-1,20] }, \
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

            pal.grp.mar.text = onionSkinning_localize(onsData.strMargine) + ": " + "4";

            //Margine slider change
            pal.grp.mar.sld.onChange = pal.grp.mar.sld.onChanging = function() {
                var value = parseInt(this.value);
                this.value = value;
                this.parent.text = onionSkinning_localize(onsData.strMargine) + ": " + value.toString();
            }

            pal.grp.header.help.onClick = function() {
                alert(onsData.scriptTitle + "\n" + onionSkinning_localize(onsData.strHelpText), onionSkinning_localize(onsData.strHelpTitle));
            }

            pal.grp.glBtn.onClick = onionSkinning_doGetLayers;
            pal.grp.suBtn.onClick = function() {
                onionSkinning_doSetup();
                pal.grp.glBtn.enabled = false;
                pal.grp.sel.enabled = false;
                pal.grp.suBtn.enabled = false;
            }
            pal.grp.cuBtn.onClick = onionSkinning_doCleanUp;
        }

        return pal;
    }

    // Main Functions:
    //
    function onionSkinning_main() {
        //code
    }

    // Button Functions:
    //

    //Get background layers
    function onionSkinning_doGetLayers() {
        //check if active comp changed
        if (app.project.activeItem.id == onsData.activeItemID) {
            //get selected layers
            var selectedLayers = onsData.activeItem.selectedLayers;
            //add selected to list
            for (var i = 0; i < selectedLayers.length; i++) {
                var lstItem = onsPal.grp.sel.lst.add("item", i + 1);
                lstItem.subItems[0].text = selectedLayers[i].name;
            }
        } else {
            alert(onionSkinning_localize(onsData.strChangedActiveError));
        }
    }

    // Set margine
    function onionSkinning_setMargine() {
        //code
    }

    // Setup
    function onionSkinning_doSetup() {
        alert("hello");
        //check if active comp changed
        //set backgorund layers to guide
        //create onion skinning composition
        //put active comp in onion skinning comp
        //duplicate first layer and turn off visibility
        //add new solid
        //add set channels to new solid and set duplicated as source
        //precomp solid and sourse layer
        //duplicate precomp
        //move duplicated to bottom
        //offset top startTime backward
        //offset bottom startTime forward
    }

    // Cleanup
    function onionSkinning_doCleanUp() {
        //delete onion skinning comp
        //set all background layers back to non guide
        //close the panel
        onsPal.close();
    }

    // Main code:
    //

    // Warning
    if (parseFloat(app.version) < 11.0) {
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