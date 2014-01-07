//Make OGV ready composition for ingame use

(function createAlphaComp(thisObj)
{
    var activeComp = app.project.activeItem;
    if(activeComp != null && activeComp instanceof CompItem) {
        app.beginUndoGroup("Make OGV ready composition for ingame use");
        try {       
            var newCompName = "ALPHA COMP (" + activeComp.name + ")";
            var newCompWidth = activeComp.width * 2;
            var offsetLeft = activeComp.width / 2;
            var offsetRight = (activeComp.width / 2) * 3;
            var offsetHight = activeComp.height / 2;
            var newComp = app.project.items.addComp(newCompName, newCompWidth, activeComp.height, activeComp.pixelAspect, activeComp.duration, activeComp.frameRate);
            newComp.layers.add(activeComp);
            newComp.layers[1].duplicate();
            var L1 = newComp.layers[1];
            var L2 = newComp.layers[2];
            L1.property("ADBE Transform Group").property("ADBE Position").setValue([offsetLeft,offsetHight]);
            L2.property("ADBE Transform Group").property("ADBE Position").setValue([offsetRight,offsetHight]);
            L2.property("Effects").addProperty("Fill").property("Color").setValue([1,1,1,1]);
            var newCompBG = newComp.layers.addSolid([0,0,0], "compBG", newComp.width, newComp.height, newComp.pixelAspect, newComp.duration);
            newCompBG.moveToEnd();
        } finally {
            app.endUndoGroup();
        }
    } else {
        alert("Please select a composition.");
    }
})(this);