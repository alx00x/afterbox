// setMaterialOptions.jsx
// 
// Name: setMaterialOptions
// Version: 1.2
// Author: Aleksandar Kocic
// 
// Description:
// This script provides a GUI to quickly change material options
// for selected layers. These options are "Accept Lights, "Accept Shadows"
// and "Cast Shadows". Script assumes they are not keyframed.
//  
// Note: This version of the script requires After Effects CS5 
// or later.

(function setMaterialOptions(thisObj) {

    // Define main variables
    var setMaterialOptionsData = new Object();

    setMaterialOptionsData.scriptNameShort = "SMO";
    setMaterialOptionsData.scriptName = "Set Material Options";
    setMaterialOptionsData.scriptVersion = "1.2";
    setMaterialOptionsData.scriptTitle = setMaterialOptionsData.scriptName + " v" + setMaterialOptionsData.scriptVersion;

    setMaterialOptionsData.strOn = {en: "ON"};
    setMaterialOptionsData.strOff = {en: "OFF"};
    setMaterialOptionsData.strHelp = {en: "?"};
    setMaterialOptionsData.strHelpTitle = {en: "Help"};
    setMaterialOptionsData.strHelpText = {en: "This script provides a GUI to quickly change material options for selected layers."};

    // Localize
    function setMaterialOptions_localize(strVar) {
        return strVar["en"];
    }

    // Main functions
    function lightsOn() {
        var myLayers = app.project.activeItem.selectedLayers;
        for (var i = 0; i < myLayers.length; i++) {
            myLayers[i].acceptsLights.setValue(true);
        }
    }

    function lightsOff() {
        var myLayers = app.project.activeItem.selectedLayers;
        for (var i = 0; i < myLayers.length; i++) {
            myLayers[i].acceptsLights.setValue(false);
        }
    }

    function shadowsOn() {
        var myLayers = app.project.activeItem.selectedLayers;
        for (var i = 0; i < myLayers.length; i++) {
            myLayers[i].acceptsShadows.setValue(true);
        }
    }

    function shadowsOff() {
        var myLayers = app.project.activeItem.selectedLayers;
        for (var i = 0; i < myLayers.length; i++) {
            myLayers[i].acceptsShadows.setValue(false);
        }
    }

    function castShadowsOn() {
        var myLayers = app.project.activeItem.selectedLayers;
        for (var i = 0; i < myLayers.length; i++) {
            myLayers[i].castsShadows.setValue(true);
        }
    }

    function castShadowsOff() {
        var myLayers = app.project.activeItem.selectedLayers;
        for (var i = 0; i < myLayers.length; i++) {
            myLayers[i].castsShadows.setValue(false);
        }
    }

    //BuildUI
    function setMaterialOptions_createUI(thisObj) {
        var pal = (thisObj instanceof Panel) ? thisObj : new Window("palette", setMaterialOptionsData.scriptTitle);
        var res =
            "group { \
                orientation:'column', alignment:['fill','fill'], \
                header: Group { \
                    alignment:['fill','top'], \
                    title: StaticText { text:'" + setMaterialOptionsData.scriptNameShort + "', alignment:['fill','center'] }, \
                    help: Button { text:'" + setMaterialOptions_localize(setMaterialOptionsData.strHelp) + "', maximumSize:[30,20], alignment:['right','center'] }, \
                }, \
                accL: Panel { orientation:'row', text:'Accepts Lights', alignment:['fill','fill'], alignChildren: ['fill','center'], \
                    lightsOnBtn: Button { text:'" + setMaterialOptions_localize(setMaterialOptionsData.strOn) + "'}, \
                    lightsOffBtn: Button { text:'" + setMaterialOptions_localize(setMaterialOptionsData.strOff) + "'}, \
                }, \
                accS: Panel { orientation:'row', text:'Accepts Shadows', alignment:['fill','fill'], alignChildren: ['fill','center'], \
                    shadowsOnBtn: Button { text:'" + setMaterialOptions_localize(setMaterialOptionsData.strOn) + "'}, \
                    shadowsOffBtn: Button { text:'" + setMaterialOptions_localize(setMaterialOptionsData.strOff) + "'}, \
                }, \
                accC: Panel { orientation:'row', text:'Cast Shadows', alignment:['fill','fill'], alignChildren: ['fill','center'], \
                    castShadowsOnBtn: Button { text:'" + setMaterialOptions_localize(setMaterialOptionsData.strOn) + "'}, \
                    castShadowsOffBtn: Button { text:'" + setMaterialOptions_localize(setMaterialOptionsData.strOff) + "'}, \
                }, \
            }";

        pal.grp = pal.add(res);
        pal.grp.header.help.onClick = function() {
            alert(setMaterialOptionsData.scriptTitle + "\n" + "\n" + setMaterialOptions_localize(setMaterialOptionsData.strHelpText), setMaterialOptions_localize(setMaterialOptionsData.strHelpTitle));
        }

        pal.grp.accL.lightsOnBtn.onClick = lightsOn;
        pal.grp.accL.lightsOffBtn.onClick = lightsOff;
        pal.grp.accS.shadowsOnBtn.onClick = shadowsOn;
        pal.grp.accS.shadowsOffBtn.onClick = shadowsOff;
        pal.grp.accC.castShadowsOnBtn.onClick = castShadowsOn;
        pal.grp.accC.castShadowsOffBtn.onClick = castShadowsOff;

        return pal;
    }

    var smoPal = setMaterialOptions_createUI(thisObj);
    smoPal.center();
    smoPal.show();

})(this);