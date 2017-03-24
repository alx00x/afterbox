// trackLayerFromPrecomp.jsx
//
// Name: trackLayerFromPrecomp
// Version: 1.0
// Author: Aleksandar Kocic
//
// Description:
// This script allows user do "parent" a layer to another layer from the
// inside of the precomp.
//
// Note: It only works with 2D layers at the moment.


(function trackLayerFromPrecomp(thisObj) {

    // Globals
    var gotFollowerSwitch = false;
    var gotMasterSwitch = false;

    var tlfpData = new Object(); // Store globals in an object
    tlfpData.scriptNameShort = "TLFP";
    tlfpData.scriptName = "Track Layer From Precomp";
    tlfpData.scriptVersion = "1.0";
    tlfpData.scriptTitle = tlfpData.scriptName + " v" + tlfpData.scriptVersion;

    tlfpData.strSelect = {en: "Select"};
    tlfpData.strGetFollower = {en: "Get Follower"};
    tlfpData.strGetMaster = {en: "Get Master"};
    tlfpData.strExecute = {en: "Execute"};

    tlfpData.strCompId = {en: "ID"};
    tlfpData.strCompName = {en: "Comp Name"};
    tlfpData.strLayerName = {en: "Layer Name"};

    tlfpData.strErrSelect = {en: "Please select your layer."};
    tlfpData.strErrNotAV = {en: "Selected item is not an instance of AVLayer."};
    tlfpData.strErrSelectNone = {en: "You need to select a layer."};
    tlfpData.strErrSelectMulti = {en: "You need to select a single layer."};
    tlfpData.strErrNameNotUnique = {en: "Selected layers name is not unique. Please rename it and than try again."};
    tlfpData.strErrNot2D = {en: "3D layers are not supported yet."};
    tlfpData.strErrExecute = {en: "Please select Master and Follower layers."};
    tlfpData.strErrNotPrecomp = {en: "Selected master does not apper to be a layer in a precomp."};

    tlfpData.strMinAE = {en: "This script requires Adobe After Effects CS5 or later."};
    tlfpData.strHelp = {en: "?"};
    tlfpData.strHelpTitle = {en: "Help"};
    tlfpData.strHelpText = {
        en: "This script duplicates the camera into specified composition and connects all parameters.\n" +
            "\n" +
            "Usage:\n" +
            "\n" +
            "        1. select the layer you wish to follow (child)\n" +
            "        2. click " + trackLayerFromPrecomp_localize(tlfpData.strGetFollower) + "\n" +
            "        3. select the layer you wish to be followed (parent)\n" +
            "        4. click " + trackLayerFromPrecomp_localize(tlfpData.strGetMaster) + "\n" +
            "        5. click " + trackLayerFromPrecomp_localize(tlfpData.strExecute) + "\n" +
            "\n"
    };

    // Localize
    function trackLayerFromPrecomp_localize(strVar) {
        return strVar["en"];
    }

    // Build UI
    function trackLayerFromPrecomp_buildUI(thisObj) {
        var pal = (thisObj instanceof Panel) ? thisObj : new Window("palette", tlfpData.scriptName, undefined, {
            resizeable: false
        });

        if (pal !== null) {
            var res =
                "group { \
                orientation:'column', alignment:['fill','fill'], \
                header: Group { \
                    alignment:['fill','top'], \
                    title: StaticText { text:'" + tlfpData.scriptNameShort + " v" + tlfpData.scriptVersion + "', alignment:['fill','center'] }, \
                    help: Button { text:'" + trackLayerFromPrecomp_localize(tlfpData.strHelp) + "', maximumSize:[30,20], alignment:['right','center'] }, \
                }, \
                opts: Panel { \
                    labels: Group { \
                        alignment:['fill','top'], \
                        id: StaticText { text:'" + trackLayerFromPrecomp_localize(tlfpData.strCompId) + ":', preferredSize:[30,20], alignment:['fill','center'] }, \
                        compName: StaticText { text:'" + trackLayerFromPrecomp_localize(tlfpData.strCompName) + ":', preferredSize:[80,20], alignment:['fill','center'] }, \
                        layerName: StaticText { text:'" + trackLayerFromPrecomp_localize(tlfpData.strLayerName) + ":', preferredSize:[200,20], alignment:['fill','center'] }, \
                        none: StaticText { text:'', preferredSize:[100,20], alignment:['fill','center'] }, \
                    }, \
                    getFollower: Group { \
                        alignment:['fill','top'], \
                        followerCompId: EditText { alignment:['fill','center'], preferredSize:[30,20] },  \
                        followerCompName: EditText { alignment:['fill','center'], preferredSize:[80,20] },  \
                        followerLayerName: EditText { alignment:['fill','center'], preferredSize:[200,20] },  \
                        followerSelectBtn: Button { text:'" + trackLayerFromPrecomp_localize(tlfpData.strGetFollower) + "', preferredSize:[100,20] }, \
                    }, \
                    getMaster: Group { \
                        alignment:['fill','top'], \
                        masterCompId: EditText { alignment:['fill','center'], preferredSize:[30,20] },  \
                        masterCompName: EditText { alignment:['fill','center'], preferredSize:[80,20] },  \
                        masterLayerName: EditText { alignment:['fill','center'], preferredSize:[200,20] },  \
                        masterSelectBtn: Button { text:'" + trackLayerFromPrecomp_localize(tlfpData.strGetMaster) + "', preferredSize:[100,20] }, \
                    }, \
                }, \
                cmds: Group { \
                    alignment:['fill','bottom'], \
                    executeBtn: Button { text:'" + trackLayerFromPrecomp_localize(tlfpData.strExecute) + "', alignment:['center','bottom'], preferredSize:[-1,20] }, \
                }, \
            }";
            pal.grp = pal.add(res);

            pal.layout.layout(true);
            pal.grp.minimumSize = pal.grp.size;
            pal.layout.resize();
            pal.onResizing = pal.onResize = function() {
                this.layout.resize();
            }

            pal.grp.opts.getFollower.followerCompId.enabled = false;
            pal.grp.opts.getFollower.followerCompName.enabled = false;
            pal.grp.opts.getFollower.followerLayerName.enabled = false;

            pal.grp.opts.getMaster.masterCompId.enabled = false;
            pal.grp.opts.getMaster.masterCompName.enabled = false;
            pal.grp.opts.getMaster.masterLayerName.enabled = false;

            pal.grp.header.help.onClick = function() {
                alert(tlfpData.scriptTitle + "\n" + "\n" + trackLayerFromPrecomp_localize(tlfpData.strHelpText), trackLayerFromPrecomp_localize(tlfpData.strHelpTitle));
            }
            pal.grp.opts.getFollower.followerSelectBtn.onClick = trackLayerFromPrecomp_doGetFollower;
            pal.grp.opts.getMaster.masterSelectBtn.onClick = trackLayerFromPrecomp_doGetMaster;
            pal.grp.cmds.executeBtn.onClick = trackLayerFromPrecomp_doExecute;
        }

        return pal;
    }

    // Main Functions:
    //

    function countInArray(array, what) {
        var count = 0;
        for (var i = 0; i < array.length; i++) {
            if (array[i] === what) {
                count++;
            }
        }
        return count;
    }

    function checkIfUniqueName(layerName, comp) {
        var allLayers = comp.layers;
        var allNames = [];
        for (var i = 0; i < allLayers.length; i++) {
            allNames.push(allLayers[i + 1].name);
        }
        if (countInArray(allNames, layerName) > 1) {
            return false;
        }
        return true;
    }

    function trackLayerFromPrecomp_doGetFollower() {
        if (app.project === null)
            return;

        var activeItem = app.project.activeItem;
        var selectedLayers = activeItem.selectedLayers;

        if (activeItem == null) {
            alert(trackLayerFromPrecomp_localize(tlfpData.strErrSelect));
            return;
        } else if (selectedLayers.length < 1) {
            alert(trackLayerFromPrecomp_localize(tlfpData.strErrSelectNone));
            return;
        } else if (selectedLayers.length > 1) {
            alert(trackLayerFromPrecomp_localize(tlfpData.strErrSelectMulti));
            return;
        } else if (!(selectedLayers[0] instanceof AVLayer)) {
            alert(trackLayerFromPrecomp_localize(tlfpData.strErrNotAV));
            return;
        } else if (checkIfUniqueName(selectedLayers[0].name, activeItem) == false) {
            alert(trackLayerFromPrecomp_localize(tlfpData.strErrNameNotUnique));
            return;
        } else {
            selectedFollower = selectedLayers[0];
            selectedFollowerName = selectedFollower.name;
            selectedFollowerComp = activeItem;
            selectedFollowerCompId = activeItem.id;
            selectedFollowerCompName = activeItem.name;
            tlfpPal.grp.opts.getFollower.followerCompId.text = selectedFollowerCompId;
            tlfpPal.grp.opts.getFollower.followerCompName.text = selectedFollowerCompName;
            tlfpPal.grp.opts.getFollower.followerLayerName.text = selectedFollowerName;
            gotFollowerSwitch = true;
        }
    }

    function trackLayerFromPrecomp_doGetMaster() {
        if (app.project === null)
            return;

        var activeItem = app.project.activeItem;
        var selectedLayers = activeItem.selectedLayers;

        if (activeItem == null) {
            alert(trackLayerFromPrecomp_localize(tlfpData.strErrSelect));
            return;
        } else if (selectedLayers.length < 1) {
            alert(trackLayerFromPrecomp_localize(tlfpData.strErrSelectNone));
            return;
        } else if (selectedLayers.length > 1) {
            alert(trackLayerFromPrecomp_localize(tlfpData.strErrSelectMulti));
            return;
        } else if (!(selectedLayers[0] instanceof AVLayer)) {
            alert(trackLayerFromPrecomp_localize(tlfpData.strErrNotAV));
            return;
        } else if (checkIfUniqueName(selectedLayers[0].name, activeItem) == false) {
            alert(trackLayerFromPrecomp_localize(tlfpData.strErrNameNotUnique));
            return;
        } else if (selectedLayers[0].threeDLayer == true) {
            alert(trackLayerFromPrecomp_localize(tlfpData.strErrNot2D));
            return;
        } else {
            selectedMaster = selectedLayers[0];
            selectedMasterName = selectedMaster.name;
            selectedMasterComp = activeItem;
            selectedMasterCompId = activeItem.id;
            selectedMasterCompName = activeItem.name;
            tlfpPal.grp.opts.getMaster.masterCompId.text = selectedMasterCompId;
            tlfpPal.grp.opts.getMaster.masterCompName.text = selectedMasterCompName;
            tlfpPal.grp.opts.getMaster.masterLayerName.text = selectedMasterName;
            gotMasterSwitch = true;
        }
    }

    function checkIfCompIsInOtherComp(fComp, mComp) {
        for (var i = 0; i < fComp.layers.length; i++) {
            if (fComp.layers[i + 1].source.id == mComp.id) {
                masterPrecompName = fComp.layers[i + 1].name;
                return true;
            }
        }
        return false;
    }

    function trackLayerFromPrecomp_doExecute() {
        if ((gotMasterSwitch == true) && (gotMasterSwitch == true)) {
            if (checkIfCompIsInOtherComp(selectedFollowerComp, selectedMasterComp) == true) {
                app.beginUndoGroup("Track Layer From Precomp");

                // master comp
                // add point controll to master layer
                var masterPos = selectedMaster.Effects.addProperty("ADBE Point Control");
                masterPos.name = "masterPos";
                masterPos.property("ADBE Point Control-0001").expression = "thisLayer.toWorld(anchorPoint)";

                // add angle controll to master layer
                var masterRot = selectedMaster.Effects.addProperty("ADBE Angle Control");
                masterRot.name = "masterRot";
                masterRot.property("ADBE Angle Control-0001").expression = "w = normalize(fromWorldVec([0,1]));\rb = Math.asin(w[0]);\rradiansToDegrees(b)";

                // follower comp
                // add anchor point expression to follower layer
                selectedFollower.property("ADBE Transform Group").property("ADBE Anchor Point").expression = "master = comp('" + selectedMasterCompName + "').layer('" + selectedMasterName + "');\r" +
                "ap = master.transform.anchorPoint;\rapx = ap[0] - (master.width - thisLayer.width) / 2;\rapy = ap[1] - (master.height - thisLayer.height) / 2;\r[apx, apy]";

                // add position expression to follower layer
                selectedFollower.property("ADBE Transform Group").property("ADBE Position").expression = "master = comp('" + selectedMasterCompName + "').layer('" + selectedMasterName + "');\r" +
                "masterComp = comp('" + selectedFollowerCompName + "').layer('" + masterPrecompName + "');\rmasterComp.toComp(master.effect('masterPos')('Point'))";

                // add scale expression to follower layer
                selectedFollower.property("ADBE Transform Group").property("ADBE Scale").expression = "master = comp('" + selectedMasterCompName + "').layer('" + selectedMasterName + "');\r" +
                "master.transform.scale";

                // add rotation expression to follower layer
                selectedFollower.property("ADBE Transform Group").property("ADBE Rotate Z").expression = "master = comp('" + selectedMasterCompName + "').layer('" + selectedMasterName + "');\r" +
                "masterComp = comp('" + selectedFollowerCompName + "').layer('" + masterPrecompName + "');\rmaster.effect('masterRot')('Angle') + masterComp.transform.rotation";

                app.endUndoGroup();
                tlfpPal.close();
            } else {
                alert(trackLayerFromPrecomp_localize(tlfpData.strErrNotPrecomp));
                return;
            }
        } else {
            alert(trackLayerFromPrecomp_localize(tlfpData.strErrExecute));
            return;
        }
    }

    // Main code:
    //

    // Prerequisites check
    if (parseFloat(app.version) < 10.0) {
        alert(tlfpData.strMinAE);
    } else {
        // Build and show the floating palette
        var tlfpPal = trackLayerFromPrecomp_buildUI(thisObj);
        if (tlfpPal !== null) {
            if (tlfpPal instanceof Window) {
                // Show the palette
                tlfpPal.center();
                tlfpPal.show();
            } else
                tlfpPal.layout.layout(true);
        }
    }
})(this);
