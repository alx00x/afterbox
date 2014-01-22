// addVignetteLayer.jsx
// 
// Name: addVignetteLayer
// Version: 1.1
// Author: Aleksandar Kocic
// 
// Description:     
// This script creates a new solid and creates a mask to 
// simulate the lens vignetting effect.
//  

(function addVignetteLayer(thisObj) {
    var activeItem = app.project.activeItem;
    var selectedLayer = activeItem.selectedLayers[0];
    var layerNumber = 0;
    var layerName;
    var testNumber;

    for (var i = 1; i <= app.project.numItems; i++) {
        if ((app.project != null) && (app.project.item(i).mainSource instanceof SolidSource)) {
            layerName = app.project.item(i).name;
            if (layerName.indexOf("vignette ") != -1) {
                testNumber = parseInt(layerName.substring(layerName.lastIndexOf(" "), layerName.length));
                if (!isNaN(testNumber)) {
                    layerNumber = Math.max(layerNumber, testNumber);
                }
            }
        }
    }

    app.beginUndoGroup("addVignetteLayer");

    var solidName = "vignette " + (layerNumber + 1);
    var solidW = activeItem.width;
    var solidH = activeItem.height;
    var solidPixelAspectRatio = activeItem.pixelAspect;
    var solidDuration = activeItem.duration;
    var newSolid = activeItem.layers.addSolid([0, 0, 0], solidName, solidW, solidH, solidPixelAspectRatio, solidDuration);

    newSolid.property("ADBE Transform Group").property("ADBE Opacity").setValue(60);
    if (selectedLayer != null) {
        newSolid.moveBefore(selectedLayer);
    }
    var ratio = .6;
    var h = newSolid.width/2;
    var v = newSolid.height/2;
    var th = h*ratio;
    var tv = v*ratio;
    
    var newMask = newSolid.Masks.addProperty("ADBE Mask Atom");
    newMask.maskMode = MaskMode.SUBTRACT;

    var maskShape = newMask.property("ADBE Mask Shape").value;
    maskShape.vertices = [[h,0],[0,v],[h,2*v],[2*h,v]];
    maskShape.inTangents = [[th,0],[0,-tv],[-th,0],[0,tv]];
    maskShape.outTangents = [[-th,0],[0,tv],[th,0],[0,-tv]];
    maskShape.closed = true;
    
    newMask.property("ADBE Mask Shape").setValue(maskShape);
    newMask.property("ADBE Mask Feather").setValue([60,60]);
    newMask.property("ADBE Mask Offset").setValue(30);

    app.endUndoGroup();
    
})(this);