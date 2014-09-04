// shotNumbering.jsx
// 
// Name: shotNumbering
// Version: 1.2
// Author: Aleksandar Kocic
// 
// Description:     
// Generates text layer for each marker and numbers them in order.
// 


(function shotNumbering(thisObj) {

    if (app.project.file == null) {
        alert("Save the project first.");
        return;
    }

    if (!(app.project.activeItem instanceof CompItem) || (app.project.activeItem == null)) {
        alert("Select your composition.");
        return;
    }

    // Define main variables
    var shnData = new Object();

    shnData.scriptNameShort = "SHN";
    shnData.scriptName = "Shot Numbering";
    shnData.scriptVersion = "1.2";
    shnData.scriptTitle = shnData.scriptName + " v" + shnData.scriptVersion;

    shnData.strMinAE = {en: "This script requires Adobe After Effects CS4 or later."};
    shnData.strActiveCompErr = {en: "Please select a composition."};
    shnData.strNoMarkersErr = {en: "Composition needs to have at least two markers."};
    shnData.strNoMetadataErr = {en: "Could not find metadata file, do you wish to locate it manually?"};
    shnData.strInstructions = {en: "This script will create a layer called \"Markers\". Use it to mark the beggining of each shot. Numbers are incremented by 10 as naming convention rule."};
    shnData.strGenerateShotNumbers = {en: "  Generate shot numbers"};
    shnData.strGenerateMetaData = {en: "  Generate metadata"};

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
                        stt: StaticText { text:'" + shotNumbering_localize(shnData.strInstructions) + "', alignment:['left','fill'], preferredSize:[-1,-1], properties:{multiline:true} }, \
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

    function shotNumbering_checkMetadata() {
        shnData.metadataFile = new File(shnData.projectFolder + "\\" + "metadata.xml");
        if (shnData.metadataFile.exists == false) {
            shnData.metadataCheck = false;
            var locateManually = confirm(shotNumbering_localize(shnData.strNoMetadataErr));
            if (locateManually == true) {
                shnData.metadataFile = File.openDialog("Find the metadata file","");
                if (shnData.metadataFile != null) {
                    shnData.metadataCheck = true;
                }
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
        var activeItem = app.project.activeItem;
        var activeItemName = activeItem.name;
        var activeItemWidth = activeItem.width;
        var activeItemHeight = activeItem.height;
        var activeItemPixelAspect = activeItem.pixelAspect;
        var activeItemDuration = activeItem.duration;

        // Generate black bars
        if ((shnPal.grp.settings.opts.box1.value == true) || (shnPal.grp.settings.opts.box2.value == true)) {
            var newSolid = activeItem.layers.addSolid([0, 0, 0], "Black Bars", activeItemWidth, activeItemHeight, activeItemPixelAspect, activeItemDuration);
            newSolid.label = 0;
            newSolid.opacity.setValue(20);
            var newMask = newSolid.Masks.addProperty("ADBE Mask Atom");
            newMask.maskMode = MaskMode.SUBTRACT;
            var maskShape = newMask.property("ADBE Mask Shape").value;
            maskShape.vertices = [[0,activeItemHeight/10],[0,activeItemHeight/10*9],[activeItemWidth,activeItemHeight/10*9],[activeItemWidth,activeItemHeight/10]];
            maskShape.closed = true;
            newMask.property("ADBE Mask Shape").setValue(maskShape);
            newSolid.locked = true;
        }

        // Generate metadata
        if ((shnPal.grp.settings.opts.box2.value == true) && (shnData.metadataCheck == true)) {
            shnData.metadataFile.open("r");
            var xmlString = shnData.metadataFile.read();
            var xmlData = new XML(xmlString);
            shnData.metadataFile.close();
            var gameName = xmlData.data.(@category == "main").game;
            var taskName = xmlData.data.(@category == "main").task;
            //var taskWidth = xmlData.data.(@category == "main").width;
            //var taskHeight = xmlData.data.(@category == "main").height;

            // gamename and taskname
            var gameNameText = activeItem.layers.addText(gameName + "_" + taskName);
            gameNameText.label = 0;
            gameNameText.opacity.setValue(40);
            var gameNameTextValue = gameNameText.sourceText.value;
            gameNameTextValue.resetCharStyle();
            gameNameTextValue.resetParagraphStyle()
            gameNameTextValue.justification = ParagraphJustification.LEFT_JUSTIFY;
            gameNameTextValue.fontSize = activeItemHeight/16;
            gameNameTextValue.fillColor = [1, 1, 1];
            gameNameTextValue.font = "Consolas";
            gameNameText.sourceText.setValue(gameNameTextValue);
            gameNameText.transform.anchorPoint.setValue([0,0]);
            gameNameText.position.setValue([5,(activeItemHeight/100*5)+(activeItemHeight/16/3.2)]);
            gameNameText.name = "Game Name";
            gameNameText.locked = true;
        }

        if (shnPal.grp.settings.opts.box2.value == true) {
            // timecode
            var timeCodeText = activeItem.layers.addText("0:00:00:00");
            timeCodeText.label = 0;
            timeCodeText.opacity.setValue(40);
            var timeCodeTextValue = timeCodeText.sourceText.value;
            timeCodeTextValue.resetCharStyle();
            timeCodeTextValue.resetParagraphStyle()
            timeCodeTextValue.justification = ParagraphJustification.RIGHT_JUSTIFY;
            timeCodeTextValue.fontSize = activeItemHeight/16;
            timeCodeTextValue.fillColor = [1, 1, 1];
            timeCodeTextValue.font = "Consolas";
            timeCodeText.sourceText.setValue(timeCodeTextValue);
            timeCodeText.transform.anchorPoint.setValue([0,0]);
            timeCodeText.position.setValue([activeItemWidth-5,(activeItemHeight/100*5)+(activeItemHeight/16/3.2)]);
            timeCodeText.name = "Time Code";
            var timeCodeExp = "timeToTimecode(t = time + thisComp.displayStartTime, timecodeBase = "+ activeItem.frameRate+", isDuration = true)";
            timeCodeText.property("Source Text").expression = timeCodeExp;
            timeCodeText.locked = true;

            // framecode
            var frameCodeText = activeItem.layers.addText("0");
            frameCodeText.label = 0;
            frameCodeText.opacity.setValue(40);
            var frameCodeTextValue = frameCodeText.sourceText.value;
            frameCodeTextValue.resetCharStyle();
            frameCodeTextValue.resetParagraphStyle()
            frameCodeTextValue.justification = ParagraphJustification.RIGHT_JUSTIFY;
            frameCodeTextValue.fontSize = activeItemHeight/16;
            frameCodeTextValue.fillColor = [1, 1, 1];
            frameCodeTextValue.font = "Consolas";
            frameCodeText.sourceText.setValue(frameCodeTextValue);
            frameCodeText.transform.anchorPoint.setValue([0,0]);
            frameCodeText.position.setValue([activeItemWidth-5,(activeItemHeight/100*95)+(activeItemHeight/16/3.2)]);
            frameCodeText.name = "Frame Code";
            var frameCodeExp = "time * "+ activeItem.frameRate;
            frameCodeText.property("Source Text").expression = frameCodeExp;
            frameCodeText.locked = true;
        }

        // Generate shot numbers
        if (shnPal.grp.settings.opts.box1.value == true) {
            // shot number
            //var shotNumberNull = activeItem.layers.addNull(activeItemDuration);
            var shotNumberSolid = activeItem.layers.addSolid([1, 1, 1], "Markers", activeItemWidth, activeItemHeight, activeItemPixelAspect, activeItemDuration);
            shotNumberSolid.enabled = false;
            var shotNumberText = activeItem.layers.addText("sh000");
            shotNumberText.label = 0;
            shotNumberText.opacity.setValue(40);
            var shotNumberTextValue = shotNumberText.sourceText.value;
            shotNumberTextValue.resetCharStyle();
            shotNumberTextValue.resetParagraphStyle()
            shotNumberTextValue.justification = ParagraphJustification.LEFT_JUSTIFY;
            shotNumberTextValue.fontSize = activeItemHeight/16;
            shotNumberTextValue.fillColor = [1, 1, 1];
            shotNumberTextValue.font = "Consolas";
            shotNumberText.sourceText.setValue(shotNumberTextValue);
            shotNumberText.transform.anchorPoint.setValue([0,0]);
            shotNumberText.position.setValue([5,(activeItemHeight/100*95)+(activeItemHeight/16/3.2)]);
            shotNumberText.name = "Shot Number";
            var shotNumberTextExp = "m = thisComp.layer('Markers').marker;\rn = 0;\rif (m.numKeys > 0) {\r    ind = m.nearestKey(time).index;\r    if (m.nearestKey(time).time > time) {\r        ind--;\r    }\r    ind = ind<1 ? 1 : ind;\r    n = m.key(ind).index;\r}\rshot = 'sh???';\rif (n < 10) {\r    shot = 'sh0' + n + '0';\r} else {\r    shot = 'sh' + n + '0';\r}\r";
            shotNumberText.property("Source Text").expression = shotNumberTextExp;
            shotNumberSolid.moveToBeginning();
            while (activeItem.selectedLayers.length) activeItem.selectedLayers[0].selected = false;
            shotNumberSolid.selected = true;
            shotNumberText.locked = true;
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