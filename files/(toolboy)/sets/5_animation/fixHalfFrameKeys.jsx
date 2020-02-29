// fixHalfFrameKeys.jsx
// 
// Name: fixHalfFrameKeys
// Version: 1.0
// Author: Aleksandar Kocic
// 
// Description:     
// Nudges keys on half-frames to full frame time.
//  

(function fixHalfFrameKeys(thisObj) {
    // Check active comp
    if (app.project.activeItem == null) {
        alert("Please, select your composition.");
        return;
    }

    // Define main variables
    var fhfkData = new Object();

    fhfkData.scriptNameShort = "FHFK";
    fhfkData.scriptName = "Fix Half-Frame Keys";
    fhfkData.scriptVersion = "1.0";
    fhfkData.scriptTitle = fhfkData.scriptName + " v" + fhfkData.scriptVersion;

    fhfkData.strMinAE = {en: "This script requires Adobe After Effects CS4 or later."};
    fhfkData.strActiveCompErr = {en: "Please select a composition."};
    fhfkData.strSelectedLayersErr = {en: "No layer is selected."};
    fhfkData.strSelectedPropertiesErr = {en: "No property is selected."};
    fhfkData.strSelectedKeysErr = {en: "Select at least one key to be fixed."};

    fhfkData.strHelp = {en: "?"};
    fhfkData.strHelpTitle = {en: "Help"};
    fhfkData.strHelpText = {en: "Nudges keys on half-frames to full frame time."};

    // Define project variables
    fhfkData.activeItem = app.project.activeItem;
    fhfkData.activeItemFPS = app.project.activeItem.frameRate;

    // Localize
    function fixHalfFrameKeys_localize(strVar) {
        return strVar["en"];
    }

    //fix keyframe time
    function fixHalfFrameKeys_fixKeys(layerIndex, propertyPathArray, keyIndex, keyValue, nearestFrame) {
        //form property path 
        var propertyPathTemp = propertyPathArray;
        var propertyPath = [];
        for (var i = 0; i < propertyPathTemp.length; i++) {
            propertyPath.push("(" + propertyPathTemp[i].toString() + ")");
        }
        propertyPath = propertyPath.reverse().join("");

        //delete key
        var deleteKeyCommand = "app.project.activeItem.layer(" + layerIndex.toString() + ")" + propertyPath.toString() + ".removeKey(" + keyIndex.toString() + ")";
        eval(deleteKeyCommand);

        //create key at nearest frame
        var addKeyCommand = "app.project.activeItem.layer(" + layerIndex.toString() + ")" + propertyPath.toString() + ".addKey(" + nearestFrame.toString() + ")";
        eval(addKeyCommand);

        //set value
        var setValueCommand = "app.project.activeItem.layer(" + layerIndex.toString() + ")" + propertyPath.toString() + ".setValueAtKey(" + keyIndex.toString() + ",[" + keyValue.toString() + "])";
        eval(setValueCommand);
    }

    //buld property path
    /*function fixHalfFrameKeys_buildPropPath(property) {
        var path;
        var propertyDepth = property.propertyDepth;

        for 

        return path;
    }*/

    // Main Functions
    //
    function fixHalfFrameKeys_main() {
        //variables
        var activeItem = fhfkData.activeItem;
        var activeItemFPS = fhfkData.activeItemFPS;
        var keyInfoArray = [];

        //get selected layers
        var selectedLayers = activeItem.selectedLayers;

        /*if (selectedLayers.length < 1) {
            alert(fixHalfFrameKeys_localize(fhfkData.strSelectedLayersErr));
            return;
        }*/

        //for all selected layers
        for (var i = 0; i < selectedLayers.length; i++) {
            //get selected layers index
            var layerIndex = selectedLayers[i].index;

            //get selected property
            var selectedProperties = selectedLayers[i].selectedProperties;

            /*if (selectedProperties.length < 1) {
                alert(fixHalfFrameKeys_localize(fhfkData.strSelectedPropertiesErr));
                return;
            }*/

            //for all selected properties that have animation
            for (var a = 0; a < selectedProperties.length; a++) {
                if (selectedProperties[a].numKeys > 0) {
                    //get selected properties info
                    var propertyDepth = selectedProperties[a].propertyDepth;

                    //buld property path
                    //var propertyPath = fixHalfFrameKeys_buildPropPath(selectedProperties[a]);
                    var propertyPathArray = [];
                    var currentProperty = selectedProperties[a];
                    while (currentProperty.parentProperty != null) {
                        propertyPathArray.push(currentProperty.propertyIndex);
                        currentProperty = currentProperty.parentProperty;
                    }
    
                    //get selected keys
                    var selectedKeys = selectedProperties[a].selectedKeys;
    
                    /*if (selectedKeys.length < 1) {
                        alert(fixHalfFrameKeys_localize(fhfkData.strSelectedKeysErr));
                        return;
                    }*/
    
                    //get number of keyframes
                    var numberOfKeys = selectedProperties[a].numKeys;
    
                    //get selected keys inicies
                    var selectedKeysIndicies = [];
                    for (var d = 1; d <= numberOfKeys; d++) {
                        if (selectedProperties[a].keySelected(d) == true) {
                            selectedKeysIndicies.push(d);
                        }
                    }
    
                    //for all selected keys
                    for (var f = 0; f < selectedKeysIndicies.length; f++) {
                        //get key index
                        var keyIndex = selectedKeysIndicies[f];
    
                        //get value
                        var keyValue = selectedProperties[a].keyValue(keyIndex);
    
                        //get time
                        var keyTime = selectedProperties[a].keyTime(keyIndex);
    
                        //nearest full frame
                        var nearestFrame = Math.round(keyTime * activeItemFPS) / activeItemFPS; // round to nearest keyframe value;
    
                        //form this keys info array
                        var thisKeysInfo = [layerIndex, propertyPathArray, keyIndex, keyValue, nearestFrame];
    
                        //push this keys info into main array
                        keyInfoArray.push(thisKeysInfo);
                    }
                }
            }
        }

        //fix keys
        for (var d = 0; d < keyInfoArray.length; d++) {
            var currentKey = keyInfoArray[d];
            fixHalfFrameKeys_fixKeys(currentKey[0], currentKey[1], currentKey[2], currentKey[3], currentKey[4]);
        }
    }

    // Init
    //
    if (parseFloat(app.version) < 11.0) {
        alert(fixHalfFrameKeys_localize(fhfkData.strMinAE));
    } else {
        app.beginUndoGroup(fhfkData.scriptName);
        fixHalfFrameKeys_main();
        app.endUndoGroup();
    }
})(this);