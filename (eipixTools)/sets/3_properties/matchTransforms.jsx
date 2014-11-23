// matchTransforms.jsx
// 
// Name: matchTransforms
// Version: 1.0
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
    matchTransformsData.scriptVersion = "1.0";
    matchTransformsData.scriptTitle = matchTransformsData.scriptName + " v" + matchTransformsData.scriptVersion;

    matchTransformsData.strExecute = {en: "Execute"};
    matchTransformsData.strCancel = {en: "Cancel"};

    matchTransformsData.strErrSelect = {en: "Please select two layers you wish to match."};
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
    var primaryItem = selectedItems[0];
    var secondaryItem = selectedItems[1];

    // Check type
    function matchTransforms_checkType() {
        var layerType = false;
        var primaryItemType;
        var secondaryItemType;
        if (primaryItem.threeDLayer == true) {
            var primaryItemType = 1;
        } else {
            var primaryItemType = 0;
        }
        if (secondaryItem.threeDLayer == true) {
            var secondaryItemType = 1;
        } else {
            var secondaryItemType = 0;
        }
        if (primaryItemType == secondaryItemType) {
            var layerType = true;
        }
        return layerType;
    }

    // Execute
    function matchTransforms_doExecute() {
        app.beginUndoGroup("Match Transforms");

        secondaryItem.property("Transform").property("Position").setValue(primaryItem.property("Transform").property("Position").value);
        secondaryItem.property("Transform").property("Scale").setValue(primaryItem.property("Transform").property("Scale").value);
        if (primaryItem.threeDLayer == true) {
            secondaryItem.property("Transform").property("Orientation").setValue(primaryItem.property("Transform").property("Orientation").value);
            secondaryItem.property("Transform").property("X Rotation").setValue(primaryItem.property("Transform").property("X Rotation").value);
            secondaryItem.property("Transform").property("Y Rotation").setValue(primaryItem.property("Transform").property("Y Rotation").value);
            secondaryItem.property("Transform").property("Z Rotation").setValue(primaryItem.property("Transform").property("Z Rotation").value);
        } else {
            secondaryItem.property("Transform").property("Rotation").setValue(primaryItem.property("Transform").property("Rotation").value);
        }
        
        app.endUndoGroup();
    }

    // MAIN
    if (selectedItems.length != 2) {
        alert(matchTransforms_localize(matchTransformsData.strErrSelect));
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
