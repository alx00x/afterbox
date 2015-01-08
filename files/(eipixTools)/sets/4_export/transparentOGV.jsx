// transparentOGV.jsx
// 
// Name: transparentOGV
// Version: 2.0
// Author: Aleksandar Kocic
// 
// Description:     
// This script prepares a composition and adds render items
// for engine use. Script checks if dimensions are dividable 
// by 16 and offers an option to reduce unnecessarily space 
// around the object.
// 

(function transparentOGV(thisObj) {
    if (app.project.file == null) {
        alert("Save the project first.");
        return;
    }

    if (app.project.activeItem == null) {
        alert("Please, select your composition.");
        return;
    }

    // Define main variables
    var togvData = new Object();

    togvData.scriptNameShort = "TOGV";
    togvData.scriptName = "Transparent OGV";
    togvData.scriptVersion = "2.0";
    togvData.scriptTitle = togvData.scriptName + " v" + togvData.scriptVersion;

    togvData.strMinAE = {en: "This script requires Adobe After Effects CS4 or later."};
    togvData.strActiveCompErr = {en: "Please select a composition."};
    togvData.strExecute = {en: "Execute"};
    togvData.strCancel = {en: "Cancel"};

    togvData.strExportTo = {en: "Export To"};
    togvData.strBrowse = {en: "Browse"};
    togvData.strBrowseText = {en: "Save OGV and PNG to:"};

    togvData.strOptions = {en: "Options"};

    togvData.strWarning = {en: "Warning: Enabling this options for big and lengthy compositions could significantly increase the execution time. Using less than 10 samples is not recommended"};
    togvData.strPNGWarning = {en: "Warning: Could not find \"" + togvData.outputTemplateName + "\" output template. It is highly recommended to either make a template by that name or import it by pressing [IMP REND] button under eipixTools panel. Exporting as PSD for now."};
    togvData.strSpreadsheetErr = {en: "You need to specify output first."};
    togvData.strOutputErr = {en: "Output is not valid."};

    togvData.strCrop = {en: "Crop to Edges"};
    togvData.strSamples = {en: "Samples"};

    togvData.strHelp = {en: "?"};
    togvData.strHelpTitle = {en: "Help"};
    togvData.strErr = {en: "Something went wrong."};
    togvData.strHelpText = {en: "This script prepares a composition and adds render items for engine use. Script checks if dimensions are dividable by 16 and offers an option to reduce unnecessarily space around the object."};

    // Define project variables
    togvData.outputQuality = "Best Settings";
    togvData.outputTemplateName = "PNG Sequence";
    togvData.activeItem = app.project.activeItem;
    togvData.activeItemFrames = app.project.activeItem.duration * app.project.activeItem.frameRate;
    togvData.projectFolder = app.project.file.parent;
    togvData.outputPath;

    // Localize
    function transparentOGV_localize(strVar) {
        return strVar["en"];
    }

    // Build UI
    function transparentOGV_buildUI(thisObj) {
        var pal = new Window("dialog", togvData.scriptName, undefined, {resizeable:true});
        if (pal !== null) {
            var res =
                "group { \
                    orientation:'column', alignment:['fill','fill'], \
                    header: Group { \
                        alignment:['fill','top'], \
                        title: StaticText { text:'" + togvData.scriptNameShort + " v" + togvData.scriptVersion + "', alignment:['fill','center'] }, \
                        help: Button { text:'" + transparentOGV_localize(togvData.strHelp) + "', maximumSize:[30,20], alignment:['right','center'] }, \
                    }, \
                    options: Panel { \
                        alignment:['fill','top'], \
                        text: '" + transparentOGV_localize(togvData.strOptions) + "', alignment:['fill','top'], \
                        crp: Group { \
                            alignment:['left','center'], \
                            text: StaticText { text:'0 / 0', characters: 7, justify: 'center', alignment:['left','center'], preferredSize:[-1,20] }, \
                            loader: Progressbar { text:'Progressbar', minvalue:0, maxvalue:100, preferredSize:[260,5]},\
                            box1: Checkbox { text:'" + transparentOGV_localize(togvData.strCrop) + "' }, \
                        }, \
                        sam: Group { \
                            alignment:['fill','top'], \
                            text: StaticText { text:'" + transparentOGV_localize(togvData.strSamples) + ":', preferredSize:[120,20] }, \
                            fld: EditText { text:'10', characters: 3, justify: 'center', alignment:['left','center'], preferredSize:[-1,20] }, \
                            sld: Slider { value:10, minvalue:1, maxvalue:20, alignment:['fill','center'], preferredSize:[200,20] }, \
                        }, \
                    }, \
                    output: Panel { \
                        alignment:['fill','top'], \
                        text: '" + transparentOGV_localize(togvData.strExportTo) + "', alignment:['fill','top'], \
                        select: Group { \
                            alignment:['fill','top'], \
                            fld: EditText { alignment:['fill','center'], preferredSize:[250,20] },  \
                            btn: Button { text:'" + transparentOGV_localize(togvData.strBrowse) + "', preferredSize:[-1,20] }, \
                        }, \
                    }, \
                    sepr: Group { \
                        orientation:'row', alignment:['fill','top'], \
                        rule: Panel { height: 2, alignment:['fill','center'] }, \
                    }, \
                    cmds: Group { \
                        alignment:['fill','top'], \
                        executeBtn: Button { text:'" + transparentOGV_localize(togvData.strExecute) + "', alignment:['center','bottom'], preferredSize:[-1,20] }, \
                        cancelBtn: Button { text:'" + transparentOGV_localize(togvData.strCancel) + "', alignment:['center','bottom'], preferredSize:[-1,20] }, \
                    }, \
                }, \
            }";
            pal.grp = pal.add(res);

            pal.layout.layout(true);
            pal.grp.minimumSize = pal.grp.size;
            pal.layout.resize();
            pal.onResizing = pal.onResize = function() {
                this.layout.resize();
            }

            pal.grp.output.select.btn.onClick = function() {
                transparentOGV_doBrowse();
            }

            //Samples slider change
            pal.grp.options.sam.fld.onChange = function() {
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
            pal.grp.options.sam.sld.onChange = pal.grp.options.sam.sld.onChanging = function() {
                var value = parseInt(this.value);
                if (isNaN(value)) {
                    value = parseInt(this.parent.fld.text);
                }
                this.value = value;
                this.parent.fld.text = value.toString();
            }

            pal.grp.options.crp.box1.value = false;
            pal.grp.options.crp.text.visible = false;
            pal.grp.options.crp.text.enabled = false;
            pal.grp.options.crp.loader.visible = false;
            pal.grp.options.sam.text.enabled = false;
            pal.grp.options.sam.fld.enabled = false;
            pal.grp.options.sam.sld.enabled = false;
            var warningShow = true;

            pal.grp.options.crp.box1.onClick = function() {
                if (pal.grp.options.crp.box1.value == true) {
                    pal.grp.options.sam.text.enabled = true;
                    pal.grp.options.sam.fld.enabled = true;
                    pal.grp.options.sam.sld.enabled = true;
                    pal.grp.options.crp.text.visible = true;
                    pal.grp.options.crp.loader.visible = true;
                    if (warningShow == true) {
                        alert(transparentOGV_localize(togvData.strWarning));
                        warningShow = false;
                    }
                } else {
                    pal.grp.options.sam.text.enabled = false;
                    pal.grp.options.sam.fld.enabled = false;
                    pal.grp.options.sam.sld.enabled = false;
                    pal.grp.options.crp.text.visible = false;
                    pal.grp.options.crp.loader.visible = false;
                }
            }

            pal.grp.header.help.onClick = function() {
                alert(togvData.scriptTitle + "\n" + transparentOGV_localize(togvData.strHelpText), transparentOGV_localize(togvData.strHelpTitle));
            }

            pal.grp.cmds.executeBtn.onClick = transparentOGV_doExecute;
            pal.grp.cmds.cancelBtn.onClick = transparentOGV_doCancel;
        }

        return pal;
    }

    // Progressbar function:
    //
    function updateProgressbar(pal, minValue, currentValue, maxValue) {
        pal.grp.options.crp.loader.minvalue = minValue;
        pal.grp.options.crp.loader.maxvalue = maxValue;
        pal.grp.options.crp.loader.value = currentValue;
        pal.update();
    }

    // Progresstext function:
    //
    function updateProgresstext(pal, text) {
        pal.grp.options.crp.text.text = text;
        pal.update();
    }

    // Main Functions:
    //

    // Calculate first divisible by 16
    function transparentOGV_factorisation16(inputValue) {
        var valueDiv = 16;
        while (inputValue % valueDiv != 0) {
            inputValue += 1;
        }
        var value = inputValue;
        return value;
    }

    // 
    function transparentOGV_doBrowse() {
        var outputFile = togvData.projectFolder.selectDlg(transparentOGV_localize(togvData.strBrowseText));
        if (outputFile != null) {
            togvPal.grp.output.select.fld.text = outputFile.fsName.toString();
        }
    }

    // 
    function transparentOGV_edgeDetect(comp, target, samples) {
        //add null
        var addNull = comp.layers.addNull();
    
        //add slider property to null
        var addSlider = addNull.Effects.addProperty("ADBE Slider Control");
    
        //analize frame by frame for x1, x2, y1 and y2
        var compFrames = Math.round(comp.duration * comp.frameRate);
        var compHeight = comp.height;
        var compWidth = comp.width;
    
        var fx1 = compWidth; //left
        var fx2 = -1; //right
        var fy1 = -1; //top
        var fy2 = -1; //bottom
    
        var x1 = compWidth; //left
        var x2 = -1; //right
        var y1 = -1; //top
        var y2 = -1; //bottom
    
        for (i = 0; i < compFrames; i++) {
            updateProgresstext(togvPal, i + " / " + compFrames);
            var ySwitch = false;

            for (b = 0; b < compHeight; b += samples) {
                for (a = 0; a < compWidth; a += samples) {
                    var expr = "thisComp.layer('" + target + "').sampleImage([" + a + "," + b + "], [" + samples + "," + samples + "]/2, true, " + (i * comp.frameDuration) + ")[3]";
                    addSlider.property(1).expressionEnabled = true;
                    addSlider.property(1).expression = expr;
                    var value = addSlider(1).value;
                    //find left edge
                    if ((value > 0) && (a < x1)) {x1 = a;}
                    //find right edge
                    if ((value > 0) && (x2 < a)) {x2 = a;}
                    //find top edge
                    if ((value > 0) && (ySwitch == false)) {
                        y1 = b;
                        ySwitch = true;
                    }
                    //find bottom edge
                    if ((value > 0) && (y2 < b)) {y2 = b;}
                }
                updateProgressbar(togvPal, 0, b+1, compHeight);
            }

            if (x1 < fx1) {fx1 = x1;}
            if (x2 > fx2) {fx2 = x2;}
            if (y1 > fy1) {fy1 = y1;}
            if (y2 > fy2) {fy2 = y2;}
        }
        updateProgresstext(togvPal, compFrames + " / " + compFrames);

        addNull.remove();

        var arr = [Math.round(fx1 - (samples / 2)), Math.round(fx2 + (samples / 2)), Math.round(fy1 - (samples / 2)), Math.round(fy2 + (samples / 2))];
        return arr;
    }

    // 
    function checkTemplate(templateName) {
        var renderQ = app.project.renderQueue;
        var tempComp = app.project.items.addComp("setProxyTempComp", 100, 100, 1, 1, 25);
        var tempCompQueueItem = renderQ.items.add(tempComp)
        var tempCompQueueItemIndex = renderQ.numItems;
        var templateArray = renderQ.item(tempCompQueueItemIndex).outputModules[1].templates;
        for (var i = 1; i <= renderQ.numItems; i++) {
            var templateExists = false;
            for (var j = 0; j <= templateArray.length; j++) {
                if (templateArray[j] == templateName) {
                    templateExists = true;
                }
            }
        }
        tempCompQueueItem.remove();
        tempComp.remove();

        return templateExists;
    }

    // main
    function transparentOGV_main() {
        var activeComp = togvData.activeItem;
        var timeSliderPos = activeComp.time;
        var endFrame = activeComp.duration - activeComp.frameDuration;
        var oneFrame = activeComp.frameDuration;
        var selectedLayers = [];
        var selectedLayersIndices = [];
        var newComp;

        if ((activeComp != null) && (activeComp instanceof CompItem)) {
            app.beginUndoGroup("Make OGV ready composition for ingame use");
            if ((activeComp.width % 16 === 0) && (activeComp.height % 16 === 0)) {
                selectedLayers = activeComp.selectedLayers;
                if (selectedLayers.length === 0) {
                    alert("Select at least one background layer.");
                } else {
                    //get each selected layer's index
                    for (var i = 0; i < selectedLayers.length; i++) {
                        selectedLayersIndices.push(selectedLayers[i].index);
                    }
                    
                    //copy source of activeComp
                    var activeCompAlpha = activeComp.duplicate();
                    activeCompAlpha.name = "alpha(" + activeComp.name + ")";

                    //set selected layers as guides in copy of activeComp
                    for (var i = 0; i < selectedLayersIndices.length; i++) {
                        activeCompAlpha.layer(selectedLayersIndices[i]).guideLayer = true;
                    }

                    //setup the export ready composition
                    try {
                        var newCompName = "ogv(" + activeComp.name + ")";
                        var newCompWidth = activeComp.width * 2;
                        var offsetLeft = activeComp.width / 2;
                        var offsetRight = (activeComp.width / 2) * 3;
                        var offsetHight = activeComp.height / 2;
                        newComp = app.project.items.addComp(newCompName, newCompWidth, activeComp.height, activeComp.pixelAspect, activeComp.duration, activeComp.frameRate);
                        newComp.layers.add(activeComp);
                        newComp.layers.add(activeCompAlpha);
                        var L1 = newComp.layers[2];
                        var L2 = newComp.layers[1];
                        L1.property("ADBE Transform Group").property("ADBE Position").setValue([offsetLeft,offsetHight]);
                        L2.property("ADBE Transform Group").property("ADBE Position").setValue([offsetRight,offsetHight]);
                        L2.property("Effects").addProperty("Fill").property("Color").setValue([1,1,1,1]);
                        var newCompBG = newComp.layers.addSolid([0,0,0], "compBG", newComp.width, newComp.height, newComp.pixelAspect, newComp.duration);
                        newCompBG.moveToEnd();

                        //add avi to render queue
                        var renderQueueComp = app.project.renderQueue.items.add(newComp);
                        var renderQueueCompIndex = app.project.renderQueue.numItems;
                        renderQueueComp.applyTemplate("Best Settings");
                        renderQueueComp.timeSpanStart = 0;
                        renderQueueComp.timeSpanDuration = newComp.duration;
                        renderQueueComp.outputModules[1].applyTemplate("Lossless");
                        renderQueueComp.outputModules[1].file = new File(togvData.outputPath.fsName.toString() + "\\" + activeComp.name + "_a.avi");

                        //add png to render queue
                        var renderQueueThumb = app.project.renderQueue.items.add(activeComp);
                        var renderQueueThumbIndex = app.project.renderQueue.numItems;
                        renderQueueThumb.applyTemplate(outputQuality);
                        renderQueueThumb.timeSpanStart = endFrame;
                        renderQueueThumb.timeSpanDuration = oneFrame;
                        renderQueueThumb.outputModules[1].applyTemplate(outputTemplateName);
                        renderQueueThumb.outputModules[1].file = new File(togvData.outputPath.fsName.toString() + "\\" + activeComp.name + "_[#####].png");
                    } catch (err) {
                        alert(err.toString());
                    }
                }
            } else {
                alert("Composition dimensions are not divisible by 16.");
            }
    }

    // Button Functions:
    //

    // Execute
    function transparentOGV_doExecute() {
        var outputPath = togvPal.grp.output.select.fld.text;
        if (outputPath != "") {
            togvData.outputPath = new File(outputPath);
            if (togvData.outputPath.parent.exists == true) {
                app.beginUndoGroup(togvData.scriptName);
                var checkPoint = checkTemplate(outputTemplateName);
                if (checkPoint == false) {
                    alert(transparentOGV_localize(togvData.strWarning));
                }
                transparentOGV_main();
                app.endUndoGroup();
                togvPal.close();                    
            } else {
                alert(transparentOGV_localize(togvData.strOutputErr));
            }
        } else {
            alert(transparentOGV_localize(togvData.strSpreadsheetErr));
        }
    }

    // Cancel
    function transparentOGV_doCancel() {
        togvPal.close();
    }

    // Main code:
    //

    // Warning
    if (parseFloat(app.version) < 9.0) {
        alert(transparentOGV_localize(togvData.strMinAE));
    } else {
        // Build and show the floating palette
        var togvPal = transparentOGV_buildUI(thisObj);
        if (togvPal !== null) {
            if (togvPal instanceof Window) {
                // Show the palette
                togvPal.center();
                togvPal.show();
            } else {
                togvPal.layout.layout(true);
            }
        }
    }
})(this);