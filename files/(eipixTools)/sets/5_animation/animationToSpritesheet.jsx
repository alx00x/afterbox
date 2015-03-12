// animationToSpritesheet.jsx
// 
// Name: animationToSpritesheet
// Version: 1.4
// Author: Aleksandar Kocic
// 
// Description: Turns animation to sprite tiled sheets.
// 
// 

(function animationToSpritesheet(thisObj) {
    if (app.project.file == null) {
        alert("Save the project first.");
        return;
    }

    if (app.project.activeItem == null) {
        alert("Please, select your composition.");
        return;
    }

    // Define main variables
    var a2sData = new Object();

    a2sData.scriptNameShort = "ATS";
    a2sData.scriptName = "Animation To Spritesheet";
    a2sData.scriptVersion = "1.4";
    a2sData.scriptTitle = a2sData.scriptName + " v" + a2sData.scriptVersion;

    a2sData.strMinAE = {en: "This script requires Adobe After Effects CS4 or later."};
    a2sData.strActiveCompErr = {en: "Please select a composition."};
    a2sData.strExecute = {en: "Execute"};
    a2sData.strCancel = {en: "Cancel"};

    a2sData.strExportTo = {en: "Export To"};
    a2sData.strBrowse = {en: "Browse"};
    a2sData.strBrowseText = {en: "Save Spritesheet to:"};

    a2sData.strOptions = {en: "Options"};
    a2sData.strColumns = {en: "Columns"};
    a2sData.strRows = {en: "Rows"};
    a2sData.strRowsInfo = {en: "(this value is calculated automaticaly)"};

    a2sData.strWarning = {en: "Warning: Enabling this options for big and lengthy compositions could significantly increase the execution time. Using less than 10 samples is not recommended"};
    a2sData.strPNGWarning = {en: "Warning: Could not find \"PNG Sequence\" output template. It is highly recommended to either make a template by that name or import it by pressing [IMP REND] button under eipixTools panel. Exporting as PSD for now."};
    a2sData.strSpreadsheetErr = {en: "You need to specify output first."};
    a2sData.strOutputErr = {en: "Output is not valid."};
    a2sData.strColumnsErr = {en: "Cannot pack sprites at requested number of rows and columns. Try again."};
    a2sData.strTooLongErr = {en: "Your composition is too long. Cannot run the script."};
    a2sData.strFramerateErr = {en: "Your composition framerate is not 25fps. Do you wish to continue?"};

    a2sData.strCrop = {en: "Crop to Edges"};
    a2sData.strSamples = {en: "Samples"};

    a2sData.strHelp = {en: "?"};
    a2sData.strHelpTitle = {en: "Help"};
    a2sData.strErr = {en: "Something went wrong."};
    a2sData.strHelpText = {en: "This script turns animation to sprite tiled sheets."};

    // Define project variables
    a2sData.activeItem = app.project.activeItem;
    a2sData.activeItemFrames = app.project.activeItem.duration * app.project.activeItem.frameRate;
    a2sData.projectFolder = app.project.file.parent;
    a2sData.spritesheetFile;

    // Comp lenght check
    if (a2sData.activeItemFrames > 250) {
        alert(animationToSpritesheet_localize(a2sData.strTooLongErr));
        return;
    }

    // Comp framerate check
    if (app.project.activeItem.frameRate != 25) {
        var fpscheck = confirm(animationToSpritesheet_localize(a2sData.strFramerateErr));
        if (fpscheck == false) {
            return;
        }
    }

    // Localize
    function animationToSpritesheet_localize(strVar) {
        return strVar["en"];
    }

    // Calculate sugested number of columns and rows
    function animationToSpritesheet_factorisation(numOfFrames) {
        var value0 = Math.floor(Math.sqrt(numOfFrames));
        while (numOfFrames % value0 != 0) {
            value0 -= 1;
        }
        var value1 = numOfFrames / value0;
        var arr = [value0, value1];
        return arr;
    }

    // Calculate first divisible by 16
    function animationToSpritesheet_factorisation16(inputValue) {
        var valueDiv = 16;
        while (inputValue % valueDiv != 0) {
            inputValue += 1;
        }
        var value = inputValue;
        return value;
    }

    // Calculate first divisible by 4
    function animationToSpritesheet_factorisation4(inputValue) {
        var valueDiv = 4;
        while (inputValue % valueDiv != 0) {
            inputValue += 1;
        }
        var value = inputValue;
        return value;
    }

    var suggestedAtStart = animationToSpritesheet_factorisation(Math.round(a2sData.activeItemFrames));

    // Build UI
    function animationToSpritesheet_buildUI(thisObj) {
        var pal = new Window("dialog", a2sData.scriptName, undefined, {resizeable:true});
        if (pal !== null) {
            var res =
                "group { \
                    orientation:'column', alignment:['fill','fill'], \
                    header: Group { \
                        alignment:['fill','top'], \
                        title: StaticText { text:'" + a2sData.scriptNameShort + " v" + a2sData.scriptVersion + "', alignment:['fill','center'] }, \
                        help: Button { text:'" + animationToSpritesheet_localize(a2sData.strHelp) + "', maximumSize:[30,20], alignment:['right','center'] }, \
                    }, \
                    options: Panel { \
                        alignment:['fill','top'], \
                        text: '" + animationToSpritesheet_localize(a2sData.strOptions) + "', alignment:['fill','top'], \
                        crp: Group { \
                            alignment:['left','center'], \
                            text: StaticText { text:'0 / 0', characters: 7, justify: 'center', alignment:['left','center'], preferredSize:[-1,20] }, \
                            loader: Progressbar { text:'Progressbar', minvalue:0, maxvalue:100, preferredSize:[260,5]},\
                            box1: Checkbox { text:'" + animationToSpritesheet_localize(a2sData.strCrop) + "' }, \
                        }, \
                        sam: Group { \
                            alignment:['fill','top'], \
                            text: StaticText { text:'" + animationToSpritesheet_localize(a2sData.strSamples) + ":', preferredSize:[120,20] }, \
                            fld: EditText { text:'10', characters: 3, justify: 'center', alignment:['left','center'], preferredSize:[-1,20] }, \
                            sld: Slider { value:10, minvalue:1, maxvalue:20, alignment:['fill','center'], preferredSize:[200,20] }, \
                        }, \
                        ver: Group { \
                            alignment:['fill','top'], \
                            text: StaticText { text:'" + animationToSpritesheet_localize(a2sData.strColumns) + ":', preferredSize:[120,20] }, \
                            fld: EditText { text:'1', characters: 3, justify: 'center', alignment:['left','center'], preferredSize:[-1,20] }, \
                            sld: Slider { value:1, minvalue:1, maxvalue:32, alignment:['fill','center'], preferredSize:[200,20] }, \
                        }, \
                        hor: Group { \
                            alignment:['fill','top'], \
                            text: StaticText { text:'" + animationToSpritesheet_localize(a2sData.strRows) + ":', preferredSize:[120,20] }, \
                            fld: EditText { text:'1', characters: 3, justify: 'center', alignment:['left','center'], preferredSize:[-1,20] }, \
                            info: StaticText { text:'" + animationToSpritesheet_localize(a2sData.strRowsInfo) + "', preferredSize:[200,20] }, \
                        }, \
                    }, \
                    spritesheet: Panel { \
                        alignment:['fill','top'], \
                        text: '" + animationToSpritesheet_localize(a2sData.strExportTo) + "', alignment:['fill','top'], \
                        select: Group { \
                            alignment:['fill','top'], \
                            fld: EditText { alignment:['fill','center'], preferredSize:[250,20] },  \
                            btn: Button { text:'" + animationToSpritesheet_localize(a2sData.strBrowse) + "', preferredSize:[-1,20] }, \
                        }, \
                    }, \
                    sepr: Group { \
                        orientation:'row', alignment:['fill','top'], \
                        rule: Panel { height: 2, alignment:['fill','center'] }, \
                    }, \
                    cmds: Group { \
                        alignment:['fill','top'], \
                        executeBtn: Button { text:'" + animationToSpritesheet_localize(a2sData.strExecute) + "', alignment:['center','bottom'], preferredSize:[-1,20] }, \
                        cancelBtn: Button { text:'" + animationToSpritesheet_localize(a2sData.strCancel) + "', alignment:['center','bottom'], preferredSize:[-1,20] }, \
                    }, \
                }, \
            }";
            pal.grp = pal.add(res);

            pal.layout.layout(true);
            pal.grp.minimumSize = pal.grp.size;
            pal.layout.resize();
            pal.onResizing = pal.onResize = function() {
                this.layout.resize();
            }

            pal.grp.spritesheet.select.btn.onClick = function() {
                animationToSpritesheet_doBrowse();
            }

            //Samples slider change
            pal.grp.options.sam.fld.onChange = function() {
                var value = parseInt(this.text);
                if (isNaN(value)) {
                    value = this.parent.sld.value;
                } else if (value < this.parent.sld.minvalue) {
                    value = this.parent.sld.minvalue;
                } else if (value > this.parent.sld.maxvalue) {
                    value = this.parent.sld.maxvalue;
                }
                this.text = value.toString();
                this.parent.sld.value = value;
            }
            pal.grp.options.sam.sld.onChange = pal.grp.options.sam.sld.onChanging = function() {
                var value = parseInt(this.value);
                if (isNaN(value)) {
                    value = parseInt(this.parent.fld.text);
                }
                this.value = value;
                this.parent.fld.text = value.toString();
            }

            pal.grp.options.crp.box1.value = false;
            pal.grp.options.crp.text.visible = false;
            pal.grp.options.crp.text.enabled = false;
            pal.grp.options.crp.loader.visible = false;
            pal.grp.options.sam.text.enabled = false;
            pal.grp.options.sam.fld.enabled = false;
            pal.grp.options.sam.sld.enabled = false;
            var warningShow = true;

            pal.grp.options.crp.box1.onClick = function() {
                if (pal.grp.options.crp.box1.value == true) {
                    pal.grp.options.sam.text.enabled = true;
                    pal.grp.options.sam.fld.enabled = true;
                    pal.grp.options.sam.sld.enabled = true;
                    pal.grp.options.crp.text.visible = true;
                    pal.grp.options.crp.loader.visible = true;
                    if (warningShow == true) {
                        alert(animationToSpritesheet_localize(a2sData.strWarning));
                        warningShow = false;
                    }
                } else {
                    pal.grp.options.sam.text.enabled = false;
                    pal.grp.options.sam.fld.enabled = false;
                    pal.grp.options.sam.sld.enabled = false;
                    pal.grp.options.crp.text.visible = false;
                    pal.grp.options.crp.loader.visible = false;
                }
            }

            pal.grp.options.ver.fld.text = suggestedAtStart[0];
            pal.grp.options.ver.sld.value = suggestedAtStart[0];

            //rows value
            pal.grp.options.hor.fld.enabled = false;
            pal.grp.options.hor.fld.text = suggestedAtStart[1];
            pal.grp.options.hor.info.enabled = false;

            //columns slider change
            pal.grp.options.ver.fld.onChange = function() {
                var value = parseInt(this.text);
                if (isNaN(value)) {
                    value = this.parent.sld.value;
                } else if (value < this.parent.sld.minvalue) {
                    value = this.parent.sld.minvalue;
                } else if (value > this.parent.sld.maxvalue) {
                    value = this.parent.sld.maxvalue;
                }
                this.text = value.toString();
                this.parent.sld.value = value;

                var numOfRows;
                var numOfRowsDirty = a2sData.activeItemFrames / value;
                if (numOfRowsDirty === parseInt(numOfRowsDirty, 10)) {
                    numOfRows = numOfRowsDirty.toString();
                } else {
                    numOfRows = "X";
                }
                pal.grp.options.hor.fld.text = numOfRows;
            }
            pal.grp.options.ver.sld.onChange = pal.grp.options.ver.sld.onChanging = function() {
                var value = parseInt(this.value);
                if (isNaN(value)) {
                    value = parseInt(this.parent.fld.text);
                }
                this.value = value;
                this.parent.fld.text = value.toString();

                var numOfRows;
                var numOfRowsDirty = a2sData.activeItemFrames / value;
                if (numOfRowsDirty === parseInt(numOfRowsDirty, 10)) {
                    numOfRows = numOfRowsDirty.toString();
                } else {
                    numOfRows = "X";
                }
                pal.grp.options.hor.fld.text = numOfRows;
            }

            pal.grp.header.help.onClick = function() {
                alert(a2sData.scriptTitle + "\n" + animationToSpritesheet_localize(a2sData.strHelpText), animationToSpritesheet_localize(a2sData.strHelpTitle));
            }

            pal.grp.cmds.executeBtn.onClick = animationToSpritesheet_doExecute;
            pal.grp.cmds.cancelBtn.onClick = animationToSpritesheet_doCancel;
        }

        return pal;
    }

    // Progressbar function:
    //
    function updateProgressbar(pal, minValue, currentValue, maxValue) {
        pal.grp.options.crp.loader.minvalue = minValue;
        pal.grp.options.crp.loader.maxvalue = maxValue;
        pal.grp.options.crp.loader.value = currentValue;
        pal.update();
    }

    // Progresstext function:
    //
    function updateProgresstext(pal, text) {
        pal.grp.options.crp.text.text = text;
        pal.update();
    }

    // Main Functions:
    //

    function animationToSpritesheet_doBrowse() {
        var spreadSheetFile = a2sData.projectFolder.saveDlg(animationToSpritesheet_localize(a2sData.strBrowseText),"PNG:*.png");
        if (spreadSheetFile != null) {
            a2sPal.grp.spritesheet.select.fld.text = spreadSheetFile.fsName.toString();
        }
    }

    function animationToSpritesheet_edgeDetect(comp, target, samples) {
        //add null
        var addNull = comp.layers.addNull();
    
        //add slider property to null
        var addSlider = addNull.Effects.addProperty("ADBE Slider Control");
    
        //analize frame by frame for x1, x2, y1 and y2
        var compFrames = Math.round(comp.duration * comp.frameRate);
        var compHeight = comp.height;
        var compWidth = comp.width;
    
        var fx1 = compWidth; //left
        var fx2 = -1; //right
        var fy1 = -1; //top
        var fy2 = -1; //bottom
    
        var x1 = compWidth; //left
        var x2 = -1; //right
        var y1 = -1; //top
        var y2 = -1; //bottom
    
        for (i = 0; i < compFrames; i++) {
            updateProgresstext(a2sPal, i + " / " + compFrames);
            var ySwitch = false;

            for (b = 0; b < compHeight; b += samples) {
                for (a = 0; a < compWidth; a += samples) {
                    var expr = "thisComp.layer('" + target + "').sampleImage([" + a + "," + b + "], [" + samples + "," + samples + "]/2, true, " + (i * comp.frameDuration) + ")[3]";
                    addSlider.property(1).expressionEnabled = true;
                    addSlider.property(1).expression = expr;
                    var value = addSlider(1).value;
                    //find left edge
                    if ((value > 0) && (a < x1)) {x1 = a;}
                    //find right edge
                    if ((value > 0) && (x2 < a)) {x2 = a;}
                    //find top edge
                    if ((value > 0) && (ySwitch == false)) {
                        y1 = b;
                        ySwitch = true;
                    }
                    //find bottom edge
                    if ((value > 0) && (y2 < b)) {y2 = b;}
                }
                updateProgressbar(a2sPal, 0, b+1, compHeight);
            }

            if (x1 < fx1) {fx1 = x1;}
            if (x2 > fx2) {fx2 = x2;}
            if (y1 > fy1) {fy1 = y1;}
            if (y2 > fy2) {fy2 = y2;}
        }
        updateProgresstext(a2sPal, compFrames + " / " + compFrames);

        addNull.remove();

        var arr = [Math.round(fx1 - (samples / 2)), Math.round(fx2 + (samples / 2)), Math.round(fy1 - (samples / 2)), Math.round(fy2 + (samples / 2))];
        return arr;
    }

    function animationToSpritesheet_main() {
        //get columns and rows
        var spritesheetFileName = a2sData.spritesheetFile.name.replace(/\..+$/, '');
        var getColumns = parseInt(a2sPal.grp.options.ver.fld.text);
        var getRows = parseInt(a2sPal.grp.options.hor.fld.text);
        var frames = a2sData.activeItemFrames;

        //get active comp info
        var activeWidth = a2sData.activeItem.width;
        var activeHeight = a2sData.activeItem.height;
        var activeDuration = a2sData.activeItem.duration;
        var activeFramerate = a2sData.activeItem.frameRate;
        var activeFrameDuration = a2sData.activeItem.frameDuration;

        //create main folder
        var mainFolderItem = app.project.items.addFolder(a2sData.spritesheetFile.name);

        //create sprite comp and insert active item as layer
        var spriteCompName = "sprite_" + spritesheetFileName;
        var spriteCompWidth = activeWidth;
        var spriteCompHeight = activeHeight;
        var spriteCompFramerate = activeFramerate;
        var spriteCompDuration = activeDuration;
        var spriteComp = mainFolderItem.items.addComp(spriteCompName, spriteCompWidth, spriteCompHeight, 1, spriteCompDuration, spriteCompFramerate);
        spriteComp.layers.add(a2sData.activeItem);

        //crop sprite comp to edges if requested
        if (a2sPal.grp.options.crp.box1.value == true) {
            //detect edges
            var numOfSamples = parseInt(a2sPal.grp.options.sam.fld.text);
            var targetEdges = animationToSpritesheet_edgeDetect(spriteComp, spriteComp.layers[1].name, numOfSamples);

            //offset active comp layer to accommodate new dimensions
            var layerPos = spriteComp.layers[1].property("Transform").property("Position").value;
            spriteComp.layers[1].property("Transform").property("Position").setValue([layerPos[0] - targetEdges[0], layerPos[1] - targetEdges[2]]);

            //crop comp to edges
            var newWidth = spriteCompWidth - (targetEdges[0] + (spriteCompWidth - targetEdges[1]));
            var newHeight = spriteCompHeight - (targetEdges[2] + (spriteCompHeight - targetEdges[3]));

            spriteComp.width = animationToSpritesheet_factorisation4(newWidth);
            spriteComp.height = animationToSpritesheet_factorisation4(newHeight);
        } else {
            spriteComp.width = animationToSpritesheet_factorisation4(spriteComp.width);
            spriteComp.height = animationToSpritesheet_factorisation4(spriteComp.height);
        }

        //create main comp and insert active item as layer
        var mainCompName = "main_" + spritesheetFileName;
        var mainCompWidth = spriteComp.width * getColumns;
        var mainCompHeight = spriteComp.height * getRows;
        var mainCompFramerate = activeFramerate;
        var mainCompDuration = 1 / mainCompFramerate;
        var mainComp = mainFolderItem.items.addComp(mainCompName, mainCompWidth, mainCompHeight, 1, mainCompDuration, mainCompFramerate);
        mainComp.layers.add(spriteComp);
        mainComp.layers[1].transform.anchorPoint.setValue([0,0]);
        mainComp.layers[1].transform.position.setValue([0,0]);

        //duplicate sprite comp to a number of frames and offset in time and space
        var positionX = spriteComp.width;
        var positionY = 0;
        var counter = 1;
        for (i = 1; i < frames; i++) {
            mainComp.layers[1].duplicate();
            mainComp.layers[1].transform.position.setValue([positionX,positionY]);
            mainComp.layers[1].startTime = 0 - (activeFrameDuration * i)

            counter = counter + 1;

            if (counter < getColumns) {
                positionX = positionX + spriteComp.width;
                positionY = positionY;
            } else {
                counter = 0;
                positionX = 0;
                positionY = positionY + spriteComp.height;
            }
        }

        //add to render queue
        var renderQueueItem = app.project.renderQueue.items.add(mainComp);
        var renderQueueItemIndex = app.project.renderQueue.numItems;

        //set output path
        renderQueueItem.outputModules[1].file = a2sData.spritesheetFile;

        //get Output Module templates and set png if exists
        var outputModuleTemplate = "Photoshop";
        var omTemplatesAll = app.project.renderQueue.item(renderQueueItemIndex).outputModule(1).templates;
        for (var i = 0; i < omTemplatesAll.length; i++) {
            if (omTemplatesAll[i] == "PNG Sequence") {
                outputModuleTemplate = "PNG Sequence";
            }
        }

        if (outputModuleTemplate != "PNG Sequence") {
            alert(animationToSpritesheet_localize(a2sData.strPNGWarning));
        }

        //set Output Module template
        renderQueueItem.outputModules[1].applyTemplate(outputModuleTemplate);

        //render
        app.project.renderQueue.render();
    }

    // Button Functions:
    //

    // Execute
    function animationToSpritesheet_doExecute() {
        var spritesheetPath = a2sPal.grp.spritesheet.select.fld.text;
        if (spritesheetPath != "") {
            a2sData.spritesheetFile = new File(spritesheetPath);
            if (a2sData.spritesheetFile.parent.exists == true) {
                if (a2sPal.grp.options.hor.fld.text == "X") {
                    alert(animationToSpritesheet_localize(a2sData.strColumnsErr));
                } else {
                    app.beginUndoGroup(a2sData.scriptName);
                    animationToSpritesheet_main();
                    app.endUndoGroup();
                    a2sPal.close();                    
                }
            } else {
                alert(animationToSpritesheet_localize(a2sData.strOutputErr));
            }
        } else {
            alert(animationToSpritesheet_localize(a2sData.strSpreadsheetErr));
        }
    }

    // Cancel
    function animationToSpritesheet_doCancel() {
        a2sPal.close();
    }

    // Main code:
    //

    // Warning
    if (parseFloat(app.version) < 9.0) {
        alert(animationToSpritesheet_localize(a2sData.strMinAE));
    } else {
        // Build and show the floating palette
        var a2sPal = animationToSpritesheet_buildUI(thisObj);
        if (a2sPal !== null) {
            if (a2sPal instanceof Window) {
                // Show the palette
                a2sPal.center();
                a2sPal.show();
            } else {
                a2sPal.layout.layout(true);
            }
        }
    }
})(this);