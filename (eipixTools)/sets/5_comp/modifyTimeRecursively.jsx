// modifyTimeRecursively.jsx
// 
// Name: modifyTimeRecursively
// Version: 0.6
// Author: Aleksandar Kocic
// 
// Description:     
// This script makes it easy modify the duration of the 
// composition hierarchy.
//  


(function modifyTimeRecursively(thisObj) {

    // Define main variables
    var mtrData = new Object(); // Store globals in an object
    mtrData.scriptNameShort = "MTR";
    mtrData.scriptName = "Modify Time Recursively";
    mtrData.scriptVersion = "0.6";
    mtrData.scriptTitle = mtrData.scriptName + " v" + mtrData.scriptVersion;

    mtrData.strOptions = {en: "Options"};
    mtrData.strSetFrames = {en: "Frames:"};
    mtrData.strSetSeconds = {en: "Seconds:"};
    mtrData.strFramesStart = {en: "Beginning"};
    mtrData.strFramesEnd = {en: "End"};
    mtrData.strExecute = {en: "Execute"};

    mtrData.strErrExecute = {en: "Please select a single composition."};

    mtrData.strMinAE = {en: "This script requires Adobe After Effects CS4 or later."};
    mtrData.strHelp = {en: "?"};
    mtrData.strHelpTitle = {en: "Help"};
    mtrData.strHelpText = 
    {
        en: "This script makes it easy modify the duration of the composition hierarchy. It only goes downwards the flowchart so you'd probably want to select the topmost composition before executing.\n" +
        "\n" +
        "NOTICE: This script has not been thoroughly tested. Watch out for bugs.\n" +
        "\n"
    };

    // Localize
    function mtr_localize(strVar)
    {
        return strVar["en"];
    }

    // Build UI
    function mtr_buildUI(thisObj)
    {
        var pal = (thisObj instanceof Panel) ? thisObj : new Window("palette", mtrData.scriptTitle, undefined, {resizeable:true});
        
        if (pal !== null)
        {
            var res =
            "group { \
                orientation:'column', alignment:['fill','fill'], \
                header: Group { \
                    alignment:['fill','top'], \
                    title: StaticText { text:'" + mtrData.scriptNameShort + "', alignment:['fill','center'] }, \
                    help: Button { text:'" + mtr_localize(mtrData.strHelp) +"', maximumSize:[30,20], alignment:['right','center'] }, \
                }, \
                opts: Panel { \
                    text: '" + mtr_localize(mtrData.strOptions) + "', alignment:['fill','top'], \
                    framesStart: Group { \
                        alignment:['fill','top'], \
                        framesStartBox: Checkbox { text:'" + mtr_localize(mtrData.strFramesStart) + "', value:true, preferredSize:[90,20]  }, \
                        framesStartText: StaticText { text:'" + mtr_localize(mtrData.strSetFrames) + "', preferredSize:[-1,20] }, \
                        framesStartField: EditText { text:'100', characters:5, justify:'center', preferredSize:[90,20] }, \
                    }, \
                    framesEnd: Group { \
                        alignment:['fill','top'], \
                        framesEndBox: Checkbox { text:'" + mtr_localize(mtrData.strFramesEnd) + "', value:true, preferredSize:[90,20]  }, \
                        framesEndText: StaticText { text:'" + mtr_localize(mtrData.strSetFrames) + "', preferredSize:[-1,20] }, \
                        framesEndField: EditText { text:'100', characters:5, justify:'center', preferredSize:[90,20] }, \
                    }, \
                }, \
                cmds: Group { \
                    alignment:['fill','bottom'], \
                    executeBtn: Button { text:'" + mtr_localize(mtrData.strExecute) + "', alignment:['center','bottom'], preferredSize:[-1,20] }, \
                }, \
            }";
            pal.grp = pal.add(res);
            
            pal.layout.layout(true);
            pal.grp.minimumSize = pal.grp.size;
            pal.layout.resize();
            pal.onResizing = pal.onResize = function () {this.layout.resize();}

            pal.grp.opts.framesStart.framesStartBox.onClick = function () {
                var state = this.value;
                this.parent.framesStartField.enabled = state;
                if (state)
                    this.parent.framesStartField.active = true;
            }

            pal.grp.opts.framesEnd.framesEndBox.onClick = function () {
                var state = this.value;
                this.parent.framesEndField.enabled = state;
                if (state)
                    this.parent.framesEndField.active = true;
            }

            pal.grp.header.help.onClick = function () {alert(mtrData.scriptTitle + "\n" + "\n" + mtr_localize(mtrData.strHelpText), mtr_localize(mtrData.strHelpTitle));}
            pal.grp.cmds.executeBtn.onClick = modifyStartFrames_doExecute;
        }
        
        return pal;
    }

    // Main Functions:
    //
    function modifyStartFrames_main(theComp) {

        var numOfSec = addFrames / theComp.frameRate;
        var newDuration = theComp.duration + numOfSec;

        theComp.duration = newDuration;
        
        for (var i = 1; i <= theComp.numLayers; i++) {
            var curLayer = theComp.layer(i);
            var curLayerSource = theComp.layer(i).source;
            var curLayerInPoint = theComp.layer(i).inPoint;
            var curLayerStartTime = theComp.layer(i).startTime;
    
            if ((curLayer.source instanceof FootageItem) && !(curLayer.source.mainSource instanceof SolidSource)) {
                if ((curLayerInPoint == 0) && (curLayerStartTime == 0)) {
                    theComp.layer(i).startTime = curLayerStartTime + numOfSec;
                    try {
                        theComp.layer(i).inPoint = 0;
                    } catch (err) {
                        // theComp.layer(i).inPoint = curLayerInPoint + numOfSec;
                    }
                } else {
                    theComp.layer(i).startTime = curLayerStartTime + numOfSec;
                }
            } else if (curLayer.source instanceof CompItem) {
                theComp.layer(i).startTime = curLayerStartTime;
                theComp.layer(i).inPoint = curLayerInPoint;
    
                modifyStartFrames_main(curLayerSource);
    
            } else {
                if (curLayerInPoint == 0) {
                    theComp.layer(i).startTime = curLayerStartTime + numOfSec;
                    theComp.layer(i).inPoint = 0;
                } else {
                    theComp.layer(i).startTime = curLayerStartTime + numOfSec;
                }
            }
        }
    }

    function modifyEndFrames_main(theComp) {

        var numOfSec = addFrames / theComp.frameRate;
        var newDuration = theComp.duration + numOfSec;

        theComp.duration = newDuration;
        
        for (var i = 1; i <= theComp.numLayers; i++) {
            var curLayer = theComp.layer(i);
            var curLayerSource = theComp.layer(i).source;
            var curLayerInPoint = theComp.layer(i).inPoint;
            var curLayerStartTime = theComp.layer(i).startTime;
    
            if ((curLayer.source instanceof FootageItem) && !(curLayer.source.mainSource instanceof SolidSource)) {
                if ((curLayerInPoint == 0) && (curLayerStartTime == 0)) {
                    theComp.layer(i).startTime = curLayerStartTime + numOfSec;
                    try {
                        theComp.layer(i).inPoint = 0;
                    } catch (err) {
                        // theComp.layer(i).inPoint = curLayerInPoint + numOfSec;
                    }
                } else {
                    theComp.layer(i).startTime = curLayerStartTime + numOfSec;
                }
            } else if (curLayer.source instanceof CompItem) {
                theComp.layer(i).startTime = curLayerStartTime;
                theComp.layer(i).inPoint = curLayerInPoint;
    
                modifyEndFrames_main(curLayerSource);
    
            } else {
                if (curLayerInPoint == 0) {
                    theComp.layer(i).startTime = curLayerStartTime + numOfSec;
                    theComp.layer(i).inPoint = 0;
                } else {
                    theComp.layer(i).startTime = curLayerStartTime + numOfSec;
                }
            }
        }
    }

    // modifyStartFrames_doExecute()
    // Function to modify start of the comp
    function modifyStartFrames_doExecute() {
        app.beginUndoGroup("Add More Frames At Beginning");
        var activeItem = app.project.activeItem;
        if ((activeItem != null) && (activeItem instanceof CompItem)) {
            var activeComp = activeItem;
            addFrames = this.parent.parent.opts.framesStart.framesStartField.text;
            modifyStartFrames_main(activeComp);
        } else {
            alert(mtr_localize(mtrData.strErrExecute));
        }
        app.endUndoGroup();
    }

    // modifyEndFrames_doExecute()
    // Function to modify end of the comp
    function modifyEndFrames_doExecute() {
        app.beginUndoGroup("Add More Frames At End");
        var activeItem = app.project.activeItem;
        if ((activeItem != null) && (activeItem instanceof CompItem)) {
            var activeComp = activeItem;
            addFrames = this.parent.parent.opts.framesEnd.framesEndField.text;
            modifyStartFrames_main(activeComp);
        } else {
            alert(mtr_localize(mtrData.strErrExecute));
        }
        app.endUndoGroup();
    }
    

    // Main code:
    //

    // Prerequisites check
    if (parseFloat(app.version) < 9.0)
    {
        alert(mtrData.strMinAE);
    }
    else
    {
        // Build and show the floating palette
        var mfabPal = mtr_buildUI(thisObj);
        if (mfabPal !== null)
        {
            if (mfabPal instanceof Window)
            {
                // Show the palette
                mfabPal.center();
                mfabPal.show();
            }
            else
                mfabPal.layout.layout(true);
        }
    }
})(this);