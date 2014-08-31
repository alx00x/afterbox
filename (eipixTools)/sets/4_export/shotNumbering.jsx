// shotNumbering.jsx
// 
// Name: shotNumbering
// Version: 1.0
// Author: Aleksandar Kocic
// 
// Description:     
// Generates text layer for each marker and numbers them in order.
// 


(function shotNumbering(thisObj) {

    // Define main variables
    var shnData = new Object();

    shnData.scriptNameShort = "SHN";
    shnData.scriptName = "Shot Numbering";
    shnData.scriptVersion = "1.0";
    shnData.scriptTitle = shnData.scriptName + " v" + shnData.scriptVersion;

    shnData.strMinAE = {en: "This script requires Adobe After Effects CS4 or later."};
    shnData.strActiveCompErr = {en: "Please select a composition."};
    shnData.strNoMarkersErr = {en: "Composition needs to have at least two markers."};
    shnData.strNoMetadataErr = {en: "Could not find metadata file, do you wish to locate it manually?"};
    shnData.strInstructions = {en: "Maximum number of shots per sequence is 99. Numbers are incremented by 10 as naming convention rule."};
    shnData.strGenerateShotNumbers = {en: "    Generate shot numbers"};
    shnData.strGenerateMetaData = {en: "    Generate metadata"};

    shnData.strSettings = {en: "Settings"};
    shnData.strQuestion = {en: "Do you wish to proceed?"};
    shnData.strExecute = {en: "Yes"};
    shnData.strCancel = {en: "No"};

    shnData.strHelp = {en: "?"};
    shnData.strHelpTitle = {en: "Help"};
    shnData.strHelpText = {en: "Generates text layer for each marker and numbers them in order."};

    // Define global variables
    shnData.projectName = app.project.file.name;
    shnData.projectNameNoExt = shnData.projectName.replace(".aepx", "").replace(".aep", "");
    shnData.projectFile = app.project.file.fsName;
    shnData.projectFolder = shnData.projectFile.replace(shnData.projectName, "");
    shnData.activeItem = app.project.activeItem;

    shnData.markerCheck = false;
    shnData.metadataCheck = false;
    shnData.metadataFile;


    // Localize
    function shotNumbering_localize(strVar) {
        return strVar["en"];
    }

    // Build UI
    function shotNumbering_buildUI(thisObj) {
        var pal = new Window("dialog", shnData.scriptName, undefined, {resizeable:false});
        if (pal !== null) {
            var res =
                "group { \
                    orientation:'column', alignment:['fill','fill'], \
                    header: Group { \
                        alignment:['fill','top'], \
                        title: StaticText { text:'" + shnData.scriptNameShort + "', alignment:['fill','center'] }, \
                        help: Button { text:'" + shotNumbering_localize(shnData.strHelp) + "', maximumSize:[30,20], alignment:['right','center'] }, \
                    }, \
                    sepr: Group { \
                        orientation:'row', alignment:['fill','top'], \
                        rule: Panel { height: 2, alignment:['fill','center'] }, \
                    }, \
                    inst: Group { \
                        alignment:['fill','top'], \
                        stt: StaticText { text:'" + shotNumbering_localize(shnData.strInstructions) + "', alignment:['left','fill'], preferredSize:[-1,40], properties:{multiline:true} }, \
                    }, \
                    settings: Panel { \
                        alignment:['fill','top'], \
                        text: '" + shotNumbering_localize(shnData.strSettings) + "', alignment:['fill','top'] \
                        opts: Group { \
                            orientation:'column', alignment:['fill','top'], \
                            box1: Checkbox { text:'" + shotNumbering_localize(shnData.strGenerateShotNumbers) + "', alignment:['fill','top'] }, \
                            box2: Checkbox { text:'" + shotNumbering_localize(shnData.strGenerateMetaData) + "', alignment:['fill','top'] }, \
                        }, \
                    }, \
                    ques: Group { \
                        alignment:['fill','top'], \
                        stt: StaticText { text:'" + shotNumbering_localize(shnData.strQuestion) + "', alignment:['left','fill'], preferredSize:[-1,20] }, \
                    }, \
                    cmds: Group { \
                        alignment:['fill','top'], \
                        executeBtn: Button { text:'" + shotNumbering_localize(shnData.strExecute) + "', alignment:['center','bottom'], preferredSize:[-1,20] }, \
                        cancelBtn: Button { text:'" + shotNumbering_localize(shnData.strCancel) + "', alignment:['center','bottom'], preferredSize:[-1,20] }, \
                    }, \
                }, \
            }";
            pal.grp = pal.add(res);

            pal.layout.layout(true);
            pal.grp.minimumSize = pal.grp.size;

            pal.grp.header.help.onClick = function() {
                alert(shnData.scriptTitle + "\n" + shotNumbering_localize(shnData.strHelpText), shotNumbering_localize(shnData.strHelpTitle));
            }

            pal.grp.settings.opts.box1.value = false;
            pal.grp.settings.opts.box2.value = false;

            pal.grp.settings.opts.box1.onClick = function() {
                if (pal.grp.settings.opts.box1.value == true){
                    shotNumbering_checkMarkers();
                }
            }

            pal.grp.settings.opts.box2.onClick = function() {
                if (pal.grp.settings.opts.box2.value == true){
                    shotNumbering_checkMetadata();
                }
            }

            pal.grp.cmds.executeBtn.onClick = shotNumbering_doExecute;
            pal.grp.cmds.cancelBtn.onClick = shotNumbering_doCancel;
        }

        return pal;
    }

    // Helper Functions:
    //
    function shotNumbering_checkMarkers() {
        var markerNull = shnData.activeItem.layers.addNull(shnData.activeItem.duration);
        var markerPos = markerNull.property("ADBE Transform Group").property("ADBE Position");
        markerPos.expression = "x = thisComp.marker.numKeys;[x,0];";
        var numberOfMarkers = markerPos.value[0];
        markerNull.remove();
        if (numberOfMarkers < 2) {
            shnData.markerCheck = false;
            alert(shotNumbering_localize(shnData.strNoMarkersErr), shnData.projectNameNoExt);
        } else {
            shnData.markerCheck = true;
        }
    }

    function shotNumbering_checkMetadata() {
        shnData.metadataFile = new File(shnData.projectFolder + "\\" + "metadata.xml");
        if (shnData.metadataFile.exists == false) {
            shnData.metadataCheck = false;
            var locateManually = confirm(shotNumbering_localize(shnData.strNoMetadataErr));
            if (locateManually == true) {
                shnData.metadataFile = File.openDialog("Find the metadata file","");
            } else {
                return;
            }
        } else {
            shnData.metadataCheck = true;
        }
    }

    // Main Functions:
    //
    function shotNumbering_main() {

        var activeItemName = app.project.activeItem.name;
        var activeItemWidth = shnData.activeItem.width;
        var activeItemHeight = shnData.activeItem.height;

        // Generate black bars
        if ((shnPal.grp.settings.opts.box1.value == true) || (shnPal.grp.settings.opts.box2.value == true)) {
            //code
        }

        // Generate shot numbers
        if ((shnPal.grp.settings.opts.box1.value == true) && (shnData.markerCheck == true)) {
            //code
        }

        // Generate metadata
        if ((shnPal.grp.settings.opts.box2.value == true) && (shnData.metadataCheck == true)) {
            //code
        }
    }

    // Execute
    function shotNumbering_doExecute() {
        app.beginUndoGroup(shnData.scriptName);
        shotNumbering_main()
        app.endUndoGroup();
        shnPal.close();
    }

    function shotNumbering_doCancel() {
        shnPal.close();
    }

    // Main code:
    //

    // Warning
    if (parseFloat(app.version) < 9.0) {
        alert(shotNumbering_localize(shnData.strMinAE));
    } else if (!(shnData.activeItem instanceof CompItem) || (shnData.activeItem == null)) {
        alert(shotNumbering_localize(shnData.strActiveCompErr));
    } else {
        // Build and show the floating palette
        var shnPal = shotNumbering_buildUI(thisObj);
        if (shnPal !== null) {
            if (shnPal instanceof Window) {
                // Show the palette
                shnPal.center();
                shnPal.show();
            } else {
                shnPal.layout.layout(true);
            }
        }
    }
})(this);