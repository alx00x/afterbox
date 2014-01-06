{

    // Functions
    //
    function collectElementInstances() {
        var elementInstancesArray = [];
        for (var i = 1; i <= app.project.numItems; i++) {
            if (app.project != null && app.project.item(i) instanceof CompItem) {
                var curComp = app.project.item(i);
                for (var f = 1; f <= curComp.numLayers; f++) {
                    if (curComp.layer(f) instanceof AVLayer && curComp.layer(f).property("ADBE Effect Parade") !=null && curComp.layer(f).property("ADBE Effect Parade").numProperties !=0)  {
                        var curLayer = curComp.layer(f);
                        for (var j = 1; j <= curLayer.property("ADBE Effect Parade").numProperties; j++) {
                            var curProperty = curLayer.property("ADBE Effect Parade").property(j);
                            if (curProperty.matchName == "VIDEOCOPILOT 3DArray") {
                                elementInstancesArray.push([curComp.id, curLayer.index, curProperty.propertyIndex]);
                            }
                        }
                    }
                }
            }
        }
        return elementInstancesArray;
    }


    function triggerElementResources(array) {
        var arrayLenght = numProps(array);
        for (var i = 0; i < arrayLenght; i++) {
            var elemCompId = array[i][0];
            var elemCompIdx = itemIndexFromId(elemCompId);
            var elemLayerIdx = array[i][1];
            var elemPropertyIdx = array[i][2];
            
            var elemComp = app.project.item(elemCompIdx);
            var elemLayer = app.project.item(elemCompIdx).layer(elemLayerIdx);
            var elemProperty = app.project.item(elemCompIdx).layer(elemLayerIdx).property("ADBE Effect Parade").property(elemPropertyIdx);
            
            var newSolid = elemComp.layers.addSolid([0, 0, 0], "tempTextureLayer"+i, elemComp.width, elemComp.height, elemComp.pixelAspect, elemComp.duration);
            newSolid.moveToEnd();
            var newSolidIndex = elemComp.numLayers;
            
            elemLayer.solo = true;
            elemLayer.openInViewer();
            elemProperty.property("VIDEOCOPILOT 3DArray-1861").setValue(newSolidIndex);
            newSolid.source.remove();
        }
    }


    function itemIndexFromId(input) {
        for (var i = 1; i <= app.project.numItems; i++) {
            if (app.project.item(i).id ==  input) {
                return i;
            }
        }
        return false;
    }


    function numProps(obj) {
        var c = 0;
        for (var key in obj) {
            if (obj.hasOwnProperty(key))++c;
        }
        return c;
    }


    // Main
    //
    var elemArray = collectElementInstances();
    triggerElementResources(elemArray);
    
    //alert(elemArray);

}