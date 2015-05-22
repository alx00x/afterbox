// simpleLooper.jsx
// 
// Name: simpleLooper
// Version: 1.0
// Author: Aleksandar Kocic
// 
// Description:     
// This script provides easy way to loop a range of frames of a single composition.
// 

(function simpleLooper(thisObj) {

    if (app.project.activeItem == null) {
        alert("Please, select your composition.");
        return;
    }

    // Define main variables
    var sloopData = new Object();

    sloopData.scriptNameShort = "SL";
    sloopData.scriptName = "Simple Looper";
    sloopData.scriptVersion = "1.0";
    sloopData.scriptTitle = sloopData.scriptName + " v" + sloopData.scriptVersion;

    sloopData.strMinAE = {en: "This script requires Adobe After Effects CS4 or later."};
    sloopData.strActiveLayerErr = {en: "Please select a single composition layer."};
    sloopData.strActiveCompErr = {en: "No active composition."};

    sloopData.strStartF = {en: "Start Frame:"};
    sloopData.strEndF = {en: "End Frame:"};
    sloopData.strInst = {en: "Set the range of frames you want to loop. Note: usually, you would set one frame less so that you avoid repeating first frame."};

    sloopData.strExecute = {en: "Execute"};
    sloopData.strCancel = {en: "Cancel"};

    sloopData.strHelp = {en: "?"};

    sloopData.strHelpTitle = {en: "Help"};
    sloopData.strHelpText = {en: "This script provides easy way to loop a range of frames of a single composition."};

    // Define project variables
    sloopData.activeItem = app.project.activeItem;
    sloopData.activeItemFrames = app.project.activeItem.duration * app.project.activeItem.frameRate;
    sloopData.activeItemFps= app.project.activeItem.frameRate;

    // Localize
    function simpleLooper_localize(strVar) {
        return strVar["en"];
    }

    // Build UI
    function simpleLooper_buildUI(thisObj) {
        var pal = new Window("palette", sloopData.scriptName, undefined, {resizeable:true});
        if (pal !== null) {
            var res =
                "group { \
                    orientation:'column', alignment:['fill','fill'], \
                    header: Group { \
                        alignment:['fill','top'], \
                        title: StaticText { text:'" + sloopData.scriptNameShort + " v" + sloopData.scriptVersion + "', alignment:['fill','center'] }, \
                        help: Button { text:'" + simpleLooper_localize(sloopData.strHelp) + "', maximumSize:[30,20], alignment:['right','center'] }, \
                    }, \
                    seperator: Panel { height: 2, alignment:['fill','center'] }, \
                    opts: Group { \
                        orientation:'column', alignment:['fill','top'], \
                        start: Group { \
                            txt: StaticText { text:'" + simpleLooper_localize(sloopData.strStartF) + "', preferredSize:[100,20] }, \
                            edt: EditText { alignment:['fill','center'], preferredSize:[100,20] },  \
                        }, \
                        end: Group { \
                            txt: StaticText { text:'" + simpleLooper_localize(sloopData.strEndF) + "', preferredSize:[100,20] }, \
                            edt: EditText { alignment:['fill','center'], preferredSize:[100,20] },  \
                        }, \
                        instructions: StaticText { text:'" + simpleLooper_localize(sloopData.strInst) + "', alignment:['left','fill'], properties:{multiline:true} }, \
                    }, \
                    seperator: Panel { height: 2, alignment:['fill','center'] }, \
                    btns: Group { \
                        alignment:['fill','bottom'], \
                        executeBtn: Button { text:'" + simpleLooper_localize(sloopData.strExecute) + "', alignment:['center','bottom'], preferredSize:[-1,20] }, \
                        cancelBtn: Button { text:'" + simpleLooper_localize(sloopData.strCancel) + "', alignment:['center','bottom'], preferredSize:[-1,20] }, \
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

            pal.grp.header.help.onClick = function() {
                alert(sloopData.scriptTitle + "\n" + simpleLooper_localize(sloopData.strHelpText), simpleLooper_localize(sloopData.strHelpTitle));
            }

            pal.grp.opts.start.edt.text = sloopData.activeItem.workAreaStart * sloopData.activeItemFps;
            pal.grp.opts.end.edt.text = (sloopData.activeItem.workAreaStart + sloopData.activeItem.workAreaDuration) * sloopData.activeItemFps - 1;

            pal.grp.btns.executeBtn.onClick = simpleLooper_doExecute;
            pal.grp.btns.cancelBtn.onClick = simpleLooper_doCancel;
        }

        return pal;
    }

    // Main Functions:
    //

    function simpleLooper_main() {
        //variables
        var selectedLayer = sloopData.activeItem.selectedLayers[0];
        var layerIndex = selectedLayer.index;
        var selectedLabel = sloopData.activeItem.selectedLayers[0].label;
        var precompName = selectedLayer.name + "_loop";

        var inFrame = sloopPal.grp.opts.start.edt.text;
        var outFrame = sloopPal.grp.opts.end.edt.text;

        var inPoint = inFrame / sloopData.activeItemFps;
        var outPoint = outFrame / sloopData.activeItemFps;

        var expression = "loopOut(\"cycle\", 0);";

        //set in and out point
        selectedLayer.inPoint = inPoint;
        selectedLayer.outPoint = outPoint + (1 / sloopData.activeItemFps);

        //precompose, move all attributes
        var layerIndexArrey = [layerIndex];
        var loopCompItem = sloopData.activeItem.layers.precompose(layerIndexArrey, precompName, true);

        //set label
        var loopComp = sloopData.activeItem.layers[layerIndex];
        loopComp.label = selectedLabel;

        //set in and out markers
        var inMarker = new MarkerValue("loop start");
        var outMarker = new MarkerValue("loop end");
        loopComp.property("Marker").setValueAtTime(inPoint, inMarker);
        loopComp.property("Marker").setValueAtTime(outPoint, outMarker);

        //enable time remapping
        loopComp.timeRemapEnabled = true;

        //set in and out keys
        loopComp.property("ADBE Time Remapping").setValueAtTime(inPoint, inPoint)
        loopComp.property("ADBE Time Remapping").setValueAtTime(outPoint, outPoint)

        //remove first and last key
        loopComp.property("ADBE Time Remapping").removeKey(4)
        loopComp.property("ADBE Time Remapping").removeKey(1)

        //add expression
        loopComp.property("ADBE Time Remapping").expression = expression;
    }

    // Button Functions:
    //

    function simpleLooper_doExecute() {
        app.beginUndoGroup(sloopData.scriptName);
        simpleLooper_main();
        app.endUndoGroup();
        sloopPal.close();
    }

    function simpleLooper_doCancel() {
        sloopPal.close();
    }

    // Main Code:
    //

    // Warning
    if (parseFloat(app.version) < 9.0) {
        alert(simpleLooper_localize(sloopData.strMinAE));
    } else {
        // Build and show the floating palette
        var sloopPal = simpleLooper_buildUI(thisObj);
        if (sloopPal !== null) {
            if (sloopPal instanceof Window) {
                if (app.project.activeItem != null) {
                    if ((app.project.activeItem.selectedLayers.length == 1) && (app.project.activeItem.selectedLayers[0].source instanceof CompItem)) {
                        // Show the palette
                        sloopPal.center();
                        sloopPal.show(); 
                    } else {
                         alert(simpleLooper_localize(sloopData.strActiveLayerErr));
                    }
                } else {
                     alert(simpleLooper_localize(sloopData.strActiveCompErr));
                }
            } else {
                sloopPal.layout.layout(true);
            }
        }
    }
})(this);