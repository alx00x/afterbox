// cropPrecomps.jsx
// 
// Name: cropPrecomps
// Version: 0.0
// Author: Aleksandar Kocic
// 
// Description:
// This script provides easy way to loop a range of frames of a single composition.
// 

(function cropPrecomps(thisObj) {

    if (app.project.activeItem == null) {
        alert("Please, select your composition.");
        return;
    }

    // Define main variables
    var crpData = new Object();

    crpData.scriptNameShort = "CRP";
    crpData.scriptName = "Crop Precomps";
    crpData.scriptVersion = "0.0";
    crpData.scriptTitle = crpData.scriptName + " v" + crpData.scriptVersion;
    crpData.strMinAE = {en: "This script requires Adobe After Effects CS4 or later."};
    crpData.strActiveLayerErr = {en: "Please select layers (precomps) you wish to crop."};
    crpData.strActiveCompErr = {en: "No active composition."};
    crpData.strHelp = {en: "?"};
    crpData.strHelpTitle = {en: "Help"};
    crpData.strHelpText = {en: "This script crops selected precomps to pixel edges."};

    // Define project variables
    crpData.activeItem = app.project.activeItem;
    crpData.activeItemDuration = app.project.activeItem.duration;
    crpData.activeItemFrames = app.project.activeItem.duration * app.project.activeItem.frameRate;
    crpData.activeItemOneFrame = 1 / app.project.activeItem.frameRate;
    crpData.activeItemFps= app.project.activeItem.frameRate;

    // Localize
    function cropPrecomps_localize(strVar) {
        return strVar["en"];
    }

    // Find maximum value in array
    Array.prototype.max = function() {
        return Math.max.apply(null, this);
    };

    // Find minimum value in array
    Array.prototype.min = function() {
        return Math.min.apply(null, this);
    };

    // Check if object is in array
    function containsObject(obj, list) {
        var i;
        for (i = 0; i < list.length; i++) {
            if (list[i] === obj) {
                return true;
            }
        }
        return false;
    }

    // Get layers bounding box
    function cropPrecomps_getBoundingBox(comp, layer) {

        //create temporary null
        var tempNull = comp.layers.addNull();

        //add point control effect
        var pointControll = tempNull.Effects.addProperty("ADBE Point Control");

        //add expression to calculate top left corner
        var expr = "rect = thisComp.layer('" + layer.name + "').sourceRectAtTime(time, true);\nx = rect.top;\ny = rect.left;\nthisComp.layer('" + layer.name + "').toComp([x,y]);";
        pointControll.property(1).expressionEnabled = true;
        pointControll.property(1).expression = expr;
        var topLeft = pointControll.property(1).value;

        //add expression to calculate bottom right corner
        var expr = "rect = thisComp.layer('" + layer.name + "').sourceRectAtTime(time, true);\nx = rect.top + rect.width;\ny = rect.left + rect.height;\nthisComp.layer('" + layer.name + "').toComp([x,y]);";
        pointControll.property(1).expressionEnabled = true;
        pointControll.property(1).expression = expr;
        var bottomRight = pointControll.property(1).value;

        //remove null
        tempNull.source.remove();

        //return bounds array
        var bounds = [topLeft[0], topLeft[1], bottomRight[0], bottomRight[1]];
        return bounds;
    }

    // Resize to bounding box
    function cropPrecomps_resizeToBoundingBox(path, resized) {

        //get all layers inside precomp
        var currentPrecomp = path[path.length - 1];
        var currentPrecompLayers = currentPrecomp.layers;

        //check if there are comp items
        for (i = 1; i <= currentPrecompLayers.length; i++) {
            var currentLayer = currentPrecompLayers[i];
            if ((currentLayer.source instanceof CompItem) && (containsObject(currentLayer.source, resized) == false)) {
                path.push(currentLayer.source);
                cropPrecomps_resizeToBoundingBox(path, resized);
                return;
            }
        }

        //for each layer get bounding box
        var boundingBoxArray = [];
        for (f = 1; f <= currentPrecompLayers.length; f++) {
            var currentAVLayer = currentPrecompLayers[f];
            if (currentAVLayer instanceof AVLayer) {
                var boundingBox = cropPrecomps_getBoundingBox(currentPrecomp, currentAVLayer);
                boundingBoxArray.push(boundingBox);
            }
        }

        //calculate comp bounding box
        //boundingBoxArray = [
        //                      [tlx, tly, brx, bry],
        //                   ]
        var tlx_array = [];
        for (a = 0; a < boundingBoxArray.length; a++) {
            tlx_array.push(boundingBoxArray[a][0]);
        }
        var tlx_min = Math.min.apply(null, tlx_array);

        var tly_array = [];
        for (a = 0; a < boundingBoxArray.length; a++) {
            tly_array.push(boundingBoxArray[a][1]);
        }
        var tly_min = Math.min.apply(null, tly_array);

        var brx_array = [];
        for (a = 0; a < boundingBoxArray.length; a++) {
            brx_array.push(boundingBoxArray[a][2]);
        }
        var brx_max = Math.max.apply(null, brx_array);

        var bry_array = [];
        for (a = 0; a < boundingBoxArray.length; a++) {
            bry_array.push(boundingBoxArray[a][3]);
        }
        var bry_max = Math.max.apply(null, bry_array);

        var boundingBoxCalculated = [tlx_min, tly_min, brx_max, bry_max];

        //move all layers left and top

        //crop composition

        alert("comp: " + currentPrecomp.name + "\n" + "bounds: " + boundingBoxCalculated.toString());

        //adjust arrays
        path.pop();
        resized.push(currentPrecomp);

        //go to parent
        if (path.length > 0) {
            cropPrecomps_resizeToBoundingBox(path, resized);
        }
    }

    // Main
    function cropPrecomps_main() {

        //get selected layers
        var selectedLayers = crpData.activeItem.selectedLayers;

        //error if nothing is selected
        if (selectedLayers.length == 0) {
            alert(cropPrecomps_localize(crpData.strActiveLayerErr));
        }

        //filter out non-precomps
        var selectedPrecomps = [];
        for (i = 0; i < selectedLayers.length; i++) {
            if (selectedLayers[i].source instanceof CompItem) {
                selectedPrecomps.push(selectedLayers[i]);
            }
        }

        //for each precomp
        for (u = 0; u < selectedPrecomps.length; u++) {
            //variables
            var currentPrecomp = selectedPrecomps[u];
            var path = [];
            var resized = [];
            path.push(currentPrecomp.source);
            //resize to bounding box
            cropPrecomps_resizeToBoundingBox(path, resized);
        }
    }

    // Main Code:
    //

    // Warning
    if (parseFloat(app.version) < 9.0) {
        alert(cropPrecomps_localize(crpData.strMinAE));
    } else {
        // Execute the script
        app.beginUndoGroup(crpData.scriptName);
        cropPrecomps_main();
        app.endUndoGroup();
    }
})(this);