// separateDimensions.jsx
// 
// Name: separateDimensions
// Version: 1.0
// Author: Aleksandar Kocic
// 
// Description:
// This script creates slider instances for multidimensional properties
// in order to separate dimensions.
//  

(function separateDimensions(thisObj) {

    //Globals
    var activeItem = app.project.activeItem;

    // Define main variables
    var separateDimensionsData = new Object();

    separateDimensionsData.scriptNameShort = "SD";
    separateDimensionsData.scriptName = "Separate Dimensions";
    separateDimensionsData.scriptVersion = "1.0";
    separateDimensionsData.scriptTitle = separateDimensionsData.scriptName + " v" + separateDimensionsData.scriptVersion;

    separateDimensionsData.strErrComp = {en: "Please select a composition."};
    separateDimensionsData.strErrProp = {en: "Please select property in timeline panel."};
    separateDimensionsData.strErrDim = {en: "Selected property is not multidimensional."};

    separateDimensionsData.strDoneMsg = {en: "Done."};

    separateDimensionsData.strHelp = {en: "?"};
    separateDimensionsData.strHelpTitle = {en: "Help"};
    separateDimensionsData.strHelpText = {en: "This script creates slider instances for multidimensional properties."};

    // Localize
    function separateDimensions_localize(strVar) {
        return strVar["en"];
    }

    // Functions:
    //
    function separateDimensions_doExecute() {

        if ((activeItem.selectedLayers[0] != null) && (activeItem.selectedLayers[0].selectedProperties[0] != null)) {
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

            var selectedPropertyItemInstance = selectedPropertyItem;
            while (!(selectedPropertyItemInstance instanceof PropertyGroup)) {
                selectedPropertyEffectIndex = selectedPropertyItemInstance.parentProperty.propertyIndex;
                selectedPropertyItemInstance = selectedPropertyItem.parentProperty;
            }

            var selectedPropertyName = selectedPropertyItem.name;
            var selectedPropertyMatchName = selectedPropertyItem.matchName;
            var selectedPropertyLenght = selectedPropertyItem.value.length;
      
            if (selectedPropertyLenght != null) {

                if (selectedProperty.isEffect == true) {
                    var addSlider1 = selectedLayer.Effects.addProperty("ADBE Slider Control");
                    addSlider1.name = selectedPropertyName + " [X]";
                    addSlider1.slider.setValue(selectedLayer.effect(selectedPropertyEffectIndex)(selectedPropertyMatchName).value[0]);
                    var addSlider2 = selectedLayer.Effects.addProperty("ADBE Slider Control");
                    addSlider2.name = selectedPropertyName + " [Y]";
                    addSlider2.slider.setValue(selectedLayer.effect(selectedPropertyEffectIndex)(selectedPropertyMatchName).value[1]);
                    if (selectedPropertyLenght == 3) {
                        var addSlider3 = selectedLayer.Effects.addProperty("ADBE Slider Control");
                        addSlider3.name = selectedPropertyName + " [Z]";
                        addSlider3.slider.setValue(selectedLayer.effect(selectedPropertyEffectIndex)(selectedPropertyMatchName).value[2]);
                    }
                } else {
                    var addSlider1 = selectedLayer.Effects.addProperty("ADBE Slider Control");
                    addSlider1.name = selectedPropertyName + " [X]";
                    addSlider1.slider.setValue(selectedLayer.transform.property(selectedPropertyMatchName).value[0]);
                    var addSlider2 = selectedLayer.Effects.addProperty("ADBE Slider Control");
                    addSlider2.name = selectedPropertyName + " [Y]";
                    addSlider2.slider.setValue(selectedLayer.transform.property(selectedPropertyMatchName).value[1]);
                    if (selectedPropertyLenght == 3) {
                        var addSlider3 = selectedLayer.Effects.addProperty("ADBE Slider Control");
                        addSlider3.name = selectedPropertyName + " [Z]";
                        addSlider3.slider.setValue(selectedLayer.transform.property(selectedPropertyMatchName).value[2]);
                    }
                }

                if (selectedPropertyLenght == 2) {
                    propertyExpression = "x = thisLayer.effect('" + selectedPropertyName + " [X]" + "')('Slider');\ry = thisLayer.effect('" + selectedPropertyName + " [Y]" + "')('Slider');\r[x,y]";
                } else if (selectedPropertyLenght == 3) {
                    propertyExpression = "x = thisLayer.effect('" + selectedPropertyName + " [X]" + "')('Slider');\ry = thisLayer.effect('" + selectedPropertyName + " [Y]" + "')('Slider');\rz = thisLayer.effect('" + selectedPropertyName + " [Z]" + "')('Slider');\r[x,y,z]";
                }

                if (selectedProperty.isEffect == true) {
                    selectedLayer.effect(selectedPropertyEffectIndex)(selectedPropertyMatchName).expression = propertyExpression;
                } else {
                    selectedLayer.transform.property(selectedPropertyMatchName).expression = propertyExpression;
                }

                alert(separateDimensions_localize(separateDimensionsData.strDoneMsg));
            } else {
                alert(separateDimensions_localize(separateDimensionsData.strErrDim));
            }
        } else {
            alert(separateDimensions_localize(separateDimensionsData.strErrProp));
        }
    }

    // Main:
    //
    if ((activeItem != null) && (activeItem instanceof CompItem)) {
        app.beginUndoGroup("separateDimensions_doExecute");
        separateDimensions_doExecute();
        app.endUndoGroup();
    } else {
        alert(separateDimensions_localize(separateDimensionsData.strErrComp));
    }

})(this);