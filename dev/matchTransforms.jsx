// matchTransforms.jsx
// 
// Name: matchTransforms
// Version: 3.0
// Author: Aleksandar Kocic
// 
// Description:     
// This script copies transform values form one selected 
// object to another.
//  


(function matchTransforms(thisObj)
{

    // Globals
    var matchTransformsData = new Object(); // Store globals in an object
    matchTransformsData.scriptNameShort = "CCAC";
    matchTransformsData.scriptName = "Match Transforms";
    matchTransformsData.scriptVersion = "3.0";
    matchTransformsData.scriptTitle = matchTransformsData.scriptName + " v" + matchTransformsData.scriptVersion;

    matchTransformsData.strExecute = {en: "Execute"};
    matchTransformsData.strCancel = {en: "Cancel"};

    matchTransformsData.strErrSelect = {en: "Please select exactly two layers you wish to match."};
    matchTransformsData.strErrChild = {en: "Layer you are trying to move cannot be a child layer. \nPlease remove parenting of layer: "};
    matchTransformsData.strErrType = {en: "Selected layers are not the same type. They both need to be either 2D or 3D."};
    matchTransformsData.strErrNoMatch = {en: "Could not match."};

    matchTransformsData.strMinAE = {en: "This script requires Adobe After Effects CS5 or later."};
    matchTransformsData.strHelp = {en: "?"};
    matchTransformsData.strHelpTitle = {en: "Help"};
    matchTransformsData.strHelpText = 
    {
        en: "This script copies transform values from one layer to another.\n" +
        "\n" +
        "Usage:\n" +
        "\n" +
        "        1. select the layer you want to match to\n" +
        "        2. shift select the layer you want to match to the previously selected layer\n" +
        "        3. execute the script\n" +
        "\n"
    };

    // Localize
    function matchTransforms_localize(strVar)
    {
        return strVar["en"];
    }

    // Selection
    var activeItem = app.project.activeItem;
    var selectedItems = activeItem.selectedLayers;
    var primaryItem = selectedItems[1];
    var secondaryItem = selectedItems[0];

    // Check type
    function matchTransforms_checkType() {
        var layerType = false;
        var primaryItemType;
        var secondaryItemType;
        if ((primaryItem.threeDLayer == true) || (primaryItem instanceof CameraLayer)) {
            var primaryItemType = 1;
        } else {
            var primaryItemType = 0;
        }
        if ((secondaryItem.threeDLayer == true) || (secondaryItem instanceof CameraLayer)) {
            var secondaryItemType = 1;
        } else {
            var secondaryItemType = 0;
        }
        if (primaryItemType == secondaryItemType) {
            var layerType = true;
        }
        return layerType;
    }

    // Get world position values
    // takes layer index
    // returns x, y and y
    function matchTransforms_getWorldPos(idx) {
        var x;
        var y;
        var z;

        // check if dimensions are separated
        var itemSeperation = activeItem.layer(idx).transform.position.dimensionsSeparated;

        // check layer is child
        var parentLayerIndicies = [];
        var activeLayer = activeItem.layer(idx);
        while (activeLayer != null) {
            parentLayerIndicies.push(activeLayer.index);
            activeLayer = activeLayer.parent;
        }

        // get positions
        if (itemSeperation == true) {
            x = 0;
            y = 0;
            z = 0;
            for (var i = 0; i < parentLayerIndicies.length; i++) {
                x = activeItem.layer(parentLayerIndicies[i]).transform("ADBE Position_0").value + x;
                y = activeItem.layer(parentLayerIndicies[i]).transform("ADBE Position_1").value + y;
                z = activeItem.layer(parentLayerIndicies[i]).transform("ADBE Position_2").value + z;
            }
        } else {
            x = 0;
            y = 0;
            z = 0;
            for (var i = 0; i < parentLayerIndicies.length; i++) {
                x = activeItem.layer(parentLayerIndicies[i]).transform.position.value[0] + x;
                y = activeItem.layer(parentLayerIndicies[i]).transform.position.value[1] + y;
                z = activeItem.layer(parentLayerIndicies[i]).transform.position.value[2] + z;
            }
        }

        // return world values
        var positionArr = [x, y, z];
        return positionArr;
    }

    // Get world scale values
    function matchTransforms_getWorldSca(idx) {
        var x;
        var y;
        var z;

        // unlink dimensions
        var itemSeperation = activeItem.layer(idx).transform.position.dimensionsSeparated;






    }

    // Get world orientation values
    function matchTransforms_getWorldRot(idx) {
        
    }

    // Execute
    function matchTransforms_doExecute() {
        app.beginUndoGroup("Match Transforms");

        var primaryItemSeperation = primaryItem.transform.position.dimensionsSeparated;
        var secondaryItemSeperation = secondaryItem.transform.position.dimensionsSeparated;

        // get world transforms
        var positionArray = matchTransforms_getWorldPos(primaryItem.index);

        // set position
        if ((primaryItemSeperation == true) && (secondaryItemSeperation == true)) {
            secondaryItem.property("Transform").property("ADBE Position_0").setValue(positionArray[0]);
            secondaryItem.property("Transform").property("ADBE Position_1").setValue(positionArray[1]);
            secondaryItem.property("Transform").property("ADBE Position_2").setValue(positionArray[2]);
        } else if ((primaryItemSeperation == true) && (secondaryItemSeperation == false)) {
            secondaryItem.property("Transform").property("Position").setValue(positionArray);
        } else if ((primaryItemSeperation == false) && (secondaryItemSeperation == true)) {
            secondaryItem.property("Transform").property("ADBE Position_0").setValue(positionArray[0]);
            secondaryItem.property("Transform").property("ADBE Position_1").setValue(positionArray[1]);
            secondaryItem.property("Transform").property("ADBE Position_2").setValue(positionArray[2]);
        } else if ((primaryItemSeperation == false) && (secondaryItemSeperation == false)) {
            secondaryItem.property("Transform").property("Position").setValue(positionArray);
        }

        // get world scale
        var positionArray = matchTransforms_getWorldSca(primaryItem.index);

        // set scale
        if (secondaryItem instanceof AVLayer) {
            secondaryItem.property("Transform").property("Scale").setValue(primaryItem.property("Transform").property("Scale").value);
        }

        // // get world rotation
        // var positionArray = matchTransforms_getWorldRot(primaryItem.index);

        // // set rotation
        // if (primaryItem.threeDLayer == true) {
        //     secondaryItem.property("Transform").property("Orientation").setValue(primaryItem.property("Transform").property("Orientation").value);
        //     secondaryItem.property("Transform").property("X Rotation").setValue(primaryItem.property("Transform").property("X Rotation").value);
        //     secondaryItem.property("Transform").property("Y Rotation").setValue(primaryItem.property("Transform").property("Y Rotation").value);
        //     secondaryItem.property("Transform").property("Z Rotation").setValue(primaryItem.property("Transform").property("Z Rotation").value);
        // } else {
        //     secondaryItem.property("Transform").property("Rotation").setValue(primaryItem.property("Transform").property("Rotation").value);
        // }

        app.endUndoGroup();
    }

    // MAIN
    if (selectedItems.length != 2) {
        alert(matchTransforms_localize(matchTransformsData.strErrSelect));
        return;
    } else if (secondaryItem.parent != null) {
        alert(matchTransforms_localize(matchTransformsData.strErrChild) + secondaryItem.name);
        return;
    } else {
        layerType = matchTransforms_checkType();
        if (layerType == false) {
            alert(matchTransforms_localize(matchTransformsData.strErrSelect));
            return;
        } else {
            matchTransforms_doExecute();
        }
    }
})(this);
