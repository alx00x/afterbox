// transparentOGV.jsx
// 
// Name: transparentOGV
// Version: 1.3
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

    // Define variables
    var outputQuality = "Best Settings";
    var outputTemplateName = "PNG Sequence";

    // Functions
    function checkTemplate(templateName) {
        var renderQ = app.project.renderQueue;
        var tempComp = app.project.items.addComp("setProxyTempComp", 100, 100, 1, 1, 25);
        var tempCompQueueItem = renderQ.items.add(tempComp)
        var tempCompQueueItemIndex = renderQ.numItems;
        var templateArray = renderQ.item(tempCompQueueItemIndex).outputModules[1].templates;
        for (var i = 1; i <= renderQ.numItems; i++) {
            var templateExists = false;
            for (var j = 0; j <= templateArray.length; j++) {
                if (templateArray[j] == templateName) {
                    templateExists = true;
                }
            }
        }
        tempCompQueueItem.remove();
        tempComp.remove();

        return templateExists;
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
        renderQueueThumb.applyTemplate(outputQuality);
        renderQueueThumb.timeSpanStart = endFrame;
        renderQueueThumb.timeSpanDuration = oneFrame;
        renderQueueThumb.outputModules[1].applyTemplate(outputTemplateName);
        renderQueueThumb.outputModules[1].file = new File(desktopPath.fsName.toString() + "\\" + activeComp.name + "_[#####].png");
    }

    // Main code
    var checkPoint = checkTemplate(outputTemplateName);
    if (checkPoint == true) {

        var projectFile = app.project.file;
        var desktopPath = new Folder("~/Desktop");
        var activeComp = app.project.activeItem;
        var timeSliderPos = activeComp.time;
        var endFrame = activeComp.duration - activeComp.frameDuration;
        var oneFrame = activeComp.frameDuration;
        var selectedLayers = [];
        var selectedLayersIndices = [];
        var newComp;

        if ((activeComp != null) && (activeComp instanceof CompItem)) {
            app.beginUndoGroup("Make OGV ready composition for ingame use");
            if ((activeComp.width % 16 === 0) && (activeComp.height % 16 === 0)) {
                selectedLayers = activeComp.selectedLayers;
                if (selectedLayers.length === 0) {
                    alert("Select at least one background layer.");
                } else {
                    //get each selected layer's index
                    for (var i = 0; i < selectedLayers.length; i++) {
                        selectedLayersIndices.push(selectedLayers[i].index);
                    }
                    
                    //copy source of activeComp
                    var activeCompAlpha = activeComp.duplicate();
                    activeCompAlpha.name = "alpha(" + activeComp.name + ")";

                    //set selected layers as guides in copy of activeComp
                    for (var i = 0; i < selectedLayersIndices.length; i++) {
                        activeCompAlpha.layer(selectedLayersIndices[i]).guideLayer = true;
                    }

                    //setup the export ready composition
                    try {       
                        var newCompName = "ogv(" + activeComp.name + ")";
                        var newCompWidth = activeComp.width * 2;
                        var offsetLeft = activeComp.width / 2;
                        var offsetRight = (activeComp.width / 2) * 3;
                        var offsetHight = activeComp.height / 2;
                        newComp = app.project.items.addComp(newCompName, newCompWidth, activeComp.height, activeComp.pixelAspect, activeComp.duration, activeComp.frameRate);
                        newComp.layers.add(activeComp);
                        newComp.layers.add(activeCompAlpha);
                        var L1 = newComp.layers[2];
                        var L2 = newComp.layers[1];
                        L1.property("ADBE Transform Group").property("ADBE Position").setValue([offsetLeft,offsetHight]);
                        L2.property("ADBE Transform Group").property("ADBE Position").setValue([offsetRight,offsetHight]);
                        L2.property("Effects").addProperty("Fill").property("Color").setValue([1,1,1,1]);
                        var newCompBG = newComp.layers.addSolid([0,0,0], "compBG", newComp.width, newComp.height, newComp.pixelAspect, newComp.duration);
                        newCompBG.moveToEnd();
                        addToRenderQueue();
                    } catch (err) {
                        alert(err.toString());
                    }
                }
            } else {
                alert("Composition dimensions are not divisible by 16.");
            }
            app.endUndoGroup();
        } else {
            alert("Select a composition.");
        }
    } else {
        alert("You don't have an Output Module Template called " + outputTemplateName + ". Run importOutputTemplates.jsx ('IMP TEMP' button in the toolbar).");
    }
})(this);