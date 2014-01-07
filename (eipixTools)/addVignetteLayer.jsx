// Creates a vignette layer

(function addVignetteLayer(thisObj) {
    var activeItem = app.project.activeItem;
    var solidName = "Vignette";
    var solidW = activeItem.width;
    var solidH = activeItem.height;
    var solidPixelAspectRatio = activeItem.pixelAspect;
    var solidDuration = activeItem.duration;
    var newSolid = activeItem.layers.addSolid([0, 0, 0], solidName, solidW, solidH, solidPixelAspectRatio, solidDuration);

    newSolid.property("ADBE Transform Group").property("ADBE Opacity").setValue(60);
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
    
})(this);