// simpleLooper.jsx
// 
// Name: simpleLooper
// Version: 1.5
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
    sloopData.strHelp = {en: "?"};
    sloopData.strHelpTitle = {en: "Help"};
    sloopData.strHelpText = {en: "This script provides easy way to loop a range of frames of a single composition."};

    // Define project variables
    sloopData.activeItem = app.project.activeItem;
    sloopData.activeItemDuration = app.project.activeItem.duration;
    sloopData.activeItemFrames = app.project.activeItem.duration * app.project.activeItem.frameRate;
    sloopData.activeItemOneFrame = 1 / app.project.activeItem.frameRate;
    sloopData.activeItemFps= app.project.activeItem.frameRate;

    // Localize
    function simpleLooper_localize(strVar) {
        return strVar["en"];
    }

    // Main Functions:
    //

    function simpleLooper_main() {
        //variables
        var selectedLayer = sloopData.activeItem.selectedLayers[0];
        var inFrame = selectedLayer.startPoint;
        var outFrame = selectedLayer.outPoint;

        var inPoint = inFrame / sloopData.activeItemFps;
        var outPoint = outFrame / sloopData.activeItemFps;

        var expression = "loopOut(\"cycle\", 0);";

        //enable time remapping
        selectedLayer.timeRemapEnabled = true;

        //set in and out markers
        var inMarker = new MarkerValue("loop start");
        var outMarker = new MarkerValue("loop end");
        var firstKey = selectedLayer.property("ADBE Time Remapping").keyTime(1);
        var secondKey = selectedLayer.property("ADBE Time Remapping").keyTime(2);
        var offsetKey = secondKey - sloopData.activeItemOneFrame;

        selectedLayer.property("Marker").setValueAtTime(firstKey, inMarker);
        selectedLayer.property("Marker").setValueAtTime(secondKey, outMarker);

        //extend the layer
        selectedLayer.outPoint = sloopData.activeItemDuration;

        //set key one frame before end
        selectedLayer.property("ADBE Time Remapping").addKey(offsetKey);

        //remove last key
        selectedLayer.property("ADBE Time Remapping").removeKey(3);

        //add expression
        selectedLayer.property("ADBE Time Remapping").expression = expression;
    }

    // Main Code:
    //

    // Warning
    if (parseFloat(app.version) < 9.0) {
        alert(simpleLooper_localize(sloopData.strMinAE));
    } else {
        // Execute the script
        app.beginUndoGroup(sloopData.scriptName);
        simpleLooper_main();
        app.endUndoGroup();
    }
})(this);