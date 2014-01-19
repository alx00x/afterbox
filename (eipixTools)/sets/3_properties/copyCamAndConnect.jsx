// copyCamAndConnect.jsx
// 
// Name: copyCamAndConnect
// Version: 1.2
// Author: Aleksandar Kocic
// 
// Description:     
// This script duplicates the camera into specified composition
// and connects all parameters.
//  
// Note: It might not be completely stable at the moment.


(function copyCamAndConnect(thisObj)
{

    // Globals
    var gotCameraSwitch = false;
    var gotCompositionSwitch = false;

    var copyCamAndConnectData = new Object(); // Store globals in an object
    copyCamAndConnectData.scriptNameShort = "CCAC";
    copyCamAndConnectData.scriptName = "Copy Cam And Connect";
    copyCamAndConnectData.scriptVersion = "1.2";
    copyCamAndConnectData.scriptTitle = copyCamAndConnectData.scriptName + " v" + copyCamAndConnectData.scriptVersion;

    copyCamAndConnectData.strSelect = {en: "Select"};
    copyCamAndConnectData.strGetCamera = {en: "Get Camera"};
    copyCamAndConnectData.strGetComp = {en: "Get Composition"};
    copyCamAndConnectData.strExecute = {en: "Execute"};

    copyCamAndConnectData.strErrExecute = {en: "Please select the camera and composition."};
    copyCamAndConnectData.strErrSelectCam = {en: "Please select the camera you wish to copy."};
    copyCamAndConnectData.strErrSelectMulti = {en: "You need to select a single camera layer."};
    copyCamAndConnectData.strErrSelectComp = {en: "Please select the composition you wish to copy your camera to."};
    copyCamAndConnectData.strErrSelectMultiComp = {en: "You need to select a single composition."};
    copyCamAndConnectData.strErrNoCompSelected = {en: "Cannot perform operation. Please select or open a single composition in the Project window, and try again."};

    copyCamAndConnectData.strMinAE = {en: "This script requires Adobe After Effects CS5 or later."};
    copyCamAndConnectData.strHelp = {en: "?"};
    copyCamAndConnectData.strHelpTitle = {en: "Help"};
    copyCamAndConnectData.strHelpText = 
    {
        en: "This script duplicates the camera into specified composition and connects all parameters.\n" +
        "\n" +
        "Usage:\n" +
        "\n" +
        "        1. select the camera you wish to copy\n" +
        "        2. click " + copyCamAndConnect_localize(copyCamAndConnectData.strGetCamera) + "\n" +
        "        3. select the composition you wish to copy your camera to\n" +
        "        4. click " + copyCamAndConnect_localize(copyCamAndConnectData.strGetComp) + "\n" +
        "        5. click " + copyCamAndConnect_localize(copyCamAndConnectData.strExecute) + "\n" +
        "\n"
    };

    // Localize
    function copyCamAndConnect_localize(strVar)
    {
        return strVar["en"];
    }

    // Build UI
    function copyCamAndConnect_buildUI(thisObj)
    {
        var pal = (thisObj instanceof Panel) ? thisObj : new Window("palette", copyCamAndConnectData.scriptTitle, undefined, {resizeable:true});
        
        if (pal !== null)
        {
            var res =
            "group { \
                orientation:'column', alignment:['fill','fill'], \
                header: Group { \
                    alignment:['fill','top'], \
                    title: StaticText { text:'" + copyCamAndConnectData.scriptNameShort + "', alignment:['fill','center'] }, \
                    help: Button { text:'" + copyCamAndConnect_localize(copyCamAndConnectData.strHelp) +"', maximumSize:[30,20], alignment:['right','center'] }, \
                }, \
                opts: Panel { \
                    getCamera: Group { \
                        alignment:['fill','top'], \
                        camName: EditText { alignment:['fill','center'], preferredSize:[200,20] },  \
                        camSelectBtn: Button { text:'" + copyCamAndConnect_localize(copyCamAndConnectData.strGetCamera) + "', preferredSize:[100,20] }, \
                    }, \
                    getComp: Group { \
                        alignment:['fill','top'], \
                        compName: EditText { alignment:['fill','center'], preferredSize:[200,20] },  \
                        compSelectBtn: Button { text:'" + copyCamAndConnect_localize(copyCamAndConnectData.strGetComp) + "', preferredSize:[100,20] }, \
                    }, \
                }, \
                cmds: Group { \
                    alignment:['fill','bottom'], \
                    executeBtn: Button { text:'" + copyCamAndConnect_localize(copyCamAndConnectData.strExecute) + "', alignment:['center','bottom'], preferredSize:[-1,20] }, \
                }, \
            }";
            pal.grp = pal.add(res);
            
            pal.layout.layout(true);
            pal.grp.minimumSize = pal.grp.size;
            pal.layout.resize();
            pal.onResizing = pal.onResize = function () {this.layout.resize();}
            
            pal.grp.header.help.onClick = function () {alert(copyCamAndConnectData.scriptTitle + "\n" + "\n" + copyCamAndConnect_localize(copyCamAndConnectData.strHelpText), copyCamAndConnect_localize(copyCamAndConnectData.strHelpTitle));}
            pal.grp.opts.getCamera.camSelectBtn.onClick = copyCamAndConnect_doGetCamera;
            pal.grp.opts.getComp.compSelectBtn.onClick = copyCamAndConnect_doGetComp;
            pal.grp.cmds.executeBtn.onClick = copyCamAndConnect_doExecute;
        }
        
        return pal;
    }

    // Main Functions:
    //

    // Global:
    // selectedCamera
    // selectedCameraName
    // selectedCameraComp
    // electedCameraCompName
    //
    function copyCamAndConnect_doGetCamera()
    {
        if (app.project === null)
            return;

        var activeItem = app.project.activeItem;
        
        if ((activeItem === null) || !(activeItem instanceof CompItem))
        {
            alert(copyCamAndConnect_localize(copyCamAndConnectData.strErrNoCompSelected));
            return;
        }
        else
        {
            app.beginUndoGroup("Get Camera");
            var selectedLayers = activeItem.selectedLayers;
            if (!(selectedLayers.length == 1)) {
                alert(copyCamAndConnect_localize(copyCamAndConnectData.strErrSelectMulti));
                return;
            }
            else
            {
                if (selectedLayers[0].constructor.name == "CameraLayer")
                {
                    selectedCamera = selectedLayers[0];
                    selectedCameraName = selectedCamera.name;
                    selectedCameraComp = activeItem;
                    selectedCameraCompName = app.project.activeItem.name;

                    gotCameraSwitch = true;

                    ccacPal.grp.opts.getCamera.camName.text = selectedCamera.name;
                }
                else
                {
                    alert(copyCamAndConnect_localize(copyCamAndConnectData.strErrSelectMulti));
                }
            }
            app.endUndoGroup();
        }
    }

    // Global:
    // selectedComposition
    //
    function copyCamAndConnect_doGetComp()
    {
        if (app.project === null)
            return;

        var activeItem = app.project.activeItem;
        
        if (activeItem === null)
        {
            alert(copyCamAndConnect_localize(copyCamAndConnectData.strErrNoCompSelected));
            return;
        }
        else if (activeItem instanceof CompItem)
        {
            app.beginUndoGroup("Get Composition");

            var initialySelectedLayer = activeItem.selectedLayers[0];
            var activeIsLayer = false;
            var oldNumLayers = activeItem.numLayers;

            app.executeCommand(2767);

            var newNumLayers = activeItem.numLayers;
            
            if (newNumLayers > oldNumLayers) 
            {
                activeIsLayer = true;
                activeItem.layer(1).remove();
            }
            
            if (activeIsLayer == false)
            {
                if (!(app.project.selection.length == 1))
                {
                    alert(copyCamAndConnect_localize(copyCamAndConnectData.strErrSelectMultiComp));
                    return;
                }
                
                selectedComposition = activeItem;
                gotCompositionSwitch = true;
                ccacPal.grp.opts.getComp.compName.text = selectedComposition.name;
            }
            else if (activeIsLayer == true)
            {
                initialySelectedLayer.selected = true;
                if (!(activeItem.selectedLayers.length == 1) || !(initialySelectedLayer.source instanceof CompItem))
                {
                    alert(copyCamAndConnect_localize(copyCamAndConnectData.strErrSelectMultiComp));
                    return;
                }
                selectedComposition = initialySelectedLayer.source;
                gotCompositionSwitch = true;
                ccacPal.grp.opts.getComp.compName.text = selectedComposition.name;
            }
            app.endUndoGroup();
        }
        else
        {
            alert(copyCamAndConnect_localize(copyCamAndConnectData.strErrSelectMultiComp));
        }
    }

    function copyCamAndConnect_doExecute()
    {
        if ((gotCameraSwitch == true) && (gotCompositionSwitch == true))
        {
            app.beginUndoGroup("Copy Camera and Connect");

            // code

            selectedComposition.layers.addCamera((selectedCameraName + " (" + selectedCameraCompName + ")"),[0,0]).startTime=0;
            instanceCam = selectedComposition.layer(1);
            instanceCam.position.expression = "C = comp(\"" + selectedCameraCompName + "\").layer(\"" + selectedCameraName + "\");\rC.toWorld([0,0,0]);";
            instanceCam.orientation.expression="C = comp(\"" + selectedCameraCompName + "\").layer("+"\""+selectedCameraName+"\""+");\ru = C.toWorldVec([1,0,0]);\rv = C.toWorldVec([0,1,0]);\rw = C.toWorldVec([0,0,1]);" 
            + "sinb = clamp(w[0],-1,1);\rb = Math.asin(sinb/thisComp.pixelAspect);\rcosb = Math.cos(b);\rif (Math.abs(cosb) > .0005) {\rc = -Math.atan2(v[0],u[0]);\r"
            + "a = -Math.atan2(w[1],w[2]);\r} else {\ra = Math.atan2(u[1],v[1]);\rc = 0;\r}\r[radians_to_degrees(a),radians_to_degrees(b),radians_to_degrees(c)];";
            instanceCam.rotationX.expression = "0;";
            instanceCam.rotationY.expression = "0;";
            instanceCam.rotationZ.expression = "0;";

            instanceCam.zoom.expression = "comp(\"" + selectedCameraCompName + "\").layer("+"\"" + selectedCameraName + "\""+").cameraOption.zoom;";
            instanceCam.depthOfField.setValue(1);
            instanceCam.focusDistance.expression = "comp(\"" + selectedCameraCompName + "\").layer("+"\"" + selectedCameraName + "\""+").cameraOption.focusDistance;";
            instanceCam.aperture.expression = "v = 0;\rif (comp(\"" + selectedCameraCompName + "\").layer(\"" + selectedCameraName + 
            "\").cameraOption.depthOfField == 1) {\rv = comp(\"" + selectedCameraCompName + "\").layer(\"" + selectedCameraName + "\").cameraOption.aperture;\r}\rv;";
            instanceCam.blurLevel.expression = "v = 0;\rif (comp(\"" + selectedCameraCompName + "\").layer(\"" + selectedCameraName + 
            "\").cameraOption.depthOfField == 1) {\rv = comp(\"" + selectedCameraCompName + "\").layer(\"" + selectedCameraName + "\").cameraOption.aperture;\r}\rv;";

            instanceCam.cameraOption.irisShape.expression = "comp(\"" + selectedCameraCompName + "\").layer("+"\"" + selectedCameraName + "\""+").cameraOption.irisShape;";
            instanceCam.cameraOption.irisRotation.expression = "comp(\"" + selectedCameraCompName + "\").layer("+"\"" + selectedCameraName + "\""+").cameraOption.irisRotation;";
            instanceCam.cameraOption.irisRoundness.expression = "comp(\"" + selectedCameraCompName + "\").layer("+"\"" + selectedCameraName + "\""+").cameraOption.irisRoundness;";
            instanceCam.cameraOption.irisAspectRatio.expression = "comp(\"" + selectedCameraCompName + "\").layer("+"\"" + selectedCameraName + "\""+").cameraOption.irisAspectRatio;";
            instanceCam.cameraOption.irisDiffractionFringe.expression = "comp(\"" + selectedCameraCompName + "\").layer("+"\"" + selectedCameraName + "\""+").cameraOption.irisDiffractionFringe;";
            instanceCam.cameraOption.highlightGain.expression = "comp(\"" + selectedCameraCompName + "\").layer("+"\"" + selectedCameraName + "\""+").cameraOption.highlightGain;";
            instanceCam.cameraOption.highlightThreshold.expression = "comp(\"" + selectedCameraCompName + "\").layer("+"\"" + selectedCameraName + "\""+").cameraOption.highlightThreshold;";
            instanceCam.cameraOption.highlightSaturation.expression = "comp(\"" + selectedCameraCompName + "\").layer("+"\"" + selectedCameraName + "\""+").cameraOption.highlightSaturation;";

            instanceCam.pointOfInterest.expression = "position;";
            instanceCam.autoOrient = AutoOrientType.NO_AUTO_ORIENT;

            // code

            app.endUndoGroup();
        }
        else
        {
            alert(copyCamAndConnect_localize(copyCamAndConnectData.strErrExecute));
            return;
        }
    }

    // Main code:
    //
    
    // Prerequisites check
    if (parseFloat(app.version) < 10.0)
    {
        alert(copyCamAndConnectData.strMinAE);
    }
    else
    {
        // Build and show the floating palette
        var ccacPal = copyCamAndConnect_buildUI(thisObj);
        if (ccacPal !== null)
        {
            if (ccacPal instanceof Window)
            {
                // Show the palette
                ccacPal.center();
                ccacPal.show();
            }
            else
                ccacPal.layout.layout(true);
        }
    }
})(this);
