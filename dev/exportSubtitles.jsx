// exportSubtitles.jsx
// 
// Name: exportSubtitles
// Version: 0.0
// Author: Aleksandar Kocic
// 
// Description: Provides a way to add text layes fit for export .srt
// 
//  


(function exportSubtitles(thisObj) {

    if (app.project.file == null) {
        alert("Save the project first.");
        return;
    }

    if (app.project.activeItem == null) {
        alert("Please, select your composition.");
        return;
    }

    // Define main variables
    var esData = new Object();

    esData.scriptNameShort = "ESub";
    esData.scriptName = "Export Subtitles";
    esData.scriptVersion = "0.0";

    esData.strPathErr = {en: "Specified path could not be found. Reverting to project folder."};
    esData.strKeyErr = {en: "Leyar %s has an unexpected number of keys."};
    esData.strCommentErr = {en: "Leyar %s doesnt have a proper marker comment."};
    esData.strMinAE = {en: "This script requires Adobe After Effects CS4 or later."};
    esData.strSaveProject = {en: "Save your project first.."};
    esData.strActiveCompErr = {en: "Please select a composition."};
    esData.strBrowse = {en: "Browse"};
    esData.strExecute = {en: "Export"};
    esData.strCancel = {en: "Cancel"};

    esData.strHelp = {en: "?"};
    esData.strHelpTitle = {en: "Help"};
    esData.strErr = {en: "Something went wrong."};
    esData.strNoAudioLayers = {en: "No audio layers were found."};
    esData.strHelpText = {en: "Provides a way to add text layes fit for export .srt"};

    esData.strAddSubtitle = {en: "Add Subtitle"};
    esData.strAddButton = {en: "+"};
    esData.strExport = {en: "Export"};
    esData.strScript = {en: "Export as .script"};
    esData.strText = {en: "Export as .txt"};

    // Define project variables
    esData.projectName = app.project.file.name;
    esData.projectNameNoExt = esData.projectName.replace(".aepx", "").replace(".aep", "");
    esData.projectNameNoVer;
    esData.projectVersion = esData.projectNameNoExt.substring(esData.projectNameNoExt.length, esData.projectNameNoExt.length - 3);
    if (esData.projectNameNoExt.substring(esData.projectNameNoExt.length - 3, esData.projectNameNoExt.length - 5) == "_v") {
        esData.projectNameNoVer = esData.projectNameNoExt.substring(0, esData.projectNameNoExt.length - 5);
    } else {
        esData.projectNameNoVer = esData.projectNameNoExt;
    }

    esData.projectFolder = app.project.file.parent
    esData.activeItem = app.project.activeItem;
    esData.activeItemName = esData.activeItem.name;
    esData.activeItemDuration = esData.activeItem.duration;
    esData.audioLayersDataDirty = [];
    esData.audioLayersData = [];
    esData.engineLayersDataDirty = [];
    esData.engineLayersData = [];
    esData.textLayersDataDirty = [];
    esData.textLayersData = [];
    esData.sfxLayersDataDirty = [];
    esData.sfxtLayersData = [];

    esData.usePath;

    // Localize
    function exportSubtitles_localize(strVar) {
        return strVar["en"];
    }

    // Build UI
    function exportSubtitles_buildUI(thisObj) {
        var pal = new Window("palette", esData.scriptName, undefined, {resizeable:true});
        if (pal !== null) {
            var res =
                "group { \
                    orientation:'column', alignment:['fill','fill'], \
                    header: Group { \
                        alignment:['fill','top'], \
                        title: StaticText { text:'" + esData.scriptNameShort + " v" + esData.scriptVersion + "', alignment:['fill','center'] }, \
                        help: Button { text:'" + exportSubtitles_localize(esData.strHelp) + "', maximumSize:[30,20], alignment:['right','center'] }, \
                    }, \
                    opts: Panel { \
                        alignment:['fill','top'], \
                        text: '" + exportSubtitles_localize(esData.strAddSubtitle) + "', alignment:['fill','top'] \
                        rdio: Group { \
                            alignment:['fill','top'], \
                            script: RadioButton { text:'" + exportSubtitles_localize(esData.strScript) + "' }, \
                            text: RadioButton { text:'" + exportSubtitles_localize(esData.strText) + "', value:true }, \
                        }, \
                        add: Group { \
                            btn: Button { text:'" + exportSubtitles_localize(esData.strAddButton) + "', alignment:['center','bottom'], preferredSize:[-1,20] }, \
                        }, \
                    }, \
                    exp: Panel { \
                        alignment:['fill','top'], \
                        text: '" + exportSubtitles_localize(esData.strExport) + "', alignment:['fill','top'], \
                        main: Group { \
                            alignment:['fill','top'], \
                            btn: Button { text:'" + exportSubtitles_localize(esData.strBrowse) + "', preferredSize:[50,20] }, \
                            box: EditText { alignment:['fill','center'], preferredSize:[-1,20] },  \
                        }, \
                        buttons: Group { \
                            btn: Button { text:'" + exportSubtitles_localize(esData.strExecute) + "', alignment:['center','bottom'], preferredSize:[-1,20] }, \
                        }, \
                    }, \
                    sepr: Group { \
                        orientation:'row', alignment:['fill','top'], \
                        rule: Panel { height: 2, alignment:['fill','center'] }, \
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

            pal.grp.opts.rdio.script.enabled = false;

            pal.grp.header.help.onClick = function() {
                alert(esData.scriptName + " v" + esData.scriptVersion + "\n" + exportSubtitles_localize(esData.strHelpText), exportSubtitles_localize(esData.strHelpTitle));
            }

            pal.grp.exp.main.btn.onClick = function() {
                exportSubtitles_doBrowse();
            }

            pal.grp.exp.buttons.btn.onClick = exportSubtitles_doExport;
            pal.grp.exp.buttons.btn.onClick = exportSubtitles_doExport;
        }

        return pal;
    }

    // Main Functions:
    //

    function exportSubtitles_doBrowse() {
        var browseFolder = Folder.selectDialog();
        if (browseoutput != null) {
            atcPal.grp.exp.main.box.text = browseFolder.fsName.toString();
        }
    }

    //function to check if string starts with substring
    if (typeof String.prototype.startsWith != 'function') {
        // see below for better implementation!
        String.prototype.startsWith = function (str){
            return this.indexOf(str) === 0;
        };
    }

    // Remove apostrophe
    function removeApostrophe(str) {
        var string = str;
        string = string.replace(/'/g, '');
        return string;
    }

    // Remove newline
    function removeNewline(str) {
        var string = str;
        string = string.replace(/(\r\n|\n|\r)/gm,'');
        return string;
    }

    function exportSubtitles_exportAsScript() {
        //code
    }

    function exportSubtitles_exportAsText() { 
        var exportSubtitles_text = new File(esData.usePath + "/" + esData.activeItemName + ".txt");
        exportSubtitles_text.open("w");
        var nothingToWrite = false;
        if (esData.audioLayersData != "") {
            for (var i = 0; i < esData.audioLayersData.length; i++) {
                exportSubtitles_text.writeln("Filename: " + esData.audioLayersData[i][0]);
                exportSubtitles_text.writeln("Timecode: " + esData.audioLayersData[i][1] + " --> " + esData.audioLayersData[i][2] + "\n");
            }
            exportSubtitles_text.writeln("----------------------------------------" + "\n");
        } else {
            exportSubtitles_text.writeln("Note: Could not find any active audio." + "\n");
            exportSubtitles_text.writeln("----------------------------------------" + "\n");
        }
        if (esData.textLayersData != "") {
            for (var j = 0; j < esData.textLayersData.length; j++) {
                exportSubtitles_text.writeln("Text    : " + esData.textLayersData[j][0]);
                exportSubtitles_text.writeln("Timecode: " + esData.textLayersData[j][1] + " --> " + esData.textLayersData[j][2] + "\n");
            }
            exportSubtitles_text.writeln("----------------------------------------" + "\n");
        } else {
            exportSubtitles_text.writeln("Note: Could not find any active text." + "\n");
            exportSubtitles_text.writeln("----------------------------------------" + "\n");
        }
        if (esData.engineLayersData != "") {
            exportSubtitles_text.writeln("Script:" + "\n");
            exportSubtitles_text.writeln("init {");
            for (var j = 0; j < esData.engineLayersData.length; j++) {
                exportSubtitles_text.writeln("    hide $" + esData.engineLayersData[j][0].replace(" ", "_").replace("'", "").toLowerCase());
                if (esData.engineLayersData[j][7].startsWith("[1]") == true) {
                    exportSubtitles_text.writeln("    hide $" + esData.projectNameNoVer);
                    exportSubtitles_text.writeln("    set $" + esData.projectNameNoVer + ".active 0");
                    exportSubtitles_text.writeln("    animate $" + esData.engineLayersData[j][0].replace(" ", "_").replace("'", "").toLowerCase() + " 100f");
                }
            }
            exportSubtitles_text.writeln("}" + "\n");

            var playFirstCheck = false;
            for (var j = 0; j < esData.engineLayersData.length; j++) {
                if (esData.engineLayersData[j][7].startsWith("[0]") == true) {
                    var playFirstCheck = true;
                }
            }

            if (playFirstCheck == true) {
                exportSubtitles_text.writeln("on !entered {");
                exportSubtitles_text.writeln("    show $" + esData.projectNameNoVer);
                exportSubtitles_text.writeln("    set $" + esData.projectNameNoVer + ".active 1");
                for (var j = 0; j < esData.engineLayersData.length; j++) {
                    var startkey = esData.engineLayersData[j][3];
                    var fadein = esData.engineLayersData[j][4] - startkey;
                    var stand = esData.engineLayersData[j][5] - startkey;
                    var fadeout = esData.engineLayersData[j][6] - esData.engineLayersData[j][5];
                    if (esData.engineLayersData[j][7].startsWith("[0]") == true) {
                        exportSubtitles_text.writeln("    after_fx " + startkey + " {");
                        exportSubtitles_text.writeln("        fadein_fx $" + esData.engineLayersData[j][0].replace(" ", "_").replace("'", "").toLowerCase() + " " + fadein);
                        exportSubtitles_text.writeln("        after_fx " + stand + " {");
                        exportSubtitles_text.writeln("            fadeout_fx $" + esData.engineLayersData[j][0].replace(" ", "_").replace("'", "").toLowerCase() + " " + fadeout);
                        exportSubtitles_text.writeln("        }");
                        exportSubtitles_text.writeln("    }");
                    }
                }
                exportSubtitles_text.writeln("    set #end_time " + esData.activeItemDuration);
                exportSubtitles_text.writeln("    after_fx #end_time {");
                exportSubtitles_text.writeln("        hide $" + esData.projectNameNoVer);
                exportSubtitles_text.writeln("        set $" + esData.projectNameNoVer + ".active 0");
                exportSubtitles_text.writeln("        call play_next_video #end_time");
                exportSubtitles_text.writeln("    }");
                exportSubtitles_text.writeln("}" + "\n");
            }

            for (var j = 0; j < esData.engineLayersData.length; j++) {
                var startkey = esData.engineLayersData[j][3];
                var fadein = esData.engineLayersData[j][4] - startkey;
                var stand = esData.engineLayersData[j][5] - startkey;
                var fadeout = esData.engineLayersData[j][6] - esData.engineLayersData[j][5];

                if (esData.engineLayersData[j][7].startsWith("[1]") == true) {
                    exportSubtitles_text.writeln("fun play_next_video %time {");
                    exportSubtitles_text.writeln("    set #end_video " + esData.activeItemDuration);
                    exportSubtitles_text.writeln("    show $" + esData.projectNameNoVer);
                    exportSubtitles_text.writeln("    set $" + esData.projectNameNoVer + ".active 1");
                    exportSubtitles_text.writeln("    after_fx " + startkey + " {");
                    exportSubtitles_text.writeln("        fadein_fx $collectors_edition 1");
                    exportSubtitles_text.writeln("        animate $" + esData.engineLayersData[j][0].replace(" ", "_").replace("'", "").toLowerCase() + " 100f 1f 2.5");
                    exportSubtitles_text.writeln("        after_fx " + stand + " {");
                    exportSubtitles_text.writeln("            fadeout_fx $" + esData.engineLayersData[j][0].replace(" ", "_").replace("'", "").toLowerCase() + " " + fadeout);
                    exportSubtitles_text.writeln("        }");
                    exportSubtitles_text.writeln("    }");
                    exportSubtitles_text.writeln("    after_fx #end_video {");
                    exportSubtitles_text.writeln("        hide $" + esData.projectNameNoVer);
                    exportSubtitles_text.writeln("        set $" + esData.projectNameNoVer + ".active 0");
                    exportSubtitles_text.writeln("    }");
                    exportSubtitles_text.writeln("    signal !finish #end_video");
                    exportSubtitles_text.writeln("}");
                }
            }
        }
        exportSubtitles_text.close();
    }

    function exportSubtitles_compensateTimeRemap(comp, index, value) {
        var framerate = comp.frameRate;
        var layer = comp.layer(index);
        var timeRemapValue = layer.property("ADBE Time Remapping");
        var currentTime = 0;
        var oneFrame = 1 / framerate;
        while (timeRemapValue.valueAtTime(currentTime, false) < value) {
            currentTime = currentTime + oneFrame;
        }
        return currentTime;
    }

    function exportSubtitles_getAudioTimeRecursively(timeRemap, parentComp, childIndex, childComp, timeOffset, timeStretch) {
        var offsetFloat = parseFloat(timeOffset);
        var currentLayer;
        for (var i = 1; i <= childComp.layers.length; i++) {
            currentLayer = childComp.layers[i];
            if (!(currentLayer.source instanceof CompItem) && (currentLayer.source instanceof FootageItem) && (currentLayer instanceof AVLayer) && (currentLayer.source.hasAudio == true) && (currentLayer.audioEnabled == true) && (currentLayer.source.hasVideo == false)) {
                var sourceName = currentLayer.source.name;
                var layerStartTime = parseFloat(currentLayer.inPoint);
                var layerEndTime = parseFloat(currentLayer.outPoint);
                if (timeRemap == true) {
                    var startTime = exportSubtitles_compensateTimeRemap(parentComp, childIndex, parseFloat(currentLayer.inPoint)) * timeStretch + offsetFloat;
                    var endTime = exportSubtitles_compensateTimeRemap(parentComp, childIndex, parseFloat(currentLayer.outPoint)) * timeStretch + offsetFloat;
                } else {
                    var startTime = layerStartTime * timeStretch + offsetFloat;
                    var endTime = layerEndTime * timeStretch + offsetFloat;
                }
                esData.audioLayersDataDirty.push([sourceName, startTime.toFixed(2), endTime.toFixed(2)]);
            } else if ((currentLayer.source instanceof CompItem) && (currentLayer.audioEnabled == true)) {
                var timeRemapCheck = false;
                var getParentComp = childComp;
                var getChildIndex = currentLayer.index;
                var stretch = (currentLayer.stretch / 100) * timeStretch;
                var offset;
                if (currentLayer.timeRemapEnabled == true) {
                    timeRemapCheck = true;
                    offset = timeOffset;
                } else {
                    offset = currentLayer.startTime + timeOffset;
                }
                exportSubtitles_getAudioTimeRecursively(timeRemapCheck, getParentComp, getChildIndex, currentLayer.source, offset, stretch);
            }
        }
    }

    function exportSubtitles_getTextTimeRecursively(timeRemap, parentComp, childIndex, childComp, timeOffset, timeStretch) {
        var offsetFloat = parseFloat(timeOffset);
        var currentLayer;
        for (var i = 1; i <= childComp.layers.length; i++) {
            currentLayer = childComp.layers[i];
            if (currentLayer instanceof TextLayer) {
                var layerName = currentLayer.name;
                var sourceText = String(currentLayer.text.sourceText.value);
                var layerStartTime = parseFloat(currentLayer.inPoint);
                var layerEndTime = parseFloat(currentLayer.outPoint);
                if (timeRemap == true) {
                    var startTime = exportSubtitles_compensateTimeRemap(parentComp, childIndex, parseFloat(currentLayer.inPoint)) * timeStretch + offsetFloat;
                    var endTime = exportSubtitles_compensateTimeRemap(parentComp, childIndex, parseFloat(currentLayer.outPoint)) * timeStretch + offsetFloat;
                } else {                
                    var startTime = layerStartTime * timeStretch + offsetFloat;
                    var endTime = layerEndTime * timeStretch + offsetFloat;
                }
                if (layerName == "engine_text") {
                    //check if layer has "ADBE Solid Composite"
                    var composite = currentLayer.Effects.property("ADBE Solid Composite");
                    if (composite != null) {
                        //check if it has 4 keyframes
                        if (composite.property(1).numKeys == 4) {
                            if (currentLayer.property("Marker").keyValue(1).comment != null) {
                                //get keyTime for all 4 frames
                                var key1 = composite.property(1).keyTime(1);
                                var key2 = composite.property(1).keyTime(2);
                                var key3 = composite.property(1).keyTime(3);
                                var key4 = composite.property(1).keyTime(4);
                                var comment = currentLayer.property("Marker").keyValue(1).comment;
                                //add data to engineLayersDataDirty
                                esData.engineLayersDataDirty.push([removeNewline(sourceText), startTime.toFixed(2), endTime.toFixed(2), key1, key2, key3, key4, comment]);
                            } else {
                                var comment_error_message = exportSubtitles_localize(esData.strCommentErr).replace('%s', '"' + removeNewline(sourceText) + '"');
                                alert(comment_error_message);
                            }
                        } else {
                            //dislay error if there are more or less keys than expected
                            var error_message = exportSubtitles_localize(esData.strKeyErr).replace('%s', '"' + removeNewline(sourceText) + '"');
                            alert(error_message);
                        }
                    }    
                } else {
                    esData.textLayersDataDirty.push([removeNewline(sourceText), startTime.toFixed(2), endTime.toFixed(2)]);
                }
            } else if (currentLayer.source instanceof CompItem) {
                var timeRemapCheck = false;
                var getParentComp = childComp;
                var getChildIndex = currentLayer.index;
                var stretch = (currentLayer.stretch / 100) * timeStretch;
                var offset;
                if (currentLayer.timeRemapEnabled == true) {
                    timeRemapCheck = true;
                    offset = timeOffset;
                } else {
                    offset = currentLayer.startTime + timeOffset;
                }
                exportSubtitles_getTextTimeRecursively(timeRemapCheck, getParentComp, getChildIndex, currentLayer.source, offset, stretch);
            }
        }
    }

    function exportSubtitles_main() {
        //sorting function
        function compare(a, b) {
            return a[1] - b[1];
        }

        //get audio layers information
        exportSubtitles_getAudioTimeRecursively(false, esData.activeItem, 0, esData.activeItem, 0, 1);
        var layersDataDirty = esData.audioLayersDataDirty;
        var layersDataUnique = [];
        for (var i = 0; i < layersDataDirty.length; i++) {
            var flag = true;
            for (var j = 0; j < layersDataUnique.length; j++) {
                if (layersDataUnique[j][0] == layersDataDirty[i][0]) {
                    flag = false;
                }
            }
            if (flag == true) {
                layersDataUnique.push(layersDataDirty[i]);
            }
        }
        esData.audioLayersData = layersDataUnique.sort(compare);

        //get text layers information
        exportSubtitles_getTextTimeRecursively(false, esData.activeItem, 0, esData.activeItem, 0, 1);
        var textLayersDataDirty = esData.textLayersDataDirty;
        var textLayersDataUnique = [];
        for (var i = 0; i < textLayersDataDirty.length; i++) {
            var flag = true;
            for (var j = 0; j < textLayersDataUnique.length; j++) {
                if (textLayersDataUnique[j][0] == textLayersDataDirty[i][0]) {
                    flag = false;
                }
            }
            if (flag == true) {
                textLayersDataUnique.push(textLayersDataDirty[i]);
            }
        }
        esData.textLayersData = textLayersDataUnique.sort(compare);

        //filter engine layers information
        var engineLayersDataDirty = esData.engineLayersDataDirty;      
        var engineLayersDataUnique = [];
        for (var i = 0; i < engineLayersDataDirty.length; i++) {
            var flag = true;
            for (var j = 0; j < engineLayersDataUnique.length; j++) {
                if (engineLayersDataUnique[j][0] == engineLayersDataDirty[i][0]) {
                    flag = false;
                }
            }
            if (flag == true)
                engineLayersDataUnique.push(engineLayersDataDirty[i]);
        }
        esData.engineLayersData = engineLayersDataUnique.sort(compare);

        //get output path
        var editboxoutput = atcPal.grp.output.main.box.text;
        if (editboxoutput == "") {
            esData.usePath = esData.projectFolder.fsName;
        } else {
            var usePathFolder = new Folder(editboxoutput);
            if (usePathFolder.exists == true) {
                esData.usePath = editboxoutput;
            } else {
                alert(exportSubtitles_localize(atcPal.strPathErr));
                esData.usePath = esData.projectFolder.fsName;
            }
        }

        //call export commands
        if (atcPal.grp.opts.rdio.script.value == true) {
            exportSubtitles_exportAsScript();
        } else if (atcPal.grp.opts.rdio.text.value == true) {
            exportSubtitles_exportAsText();
        } else {
            alert(exportSubtitles_localize(esData.strErr))
        }
    }

    // Button Functions:
    //

    // Execute
    function exportSubtitles_doExport() {
        app.beginUndoGroup(esData.scriptName);
        exportSubtitles_main()
        app.endUndoGroup();
        atcPal.close();
    }

    // Main code:
    //

    // Warning
    if (parseFloat(app.version) < 9.0) {
        alert(exportSubtitles_localize(esData.strMinAE));
    } else {
        // Build and show the floating palette
        var atcPal = exportSubtitles_buildUI(thisObj);
        if (atcPal !== null) {
            if (atcPal instanceof Window) {
                // Show the palette
                atcPal.center();
                atcPal.show();
            } else {
                atcPal.layout.layout(true);
            }
        }
    }
})(this);