// animationToSpritesheet.jsx
// 
// Name: animationToSpritesheet
// Version: 0.2
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
    a2sData.scriptVersion = "0.2";
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

    a2sData.strSpreadsheetErr = {en: "You need to specify output first."};
    a2sData.strOutputErr = {en: "Output is not valid."};
    a2sData.strColumnsErr = {en: "Cannot pack sprites at requested number of rows and columns. Try again."};

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

    // Localize
    function animationToSpritesheet_localize(strVar) {
        return strVar["en"];
    }

    // Calculate sugested number of columns and rows
    function animationToSpritesheet_factorisation(numOfFrames) {
        var numOfFrames = a2sData.activeItemFrames;
        var value0 = Math.floor(Math.sqrt(numOfFrames));
        while (numOfFrames % value0 != 0) {
            value0 = value0 - 1;
        }
        var value1 = numOfFrames / value0;
        var arr = [value0, value1];
        return arr;
    }

    // Calculate first divisible by 16
    function animationToSpritesheet_factorisation16(inputValue) {
        var valueDiv = 16;
        while (inputValue % valueDiv != 0) {
            valueDiv = valueDiv + 1;
        }
        var value = valueDiv;
        return value;
    }

    var suggestedAtStart = animationToSpritesheet_factorisation(a2sData.activeItemFrames);

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
                            alignment:['right','top'], \
                            box1: Checkbox { text:'" + animationToSpritesheet_localize(a2sData.strCrop) + "' }, \
                        }, \
                        sam: Group { \
                            alignment:['fill','top'], \
                            text: StaticText { text:'" + animationToSpritesheet_localize(a2sData.strSamples) + ":', preferredSize:[120,20] }, \
                            fld: EditText { text:'1', characters: 3, justify: 'center', alignment:['left','center'], preferredSize:[-1,20] }, \
                            sld: Slider { value:1, minvalue:1, maxvalue:16, alignment:['fill','center'], preferredSize:[200,20] }, \
                        }, \
                        ver: Group { \
                            alignment:['fill','top'], \
                            text: StaticText { text:'" + animationToSpritesheet_localize(a2sData.strColumns) + ":', preferredSize:[120,20] }, \
                            fld: EditText { text:'1', characters: 3, justify: 'center', alignment:['left','center'], preferredSize:[-1,20] }, \
                            sld: Slider { value:1, minvalue:1, maxvalue:16, alignment:['fill','center'], preferredSize:[200,20] }, \
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
            pal.grp.options.sam.text.enabled = false;
            pal.grp.options.sam.fld.enabled = false;
            pal.grp.options.sam.sld.enabled = false;

            pal.grp.options.crp.box1.onClick = function() {
                if (pal.grp.options.crp.box1.value == true) {
                    pal.grp.options.sam.text.enabled = true;
                    pal.grp.options.sam.fld.enabled = true;
                    pal.grp.options.sam.sld.enabled = true;
                } else {
                    pal.grp.options.sam.text.enabled = false;
                    pal.grp.options.sam.fld.enabled = false;
                    pal.grp.options.sam.sld.enabled = false;
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

    // Main Functions:
    //

    function animationToSpritesheet_doBrowse() {
        var spreadSheetFile = a2sData.projectFolder.saveDlg(animationToSpritesheet_localize(a2sData.strBrowseText),"PNG:*.png");
        if (spreadSheetFile != null) {
            a2sPal.grp.spritesheet.select.fld.text = spreadSheetFile.fsName.toString();
        }
    }

    function animationToSpritesheet_crop() {
        //code
    }

    function animationToSpritesheet_main() {
        //get columns and rows
        var getColumns = parseInt(a2sPal.grp.options.ver.fld.text);
        var getRows = parseInt(a2sPal.grp.options.hor.fld.text);
        var frames = getRows * getColumns;

        //calculate dimensions divisible by 16
        var activeWidth = animationToSpritesheet_factorisation16(a2sData.activeItem.width);
        var activeHeight = animationToSpritesheet_factorisation16(a2sData.activeItem.height);
        var activeFramerate = a2sData.activeItem.frameRate;

        //create main folder
        var mainFolderItem = app.project.items.addFolder(a2sData.spritesheetFile.name);

        //create sprite comp and insert active item as layer
        var spriteCompName = "sprite_" + spritesheetFileName;
        var spriteCompWidth = activeWidth;
        var spriteCompHeight = activeHeight;
        var spriteCompFramerate = activeFramerate;
        var spriteCompDuration = 1 / spriteCompFramerate;
        var spriteComp = mainFolderItem.items.addComp(spriteCompName, spriteCompWidth, spriteCompHeight, 1, spriteCompDuration, spriteCompFramerate);
        spriteComp.layers.add(a2sData.activeItem);

        //crop sprite comp to edges if requested
        if (a2sPal.grp.options.crp.box1.value == true) {
            //code
        }

        //create main comp and insert active item as layer
        var mainCompName = "main_" + spritesheetFileName;
        var mainCompWidth = activeWidth * getColumns;
        var mainCompHeight = activeHeight * getRows;
        var mainCompFramerate = activeFramerate;
        var mainCompDuration = 1 / mainCompFramerate;
        var mainComp = mainFolderItem.items.addComp(mainCompName, mainCompWidth, mainCompHeight, 1, mainCompDuration, mainCompFramerate);
        mainComp.layers.add(spriteComp);

        //duplicate sprite comp to a number of frames
        for (i = 0; i < frames; i++) {
            mainComp.layers[1].duplicate();
        }

        //position sprite comps into rows and columns


        //offset sprite comps in time
        //render
    }

    // Button Functions:
    //

    // Execute
    function animationToSpritesheet_doExecute() {
        var spritesheetPath = a2sPal.grp.spritesheet.select.fld.text;
        if (spritesheetPath != "") {
            a2sData.spritesheetFile = new File(spritesheetPath);
            if (a2sData.spritesheetFile.parent.exists == true) {
                app.beginUndoGroup(a2sData.scriptName);
                animationToSpritesheet_main();
                app.endUndoGroup();
                a2sPal.close();
            } else {
                alert(animationToSpritesheet_localize(a2sData.a2sData.strOutputErr));
            }
        } else {
            alert(animationToSpritesheet_localize(a2sData.a2sData.strSpreadsheetErr));
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