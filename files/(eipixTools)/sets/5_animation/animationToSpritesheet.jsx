// animationToSpritesheet.jsx
// 
// Name: animationToSpritesheet
// Version: 0.1
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
    a2sData.scriptVersion = "0.1";
    a2sData.scriptTitle = a2sData.scriptName + " v" + a2sData.scriptVersion;

    a2sData.strMinAE = {en: "This script requires Adobe After Effects CS4 or later."};
    a2sData.strActiveCompErr = {en: "Please select a composition."};
    a2sData.strExecute = {en: "Execute"};
    a2sData.strCancel = {en: "Cancel"};

    a2sData.strExportTo = {en: "Export To"};
    a2sData.strBrowse = {en: "Browse"};
    a2sData.strBrowseText = {en: "Save Sprite Sheet to:"};

    a2sData.strOptions = {en: "Options"};
    a2sData.strColumns = {en: "Columns"};
    a2sData.strRows = {en: "Rows"};
    a2sData.strRowsInfo = {en: "(this value is calculated automaticaly)"};

    a2sData.strColumnsErr = {en: "Cannot pack sprites at requested number of rows and columns. Try again."};

    a2sData.strMargin = {en: "Margin"};
    a2sData.strCrop = {en: "Crop to Edges"};

    a2sData.strHelp = {en: "?"};
    a2sData.strHelpTitle = {en: "Help"};
    a2sData.strErr = {en: "Something went wrong."};
    a2sData.strHelpText = {en: "This script turns animation to sprite tiled sheets."};

    // Define project variables
    a2sData.activeItem = app.project.activeItem;
    a2sData.activeItemFrames = app.project.activeItem.duration * app.project.activeItem.frameRate;
    a2sData.projectFolder = app.project.file.parent;

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
                        mar: Group { \
                            alignment:['fill','top'], \
                            text: StaticText { text:'" + animationToSpritesheet_localize(a2sData.strMargin) + ":', preferredSize:[120,20] }, \
                            fld: EditText { text:'1', characters: 3, justify: 'center', alignment:['left','center'], preferredSize:[-1,20] }, \
                            sld: Slider { value:1, minvalue:1, maxvalue:100, alignment:['fill','center'], preferredSize:[200,20] }, \
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

            //margin slider change
            pal.grp.options.mar.fld.onChange = function() {
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
            pal.grp.options.mar.sld.onChange = pal.grp.options.mar.sld.onChanging = function() {
                var value = parseInt(this.value);
                if (isNaN(value)) {
                    value = parseInt(this.parent.fld.text);
                }
                this.value = value;
                this.parent.fld.text = value.toString();
            }

            pal.grp.options.crp.box1.value = false;
            pal.grp.options.mar.text.enabled = false;
            pal.grp.options.mar.fld.enabled = false;
            pal.grp.options.mar.sld.enabled = false;

            pal.grp.options.crp.box1.onClick = function() {
                if (pal.grp.options.crp.box1.value == true) {
                    pal.grp.options.mar.text.enabled = true;
                    pal.grp.options.mar.fld.enabled = true;
                    pal.grp.options.mar.sld.enabled = true;
                } else {
                    pal.grp.options.mar.text.enabled = false;
                    pal.grp.options.mar.fld.enabled = false;
                    pal.grp.options.mar.sld.enabled = false;
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
        //create sprite comp and insert active item as layer
        //crop to edges if requested
        //create render comp
        //insert sprite comp
        //duplicate sprite comp to a number of frames
        //position sprite comps into rows and columns
        //offset sprite comps in time
        //render
    }

    // Button Functions:
    //

    // Execute
    function animationToSpritesheet_doExecute() {
        app.beginUndoGroup(a2sData.scriptName);
        animationToSpritesheet_main()
        app.endUndoGroup();
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