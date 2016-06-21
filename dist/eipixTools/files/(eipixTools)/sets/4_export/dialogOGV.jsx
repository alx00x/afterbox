// dialogOGV.jsx
// 
// Name: dialogOGV
// Version: 1.1
// Author: Aleksandar Kocic
// 
// Description:     
// This script prepares a dialog sequence and adds render items
// for engine use. Script checks if dimensions are dividable 
// by 16 and offers an option to reduce unnecessarily space 
// around the object.
// 

(function dialogOGV(thisObj) {
    if (app.project.file == null) {
        alert("Save the project first.");
        return;
    }

    // Define main variables
    var dogvData = new Object();

    dogvData.scriptNameShort = "DOGV";
    dogvData.scriptName = "Dialog OGV";
    dogvData.scriptVersion = "1.1";
    dogvData.scriptTitle = dogvData.scriptName + " v" + dogvData.scriptVersion;

    dogvData.strMinAE = {en: "This script requires Adobe After Effects CS4 or later."};
    dogvData.strActiveCompErr = {en: "Please select a composition."};

    dogvData.strExecute = {en: "Execute"};
    dogvData.strCancel = {en: "Cancel"};

    dogvData.strSelect = {en: "Select"};
    dogvData.strSelectText = {en: "Import sequences into project panel, select them and press the button:"};
    dogvData.strExportTo = {en: "Export To"};
    dogvData.strBrowse = {en: "Browse"};
    dogvData.strBrowseText = {en: "Save OGV and PNG to:"};

    dogvData.strOptions = {en: "Options"};

    dogvData.strWarning = {en: "Warning: Enabling this options for big and lengthy compositions could significantly increase the execution time. Setting smaller than 5 sample size is not recommended"};
    dogvData.strPNGWarning = {en: "Warning: Could not find \"" + dogvData.outputTemplateName + "\" output template. It is highly recommended to either make a template by that name or import it by pressing [IMP REND] button under eipixTools panel. Exporting as PSD for now."};
    dogvData.strSpreadsheetErr = {en: "You need to specify output first."};
    dogvData.strOutputErr = {en: "Output is not valid."};

    dogvData.strCrop = {en: "Crop to Edges"};
    dogvData.strSamples = {en: "Samples"};
    dogvData.strFrameSkip = {en: "Skip frames"};
    dogvData.strFrameSkipOpts = [0, 1, 2, 5, 10, 25];

    dogvData.strSamplesHelpTip = {en: "Lower the value, slower the execution."};
    dogvData.strFrameSkipHelpTip = {en: "Lower the value, slower the execution."};

    dogvData.strInputSelectErr = {en: "No selected sequences."};
    dogvData.strErrNotCorrectExt = {en: "Following item is not a PNG sequence:"};
    dogvData.strErrNotCorrectFPS = {en: "Following item is not interpreted as 25fps sequence:"};

    dogvData.strHelp = {en: "?"};
    dogvData.strHelpTitle = {en: "Help"};
    dogvData.strErr = {en: "Something went wrong."};
    dogvData.strHelpText = {en: "This script prepares a composition and adds render items for engine use. Script checks if dimensions are dividable by 16 and offers an option to reduce unnecessarily space around the object."};

    // Define project variables
    dogvData.outputQuality = "Best Settings";
    dogvData.outputTemplateVid = "Lossless";
    dogvData.outputTemplateImg = "PNG Sequence";
    dogvData.projectFolder = app.project.file.parent;
    dogvData.sequenceItems = [];
    dogvData.outputPath;

    // Localize
    function dialogOGV_localize(strVar) {
        return strVar["en"];
    }

    // Build UI
    function dialogOGV_buildUI(thisObj) {
        var pal = new Window("palette", dogvData.scriptName, undefined, {resizeable:false});
        if (pal !== null) {
            var res =
                "group { \
                    orientation:'column', alignment:['fill','fill'], \
                    header: Group { \
                        alignment:['fill','top'], \
                        title: StaticText { text:'" + dogvData.scriptNameShort + " v" + dogvData.scriptVersion + "', alignment:['fill','center'] }, \
                        help: Button { text:'" + dialogOGV_localize(dogvData.strHelp) + "', maximumSize:[30,20], alignment:['right','center'] }, \
                    }, \
                    input: Panel { \
                        alignment:['fill','top'], \
                        text: '" + dialogOGV_localize(dogvData.strSelect) + "', alignment:['fill','top'], \
                        sel: Group { \
                            alignment:['fill','top'], \
                            txt: StaticText { text:'" + dialogOGV_localize(dogvData.strSelectText) + "', preferredSize:[-1,20] },  \
                            btn: Button { text:'" + dialogOGV_localize(dogvData.strSelect) + "', preferredSize:[-1,20] }, \
                        }, \
                        lst: Group { \
                            box: ListBox { alignment:['fill','fill'], preferredSize:[460,120], properties:{numberOfColumns:2, showHeaders:true, columnTitles: ['#', 'Name'], columnWidths:[20,435]} }, \
                        }, \
                    }, \
                    options: Panel { \
                        alignment:['fill','top'], \
                        text: '" + dialogOGV_localize(dogvData.strOptions) + "', alignment:['fill','top'], \
                        crp: Group { \
                            alignment:['right','center'], \
                            text: StaticText { text:'0 / 0', characters: 7, justify: 'center', alignment:['left','center'], preferredSize:[-1,20] }, \
                            loader: Progressbar { text:'Progressbar', minvalue:0, maxvalue:100, preferredSize:[260,5]},\
                            box1: Checkbox { text:'" + dialogOGV_localize(dogvData.strCrop) + "' }, \
                        }, \
                        skp: Group { \
                            alignment:['fill','top'], \
                            text: StaticText { text:'" + dialogOGV_localize(dogvData.strFrameSkip) + ":', preferredSize:[120,20] }, \
                            list: DropDownList { alignment:['fill','center'], preferredSize:[180,20] }, \
                        }, \
                        sam: Group { \
                            alignment:['fill','top'], \
                            text: StaticText { text:'" + dialogOGV_localize(dogvData.strSamples) + ":', preferredSize:[120,20] }, \
                            fld: EditText { text:'5', characters: 3, justify: 'center', alignment:['left','center'], preferredSize:[-1,20] }, \
                            sld: Slider { value:5, minvalue:1, maxvalue:20, alignment:['fill','center'], preferredSize:[200,20] }, \
                        }, \
                    }, \
                    output: Panel { \
                        alignment:['fill','top'], \
                        text: '" + dialogOGV_localize(dogvData.strExportTo) + "', alignment:['fill','top'], \
                        select: Group { \
                            alignment:['fill','top'], \
                            fld: EditText { alignment:['fill','center'], preferredSize:[280,20] },  \
                            btn: Button { text:'" + dialogOGV_localize(dogvData.strBrowse) + "', preferredSize:[-1,20] }, \
                        }, \
                    }, \
                    sepr: Group { \
                        orientation:'row', alignment:['fill','top'], \
                        rule: Panel { height: 2, alignment:['fill','center'] }, \
                    }, \
                    cmds: Group { \
                        alignment:['fill','top'], \
                        executeBtn: Button { text:'" + dialogOGV_localize(dogvData.strExecute) + "', alignment:['center','bottom'], preferredSize:[-1,20] }, \
                        cancelBtn: Button { text:'" + dialogOGV_localize(dogvData.strCancel) + "', alignment:['center','bottom'], preferredSize:[-1,20] }, \
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

            pal.grp.input.lst.enabled = true;
            pal.grp.input.sel.btn.onClick = function() {
                collectFilesAndReduce_doSelectSequences();
            }

            pal.grp.output.select.btn.onClick = function() {
                dialogOGV_doBrowse();
            }

            pal.grp.options.crp.box1.helpTip = dialogOGV_localize(dogvData.strWarning);
            pal.grp.options.skp.list.helpTip = dialogOGV_localize(dogvData.strFrameSkipHelpTip);
            pal.grp.options.sam.sld.helpTip = dialogOGV_localize(dogvData.strSamplesHelpTip);

            //Skip dropdown menu
            var skipItems = dogvData.strFrameSkipOpts;
            for (var i = 0; i < skipItems.length; i++) {
                pal.grp.options.skp.list.add("item", skipItems[i]);
            }
            pal.grp.options.skp.list.selection = 3;

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

            pal.grp.options.skp.text.enabled = false;
            pal.grp.options.skp.list.enabled = false;
            pal.grp.options.crp.box1.value = false;
            pal.grp.options.crp.text.visible = false;
            pal.grp.options.crp.text.enabled = false;
            pal.grp.options.crp.loader.visible = false;
            pal.grp.options.sam.text.enabled = false;
            pal.grp.options.sam.fld.enabled = false;
            pal.grp.options.sam.sld.enabled = false;
            //var warningShow = true;

            pal.grp.options.crp.box1.onClick = function() {
                if (pal.grp.options.crp.box1.value == true) {
                    pal.grp.options.skp.text.enabled = true;
                    pal.grp.options.skp.list.enabled = true;
                    pal.grp.options.sam.text.enabled = true;
                    pal.grp.options.sam.fld.enabled = true;
                    pal.grp.options.sam.sld.enabled = true;
                    pal.grp.options.crp.text.visible = true;
                    pal.grp.options.crp.loader.visible = true;
                    //if (warningShow == true) {
                    //    alert(dialogOGV_localize(dogvData.strWarning));
                    //    warningShow = false;
                    //}
                } else {
                    pal.grp.options.skp.text.enabled = false;
                    pal.grp.options.skp.list.enabled = false;
                    pal.grp.options.sam.text.enabled = false;
                    pal.grp.options.sam.fld.enabled = false;
                    pal.grp.options.sam.sld.enabled = false;
                    pal.grp.options.crp.text.visible = false;
                    pal.grp.options.crp.loader.visible = false;
                }
            }

            pal.grp.header.help.onClick = function() {
                alert(dogvData.scriptTitle + "\n" + dialogOGV_localize(dogvData.strHelpText), dialogOGV_localize(dogvData.strHelpTitle));
            }

            pal.grp.cmds.executeBtn.onClick = dialogOGV_doExecute;
            pal.grp.cmds.cancelBtn.onClick = dialogOGV_doCancel;
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
    function dialogOGV_factorisation16(inputValue) {
        var valueDiv = 16;
        while (inputValue % valueDiv != 0) {
            inputValue += 1;
        }
        var value = inputValue;
        return value;
    }

    // Get selected sequences
    function collectFilesAndReduce_doSelectSequences() {
        //clear list
        dogvData.sequenceItems = [];
        dogvPal.grp.input.lst.box.removeAll();
        //get selected
        var selectedItems = app.project.selection;
        for (var j = 0; j < selectedItems.length; j++) {
            var currentItem = selectedItems[j];
            //check if source is a png sequence
            if (currentItem instanceof FootageItem && currentItem.mainSource.isStill == false && currentItem.mainSource.hasAlpha == true) {
                var file = currentItem.file.toString();
                if (file.slice(-3) != "png") {
                    alert(dialogOGV_localize(dogvData.strErrNotCorrectExt) + "\n" + currentItem.name, "Warning");
                }
                if (currentItem.frameRate != 25) {
                    alert(dialogOGV_localize(dogvData.strErrNotCorrectFPS) + "\n" + currentItem.name, "Warning");
                }    
                dogvData.sequenceItems.push(currentItem);
            }
        }
        //populate list
        for (var i = 0; i < dogvData.sequenceItems.length; i++) {
            var myItem = dogvPal.grp.input.lst.box.add("item", i + 1);
            myItem.subItems[0].text = dogvData.sequenceItems[i].name;
        }
    }

    // Browse for location
    function dialogOGV_doBrowse() {
        var outputFile = dogvData.projectFolder.selectDlg(dialogOGV_localize(dogvData.strBrowseText));
        if (outputFile != null) {
            dogvPal.grp.output.select.fld.text = outputFile.fsName.toString();
        }
    }

    // Detect edges for cropping
    function dialogOGV_edgeDetect(comp, samples, skip) {

        //create duplicate comp
        var analizeComp = comp.duplicate();
        analizeComp.name = "analizeComp_(" + comp.name + ")";
        var analizeFrames = analizeComp.layers.precompose([1], "analizeFrames_(" + comp.name + ")", true);
        var target = analizeComp.layers[1].name;

        //duplicate layer and distribute frames to single frame
        var compFrames = Math.round(analizeFrames.duration * analizeFrames.frameRate);

        for (i = 0; i < compFrames; i += skip) {
            var firstLayer = analizeFrames.layers[1];
            var newLayer = firstLayer.duplicate()
            var newLayerStartTime = newLayer.startTime;
            newLayer.startTime = newLayerStartTime - (analizeFrames.frameDuration * skip);
        }

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

        for (b = 0; b < compHeight; b += samples) {
            for (a = 0; a < compWidth; a += samples) {
                var expr = "thisComp.layer('" + target + "').sampleImage([" + a + "," + b + "], [" + samples + "," + samples + "]/2, true, 0)[3]";
                addSlider.property(1).expressionEnabled = true;
                addSlider.property(1).expression = expr;
                var value = addSlider(1).value;
                //find left edge
                if ((value > 0) && (a < x1)) {x1 = a;}
                //find right edge
                if ((value > 0) && (x2 < a)) {x2 = a;}
                //find top edge
                if ((value > 0) && (b < y1)) {y1 = b;}
                //find bottom edge
                if ((value > 0) && (y2 < b)) {y2 = b;}
            }
            updateProgresstext(dogvPal, b + " / " + compHeight);
            updateProgressbar(dogvPal, 0, b+1, compHeight);
        }

        analizeComp.remove();
        analizeFrames.remove();

        var arr = [Math.round(x1 - (samples / 2)), Math.round(x2 + (samples / 2)), Math.round(y1 - (samples / 2)), Math.round(y2 + (samples / 2))];
        return arr;
    }

    // main
    function dialogOGV_main() {
        for (var i = 0; i < dogvData.sequenceItems.length; i++) {
            dialogOGV_export(dogvData.sequenceItems[i]);
        }
        //render
        app.project.renderQueue.render();
    }

    // export
    function dialogOGV_export(item) {
        var itemName = item.name.split("_[")[0];
        //create item comp
        var currentItem = app.project.items.addComp(itemName, item.width, item.height, item.pixelAspect, item.duration, item.frameRate);
        var colorLayer = currentItem.layers.add(item);
        colorLayer.property("Effects").addProperty("Simple Choker");
        colorLayer.property("Effects").property("Simple Choker").property("Choke Matte").setValue(0.5);

        //get general info
        var outPath = dogvData.outputPath;

        //get current comp info
        var currentWidth = currentItem.width;
        var currentHeight = currentItem.height;
        var currentCompName = currentItem.name;
        var currentAspectRatio = currentItem.pixelAspect;
        var currentDuration = currentItem.duration;
        var currentFramerate = currentItem.frameRate;
        var currentFrameDuration = currentItem.frameDuration;

        //fix holes in alpha
        var duplicateColorLayer = colorLayer.duplicate();
        duplicateColorLayer.moveAfter(colorLayer);
        duplicateColorLayer.property("Effects").addProperty("Matte Choker");
        duplicateColorLayer.property("Effects").property("Matte Choker").property("Geometric Softness 1").setValue(50);

        //create background layer
        var backgroundLayer = currentItem.layers.addSolid([0.2, 0.2, 0.2], "bg", currentWidth, currentHeight, currentAspectRatio, currentDuration);
        backgroundLayer.moveToEnd();
        var backgroundLayerIndex = backgroundLayer.index;

        //create main folder
        var mainFolderItem = app.project.items.addFolder(currentCompName);

        //copy source of currentItem
        var currentCompAlpha = currentItem.duplicate();
        currentCompAlpha.name = "alpha(" + currentCompName + ")";
        currentCompAlpha.parentFolder = mainFolderItem;
        currentCompAlpha.layer(backgroundLayerIndex).remove();

        //create container for currentItem
        var mainCompName = "main_" + currentCompName;
        var mainCompWidth = currentWidth;
        var mainCompHeight = currentHeight;
        var mainCompFramerate = currentFramerate;
        var mainCompDuration = currentDuration;
        var mainComp = mainFolderItem.items.addComp(mainCompName, mainCompWidth, mainCompHeight, 1, mainCompDuration, mainCompFramerate);
        mainComp.layers.add(currentItem);

        //create container for currentCompAlpha
        var mainCompAlphaName = "alpha_" + currentCompName;
        var mainCompAlphaWidth = currentWidth;
        var mainCompAlphaHeight = currentHeight;
        var mainCompAlphaFramerate = currentFramerate;
        var mainCompAlphaDuration = currentDuration;
        var mainCompAlpha = mainFolderItem.items.addComp(mainCompAlphaName, mainCompAlphaWidth, mainCompAlphaHeight, 1, mainCompAlphaDuration, mainCompAlphaFramerate);
        var alphaLayer = mainCompAlpha.layers.add(currentCompAlpha);

        //crop mainComp and mainCompAlpha to edges if requested
        if (dogvPal.grp.options.crp.box1.value == true) {
            //detect edges
            var numOfSamples = parseInt(dogvPal.grp.options.sam.fld.text);
            var skipValue = parseInt(String(dogvPal.grp.options.skp.list.selection)) + 1;
            var targetEdges = dialogOGV_edgeDetect(mainCompAlpha, numOfSamples, skipValue);

            //offset mainComp layers to accommodate new dimensions
            for (var i = 0; i < mainComp.layers.length; i++) {
                var layerPos = mainComp.layers[i + 1].property("Transform").property("Position").value;
                mainComp.layers[i + 1].property("Transform").property("Position").setValue([layerPos[0] - targetEdges[0], layerPos[1] - targetEdges[2]]);
            }

            //offset mainCompAlpha layer to accommodate new dimensions
            for (var i = 0; i < mainComp.layers.length; i++) {
                var layerPos = mainCompAlpha.layers[i + 1].property("Transform").property("Position").value;
                mainCompAlpha.layers[i + 1].property("Transform").property("Position").setValue([layerPos[0] - targetEdges[0], layerPos[1] - targetEdges[2]]);
            }

            //crop comp to edges
            var newWidth = mainCompWidth - (targetEdges[0] + (mainCompWidth - targetEdges[1]));
            var newHeight = mainCompHeight - (targetEdges[2] + (mainCompHeight - targetEdges[3]));

            //crop mainComp
            mainComp.width = dialogOGV_factorisation16(newWidth);
            mainComp.height = dialogOGV_factorisation16(newHeight);

            //crop mainCompAlpha
            mainCompAlpha.width = dialogOGV_factorisation16(newWidth);
            mainCompAlpha.height = dialogOGV_factorisation16(newHeight);
        } else {
            //crop mainComp
            mainComp.width = dialogOGV_factorisation16(mainComp.width);
            mainComp.height = dialogOGV_factorisation16(mainComp.height);

            //crop mainCompAlpha
            mainCompAlpha.width = dialogOGV_factorisation16(mainComp.width);
            mainCompAlpha.height = dialogOGV_factorisation16(mainComp.height);
        }

        //setup the export
        try {
            var endFrame = mainComp.duration - mainComp.frameDuration;
            var oneFrame = mainComp.frameDuration;
            var newCompName = "ogv(" + mainComp.name + ")";
            var newCompWidth = mainComp.width * 2;
            var offsetLeft = mainComp.width / 2;
            var offsetRight = (mainComp.width / 2) * 3;
            var offsetHight = mainComp.height / 2;
            var newComp = mainFolderItem.items.addComp(newCompName, newCompWidth, mainComp.height, mainComp.pixelAspect, mainComp.duration, mainComp.frameRate);
            newComp.layers.add(mainComp);
            newComp.layers.add(mainCompAlpha);
            var L1 = newComp.layers[2];
            var L2 = newComp.layers[1];
            L1.property("ADBE Transform Group").property("ADBE Position").setValue([offsetLeft,offsetHight]);
            L2.property("ADBE Transform Group").property("ADBE Position").setValue([offsetRight,offsetHight]);
            L2.property("Effects").addProperty("Fill").property("Color").setValue([1,1,1,1]);
            var newCompBG = newComp.layers.addSolid([0,0,0], "background_layer", newComp.width, newComp.height, newComp.pixelAspect, newComp.duration);
            newCompBG.moveToEnd();
            //add avi to render queue
            var renderQueueComp = app.project.renderQueue.items.add(newComp);
            var renderQueueCompIndex = app.project.renderQueue.numItems;
            renderQueueComp.applyTemplate(dogvData.outputQuality);
            renderQueueComp.timeSpanStart = 0;
            renderQueueComp.timeSpanDuration = newComp.duration;
            renderQueueComp.outputModules[1].applyTemplate(dogvData.outputTemplateVid);
            renderQueueComp.outputModules[1].file = new File(dogvData.outputPath.fsName.toString() + "\\" + currentCompName + "_a.avi");
        } catch (err) {
            alert(err.toString());
        }

        mainComp.openInViewer()

    }

    // Button Functions:
    //

    // Execute
    function dialogOGV_doExecute() {
        if (dogvData.sequenceItems.length == 0) {
            alert(dialogOGV_localize(dogvData.strInputSelectErr));
        } else {
            var outputPath = dogvPal.grp.output.select.fld.text;
            if (outputPath != "") {
                dogvData.outputPath = new File(outputPath);
                if (dogvData.outputPath.exists == true) {
                    app.beginUndoGroup(dogvData.scriptName);
                    dialogOGV_main();
                    app.endUndoGroup();
                    dogvPal.close();
                } else {
                    alert(dialogOGV_localize(dogvData.strOutputErr));
                }
            } else {
                alert(dialogOGV_localize(dogvData.strSpreadsheetErr));
            }
        }
    }

    // Cancel
    function dialogOGV_doCancel() {
        dogvPal.close();
    }

    // Main code:
    //

    // Warning
    if (parseFloat(app.version) < 9.0) {
        alert(dialogOGV_localize(dogvData.strMinAE));
    } else {
        // Build and show the floating palette
        var dogvPal = dialogOGV_buildUI(thisObj);
        if (dogvPal !== null) {
            if (dogvPal instanceof Window) {
                // Show the palette
                dogvPal.center();
                dogvPal.show();
            } else {
                dogvPal.layout.layout(true);
            }
        }
    }
})(this);