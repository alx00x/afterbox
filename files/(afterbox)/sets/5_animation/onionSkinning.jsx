// onionSkinning.jsx
// 
// Name: onionSkinning
// Version: 1.0
// Author: Aleksandar Kocic
// 
// Description:     
// This script sets up a primitive onion skinning preview.
//  

(function onionSkinning(thisObj) {
    // Check active comp
    if (app.project.activeItem == null) {
        alert("Please, select your composition.");
        return;
    }

    // Define main variables
    var onsData = new Object();

    onsData.scriptNameShort = "ONS";
    onsData.scriptName = "Onion Skinning";
    onsData.scriptVersion = "1.0";
    onsData.scriptTitle = onsData.scriptName + " v" + onsData.scriptVersion;

    onsData.strMinAE = {en: "This script requires Adobe After Effects CS6 or later."};
    onsData.strActiveCompErr = {en: "Please select a composition."};

    onsData.strHelp = {en: "?"};
    onsData.strHelpTitle = {en: "Help"};
    onsData.strHelpText = {en: "This script sets up a primitive onion skinning preview."};

    // Define project variables
    onsData.activeItem = app.project.activeItem;

    // Localize
    function onionSkinning_localize(strVar) {
        return strVar["en"];
    }

    // Main Functions
    //
    function onionSkinning_main() {
        //define
        var OnionSkinning = "Onion Skinning";
        var Margine = "Margine";
        var Before = "Before";
        var After = "After";

        //add adjustment layer
        var active = onsData.activeItem;
        var adjLayer = active.layers.addSolid([0,0,0], OnionSkinning, active.width, active.height, 1);
        adjLayer.adjustmentLayer = true;

        //move to top
        adjLayer.moveToBeginning();

        //add slider
        var slider = adjLayer.property("ADBE Effect Parade").addProperty("ADBE Slider Control");
        slider.name = Margine;
        slider.property("ADBE Slider Control-0001").setValue(4);

        //add echo one
        var echo1 = adjLayer.property("ADBE Effect Parade").addProperty("ADBE Echo");
        var expr1 = "x = effect(\"" + Margine + "\")(\"Slider\");\n-(thisComp.frameDuration * x);";
        echo1.name = Before;
        echo1.property("ADBE Echo-0001").expressionEnabled = true;
        echo1.property("ADBE Echo-0001").expression = expr1;
        echo1.property("ADBE Echo-0004").setValue(0.5);
        echo1.property("ADBE Echo-0005").setValue(2);

        //add echo two
        var echo2 = adjLayer.property("ADBE Effect Parade").addProperty("ADBE Echo");
        var expr2 = "x = effect(\"" + Margine + "\")(\"Slider\");\nthisComp.frameDuration * x;";
        echo2.name = After;
        echo2.property("ADBE Echo-0001").expressionEnabled = true;
        echo2.property("ADBE Echo-0001").expression = expr2;
        echo2.property("ADBE Echo-0004").setValue(0.5);
        echo2.property("ADBE Echo-0005").setValue(2);
    }

    // Init
    //
    if (parseFloat(app.version) < 11.0) {
        alert(onionSkinning_localize(onsData.strMinAE));
    } else {
        app.beginUndoGroup(onsData.scriptName);
        onionSkinning_main();
        app.endUndoGroup();
    }
})(this);