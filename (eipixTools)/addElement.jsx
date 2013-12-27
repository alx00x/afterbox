// addElement.jsx
// 
// Name: addElement
// Version: 1.0
// 
// Description:     
// This script creates a new solid and adds Element3D to it.
//  


(function addElement(thisObj) {
    var activeItem = app.project.activeItem;
    var solidName = "element";
    var solidW = activeItem.width;
    var solidH = activeItem.height;
    var solidPixelAspectRatio = activeItem.pixelAspect;
    var solidDuration = activeItem.duration;
    var newSolid = activeItem.layers.addSolid([0, 0, 0], solidName, solidW, solidH, solidPixelAspectRatio, solidDuration);
    var addParticular = newSolid.property("Effects").addProperty("Element");
})(this);