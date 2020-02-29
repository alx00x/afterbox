// renamePuppetPins.jsx
// 
// Name: renamePuppetPins
// Version: 1.1
// Author: Aleksandar Kocic
// 
// Description:     
// This script renames selected puppet pins taking the name 
// of the layer as a base.
//  

(function renamePuppetPins(thisObj) {
    // Check active comp
    if (app.project.activeItem == null) {
        alert("Please, select your composition.");
        return;
    }

    // Define main variables
    var rppData = new Object();

    rppData.scriptNameShort = "RPP";
    rppData.scriptName = "Rename Puppet Pins";
    rppData.scriptVersion = "1.1";
    rppData.scriptTitle = rppData.scriptName + " v" + rppData.scriptVersion;

    rppData.strMinAE = { en: "This script renames selected puppet pins taking the name of the layer as a base." };
    rppData.strActivePPErr = { en: "Please select al least one puppet pin." };
    rppData.strSelectedLayersErr = { en: "Please select only one layer." };

    rppData.strHelp = { en: "?" };
    rppData.strHelpTitle = { en: "Help" };
    rppData.strHelpText = { en: "This script renames selected puppet pins taking the name of the layer as a base." };

    // Define project variables
    rppData.activeItem = app.project.activeItem;

    // Localize
    function renamePuppetPins_localize(strVar) {
        return strVar["en"];
    }

    // Generate random lowercase string of specified lenght
    function randomString(num) {
        var s = '';
        var randomchar = function () {
            var n = Math.floor(Math.random() * 25);
            return String.fromCharCode(n + 97); //a-z
        }
        while (s.length < num) s += randomchar();
        return s;
    }

    // Check if at least one puppet pin is selected
    function checkSelectedPP() {
        var selectedProps = rppData.activeItem.selectedProperties;
        if (selectedProps != null) {
            for (var i = 0; i < selectedProps.length; i++) {
                if (selectedProps[i].matchName == "ADBE FreePin3 PosPin Atom") {
                    return true;
                }
            }
        } else {
            return false;
        }
    }

    // Main Functions
    //
    function renamePuppetPins_main() {
        //get selected layer
        var selectedLayer = rppData.activeItem.selectedLayers[0];
        var selectedLayerName = selectedLayer.name;
        var selectedProps = rppData.activeItem.selectedProperties;
        var randomStringGenerated = randomString(2);


        // get all mesh indices
        var indices = []
        for (var a = 0; a < selectedProps.length; a++) {
            if (selectedProps[a].matchName == "ADBE FreePin3 PosPin Atom") {
                var item = selectedProps[a].parentProperty.parentProperty.propertyIndex;
                if (indices.indexOf(item) === -1) {
                    indices.push(item);
                }
            }
        }

        // generate random strings for each mesh index
        var randomStrings = [];
        for (var j = 0; j < indices.length; j++) {
            var randomStringGenerated = randomString(2);
            randomStrings.push(randomStringGenerated);
        }

        //get selected puppet pins and rename pins
        for (var i = 0; i < selectedProps.length; i++) {
            if (selectedProps[i].matchName == "ADBE FreePin3 PosPin Atom") {
                var index = selectedProps[i].propertyIndex;
                var numOfProperties = selectedProps[i].parentProperty.numProperties;
                var meshPropertyIndex = selectedProps[i].parentProperty.parentProperty.propertyIndex;
                var id = numOfProperties - index + 1;
                selectedProps[i].name = selectedLayerName + "_" + id + "_[" + randomStrings[meshPropertyIndex - 1] + "]";
            }
        }

    }

    // Init
    //
    if (parseFloat(app.version) < 11.0) {
        alert(renamePuppetPins_localize(rppData.strMinAE));
    } else {
        app.beginUndoGroup(rppData.scriptName);
        var selectedLayers = rppData.activeItem.selectedLayers;
        if ((selectedLayers.length < 1) || (selectedLayers.length > 1)) {
            alert(renamePuppetPins_localize(rppData.strSelectedLayersErr));
        } else {
            if (checkSelectedPP() == true) {
                renamePuppetPins_main();
            } else {
                alert(renamePuppetPins_localize(rppData.strActivePPErr));
            }
        }
        app.endUndoGroup();
    }
})(this);