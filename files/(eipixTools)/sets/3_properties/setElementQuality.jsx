// setElementQuality.jsx
//
// Name: setElementQuality
// Version: 2.0
// Author: Aleksandar Kocic
//
// Description:
// This script provides a GUI to quickly change element3D settings.
//

(function setElementQuality(thisObj) {

    //Globals
    var activeItem = app.project.activeItem;

    // Define main variables
    var seqData = new Object();

    seqData.scriptNameShort = "SEQ";
    seqData.scriptName = "Set Element Quality";
    seqData.scriptVersion = "2.0";
    seqData.scriptTitle = seqData.scriptName + " v" + seqData.scriptVersion;

    seqData.strAffect = {en: "Affect"};
    seqData.strChange = {en: "Change"};

    seqData.strSelected = {en: "Selected layers only"};
    seqData.strComp = {en: "Layers in active composition"};
    seqData.strProject = {en: "All element layers in project"};

    seqData.strErr = {en: "You dont have Element3D installed."};
    seqData.strErrComp = {en: "Please select a composition."};
    seqData.strNoLayersSelectedErr = {en: "No layers are selected."};

    seqData.strHelp = {en: "?"};
    seqData.strHelpTitle = {en: "Help"};
    seqData.strHelpText = {en: "This script provides a GUI to quickly change element3D settings."};
    seqData.strExecute = {en: "Set"};
    seqData.strCancel = {en: "Cancel"};

    // Define main variables
    seqData.strSphericalMapResolution = {en: "Spherical Map Resolution"};
    seqData.strSphericalMapResolutionItems = [64, 128, 256, 512];

    seqData.strMirrorSurfaceQuality = {en: "Mirror Surface Quality"};
    seqData.strMirrorSurfaceQualityItems = ["Normal", "High"];

    seqData.strMultisampling = {en: "Multisampling"};
    seqData.strMultisamplingItems = [0, 1, 2, 4, 8, 16, 32];

    seqData.strSupersampling = {en: "Supersampling"};
    seqData.strSupersamplingItems = [0, 2, 4, 8];

    seqData.strRenderMode = {en: "Render Mode"};
    seqData.strRenderModeItems = ["Full Render", "Preview", "Draft", "Unified"];

    // Localize
    function setElementQuality_localize(strVar) {
        return strVar["en"];
    }

    //BuildUI
    function setElementQuality_buildUI(thisObj) {
        var pal = new Window("palette", seqData.scriptName, undefined, {resizeable:false});
        if (pal !== null) {
            var res =
                "group { \
                    orientation:'column', alignment:['fill','fill'], \
                    header: Group { \
                        alignment:['fill','top'], \
                        title: StaticText { text:'" + seqData.scriptNameShort + " v" + seqData.scriptVersion + "', alignment:['fill','center'] }, \
                        help: Button { text:'" + setElementQuality_localize(seqData.strHelp) + "', maximumSize:[30,20], alignment:['right','center'] }, \
                    }, \
                    scope: Panel { \
                        alignment:['fill','top'], \
                        text: '" + setElementQuality_localize(seqData.strAffect) + "', alignment:['fill','top'], \
                        rdio: Group { \
                            orientation:'column', \
                            sele: RadioButton { text:'" + setElementQuality_localize(seqData.strSelected) + "', value:true, alignment:['left','center'] }, \
                            comp: RadioButton { text:'" + setElementQuality_localize(seqData.strComp) + "', alignment:['left','center'] }, \
                            proj: RadioButton { text:'" + setElementQuality_localize(seqData.strProject) + "', alignment:['left','center'] }, \
                        }, \
                    }, \
                    opts: Panel { \
                        alignment:['fill','top'], minimumSize:[260,20], \
                        text: '" + setElementQuality_localize(seqData.strChange) + "', alignment:['fill','top'], \
                        sphericalMapRes: Group { \
                            name:'Spherical Map Resolution', \
                            alignment:['fill','top'], \
                            box: Checkbox { text:'" + setElementQuality_localize(seqData.strSphericalMapResolution) + "' }, \
                            list: DropDownList { alignment:['fill','center'], preferredSize:[-1,20] }, \
                        }, \
                        mirrorSurfaceQuility: Group { \
                            name:'Mirror Surface Quality', \
                            alignment:['fill','top'], \
                            box: Checkbox { text:'" + setElementQuality_localize(seqData.strMirrorSurfaceQuality) + "' }, \
                            list: DropDownList { alignment:['fill','center'], preferredSize:[-1,20] }, \
                        }, \
                        multiSampling: Group { \
                            name:'Multisampling', \
                            alignment:['fill','top'], \
                            box: Checkbox { text:'" + setElementQuality_localize(seqData.strMultisampling) + "' }, \
                            list: DropDownList { alignment:['fill','center'], preferredSize:[-1,20] }, \
                        }, \
                        superSampling: Group { \
                            name:'Supersampling', \
                            alignment:['fill','top'], \
                            box: Checkbox { text:'" + setElementQuality_localize(seqData.strSupersampling) + "' }, \
                            list: DropDownList { alignment:['fill','center'], preferredSize:[-1,20] }, \
                        }, \
                        renderMode: Group { \
                            name:'Render Mode', \
                            alignment:['fill','top'], \
                            box: Checkbox { text:'" + setElementQuality_localize(seqData.strRenderMode) + "' }, \
                            list: DropDownList { alignment:['fill','center'], preferredSize:[-1,20] }, \
                        }, \
                    }, \
                    sepr: Group { \
                        orientation:'row', alignment:['fill','bottom'], \
                        rule: Panel { height: 2, alignment:['fill','center'] }, \
                    }, \
                    cmds: Group { \
                        alignment:['fill','bottom'], \
                        executeBtn: Button { text:'" + setElementQuality_localize(seqData.strExecute) + "', alignment:['center','bottom'], preferredSize:[-1,20] }, \
                        cancelBtn: Button { text:'" + setElementQuality_localize(seqData.strCancel) + "', alignment:['center','bottom'], preferredSize:[-1,20] }, \
                    }, \
                }";

            pal.grp = pal.add(res);

            pal.layout.layout(true);
            pal.grp.minimumSize = pal.grp.size;
            pal.layout.resize();
            pal.onResizing = pal.onResize = function() {
                this.layout.resize();
            }

            pal.grp.header.help.onClick = function() {
                alert(seqData.scriptTitle + "\n" + "\n" + setElementQuality_localize(seqData.strHelpText), setElementQuality_localize(seqData.strHelpTitle));
            }

            // SphericalMapResolutionItems items dropdown
            var smrItems = seqData.strSphericalMapResolutionItems;
            for (var i = 0; i < smrItems.length; i++) {
                pal.grp.opts.sphericalMapRes.list.add("item", smrItems[i]);
            }
            pal.grp.opts.sphericalMapRes.list.selection = 1;
            pal.grp.opts.sphericalMapRes.list.enabled = false;
            pal.grp.opts.sphericalMapRes.box.onClick = function() {
                this.parent.list.enabled = !this.parent.list.enabled;
            }

            // MirrorSurfaceQuality items dropdown
            var msqItems = seqData.strMirrorSurfaceQualityItems;
            for (var i = 0; i < msqItems.length; i++) {
                pal.grp.opts.mirrorSurfaceQuility.list.add("item", msqItems[i]);
            }
            pal.grp.opts.mirrorSurfaceQuility.list.selection = 0;
            pal.grp.opts.mirrorSurfaceQuility.list.enabled = false;
            pal.grp.opts.mirrorSurfaceQuility.box.onClick = function() {
                this.parent.list.enabled = !this.parent.list.enabled;
            }

            // Multisampling items dropdown
            var musItems = seqData.strMultisamplingItems;
            for (var i = 0; i < musItems.length; i++) {
                pal.grp.opts.multiSampling.list.add("item", musItems[i]);
            }
            pal.grp.opts.multiSampling.list.selection = 3;
            pal.grp.opts.multiSampling.list.enabled = false;
            pal.grp.opts.multiSampling.box.onClick = function() {
                this.parent.list.enabled = !this.parent.list.enabled;
            }

            // Supersampling items dropdown
            var susItems = seqData.strSupersamplingItems;
            for (var i = 0; i < susItems.length; i++) {
                pal.grp.opts.superSampling.list.add("item", susItems[i]);
            }
            pal.grp.opts.superSampling.list.selection = 0;
            pal.grp.opts.superSampling.list.enabled = false;
            pal.grp.opts.superSampling.box.onClick = function() {
                this.parent.list.enabled = !this.parent.list.enabled;
            }

            // RenderMode items dropdown
            var remItems = seqData.strRenderModeItems;
            for (var i = 0; i < remItems.length; i++) {
                pal.grp.opts.renderMode.list.add("item", remItems[i]);
            }
            pal.grp.opts.renderMode.list.selection = 0;
            pal.grp.opts.renderMode.list.enabled = false;
            pal.grp.opts.renderMode.box.onClick = function() {
                this.parent.list.enabled = !this.parent.list.enabled;
            }

            pal.grp.cmds.executeBtn.onClick = setElementQuality_doExecute;
            pal.grp.cmds.cancelBtn.onClick = setElementQuality_doCancel;
        }
        return pal;
    }

    // Main Functions
    //
    // Get properties and values
    function getPropVal() {
        var propValDict = [];
        for (var i = 0; i < seqPal.grp.opts.children.length; i++) {
            var currentProp = seqPal.grp.opts.children[i];
            if (currentProp.box.value == true) {
                var n = currentProp.name;
                var v = currentProp.list.selection.index;
                propValDict.push({
                    key: n,
                    index: v
                });

            }
        }
        //propValDict[0]["key"]
        return propValDict;
    }

    // Set on selected layers only
    function setElementQuality_changeInSelected() {
        var getPropValDict = getPropVal();
        //check if any layers are selected
        if (activeItem.selectedLayers.length != 0) {
            // set property on each selected layer
            for (var j = 0; j < activeItem.selectedLayers.length; j++) {
                var currentLayer = activeItem.selectedLayers[j];
                if (currentLayer.property("Effects").property("Element") != null) {
                    for (var i = 0; i < getPropValDict.length; i++) {
                        var currentProperty = getPropValDict[i]["key"];
                        var currentIndex = getPropValDict[i]["index"] + 1;
                        currentLayer.property("Effects").property("Element").property(currentProperty).setValue(currentIndex);
                    }
                }
            }
        } else {
            alert(setElementQuality_localize(seqData.strNoLayersSelectedErr));
        }
    }

    // Set only on layers in active composition
    function setElementQuality_changeInComp() {
        var getPropValDict = getPropVal();
        // set property on each selected layer
        for (var j = 1; j < activeItem.layers.length; j++) {
            var currentLayer = activeItem.layers[j];
            if (currentLayer.property("Effects").property("Element") != null) {
                for (var i = 0; i < getPropValDict.length; i++) {
                    var currentProperty = getPropValDict[i]["key"];
                    var currentIndex = getPropValDict[i]["index"] + 1;
                    currentLayer.property("Effects").property("Element").property(currentProperty).setValue(currentIndex);
                }
            }
        }
    }

    // Set on all layers in project
    function setElementQuality_changeInProject() {
        var getPropValDict = getPropVal();
        // get comp items
        var compItems = app.project.items;

        // set property on each layer in all comps
        for (var a = 1; a <= compItems.length;a++) {
            var currentItem = compItems[a];
            if (currentItem instanceof CompItem) {
                for (var j = 1; j <= currentItem.layers.length; j++) {
                    var currentLayer = currentItem.layers[j];
                    if (currentLayer.property("Effects").property("Element") != null) {
                        for (var i = 0; i < getPropValDict.length; i++) {
                            var currentProperty = getPropValDict[i]["key"];
                            var currentIndex = getPropValDict[i]["index"] + 1;
                            currentLayer.property("Effects").property("Element").property(currentProperty).setValue(currentIndex);
                        }
                    }
                }
            }
        }
    }

    // Execute
    function setElementQuality_doExecute() {
        app.beginUndoGroup(seqData.scriptName);
        if (seqPal.grp.scope.rdio.sele.value == true) {
            setElementQuality_changeInSelected();
        } else if (seqPal.grp.scope.rdio.comp.value == true) {
            setElementQuality_changeInComp();
        } else {
            setElementQuality_changeInProject();
        }
        app.endUndoGroup();
    }

    // Cancel
    function setElementQuality_doCancel() {
        seqPal.close();
    }



    // Check if Element3D is installed
    seqData.check = false;
    var effectNameCollection = app.effects;
    for (var i = 0; i < effectNameCollection.length; i++) {
        var name = effectNameCollection[i].displayName;
        if (name == "Element") {
            seqData.check = true;
        }
    }

    // Prerequisites check
    if (seqData.check == false) {
        alert(setElementQuality_localize(seqData.strErr));
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
