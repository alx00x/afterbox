// transparentOGV.jsx
// 
// Name: transparentOGV
// Version: 1.2
// Author: Aleksandar Kocic
// 
// Description:     
// This script prepares a composition and adds render items
// for engine use. Script checks if dimensions are dividable 
// by 16 and offers an option to reduce unnecessarily space 
// around the object.
//  


(function transparentOGV(thisObj)
{
    var projectFile = app.project.file;
    var desktopPath = new Folder("~/Desktop");
    var activeComp = app.project.activeItem;
    var timeSliderPos = activeComp.time;
    var endFrame = activeComp.duration - activeComp.frameDuration;
    var oneFrame = activeComp.frameDuration;
    var newComp;

    if ((activeComp != null) && (activeComp instanceof CompItem)) {
        app.beginUndoGroup("Make OGV ready composition for ingame use");

        if ((activeComp.width % 16 === 0) && (activeComp.height % 16 === 0)) {
            try {       
                var newCompName = "OGV(" + activeComp.name + ")";
                var newCompWidth = activeComp.width * 2;
                var offsetLeft = activeComp.width / 2;
                var offsetRight = (activeComp.width / 2) * 3;
                var offsetHight = activeComp.height / 2;
                newComp = app.project.items.addComp(newCompName, newCompWidth, activeComp.height, activeComp.pixelAspect, activeComp.duration, activeComp.frameRate);
                newComp.layers.add(activeComp);
                newComp.layers[1].duplicate();
                var L1 = newComp.layers[1];
                var L2 = newComp.layers[2];
                L1.property("ADBE Transform Group").property("ADBE Position").setValue([offsetLeft,offsetHight]);
                L2.property("ADBE Transform Group").property("ADBE Position").setValue([offsetRight,offsetHight]);
                L2.property("Effects").addProperty("Fill").property("Color").setValue([1,1,1,1]);
                var newCompBG = newComp.layers.addSolid([0,0,0], "compBG", newComp.width, newComp.height, newComp.pixelAspect, newComp.duration);
                newCompBG.moveToEnd();
                addToRenderQueue()
            } catch (err) {
                alert(err.toString());
            }
        } else {
            alert("Composition dimensions are not divisible by 16.");
        }

        app.endUndoGroup();
    } else {
        alert("Please select a composition.");
    }

    // Functions
    function addQuotes(string) { 
        return "\""+ string + "\"";
    }

    function addToRenderQueue() {
        var renderQueueComp = app.project.renderQueue.items.add(newComp);
        var renderQueueCompIndex = app.project.renderQueue.numItems;
        renderQueueComp.applyTemplate("Best Settings");
        renderQueueComp.timeSpanStart = 0;
        renderQueueComp.timeSpanDuration = newComp.duration;
        renderQueueComp.outputModules[1].applyTemplate("Lossless");
        renderQueueComp.outputModules[1].file = new File(desktopPath.fsName.toString() + "\\" + activeComp.name + ".avi");

        var renderQueueThumb = app.project.renderQueue.items.add(activeComp);
        var renderQueueThumbIndex = app.project.renderQueue.numItems;
        renderQueueThumb.applyTemplate("Best Settings");
        renderQueueThumb.timeSpanStart = endFrame;
        renderQueueThumb.timeSpanDuration = oneFrame;
        renderQueueThumb.outputModules[1].applyTemplate("Photoshop");
        renderQueueThumb.outputModules[1].file = new File(desktopPath.fsName.toString() + "\\" + activeComp.name + "_[#####].psd");
    }
})(this);