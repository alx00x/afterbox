// quickColor.jsx
// 
// Name: quickColor
// Version: 0.1
// Author: Aleksandar Kocic
// 
// Description: Turns animation to sprite tiled sheets.
// 
// 

(function quickColor(thisObj) {

    if (app.project.activeItem == null) {
        alert("Please, select your composition.");
        return;
    }

    // Define main variables
    var qcoData = new Object();

    qcoData.scriptNameShort = "QCO";
    qcoData.scriptName = "Quick Color";
    qcoData.scriptVersion = "0.1";
    qcoData.scriptTitle = qcoData.scriptName + " v" + qcoData.scriptVersion;

    qcoData.strMinAE = {en: "This script requires Adobe After Effects CS4 or later."};
    qcoData.strActiveCompErr = {en: "Please select a composition."};

    qcoData.strHelp = {en: "?"};
    qcoData.strHelpTitle = {en: "Help"};
    qcoData.strErr = {en: "Something went wrong."};
    qcoData.strHelpText = {en: "This script allows for quick solod color changes on selected layers."};

    // Localize
    function quickColor_localize(strVar) {
        return strVar["en"];
    }

    // Functions:
    //

    // Convert a hexidecimal color string
    var hexToRGB = function(hex) {
        var r = hex >> 16;
        var g = hex >> 8 & 0xFF;
        var b = hex & 0xFF;
        return [r, g, b];
    }

    // Change color
    function quickColor_change(layers, color) {
        for (var i = 0; i < layers.length; i++) {
            var element = layers[i];
            if (element.source != null) {
                if (element.source.mainSource instanceof SolidSource) {
                    element.source.mainSource.color = color;
                }
            }
        }
    }

    // Main function
    function quickColor_main() {
        //get selected layers
        var selectedLayers = app.project.activeItem.selectedLayers;

        //select color ui
        var colorDecimal = $.colorPicker();
        var colorHexadecimal = colorDecimal.toString(16);
        var colorRGB = hexToRGB(parseInt(colorHexadecimal, 16));
        var selectedColor = [colorRGB[0] / 255, colorRGB[1] / 255, colorRGB[2] / 255];

        //change solid color
        quickColor_change(selectedLayers, selectedColor);
    }


    // Main code:
    //

    // Warning
    var appVersion = parseFloat(app.version);
    if (appVersion < 9.0) {
        alert(quickColor_localize(qcoData.strMinAE));
    } else {
        // Execute the script
        app.beginUndoGroup(qcoData.scriptName);
        quickColor_main()
        app.endUndoGroup();
    }
})(this);