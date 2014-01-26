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

    mtrData.timeUnit;
    mtrData.operationApply;

    mtrData.strOptions = {en: "Options"};
    mtrData.strTimeText = {en: "Select time unit:"};
    mtrData.strTimeOpts = {en: ["Frames", "Seconds"]};
    mtrData.strOperationText = {en: "Select operation:"};
    mtrData.strOperationOpts = {en: ["Add time at the beginning", "Add time at the end"]};
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
                    timelist: Group { \
                        txt: StaticText { text:'" + mtr_localize(mtrData.strTimeText) + "', preferredSize:[100,20] }, \
                        lst: DropDownList { alignment:['fill','center'], preferredSize:[160,20] }, \
                    }, \
                    operationlist: Group { \
                        txt: StaticText { text:'" + mtr_localize(mtrData.strOperationText) + "', preferredSize:[100,20] }, \
                        lst: DropDownList { alignment:['fill','center'], preferredSize:[160,20] }, \
                    }, \
                    num: Group { \
                        fld: EditText { text:'100', characters:5, justify:'center', preferredSize:[100,20] }, \
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

            var timeItems = mtr_localize(mtrData.strTimeOpts);
            for (var i=0; i<timeItems.length; i++)
                pal.grp.opts.timelist.lst.add("item", timeItems[i]);
            pal.grp.opts.timelist.lst.selection = 0;

            var operationItems = mtr_localize(mtrData.strOperationOpts);
            for (var i=0; i<operationItems.length; i++)
                pal.grp.opts.operationlist.lst.add("item", operationItems[i]);
            pal.grp.opts.operationlist.lst.selection = 0;

            pal.grp.header.help.onClick = function () {alert(mtrData.scriptTitle + "\n" + "\n" + mtr_localize(mtrData.strHelpText), mtr_localize(mtrData.strHelpTitle));}
            pal.grp.cmds.executeBtn.onClick = mtr_doExecute;
        }
        
        return pal;
    }

    // Main Functions:
    //
    function addStartFrames_main(theComp) {

        var numOfSec = numField / theComp.frameRate;
        var newDuration = theComp.duration + numOfSec;

        theComp.duration = newDuration;
        
        for (var i = 1; i <= theComp.numLayers; i++) {
            var curLayer = theComp.layer(i);
            var curLayerSource = theComp.layer(i).source;
            var curLayerInPoint = theComp.layer(i).inPoint;
            var curLayerOutPoint = theComp.layer(i).outPoint;
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
    
                addStartFrames_main(curLayerSource);
                theComp.layer(i).outPoint = curLayerOutPoint + numOfSec;
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

    function addEndFrames_main(theComp) {
        var numOfSec = numField / theComp.frameRate;
        var newDuration = theComp.duration + numOfSec;
        var oldDuration = theComp.duration;

        theComp.duration = newDuration;
        
        for (var i = 1; i <= theComp.numLayers; i++) {
            var curLayer = theComp.layer(i);
            var curLayerSource = theComp.layer(i).source;
            var curLayerInPoint = theComp.layer(i).inPoint;
            var curLayerOutPoint = theComp.layer(i).outPoint;
            var curLayerStartTime = theComp.layer(i).startTime;

            if ((curLayer.source instanceof FootageItem) && !(curLayer.source.mainSource instanceof SolidSource) && (curLayerOutPoint == oldDuration)) {
                theComp.layer(i).outPoint = newDuration;
            } else if ((curLayer.source instanceof CompItem) && (curLayerOutPoint == oldDuration)) {   
                addEndFrames_main(curLayerSource);
                theComp.layer(i).outPoint = curLayerOutPoint + numOfSec;
            } else {
                if (curLayerOutPoint == oldDuration) {
                    theComp.layer(i).outPoint = newDuration;
                }
            }
        }
    }

    function addStartSeconds_main(theComp) {

        var numOfSec = numField;
        var newDuration = theComp.duration + numOfSec;

        theComp.duration = newDuration;
        
        for (var i = 1; i <= theComp.numLayers; i++) {
            var curLayer = theComp.layer(i);
            var curLayerSource = theComp.layer(i).source;
            var curLayerInPoint = theComp.layer(i).inPoint;
            var curLayerOutPoint = theComp.layer(i).outPoint;
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
    
                addStartSeconds_main(curLayerSource);
                theComp.layer(i).outPoint = curLayerOutPoint + numOfSec;
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

    function addEndSeconds_main(theComp) {
        var numOfSec = numField;
        var newDuration = theComp.duration + numOfSec;
        var oldDuration = theComp.duration;

        theComp.duration = newDuration;
        
        for (var i = 1; i <= theComp.numLayers; i++) {
            var curLayer = theComp.layer(i);
            var curLayerSource = theComp.layer(i).source;
            var curLayerInPoint = theComp.layer(i).inPoint;
            var curLayerOutPoint = theComp.layer(i).outPoint;
            var curLayerStartTime = theComp.layer(i).startTime;

            if ((curLayer.source instanceof FootageItem) && !(curLayer.source.mainSource instanceof SolidSource) && (curLayerOutPoint == oldDuration)) {
                theComp.layer(i).outPoint = newDuration;
            } else if ((curLayer.source instanceof CompItem) && (curLayerOutPoint == oldDuration)) {   
                addEndSeconds_main(curLayerSource);
                theComp.layer(i).outPoint = curLayerOutPoint + numOfSec;
            } else {
                if (curLayerOutPoint == oldDuration) {
                    theComp.layer(i).outPoint = newDuration;
                }
            }
        }
    }

    // mtr_doExecute()
    // Function to modify start of the comp
    function mtr_doExecute() {

        app.beginUndoGroup(mtrData.scriptName);

        var activeItem = app.project.activeItem;
        if ((activeItem != null) && (activeItem instanceof CompItem)) {
            var activeComp = activeItem;
            numField = parseInt(this.parent.parent.opts.num.fld.text);
            mtrData.timeUnit = this.parent.parent.opts.timelist.lst.selection.index;
            mtrData.operationApply = this.parent.parent.opts.operationlist.lst.selection.index;

            if ((mtrData.timeUnit == 0) && (mtrData.operationApply == 0)) {
                addStartFrames_main(activeComp);
            } else if ((mtrData.timeUnit == 0) && (mtrData.operationApply == 1)) {
                addEndFrames_main(activeComp);
            } else if ((mtrData.timeUnit == 1) && (mtrData.operationApply == 0)) {
                addStartSeconds_main(activeComp);
            } else if ((mtrData.timeUnit == 1) && (mtrData.operationApply == 1)) {
                addEndSeconds_main(activeComp);
            }
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
        var mtrPal = mtr_buildUI(thisObj);
        if (mtrPal !== null)
        {
            if (mtrPal instanceof Window)
            {
                // Show the palette
                mtrPal.center();
                mtrPal.show();
            }
            else
                mtrPal.layout.layout(true);
        }
    }
})(this);