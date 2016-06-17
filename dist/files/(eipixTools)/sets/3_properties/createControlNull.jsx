// createControlNull.jsx
// 
// Name: createControlNull
// Version: 1.2
// Author: Aleksandar Kocic
// 
// Description:
// This script provides a GUI to quickly create a control null object.
//  

(function createControlNull(thisObj) {

    //Globals
    var activeItem = app.project.activeItem;
    var xyCombined = false;

    // Define main variables
    var ccnData = new Object();
    var createControlNullData = new Object();

    createControlNullData.scriptNameShort = "CCN";
    createControlNullData.scriptName = "Create Control Null";
    createControlNullData.scriptVersion = "1.2";
    createControlNullData.scriptTitle = createControlNullData.scriptName + " v" + createControlNullData.scriptVersion;

    createControlNullData.strSelect = {en: "Select"};
    createControlNullData.strBtnGetX = {en: "Get X"};
    createControlNullData.strBtnGetY = {en: "Get Y"};
    createControlNullData.strBtnGetZ = {en: "Get Z"};
    createControlNullData.strInstructions = {en: "Instructions"};
    createControlNullData.strInstructionsText = {en: "Select the property in timeline panel under layer properties and than click \"Get\" button for each dimension."};

    createControlNullData.strExecute = {en: "Create"};
    createControlNullData.strCancel = {en: "Cancel"};

    createControlNullData.strErr = {en: ""};
    createControlNullData.strErrComp = {en: "Please select a composition."};
    createControlNullData.strErrProp = {en: "Please select property in timeline panel."};
    createControlNullData.strErrEffect = {en: "This script only works with effect properties at the moment."};
    createControlNullData.strErrCantExp = {en: "Cannot use this property."};
    createControlNullData.strErrNotDefined = {en: "Dimensions are not defined."};

    createControlNullData.strHelp = {en: "?"};
    createControlNullData.strHelpTitle = {en: "Help"};
    createControlNullData.strHelpText = {en: "This script provides a GUI to quickly create a control null object."};

    // Localize
    function createControlNull_localize(strVar) {
        return strVar["en"];
    }

    //BuildUI
    function createControlNull_buildUI(thisObj) {
        var pal = (thisObj instanceof Panel) ? thisObj : new Window("palette", createControlNullData.scriptName);
        var res =
            "group { \
                orientation:'column', alignment:['fill','fill'], \
                header: Group { \
                    alignment:['fill','top'], \
                    title: StaticText { text:'" + createControlNullData.scriptNameShort + " v" + createControlNullData.scriptVersion + "', alignment:['fill','center'] }, \
                    help: Button { text:'" + createControlNull_localize(createControlNullData.strHelp) + "', maximumSize:[30,20], alignment:['right','center'] }, \
                }, \
                instr: Panel { orientation:'column', text:'" + createControlNull_localize(createControlNullData.strInstructions) + "', alignment:['fill','fill'], alignChildren: ['fill','center'], \
                    instructions: StaticText { text:'" + createControlNull_localize(createControlNullData.strInstructionsText) + "', alignment:['left','fill'], properties:{multiline:true} }, size:[210,70], \
                }, \
                select: Panel { orientation:'column', text:'" + createControlNull_localize(createControlNullData.strSelect) + "', alignment:['fill','fill'], alignChildren: ['fill','center'], \
                    getX: Group { \
                        alignment:['fill','top'], \
                        prop: EditText { alignment:['fill','center'], justify:'center', preferredSize:[40,20] },  \
                        getXBtn: Button { text:'" + createControlNull_localize(createControlNullData.strBtnGetX) + "', preferredSize:[40,20] }, \
                    }, \
                    getY: Group { \
                        alignment:['fill','top'], \
                        prop: EditText { alignment:['fill','center'], justify:'center', preferredSize:[40,20] },  \
                        getYBtn: Button { text:'" + createControlNull_localize(createControlNullData.strBtnGetY) + "', preferredSize:[40,20] }, \
                    }, \
                    getZ: Group { \
                        alignment:['fill','top'], \
                        prop: EditText { alignment:['fill','center'], justify:'center', preferredSize:[40,20] },  \
                        getZBtn: Button { text:'" + createControlNull_localize(createControlNullData.strBtnGetZ) + "', preferredSize:[40,20] }, \
                    }, \
                }, \
                buttons: Group { \
                    alignment:['fill','bottom'], \
                    executeBtn: Button { text:'" + createControlNull_localize(createControlNullData.strExecute) + "', alignment:['center','bottom'], preferredSize:[-1,20] }, \
                    cancelBtn: Button { text:'" + createControlNull_localize(createControlNullData.strCancel) + "', alignment:['center','bottom'], preferredSize:[-1,20] }, \
                }, \
            }";

        pal.grp = pal.add(res);
        pal.grp.header.help.onClick = function() {
            alert(createControlNullData.scriptTitle + "\n" + "\n" + createControlNull_localize(createControlNullData.strHelpText), createControlNull_localize(createControlNullData.strHelpTitle));
        }

        pal.grp.select.getX.getXBtn.onClick = function() {
            var checkBeforeGet = createControlNull_checkBeforeGet();
            if (checkBeforeGet == true) {
                var checkIsEffect = createControlNull_checkIsEffect();
                if (checkIsEffect == true) {
                    createControlNull_getX();
                } else {
                    alert(createControlNull_localize(createControlNullData.strErrEffect));
                }
            } else {
                alert(createControlNull_localize(createControlNullData.strErrProp));
            }
        }
        pal.grp.select.getY.getYBtn.onClick = function() {
            var checkBeforeGet = createControlNull_checkBeforeGet();
            if (checkBeforeGet == true) {
                var checkIsEffect = createControlNull_checkIsEffect();
                if (checkIsEffect == true) {
                    createControlNull_getY();
                } else {
                    alert(createControlNull_localize(createControlNullData.strErrEffect));
                }
            } else {
                alert(createControlNull_localize(createControlNullData.strErrProp));
            }
        }
        pal.grp.select.getZ.getZBtn.onClick = function() {
            var checkBeforeGet = createControlNull_checkBeforeGet();
            if (checkBeforeGet == true) {
                var checkIsEffect = createControlNull_checkIsEffect();
                if (checkIsEffect == true) {
                    createControlNull_getZ();
                } else {
                    alert(createControlNull_localize(createControlNullData.strErrEffect));
                }
            } else {
                alert(createControlNull_localize(createControlNullData.strErrProp));
            }
        }

        pal.grp.buttons.executeBtn.onClick = createControlNull_doExecute;
        pal.grp.buttons.cancelBtn.onClick = createControlNull_doCancel;

        return pal;
    }

    // Functions:
    //

    // Check if property is selected
    function createControlNull_checkBeforeGet() {
        if ((activeItem.selectedLayers[0] != null) && (activeItem.selectedLayers[0].selectedProperties[0] != null)) {
            return true;
        } else {
            return false;
        }
    }

    // Check if property is effect
    function createControlNull_checkIsEffect() {
        if (activeItem.selectedLayers[0].selectedProperties[0].isEffect == true) {
            return true;
        } else {
            return false;
        }
    }

    // Get X
    function createControlNull_getX() {
        var selectedLayer = activeItem.selectedLayers[0];
        var selectedProperty = selectedLayer.selectedProperties[0];

        var selectedPropertyItem;
        var selectedPropertyEffectIndex;
        var selectedPropertyMatchName;
        var propertyExpression;

        if (selectedProperty.isEffect == true) {
            for (var i = 1; i <= selectedProperty.numProperties; i++) {
                if (selectedProperty.property(i).selected == true) {
                    selectedPropertyItem = selectedProperty.property(i);
                }
            }
        } else {
            selectedPropertyItem = selectedProperty;
        }

        if (selectedPropertyItem.canSetExpression == true) {
            var selectedPropertyItemInstance = selectedPropertyItem;
            while (!(selectedPropertyItemInstance instanceof PropertyGroup)) {
                selectedPropertyEffectIndex = selectedPropertyItemInstance.parentProperty.propertyIndex;
                selectedPropertyItemInstance = selectedPropertyItem.parentProperty;
            }

            var selectedLayerName = selectedLayer.name;
    
            var selectedPropertyName = selectedPropertyItem.name;
            var selectedPropertyMatchName = selectedPropertyItem.matchName;
            var selectedPropertyLenght = selectedPropertyItem.value.length;
            var selectedPropertyValue;

            if (selectedPropertyLenght == null) {
                selectedPropertyValue = selectedPropertyItem.value;
            } else {
                xyCombined = true;
                selectedPropertyValue = selectedPropertyItem.value[0];
            }

            ccnPal.grp.select.getX.prop.text = selectedPropertyValue;

            ccnData.xLayerName = selectedLayerName;
            ccnData.xPropName = selectedPropertyName;
            ccnData.xPropMatchName = selectedPropertyMatchName;
            ccnData.xPropIndex = selectedPropertyEffectIndex;
            ccnData.xPropValue = selectedPropertyValue;
        } else {
            alert(createControlNull_localize(createControlNullData.strErrCantExp));
        }
    }

    // Get Y
    function createControlNull_getY() {
        var selectedLayer = activeItem.selectedLayers[0];
        var selectedProperty = selectedLayer.selectedProperties[0];

        var selectedPropertyItem;
        var selectedPropertyEffectIndex;
        var selectedPropertyMatchName;
        var propertyExpression;

        if (selectedProperty.isEffect == true) {
            for (var i = 1; i <= selectedProperty.numProperties; i++) {
                if (selectedProperty.property(i).selected == true) {
                    selectedPropertyItem = selectedProperty.property(i);
                }
            }
        } else {
            selectedPropertyItem = selectedProperty;
        }

        if (selectedPropertyItem.canSetExpression == true) {
            var selectedPropertyItemInstance = selectedPropertyItem;
            while (!(selectedPropertyItemInstance instanceof PropertyGroup)) {
                selectedPropertyEffectIndex = selectedPropertyItemInstance.parentProperty.propertyIndex;
                selectedPropertyItemInstance = selectedPropertyItem.parentProperty;
            }

            var selectedLayerName = selectedLayer.name;
    
            var selectedPropertyName = selectedPropertyItem.name;
            var selectedPropertyMatchName = selectedPropertyItem.matchName;
            var selectedPropertyLenght = selectedPropertyItem.value.length;
            var selectedPropertyValue;

            if (selectedPropertyLenght == null) {
                selectedPropertyValue = selectedPropertyItem.value;
            } else {
                xyCombined = true;
                selectedPropertyValue = selectedPropertyItem.value[1];
            }

            ccnPal.grp.select.getY.prop.text = selectedPropertyValue;

            ccnData.yLayerName = selectedLayerName;
            ccnData.yPropName = selectedPropertyName;
            ccnData.yPropMatchName = selectedPropertyMatchName;
            ccnData.yPropIndex = selectedPropertyEffectIndex;
            ccnData.yPropValue = selectedPropertyValue;
        } else {
            alert(createControlNull_localize(createControlNullData.strErrCantExp));
        }
    }

    // Get Z
    function createControlNull_getZ() {
        var selectedLayer = activeItem.selectedLayers[0];
        var selectedProperty = selectedLayer.selectedProperties[0];

        var selectedPropertyItem;
        var selectedPropertyEffectIndex;
        var selectedPropertyMatchName;
        var propertyExpression;

        if (selectedProperty.isEffect == true) {
            for (var i = 1; i <= selectedProperty.numProperties; i++) {
                if (selectedProperty.property(i).selected == true) {
                    selectedPropertyItem = selectedProperty.property(i);
                }
            }
        } else {
            selectedPropertyItem = selectedProperty;
        }

        if (selectedPropertyItem.canSetExpression == true) {
            var selectedPropertyItemInstance = selectedPropertyItem;
            while (!(selectedPropertyItemInstance instanceof PropertyGroup)) {
                selectedPropertyEffectIndex = selectedPropertyItemInstance.parentProperty.propertyIndex;
                selectedPropertyItemInstance = selectedPropertyItem.parentProperty;
            }

            var selectedLayerName = selectedLayer.name;
    
            var selectedPropertyName = selectedPropertyItem.name;
            var selectedPropertyMatchName = selectedPropertyItem.matchName;
            var selectedPropertyLenght = selectedPropertyItem.value.length;
            var selectedPropertyValue;

            if (selectedPropertyLenght == null) {
                selectedPropertyValue = selectedPropertyItem.value;
            } else {
                selectedPropertyValue = selectedPropertyItem.value[2];
            }

            ccnPal.grp.select.getZ.prop.text = selectedPropertyValue;

            ccnData.zLayerName = selectedLayerName;
            ccnData.zPropName = selectedPropertyName;
            ccnData.zPropMatchName = selectedPropertyMatchName;
            ccnData.zPropIndex = selectedPropertyEffectIndex;
            ccnData.zPropValue = selectedPropertyValue;
        } else {
            alert(createControlNull_localize(createControlNullData.strErrCantExp));
        }
    }

    // Execute
    function createControlNull_doExecute() {
        if ((ccnData.xPropValue !== null) && (ccnData.yPropValue !== null) && (ccnData.zPropValue !== null)) {
            var propertyExpression1;
            var propertyExpression2;
            var controlNullName = ccnData.xLayerName + " (" + ccnData.xPropName + ")";

            var addControlNull = activeItem.layers.addNull();
            addControlNull.threeDLayer = true;
            addControlNull.name = controlNullName;
            addControlNull.transform.position.setValue([ccnData.xPropValue,ccnData.yPropValue,ccnData.zPropValue])

            if (xyCombined == true) {
                propertyExpression1 = "x = thisComp.layer('" + controlNullName + "').transform.position[0];\ry = thisComp.layer('" + controlNullName + "').transform.position[1];\r[x,y]";
                propertyExpression2 = "z = thisComp.layer('" + controlNullName + "').transform.position[2];\r[z]";
                activeItem.layer(ccnData.xLayerName).effect(ccnData.xPropIndex)(ccnData.xPropMatchName).expression = propertyExpression1;
                activeItem.layer(ccnData.zLayerName).effect(ccnData.zPropIndex)(ccnData.zPropMatchName).expression = propertyExpression2;
            } else {
                propertyExpression1 = "x = thisComp.layer('" + controlNullName + "').transform.position[0];\r[x]";
                propertyExpression2 = "y = thisComp.layer('" + controlNullName + "').transform.position[1];\r[y]";
                propertyExpression3 = "z = thisComp.layer('" + controlNullName + "').transform.position[2];\r[z]";
                activeItem.layer(ccnData.xLayerName).effect(ccnData.xPropIndex)(ccnData.xPropMatchName).expression = propertyExpression1;
                activeItem.layer(ccnData.yLayerName).effect(ccnData.yPropIndex)(ccnData.yPropMatchName).expression = propertyExpression2;
                activeItem.layer(ccnData.zLayerName).effect(ccnData.zPropIndex)(ccnData.zPropMatchName).expression = propertyExpression3;
            }

            ccnPal.close();
        } else {
            alert(createControlNull_localize(createControlNullData.strErrNotDefined));
            return;
        }
    }

    // Cancel
    function createControlNull_doCancel() {
        ccnPal.close();
    }

    // Main:
    //
    // Prerequisites check
    if ((activeItem != null) && (activeItem instanceof CompItem)) {
        // Build and show the floating palette
        var ccnPal = createControlNull_buildUI(thisObj);
        if (ccnPal !== null) {
            if (ccnPal instanceof Window) {
                // Show the palette
                ccnPal.center();
                ccnPal.show();
            } else {
                ccnPal.layout.layout(true);
            }
        }
    } else {
        alert(createControlNull_localize(createControlNullData.strErrComp));
    }

})(this);