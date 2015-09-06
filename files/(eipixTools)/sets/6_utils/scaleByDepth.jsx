// scaleByDepth.jsx
// 
// Name: scaleByDepth
// Version: 1.1
// Author: Aleksandar Kocic
// 
// Description:
// This script sets up selected layers for scaling by depth.
// 

(function scaleByDepth(thisObj) {

    if (app.project.activeItem == null) {
        alert("Please, select your composition.");
        return;
    }

    // Define main variables
    var sbzData = new Object();

    sbzData.scriptNameShort = "SBZ";
    sbzData.scriptName = "Scale By Depth";
    sbzData.scriptVersion = "1.1";
    sbzData.scriptTitle = sbzData.scriptName + " v" + sbzData.scriptVersion;
    sbzData.strMinAE = {en: "This script sets up selected layers for scaling by depth."};
    sbzData.strErrNoSelected = {en: "Please select layers you wish to setup for scaling by depth."};
    sbzData.strErrWrongSelected = {en: "Only select instances of AV layers."};
    sbzData.strActiveCompErr = {en: "No active composition."};
    sbzData.strSuccess = {en: "Setup successful."};
    sbzData.strHelp = {en: "?"};
    sbzData.strHelpTitle = {en: "Help"};
    sbzData.strHelpText = {en: "This script crops selected precomps to pixel edges."};

    // Define project variables
    sbzData.activeItem = app.project.activeItem;
    sbzData.activeItemDuration = app.project.activeItem.duration;
    sbzData.activeItemFrames = app.project.activeItem.duration * app.project.activeItem.frameRate;
    sbzData.activeItemOneFrame = 1 / app.project.activeItem.frameRate;
    sbzData.activeItemFps= app.project.activeItem.frameRate;

    // Localize
    function scaleByDepth_localize(strVar) {
        return strVar["en"];
    }

    // Converts numeric degrees to radians
    Math.radians = function(deg) {
        return deg * (Math.PI / 180);
    }

    // Main
    function scaleByDepth_main() {

        //variables
        var activeItem = sbzData.activeItem;
        var selectedLayers = activeItem.selectedLayers;

        var activeItemWidth = activeItem.width;
        var activeItemHeight = activeItem.height;

        //chack if there is anything selected
        if (selectedLayers.length == 0) {
            alert(scaleByDepth_localize(sbzData.strErrNoSelected));
            return;
        } else {

            //check if selected layers are AVLayer
            for (var i = 0; i < selectedLayers.length; i++) {
                if (!(selectedLayers[i] instanceof AVLayer)) {
                    alert(scaleByDepth_localize(sbzData.strErrWrongSelected));
                    return;
                }
            }

            //make all selected layers 3D
            for (var f = 0; f < selectedLayers.length; f++) {
                selectedLayers[f].threeDLayer = true;
            }

            //create camera
            var centerX = activeItemWidth / 2;
            var centerY = activeItemHeight / 2;
            var zoomValue = activeItemWidth/(2*Math.tan(Math.radians(54.4322/2)));
            var scaleCam = activeItem.layers.addCamera("scaleCam_DO_NOT_TOUCH", [centerX, centerY]);
            scaleCam.property("ADBE Camera Options Group").property("ADBE Camera Zoom").setValue(zoomValue);
            scaleCam.property("ADBE Camera Options Group").property("ADBE Camera Focus Distance").setValue(zoomValue);
            scaleCam.position.setValue([centerX, centerY, -zoomValue]);
            scaleCam.enabled = false;

            //for each layer create null parent and add expression
            for (var v = 0; v < selectedLayers.length; v++) {

                //create null
                var parentNull = activeItem.layers.addNull();
                parentNull.name = selectedLayers[v].name + "_CTRL";
                parentNull.threeDLayer = true;
                parentNull.shy = true;

                //make parent
                parentNull.moveBefore(selectedLayers[v]);
                selectedLayers[v].parent = parentNull;

                //add expression
                var expr = "cam = thisComp.layer('scaleCam_DO_NOT_TOUCH');\ndistance = length(sub(position, cam.position));\nscale * distance / cam.zoom";
                parentNull.transform.scale.expressionEnabled = true;
                parentNull.transform.scale.expression = expr;
            }

            //create animation camera
            var animCam = activeItem.layers.addCamera("animCam", [centerX, centerY]);
            animCam.property("ADBE Camera Options Group").property("ADBE Camera Zoom").setValue(zoomValue);
            animCam.property("ADBE Camera Options Group").property("ADBE Camera Focus Distance").setValue(zoomValue);
            animCam.position.setValue([centerX, centerY, -zoomValue]);
            animCam.autoOrient = AutoOrientType.NO_AUTO_ORIENT;

            //create animation camera controll
            var animCamCTRL = activeItem.layers.addNull();
            animCamCTRL.threeDLayer = true;
            animCamCTRL.position.setValue([centerX, centerY, -zoomValue]);
            animCamCTRL.source.name = "animCamCTRL";
            animCam.parent = animCamCTRL;

            //add smooth wiggle controll
            var addSlider1 = animCamCTRL.property("ADBE Effect Parade").addProperty("ADBE Slider Control");
            addSlider1.name = "Wiggle X Amplitude";

            var addSlider2 = animCamCTRL.property("ADBE Effect Parade").addProperty("ADBE Slider Control");
            addSlider2.name = "Wiggle X Frequency";

            var addSlider3 = animCamCTRL.property("ADBE Effect Parade").addProperty("ADBE Slider Control");
            addSlider3.name = "Wiggle Y Amplitude";

            var addSlider4 = animCamCTRL.property("ADBE Effect Parade").addProperty("ADBE Slider Control");
            addSlider4.name = "Wiggle Y Frequency";

            //add wiggle expressions to animation cam position
            animCam.transform.position.dimensionsSeparated = true;

            var expr1 = "amp = thisComp.layer('animCamCTRL').effect('Wiggle X Amplitude')('Slider');\nfreq = thisComp.layer('animCamCTRL').effect('Wiggle Y Frequency')('Slider');\nif (freq.numKeys > 0){\n\taccum = 0;\n\tv0 = freq.valueAtTime(0);\n\tt0 = 0;\n\ti = 1;\n\twhile (i <= freq.numKeys){\n\t\tt = freq.key(i).time;\n\t\tif (t < time){\n\t\t\taccum += (v0 + freq.key(i).value)*(t - t0)/2;\n\t\t\tv0 = freq.key(i).value;\n\t\t\tt0 = t;\n\t\t\tif (i == freq.numKeys){\n\t\t\t\taccum += (time - t0)*v0;\n\t\t\t}\n\t\t}else{\n\t\t\taccum += (freq + v0)*(time - t0)/2;\n\t\t\tbreak;\n\t\t}\n\t\ti++;\n\t}\n}else{\n\taccum = freq*time;\n}\nwiggle(1,amp,1,.5,accum);\n";
            animCam.property("ADBE Transform Group").property("ADBE Position_0").expressionEnabled = true;
            animCam.property("ADBE Transform Group").property("ADBE Position_0").expression = expr1;

            var expr2 = "amp = thisComp.layer('animCamCTRL').effect('Wiggle Y Amplitude')('Slider');\nfreq = thisComp.layer('animCamCTRL').effect('Wiggle Y Frequency')('Slider');\nif (freq.numKeys > 0){\n\taccum = 0;\n\tv0 = freq.valueAtTime(0);\n\tt0 = 0;\n\ti = 1;\n\twhile (i <= freq.numKeys){\n\t\tt = freq.key(i).time;\n\t\tif (t < time){\n\t\t\taccum += (v0 + freq.key(i).value)*(t - t0)/2;\n\t\t\tv0 = freq.key(i).value;\n\t\t\tt0 = t;\n\t\t\tif (i == freq.numKeys){\n\t\t\t\taccum += (time - t0)*v0;\n\t\t\t}\n\t\t}else{\n\t\t\taccum += (freq + v0)*(time - t0)/2;\n\t\t\tbreak;\n\t\t}\n\t\ti++;\n\t}\n}else{\n\taccum = freq*time;\n}\nwiggle(1,amp,1,.5,accum);\n";
            animCam.property("ADBE Transform Group").property("ADBE Position_1").expressionEnabled = true;
            animCam.property("ADBE Transform Group").property("ADBE Position_1").expression = expr2;
        }
    }

    // Main Code:
    //

    // Warning
    if (parseFloat(app.version) < 9.0) {
        alert(scaleByDepth_localize(sbzData.strMinAE));
    } else {
        // Execute the script
        app.beginUndoGroup(sbzData.scriptName);
        scaleByDepth_main();
        app.endUndoGroup();
    }
})(this);