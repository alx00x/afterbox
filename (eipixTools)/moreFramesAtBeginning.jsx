// collectFilesAndReduce.jsx
// 
// Name: collectFilesAndReduce
// Version: 0.3
// Author: Aleksandar Kocic
// 
// Description:
// This script removes unused footage and collects files
// at the location of the original project. It mimics the 
// "Collect Files..." function. Parts based on a script
// by duduf.net
//  
// Note: Might not be completely stable. Use with caution.

(function main(thisObj)
{

    // Define main variables
    var moreFramesAtBeginningData = new Object(); // Store globals in an object
    moreFramesAtBeginningData.scriptNameShort = "MFAB";
    moreFramesAtBeginningData.scriptName = "More Frames At Beginning";
    moreFramesAtBeginningData.scriptVersion = "0.1";
    moreFramesAtBeginningData.scriptTitle = moreFramesAtBeginningData.scriptName + " v" + moreFramesAtBeginningData.scriptVersion;

    moreFramesAtBeginningData.strOptions = {en: "Options"};
    moreFramesAtBeginningData.strSelect = {en: "Frames:"};
    moreFramesAtBeginningData.strExecute = {en: "Execute"};

    moreFramesAtBeginningData.strErrExecute = {en: "Please select a single composition."};

    moreFramesAtBeginningData.strMinAE = {en: "This script requires Adobe After Effects CS5 or later."};
    moreFramesAtBeginningData.strHelp = {en: "?"};
    moreFramesAtBeginningData.strHelpTitle = {en: "Help"};
    moreFramesAtBeginningData.strHelpText = 
    {
        en: "This script adds a specified number of frames at the beginning of the comp hierarchy. It only goes downwards the flowchart so you'd probably want to select the topmost composition before executing.\n" +
        "\n" +
        "NOTICE: This script has not been thoroughly tested. Watch out for bugs.\n" +
        "\n"
    };

    // Localize
    function moreFramesAtBeginning_localize(strVar)
    {
        return strVar["en"];
    }

    // Build UI
    function moreFramesAtBeginning_buildUI(thisObj)
    {
        var pal = (thisObj instanceof Panel) ? thisObj : new Window("palette", moreFramesAtBeginningData.scriptTitle, undefined, {resizeable:true});
        
        if (pal !== null)
        {
            var res =
            "group { \
                orientation:'column', alignment:['fill','fill'], \
                header: Group { \
                    alignment:['fill','top'], \
                    title: StaticText { text:'" + moreFramesAtBeginningData.scriptNameShort + "', alignment:['fill','center'] }, \
                    help: Button { text:'" + moreFramesAtBeginning_localize(moreFramesAtBeginningData.strHelp) +"', maximumSize:[30,20], alignment:['right','center'] }, \
                }, \
                opts: Panel { \
                    text: '" + moreFramesAtBeginning_localize(moreFramesAtBeginningData.strOptions) + "', alignment:['fill','top'], \
                    numFrames: Group { \
                        alignment:['fill','top'], \
                        numFramesText: StaticText { text:'" + moreFramesAtBeginning_localize(moreFramesAtBeginningData.strSelect) + "', preferredSize:[-1,20] }, \
                        numFramesField: EditText { text:'100', characters:5, justify:'center', preferredSize:[90,20] }, \
                    }, \
                }, \
                cmds: Group { \
                    alignment:['fill','bottom'], \
                    executeBtn: Button { text:'" + moreFramesAtBeginning_localize(moreFramesAtBeginningData.strExecute) + "', alignment:['center','bottom'], preferredSize:[-1,20] }, \
                }, \
            }";
            pal.grp = pal.add(res);
            
            pal.layout.layout(true);
            pal.grp.minimumSize = pal.grp.size;
            pal.layout.resize();
            pal.onResizing = pal.onResize = function () {this.layout.resize();}

            pal.grp.header.help.onClick = function () {alert(moreFramesAtBeginningData.scriptTitle + "\n" + "\n" + moreFramesAtBeginning_localize(moreFramesAtBeginningData.strHelpText), moreFramesAtBeginning_localize(moreFramesAtBeginningData.strHelpTitle));}
            pal.grp.cmds.executeBtn.onClick = moreFramesAtBeginning_doExecute;
        }
        
        return pal;
    }

    // Main Functions:
    //
    function moreFramesAtBeginning(theComp) {

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
                theComp.layer(i).startTime = curLayerStartTime + numOfSec;
                theComp.layer(i).inPoint = curLayerInPoint + numOfSec;
    
                moreFramesAtBeginning(curLayerSource);
    
            } else {
                if ((curLayerInPoint == 0) && (curLayerStartTime == 0)) {
                    theComp.layer(i).startTime = curLayerStartTime + numOfSec;
                    theComp.layer(i).inPoint = 0;
                } else if ((curLayerInPoint == 0) && (curLayerStartTime < 0)) {
                    theComp.layer(i).startTime = curLayerStartTime + numOfSec;
                    theComp.layer(i).inPoint = 0;
                } else {
                    theComp.layer(i).startTime = curLayerStartTime + numOfSec;
                }
            }
        }
    }

    // Execute
    function moreFramesAtBeginning_doExecute() {
        app.beginUndoGroup("Add More Frames At Beginning");
        var activeItem = app.project.activeItem;
        if ((activeItem != null) && (activeItem instanceof CompItem)) {
            var activeComp = activeItem;
            addFrames = this.parent.parent.opts.numFrames.numFramesField.text;
            moreFramesAtBeginning(activeComp);
        } else {
            alert("Please select a single composition.");
        }
        app.endUndoGroup();
    }
    

    // Main code:
    //

    // Prerequisites check
    if (parseFloat(app.version) < 10.0)
    {
        alert(moreFramesAtBeginningData.strMinAE);
    }
    else
    {
        // Build and show the floating palette
        var mfabPal = moreFramesAtBeginning_buildUI(thisObj);
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