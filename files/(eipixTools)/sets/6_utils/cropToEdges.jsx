// cropToEdges.jsx
// 
// Name: cropToEdges
// Version: 0.7
// Author: Aleksandar Kocic
// 
// Description: Crops the precomps to the egdes of opaque pixels.
// 
// 

(function cropToEdges(thisObj) {
    if (app.project.file == null) {
        alert("Save the project first.");
        return;
    }

    if (app.project.activeItem == null) {
        alert("Please, select your composition.");
        return;
    }

    // Define main variables
    var cteData = new Object();

    cteData.scriptNameShort = "CTE";
    cteData.scriptName = "Crop To Edges";
    cteData.scriptVersion = "0.7";
    cteData.scriptTitle = cteData.scriptName + " v" + cteData.scriptVersion;

    cteData.strMinAE = { en: "This script requires Adobe After Effects CS4 or later." };
    cteData.strMaxAE = { en: "This script does not work with Adobe After Effects CC2015 or later." };
    cteData.strActiveCompErr = { en: "Please select a composition." };
    cteData.strNoLayersSelectedErr = { en: "Please select at least one layer." };
    cteData.strSelectedLayersErr = { en: "One or more layers you selected is not a precomposition." };
    cteData.strLayerIs3DErr = { en: "This script currently does not support 3D layers." };

    cteData.strOptions = { en: "Options" };
    cteData.strCrop = { en: "Crop to Edges" };
    cteData.strSamples = { en: "Samples " };
    cteData.strBorder = { en: "Border" };

    cteData.strSamplesHelpTip = { en: "Lower the value, more precise the execution." };
    cteData.strBorderHelpTip = { en: "Number of pixels to add on the edges." };

    cteData.strExecute = { en: "Crop" };
    cteData.strCancel = { en: "Exit" };

    cteData.strHelp = { en: "?" };
    cteData.strHelpTitle = { en: "Help" };
    cteData.strErr = { en: "Something went wrong." };
    cteData.strHelpText = { en: "This script crops selected precomposition layers to non opaque edges." };

    // Localize
    function cropToEdges_localize(strVar) {
        return strVar["en"];
    }

    // Build UI
    function cropToEdges_buildUI(thisObj) {
        var pal = new Window("palette", cteData.scriptName, undefined, { resizeable: true });
        if (pal !== null) {
            var res =
                "group { \
                    orientation:'column', alignment:['fill','fill'], \
                    header: Group { \
                        alignment:['fill','top'], \
                        title: StaticText { text:'" + cteData.scriptNameShort + " v" + cteData.scriptVersion + "', alignment:['fill','center'] }, \
                        help: Button { text:'" + cropToEdges_localize(cteData.strHelp) + "', maximumSize:[30,20], alignment:['right','center'] }, \
                    }, \
                    options: Panel { \
                        alignment:['fill','top'], \
                        text: '" + cropToEdges_localize(cteData.strOptions) + "', alignment:['fill','top'], \
                        sample: Group { \
                            alignment:['fill','center'], \
                            text: StaticText { text:'" + cropToEdges_localize(cteData.strSamples) + ":', preferredSize:[60,20] }, \
                            fld: EditText { text:'10', characters: 3, justify: 'center', alignment:['left','center'], preferredSize:[-1,20] }, \
                            sld: Slider { value:10, minvalue:2, maxvalue:20, alignment:['fill','center'], preferredSize:[160,20] }, \
                        }, \
                        border: Group { \
                            alignment:['fill','center'], \
                            text: StaticText { text:'" + cropToEdges_localize(cteData.strBorder) + ":', preferredSize:[60,20] }, \
                            fld: EditText { text:'0', characters: 3, justify: 'center', alignment:['left','center'], preferredSize:[-1,20] }, \
                            sld: Slider { value:0, minvalue:0, maxvalue:100, alignment:['fill','center'], preferredSize:[160,20] }, \
                        }, \
                    }, \
                    progress: Group { \
                        alignment:['fill','center'], \
                        bar: Progressbar { text:'Progressbar', minvalue:0, maxvalue:100, alignment:['fill','center'], preferredSize:[260,5]},\
                    }, \
                    sepr: Group { \
                        orientation:'row', alignment:['fill','top'], \
                        rule: Panel { height: 2, alignment:['fill','center'] }, \
                    }, \
                    cmds: Group { \
                        alignment:['fill','top'], \
                        executeBtn: Button { text:'" + cropToEdges_localize(cteData.strExecute) + "', alignment:['center','bottom'], preferredSize:[-1,20] }, \
                        cancelBtn: Button { text:'" + cropToEdges_localize(cteData.strCancel) + "', alignment:['center','bottom'], preferredSize:[-1,20] }, \
                    }, \
                }, \
            }";
            pal.grp = pal.add(res);

            pal.layout.layout(true);
            pal.grp.minimumSize = pal.grp.size;
            pal.layout.resize();
            pal.onResizing = pal.onResize = function () {
                this.layout.resize();
            }

            pal.grp.options.sample.sld.helpTip = cropToEdges_localize(cteData.strSamplesHelpTip);
            pal.grp.options.border.sld.helpTip = cropToEdges_localize(cteData.strBorderHelpTip);

            //Samples slider change
            pal.grp.options.sample.fld.onChange = function () {
                var value = parseInt(this.text);
                if (isNaN(value)) {
                    value = this.parent.sld.value;
                } else if (value < this.parent.sld.minvalue) {
                    value = this.parent.sld.minvalue;
                } else if (value > this.parent.sld.maxvalue) {
                    value = this.parent.sld.maxvalue;
                }
                this.text = value.toString();
                this.parent.sld.value = value;
            }
            pal.grp.options.sample.sld.onChange = pal.grp.options.sample.sld.onChanging = function () {
                var value = parseInt(this.value);
                if (isNaN(value)) {
                    value = parseInt(this.parent.fld.text);
                }
                this.value = value;
                this.parent.fld.text = value.toString();
            }

            //Border slider change
            pal.grp.options.border.fld.onChange = function () {
                var value = parseInt(this.text);
                if (isNaN(value)) {
                    value = this.parent.sld.value;
                } else if (value < this.parent.sld.minvalue) {
                    value = this.parent.sld.minvalue;
                } else if (value > this.parent.sld.maxvalue) {
                    value = this.parent.sld.maxvalue;
                }
                this.text = value.toString();
                this.parent.sld.value = value;
            }
            pal.grp.options.border.sld.onChange = pal.grp.options.border.sld.onChanging = function () {
                var value = parseInt(this.value);
                if (isNaN(value)) {
                    value = parseInt(this.parent.fld.text);
                }
                this.value = value;
                this.parent.fld.text = value.toString();
            }

            //Progressbar
            pal.grp.progress.bar.visible = false;

            //Header
            pal.grp.header.help.onClick = function () {
                alert(cteData.scriptTitle + "\n" + cropToEdges_localize(cteData.strHelpText), cropToEdges_localize(cteData.strHelpTitle));
            }

            //Buttons
            pal.grp.cmds.executeBtn.onClick = cropToEdges_doExecute;
            pal.grp.cmds.cancelBtn.onClick = cropToEdges_doCancel;
        }

        return pal;
    }

    // Progressbar function:
    //
    function updateProgressbar(pal, minValue, currentValue, maxValue) {
        pal.grp.progress.bar.minvalue = minValue;
        pal.grp.progress.bar.maxvalue = maxValue;
        pal.grp.progress.bar.value = currentValue;
        pal.update();
    }

    // Helper Functions:
    //
    function cropToEdges_checkSelected() {

        var activeItem = app.project.activeItem;
        if (activeItem == null) {
            alert(cropToEdges_localize(cteData.strActiveCompErr));
            return false;
        }

        var selectedLayers = activeItem.selectedLayers;
        if (selectedLayers.length < 1) {
            alert(cropToEdges_localize(cteData.strNoLayersSelectedErr));
            return false;
        }

        for (var i = 0; i < selectedLayers.length; i++) {
            var element = selectedLayers[i];
            if (element.source instanceof CompItem != true) {
                alert(cropToEdges_localize(cteData.strSelectedLayersErr));
                return false;
            }

            if (element.threeDLayer) {
                alert(cropToEdges_localize(cteData.strLayerIs3DErr));
                return false;
            }
        }

        return true;
    }

    function cropToEdges_edgeDetect(precomp, layer, samples, border) {

        //create duplicate comp
        var duplicateComp = layer.duplicate();
        duplicateComp.name = "duplicate_(" + layer.name + ")";
        var analizeComp = precomp.layers.precompose([duplicateComp.index], "analize_(" + layer.name + ")", true);
        analizeComp.name = "analize_(" + layer.name + ")";
        var target = analizeComp.layers[1].name;

        //add null
        var addNull = analizeComp.layers.addNull();

        //add slider property to null
        var addSlider = addNull.Effects.addProperty("ADBE Slider Control");

        //analize for x1, x2, y1 and y2
        var compHeight = analizeComp.height;
        var compWidth = analizeComp.width;

        var x1 = compWidth; //left
        var x2 = -1; //right
        var y1 = compHeight; //top
        var y2 = -1; //bottom

        ctePal.grp.progress.bar.visible = true;

        for (b = 0; b < compHeight; b += samples) {
            for (a = 0; a < compWidth; a += samples) {
                var expr = "thisComp.layer('" + target + "').sampleImage([" + a + "," + b + "], [" + samples + "," + samples + "]/2, true, 0)[3]";
                addSlider.property(1).expressionEnabled = true;
                addSlider.property(1).expression = expr;
                var value = addSlider(1).value;
                //find left edge
                if ((value > 0) && (a < x1)) { x1 = a; }
                //find right edge
                if ((value > 0) && (x2 < a)) { x2 = a; }
                //find top edge
                if ((value > 0) && (b < y1)) { y1 = b; }
                //find bottom edge
                if ((value > 0) && (y2 < b)) { y2 = b; }
            }
            updateProgressbar(ctePal, 0, b + 1, compHeight);
        }

        ctePal.grp.progress.bar.visible = false;

        analizeComp.remove();

        var arr = [Math.round(x1 - (samples / 2)), Math.round(x2 + (samples / 2)), Math.round(y1 - (samples / 2)), Math.round(y2 + (samples / 2))];
        return arr;
    }

    // Main Function:
    //

    function cropToEdges_main() {
        var activeItem = app.project.activeItem;
        var selectedLayers = activeItem.selectedLayers;
        var samples = parseInt(ctePal.grp.options.sample.fld.text);
        var border = parseInt(ctePal.grp.options.border.fld.text);

        //crop precomps
        for (var j = 0; j < selectedLayers.length; j++) {
            var layer = selectedLayers[j];
            var layerPos = layer.property("Transform").property("Position").value;
            var layerAnchor = layer.property("Transform").property("Anchor Point").value;

            var precomp = layer.source;
            var precompLayers = precomp.layers;

            if (precompLayers.length > 0) {
                var precompWidth = precomp.width;
                var precompHeight = precomp.height;

                //move precomp anchor point to [0,0]
                layer.property("Transform").property("Anchor Point").setValue([0, 0]);
                layer.property("Transform").property("Position").setValue([layerPos[0] - layerAnchor[0], layerPos[1] - layerAnchor[1]]);

                var startingOffset = layer.property("Transform").property("Position").value;

                //detect edges
                var targetEdges = cropToEdges_edgeDetect(activeItem, layer, samples, border);

                //offset layers to accommodate new dimensions
                for (var v = 1; v <= precompLayers.length; v++) {
                    var layerInsideComp = precompLayers[v];
                    if ((layerInsideComp instanceof ShapeLayer) || (layerInsideComp instanceof TextLayer) || (layerInsideComp instanceof AVLayer)) {
                        if (!layerInsideComp.hasAudio) {
                            var layerInsideCompPos = layerInsideComp.property("Transform").property("Position").value;
                            layerInsideComp.property("Transform").property("Position").setValue([layerInsideCompPos[0] - targetEdges[0], layerInsideCompPos[1] - targetEdges[2]]);
                        }
                    }
                }

                //crop comp to edges
                var newWidth = precompWidth - (targetEdges[0] + (precompWidth - targetEdges[1]));
                var newHeight = precompHeight - (targetEdges[2] + (precompHeight - targetEdges[3]));
                precomp.width = newWidth;
                precomp.height = newHeight;

                //move precomposition layer to compensate for cropping
                layer.property("Transform").property("Position").setValue([targetEdges[0], targetEdges[2]]);

                //centar precomposition layer anchor
                var newAnchor = layer.property("Transform").property("Anchor Point").value;;
                layer.property("Transform").property("Anchor Point").setValue([newAnchor[0] + newWidth / 2, newAnchor[1] + newHeight / 2]);
                var newPosition = layer.property("Transform").property("Position").value;;
                layer.property("Transform").property("Position").setValue([newPosition[0] + (newAnchor[0] + newWidth / 2) + startingOffset[0], newPosition[1] + (newAnchor[0] + newHeight / 2) + startingOffset[1]]);
            }
        }
    }

    // Button Functions:
    //

    // Execute
    function cropToEdges_doExecute() {
        if (cropToEdges_checkSelected() == true) {
            app.beginUndoGroup(cteData.scriptName);
            cropToEdges_main();
            app.endUndoGroup();
        } else {
            return;
        }
    }

    // Cancel
    function cropToEdges_doCancel() {
        ctePal.close();
    }

    // Main code:
    //

    // Warning
    var appVersion = parseFloat(app.version);
    if ((appVersion < 9.0) || (appVersion > 13.0) ) {
        alert(cropToEdges_localize(cteData.strMinAE));
    } else {
        // Build and show the floating palette
        var ctePal = cropToEdges_buildUI(thisObj);
        if (ctePal !== null) {
            if (ctePal instanceof Window) {
                // Show the palette
                ctePal.center();
                ctePal.show();
            } else {
                ctePal.layout.layout(true);
            }
        }
    }
})(this);
