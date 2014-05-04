// setProxy.jsx
// 
// Name: setProxy
// Version: 0.1
// Author: Aleksandar Kocic
// 
// Description:     
// Creates proxy PNG sequence for each selected item.
// Needs a Output Module Template called "PNG Sequence".
//  


(function setProxy(thisObj)
{
    var selectedItems = app.project.selection;

    if (selectedItems.length > 0) {

        // Save project
        app.project.save();
    
        // Define variables
        var outputQuality = "Draft Settings";
        var outputTemplateName = "PNG Sequence";
    
        // Functions
        function addToRenderQueue(item) {
            var renderQueueComp = renderQ.items.add(item);
            var itemRenderPath = renderPath.fsName.toString() + "\\" + item.name;
            Folder(itemRenderPath).create();
            renderQueueComp.applyTemplate(outputQuality);
            renderQueueComp.timeSpanStart = 0;
            renderQueueComp.timeSpanDuration = item.duration;
            renderQueueComp.outputModules[1].applyTemplate(outputTemplateName);
            renderQueueComp.outputModules[1].file = new File(itemRenderPath + "\\" + item.name + "_[#####].png");
            renderQueueComp.outputModules[1].postRenderAction = PostRenderAction.SET_PROXY;
        }
    
        // Check if PNG Sequenxce output template exists
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
    
        // Main code
        var checkPoint = checkTemplate(outputTemplateName);
        if (checkPoint == true) {

            // Define render path 
            var renderPath = Folder.selectDialog();
    
            // Main code
            for (var i = 0; i <= selectedItems.length; i++) {
                if (selectedItems[i] instanceof CompItem) {
                    addToRenderQueue(selectedItems[i]);
                }
            }
            renderQ.render()

        } else {
            // Something went wrong, cannot continue
            alert("You don't have an Output Module Template called " + outputTemplateName + ". Please run importOutputTemplates.jsx script.");
        }
    } else {
        alert("Select at least one item in project window.");
    }
})(this);