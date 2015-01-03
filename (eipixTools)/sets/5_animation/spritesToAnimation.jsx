// spritesToAnimation.jsx
// 
// Name: spritesToAnimation
// Version: 0.1
// Author: Aleksandar Kocic
// 
// Description: Turns sprite tiled sheets into sequences.
// 
// 

(function spritesToAnimation(thisObj) {
    if (app.project.file == null) {
        alert("Save the project first.");
        return;
    }

    if (app.project.activeItem == null) {
        alert("Please, select your composition.");
        return;
    }

    // Define main variables
    var s2aData = new Object();

    s2aData.scriptNameShort = "S2A";
    s2aData.scriptName = "Spritesheet To Animation";
    s2aData.scriptVersion = "0.1";
    s2aData.scriptTitle = s2aData.scriptName + " v" + s2aData.scriptVersion;

    s2aData.strMinAE = {en: "This script requires Adobe After Effects CS4 or later."};
    s2aData.strActiveCompErr = {en: "Please select a composition."};
    s2aData.strExecute = {en: "Execute"};
    s2aData.strCancel = {en: "Cancel"};

    s2aData.strSpriteSheet = {en: "Sprite Sheet"};
    s2aData.strBrowse = {en: "Browse"};
    s2aData.strBrowseText = {en: "Locate the Sprite Sheet file:"};

    s2aData.strSpriteSheetErr = {en: "Please select a valid sprite sheet file."};
    s2aData.strIntErr = {en: "Error: Could not create animation. You probably entered wrong values. Try again."};

    s2aData.strOptions = {en: "Options"};
    s2aData.strRows = {en: "Rows"};
    s2aData.strColumns = {en: "Columns"};
    s2aData.strFramesPerSecond = {en: "Frames Per Second"};

    s2aData.strHelp = {en: "?"};
    s2aData.strHelpTitle = {en: "Help"};
    s2aData.strErr = {en: "Something went wrong."};
    s2aData.strHelpText = {en: "This script turns sprite tiled sheets into sequences."};

    // Define project variables
    s2aData.activeItem = app.project.activeItem;
    s2aData.projectFolder = app.project.file.parent;


    // Localize
    function spritesToAnimation_localize(strVar) {
        return strVar["en"];
    }

    // Build UI
    function spritesToAnimation_buildUI(thisObj) {
        var pal = new Window("dialog", s2aData.scriptName, undefined, {resizeable:true});
        if (pal !== null) {
            var res =
                "group { \
                    orientation:'column', alignment:['fill','fill'], \
                    header: Group { \
                        alignment:['fill','top'], \
                        title: StaticText { text:'" + s2aData.scriptNameShort + " v" + s2aData.scriptVersion + "', alignment:['fill','center'] }, \
                        help: Button { text:'" + spritesToAnimation_localize(s2aData.strHelp) + "', maximumSize:[30,20], alignment:['right','center'] }, \
                    }, \
                    spritesheet: Panel { \
                        alignment:['fill','top'], \
                        text: '" + spritesToAnimation_localize(s2aData.strSpriteSheet) + "', alignment:['fill','top'], \
                        select: Group { \
                            alignment:['fill','top'], \
                            fld: EditText { alignment:['fill','center'], preferredSize:[250,20] },  \
                            btn: Button { text:'" + spritesToAnimation_localize(s2aData.strBrowse) + "', preferredSize:[-1,20] }, \
                        }, \
                    }, \
                    sliders: Panel { \
                        alignment:['fill','top'], \
                        text: '" + spritesToAnimation_localize(s2aData.strOptions) + "', alignment:['fill','top'], \
                        ver: Group { \
                            alignment:['fill','top'], \
                            text: StaticText { text:'" + spritesToAnimation_localize(s2aData.strColumns) + ":', preferredSize:[120,20] }, \
                            fld: EditText { text:'1', characters: 3, justify: 'center', alignment:['left','center'], preferredSize:[-1,20] }, \
                            sld: Slider { value:1, minvalue:1, maxvalue:16, alignment:['fill','center'], preferredSize:[200,20] }, \
                        }, \
                        hor: Group { \
                            alignment:['fill','top'], \
                            text: StaticText { text:'" + spritesToAnimation_localize(s2aData.strRows) + ":', preferredSize:[120,20] }, \
                            fld: EditText { text:'1', characters: 3, justify: 'center', alignment:['left','center'], preferredSize:[-1,20] }, \
                            sld: Slider { value:1, minvalue:1, maxvalue:16, alignment:['fill','center'], preferredSize:[200,20] }, \
                        }, \
                        fps: Group { \
                            alignment:['fill','top'], \
                            text: StaticText { text:'" + spritesToAnimation_localize(s2aData.strFramesPerSecond) + ":', preferredSize:[120,20] }, \
                            fld: EditText { text:'25', characters: 3, justify: 'center', alignment:['left','center'], preferredSize:[-1,20] }, \
                            sld: Slider { value:25, minvalue:1, maxvalue:50, alignment:['fill','center'], preferredSize:[200,20] }, \
                        }, \
                    }, \
                    sepr: Group { \
                        orientation:'row', alignment:['fill','top'], \
                        rule: Panel { height: 2, alignment:['fill','center'] }, \
                    }, \
                    cmds: Group { \
                        alignment:['fill','top'], \
                        executeBtn: Button { text:'" + spritesToAnimation_localize(s2aData.strExecute) + "', alignment:['center','bottom'], preferredSize:[-1,20] }, \
                        cancelBtn: Button { text:'" + spritesToAnimation_localize(s2aData.strCancel) + "', alignment:['center','bottom'], preferredSize:[-1,20] }, \
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
                audioTimecode_doBrowse();
            }

            //Rows slider change
            pal.grp.sliders.hor.fld.onChange = function () {
                var value = parseInt(this.text);
                if (isNaN(value))
                    value = this.parent.sld.value;
                else if (value < this.parent.sld.minvalue)
                    value = this.parent.sld.minvalue;
                else if (value > this.parent.sld.maxvalue)
                    value = this.parent.sld.maxvalue;
                this.text = value.toString();
                this.parent.sld.value = value;
            }
            pal.grp.sliders.hor.sld.onChange = pal.grp.sliders.hor.sld.onChanging = function () {
                var value = parseInt(this.value);
                if (isNaN(value))
                    value = parseInt(this.parent.fld.text);
                this.value = value;
                this.parent.fld.text = value.toString();
            }

            //Columns slider change
            pal.grp.sliders.ver.fld.onChange = function () {
                var value = parseInt(this.text);
                if (isNaN(value))
                    value = this.parent.sld.value;
                else if (value < this.parent.sld.minvalue)
                    value = this.parent.sld.minvalue;
                else if (value > this.parent.sld.maxvalue)
                    value = this.parent.sld.maxvalue;
                this.text = value.toString();
                this.parent.sld.value = value;
            }
            pal.grp.sliders.ver.sld.onChange = pal.grp.sliders.ver.sld.onChanging = function () {
                var value = parseInt(this.value);
                if (isNaN(value))
                    value = parseInt(this.parent.fld.text);
                this.value = value;
                this.parent.fld.text = value.toString();
            }

            //framerate slider change
            pal.grp.sliders.fps.fld.onChange = function () {
                var value = parseInt(this.text);
                if (isNaN(value))
                    value = this.parent.sld.value;
                else if (value < this.parent.sld.minvalue)
                    value = this.parent.sld.minvalue;
                else if (value > this.parent.sld.maxvalue)
                    value = this.parent.sld.maxvalue;
                this.text = value.toString();
                this.parent.sld.value = value;
            }
            pal.grp.sliders.fps.sld.onChange = pal.grp.sliders.fps.sld.onChanging = function () {
                var value = parseInt(this.value);
                if (isNaN(value))
                    value = parseInt(this.parent.fld.text);
                this.value = value;
                this.parent.fld.text = value.toString();
            }

            pal.grp.header.help.onClick = function() {
                alert(s2aData.scriptTitle + "\n" + spritesToAnimation_localize(s2aData.strHelpText), spritesToAnimation_localize(s2aData.strHelpTitle));
            }

            pal.grp.cmds.executeBtn.onClick = spritesToAnimation_doExecute;
            pal.grp.cmds.cancelBtn.onClick = spritesToAnimation_doCancel;
        }

        return pal;
    }

    // Main Functions:
    //

    function audioTimecode_doBrowse() {
        var spreadSheetFile = s2aData.projectFolder.openDlg(spritesToAnimation_localize(s2aData.strBrowseText),"PNG:*.png");
        if (spreadSheetFile != null) {
            atcPal.grp.spritesheet.select.fld.text = spreadSheetFile.fsName.toString();
        }
    }

    function spritesToAnimation_main() {
        var spritesheetPath = atcPal.grp.spritesheet.select.fld.text;
        var spritesheetFile = new File(spritesheetPath);
        var spritesheetFileName = spritesheetFile.name.replace(/\..+$/, '');

        if (spritesheetFile.exists == false) {
            alert(spritesToAnimation_localize(s2aData.strSpriteSheetErr));
        } else {

            var rows = parseInt(atcPal.grp.sliders.hor.fld.text);
            var columns = parseInt(atcPal.grp.sliders.ver.fld.text);
            var framerate = parseInt(atcPal.grp.sliders.fps.fld.text);
            var frames = rows * columns;
    
            //make folderitem
            var spritesFolderItem = app.project.items.addFolder("sprites_" + spritesheetFile.name);

            //import file
            var io = new ImportOptions(File(spritesheetFile));
            var spritesFileItem = app.project.importFile(io);
            spritesFileItem.parentFolder = spritesFolderItem;

            var checkInt1 = spritesFileItem.width / columns;
            var checkInt2 = spritesFileItem.height / rows;
            if ((checkInt1 === parseInt(checkInt1, 10)) && (checkInt2 === parseInt(checkInt2, 10))) {
                //make main precomp and import png layer
                var mainCompName = "main_" + spritesheetFileName;
                var mainCompWidth = spritesFileItem.width;
                var mainCompHeight = spritesFileItem.height;
                var mainCompFramerate = framerate;
                var mainCompDuration = 1 / framerate;
                var mainComp = spritesFolderItem.items.addComp(mainCompName, mainCompWidth, mainCompHeight, 1, mainCompDuration, mainCompFramerate);
                mainComp.layers.add(spritesFileItem);
    
                //make sequenced precomp
                var sequenceCompName = spritesheetFileName;
                var sequenceCompWidth = mainCompWidth / columns;
                var sequenceCompHeight = mainCompHeight / rows;
                var sequenceCompFramerate = framerate;
                var sequenceCompDuration = (1 / framerate) * frames;
                var sequenceComp = spritesFolderItem.items.addComp(sequenceCompName, sequenceCompWidth, sequenceCompHeight, 1, sequenceCompDuration, sequenceCompFramerate);
    
                //make frames precomp
                var framesCompName = "frames_" + spritesheetFileName;
                var framesCompWidth = mainCompWidth / columns;
                var framesCompHeight = mainCompHeight / rows;
                var framesCompFramerate = framerate;
                var framesCompDuration = (1 / framerate) * frames;
                var framesComp = spritesFolderItem.items.addComp(framesCompName, framesCompWidth, framesCompHeight, 1, framesCompDuration, framesCompFramerate);
                sequenceComp.layers.add(framesComp);
    
                //make single sprite precomps and place them under sprites folder
                var spriteCompName = "sprite";
                var spriteCompWidth = mainCompWidth / columns;
                var spriteCompHeight = mainCompHeight / rows;
                var spriteCompFramerate = framerate;
                var spriteCompDuration = 1 / framerate;
                var spritesFolderChildItem = spritesFolderItem.items.addFolder("sprites");
                var compsFolderChildItem = spritesFolderItem.items.addFolder("comps");
                framesComp.parentFolder = compsFolderChildItem;
                mainComp.parentFolder = compsFolderChildItem;
    
                var positionX = 0;
                var positionY = 0;
                var counter = 0;
                for (i = 0; i < frames; i++) {
                    var currentComp = spritesFolderChildItem.items.addComp(spriteCompName + "_" + (i + 1), spriteCompWidth, spriteCompHeight, 1, spriteCompDuration, spriteCompFramerate);
                    currentComp.layers.add(mainComp);
    
                    currentComp.layers[1].transform.anchorPoint.setValue([0,0]);
                    currentComp.layers[1].transform.position.setValue([positionX,positionY]);
    
                    framesComp.layers.add(currentComp);
                    framesComp.layers[1].startTime = (1 / spriteCompFramerate) * i;
    
                    counter = counter + 1;
    
                    if (counter < columns) {
                        positionX = positionX - spriteCompWidth;
                        positionY = positionY;
                    } else {
                        counter = 0;
                        positionX = 0;
                        positionY = positionY - spriteCompHeight;
                    }
                }
                sequenceComp.openInViewer();
                atcPal.close();
            } else {
                spritesFolderItem.remove();
                alert(spritesToAnimation_localize(s2aData.strIntErr));
                return;
            }
        }
    }

    // Button Functions:
    //

    // Execute
    function spritesToAnimation_doExecute() {
        app.beginUndoGroup(s2aData.scriptName);
        spritesToAnimation_main()
        app.endUndoGroup();
    }

    // Cancel
    function spritesToAnimation_doCancel() {
        atcPal.close();
    }

    // Main code:
    //

    // Warning
    if (parseFloat(app.version) < 9.0) {
        alert(spritesToAnimation_localize(s2aData.strMinAE));
    } else {
        // Build and show the floating palette
        var atcPal = spritesToAnimation_buildUI(thisObj);
        if (atcPal !== null) {
            if (atcPal instanceof Window) {
                // Show the palette
                atcPal.center();
                atcPal.show();
            } else {
                atcPal.layout.layout(true);
            }
        }
    }
})(this);