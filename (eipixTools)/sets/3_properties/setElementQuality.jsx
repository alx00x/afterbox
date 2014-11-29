// setElementQuality.jsx
// 
// Name: setElementQuality
// Version: 1.0
// Author: Aleksandar Kocic
// 
// Description:
// This script provides a GUI to quickly change element3D quality settings.
//  

(function setElementQuality(thisObj) {

    //Globals
    var activeItem = app.project.activeItem;

    // Define main variables
    var setElementQualityData = new Object();

    setElementQualityData.scriptNameShort = "SEQ";
    setElementQualityData.scriptName = "Set Element Quality";
    setElementQualityData.scriptVersion = "1.0";
    setElementQualityData.scriptTitle = setElementQualityData.scriptName + " v" + setElementQualityData.scriptVersion;

    setElementQualityData.strFull = {en: "Full Render"};
    setElementQualityData.strPreview = {en: "Preview"};
    setElementQualityData.strDraft = {en: "Draft"};

    setElementQualityData.strSelectedOnly = {en: "Affect selected layers only"};
    setElementQualityData.strErr = {en: "You dont have Element3D installed."};
    setElementQualityData.strErrComp = {en: "Please select a composition."};

    setElementQualityData.strHelp = {en: "?"};
    setElementQualityData.strHelpTitle = {en: "Help"};
    setElementQualityData.strHelpText = {en: "This script provides a GUI to quickly change element3D quality settings."};

    // Localize
    function setElementQuality_localize(strVar) {
        return strVar["en"];
    }

    //BuildUI
    function setElementQuality_buildUI(thisObj) {
        var pal = (thisObj instanceof Panel) ? thisObj : new Window("palette", setElementQualityData.scriptTitle);
        var res =
            "group { \
                orientation:'column', alignment:['fill','fill'], \
                header: Group { \
                    alignment:['fill','top'], \
                    title: StaticText { text:'" + setElementQualityData.scriptNameShort + "', alignment:['fill','center'] }, \
                    help: Button { text:'" + setElementQuality_localize(setElementQualityData.strHelp) + "', maximumSize:[30,20], alignment:['right','center'] }, \
                }, \
                options: Panel { orientation:'column', text:'Options', alignment:['fill','fill'], alignChildren: ['fill','center'], \
                    checkbox: Checkbox { text:'" + setElementQuality_localize(setElementQualityData.strSelectedOnly) + "', alignment:['fill','top'] }, \
                }, \
                mode: Panel { orientation:'column', text:'Render Mode', alignment:['fill','fill'], alignChildren: ['fill','center'], \
                    btnFull: Button { text:'" + setElementQuality_localize(setElementQualityData.strFull) + "'}, \
                    btnPreview: Button { text:'" + setElementQuality_localize(setElementQualityData.strPreview) + "'}, \
                    btnDraft: Button { text:'" + setElementQuality_localize(setElementQualityData.strDraft) + "'}, \
                }, \
            }";

        pal.grp = pal.add(res);
        pal.grp.header.help.onClick = function() {
            alert(setElementQualityData.scriptTitle + "\n" + "\n" + setElementQuality_localize(setElementQualityData.strHelpText), setElementQuality_localize(setElementQualityData.strHelpTitle));
        }

        pal.grp.mode.btnFull.onClick = setElementQuality_setFull;
        pal.grp.mode.btnPreview.onClick = setElementQuality_setPreview;
        pal.grp.mode.btnDraft.onClick = setElementQuality_setDraft;

        return pal;
    }

    // Main Functions:
    //
    function setElementQuality_setFull() {
        app.beginUndoGroup("setElementQuality_setFull");

        if ((activeItem != null) && (activeItem instanceof CompItem)) {
            var effectLayers = [];

            if (seqPal.grp.options.checkbox.value == true) { 
                var selectedLayers = activeItem.selectedLayers;
                effectLayers.push.apply(effectLayers, selectedLayers);
            } else {
                var activeItemLayers = activeItem.layers;
                for (var i = 1; i <= activeItemLayers.length; i++) {
                    effectLayers.push(activeItemLayers[i]);
                }
            }

            for (var i = 0; i < effectLayers.length; i++) {
                if ((effectLayers[i] instanceof AVLayer) && (effectLayers[i].property("Effects").property("Element") != null)) {
                    effectLayers[i].property("Effects").property("Element").property("Render Mode").setValue(1);
                }
            }
        } else {
            alert(setElementQuality_localize(setElementQualityData.strErrComp));
        }

        app.endUndoGroup();
    }

    function setElementQuality_setPreview() {
        app.beginUndoGroup("setElementQuality_setPreview");

        if ((activeItem != null) && (activeItem instanceof CompItem)) {
            var effectLayers = [];

            if (seqPal.grp.options.checkbox.value == true) { 
                var selectedLayers = activeItem.selectedLayers;
                effectLayers.push.apply(effectLayers, selectedLayers);
            } else {
                var activeItemLayers = activeItem.layers;
                for (var i = 1; i <= activeItemLayers.length; i++) {
                    effectLayers.push(activeItemLayers[i]);
                }
            }

            for (var i = 0; i < effectLayers.length; i++) {
                if ((effectLayers[i] instanceof AVLayer) && (effectLayers[i].property("Effects").property("Element") != null)) {
                    effectLayers[i].property("Effects").property("Element").property("Render Mode").setValue(2);
                }
            }
        } else {
            alert(setElementQuality_localize(setElementQualityData.strErrComp));
        }

        app.endUndoGroup();
    }

    function setElementQuality_setDraft() {
        app.beginUndoGroup("setElementQuality_setDraft");

        if ((activeItem != null) && (activeItem instanceof CompItem)) {
            var effectLayers = [];

            if (seqPal.grp.options.checkbox.value == true) { 
                var selectedLayers = activeItem.selectedLayers;
                effectLayers.push.apply(effectLayers, selectedLayers);
            } else {
                var activeItemLayers = activeItem.layers;
                for (var i = 1; i <= activeItemLayers.length; i++) {
                    effectLayers.push(activeItemLayers[i]);
                }
            }

            for (var i = 0; i < effectLayers.length; i++) {
                if ((effectLayers[i] instanceof AVLayer) && (effectLayers[i].property("Effects").property("Element") != null)) {
                    effectLayers[i].property("Effects").property("Element").property("Render Mode").setValue(3);
                }
            }
        } else {
            alert(setElementQuality_localize(setElementQualityData.strErrComp));
        }

        app.endUndoGroup();
    }

    // Main code:
    //

    // Check if Element3D is installed
    setElementQualityData.check = false;
    var effectNameCollection = app.effects;
    for (var i = 0; i < effectNameCollection.length; i++) {
        var name = effectNameCollection[i].displayName;
        if (name == "Element") {
            setElementQualityData.check = true;
        }
    }

    // Prerequisites check
    if (setElementQualityData.check == false) {
        alert(setElementQuality_localize(setElementQualityData.strErr));
    } else {
        // Build and show the floating palette
        var seqPal = setElementQuality_buildUI(thisObj);
        if (seqPal !== null) {
            if (seqPal instanceof Window) {
                // Show the palette
                seqPal.center();
                seqPal.show();
            } else {
                seqPal.layout.layout(true);
            }
        }
    }

})(this);