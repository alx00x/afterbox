// audioTimecode.jsx
// 
// Name: audioTimecode
// Version: 3.10
// Author: Aleksandar Kocic
// 
// Description: Exports audio layers timecode.    
// 
//  


(function audioTimecode(thisObj) {

    if (app.project.file == null) {
        alert("Save the project first.");
        return;
    }

    if (app.project.activeItem == null) {
        alert("Please, select your composition.");
        return;
    }

    // Define main variables
    var atcData = new Object();

    atcData.scriptNameShort = "ATC";
    atcData.scriptName = "Audio Timecode";
    atcData.scriptVersion = "3.10";

    atcData.strPathErr = {en: "Specified path could not be found. Reverting to project folder."};
    atcData.strKeyErr = {en: "Leyar %s has an unexpected number of keys."};
    atcData.strCommentErr = {en: "Leyar %s doesnt have a proper marker comment."};
    atcData.strMinAE = {en: "This script requires Adobe After Effects CS4 or later."};
    atcData.strSaveProject = {en: "Save your project first.."};
    atcData.strActiveCompErr = {en: "Please select a composition."};
    atcData.strBrowse = {en: "Browse"};
    atcData.strExecute = {en: "Export"};
    atcData.strCancel = {en: "Cancel"};

    atcData.strHelp = {en: "?"};
    atcData.strHelpTitle = {en: "Help"};
    atcData.strErr = {en: "Something went wrong."};
    atcData.strNoAudioLayers = {en: "No audio layers were found."};
    atcData.strHelpText = {en: "This script exports timecode data related to audio files to the external .script or .text file."};

    atcData.strRenderSettings = {en: "Settings"};
    atcData.strOutputPath = {en: "Output Path"};
    atcData.strScript = {en: "Export as .script"};
    atcData.strText = {en: "Export as .txt"};

    // Define project variables
    atcData.projectName = app.project.file.name;
    atcData.projectNameNoExt = atcData.projectName.replace(".aepx", "").replace(".aep", "");
    atcData.projectNameNoVer;
    atcData.projectVersion = atcData.projectNameNoExt.substring(atcData.projectNameNoExt.length, atcData.projectNameNoExt.length - 3);
    if (atcData.projectNameNoExt.substring(atcData.projectNameNoExt.length - 3, atcData.projectNameNoExt.length - 5) == "_v") {
        atcData.projectNameNoVer = atcData.projectNameNoExt.substring(0, atcData.projectNameNoExt.length - 5);
    } else {
        atcData.projectNameNoVer = atcData.projectNameNoExt;
    }

    atcData.projectFolder = app.project.file.parent
    atcData.activeItem = app.project.activeItem;
    atcData.activeItemName = atcData.activeItem.name;
    atcData.activeItemDuration = atcData.activeItem.duration;
    atcData.audioLayersDataDirty = [];
    atcData.audioLayersData = [];
    atcData.engineLayersDataDirty = [];
    atcData.engineLayersData = [];
    atcData.textLayersDataDirty = [];
    atcData.textLayersData = [];
    atcData.sfxLayersDataDirty = [];
    atcData.sfxtLayersData = [];

    atcData.usePath;

    // Localize
    function audioTimecode_localize(strVar) {
        return strVar["en"];
    }

    // Build UI
    function audioTimecode_buildUI(thisObj) {
        var pal = new Window("dialog", atcData.scriptName, undefined, {resizeable:false});
        if (pal !== null) {
            var res =
                "group { \
                    orientation:'column', alignment:['fill','fill'], \
                    header: Group { \
                        alignment:['fill','top'], \
                        title: StaticText { text:'" + atcData.scriptNameShort + " v" + atcData.scriptVersion + "', alignment:['fill','center'] }, \
                        help: Button { text:'" + audioTimecode_localize(atcData.strHelp) + "', maximumSize:[30,20], alignment:['right','center'] }, \
                    }, \
                    outputPath: Panel { \
                        alignment:['fill','top'], \
                        text: '" + audioTimecode_localize(atcData.strOutputPath) + "', alignment:['fill','top'], \
                        main: Group { \
                            alignment:['fill','top'], \
                            btn: Button { text:'" + audioTimecode_localize(atcData.strBrowse) + "', preferredSize:[50,20] }, \
                            box: EditText { alignment:['fill','center'], preferredSize:[-1,20] },  \
                        }, \
                    }, \
                    opts: Panel { \
                        alignment:['fill','top'], \
                        text: '" + audioTimecode_localize(atcData.strRenderSettings) + "', alignment:['fill','top'] \
                        rdio: Group { \
                            alignment:['fill','top'], \
                            script: RadioButton { text:'" + audioTimecode_localize(atcData.strScript) + "' }, \
                            text: RadioButton { text:'" + audioTimecode_localize(atcData.strText) + "', value:true }, \
                        }, \
                    }, \
                    sepr: Group { \
                        orientation:'row', alignment:['fill','top'], \
                        rule: Panel { height: 2, alignment:['fill','center'] }, \
                    }, \
                    cmds: Group { \
                        alignment:['fill','top'], \
                        executeBtn: Button { text:'" + audioTimecode_localize(atcData.strExecute) + "', alignment:['center','bottom'], preferredSize:[-1,20] }, \
                        cancelBtn: Button { text:'" + audioTimecode_localize(atcData.strCancel) + "', alignment:['center','bottom'], preferredSize:[-1,20] }, \
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
                alert(atcData.scriptTitle + "\n" + audioTimecode_localize(atcData.strHelpText), audioTimecode_localize(atcData.strHelpTitle));
            }

            pal.grp.outputPath.main.btn.onClick = function() {
                audioTimecode_doBrowse();
            }

            pal.grp.cmds.executeBtn.onClick = audioTimecode_doExecute;
            pal.grp.cmds.cancelBtn.onClick = audioTimecode_doCancel;
        }

        return pal;
    }

    // Main Functions:
    //

    function audioTimecode_doBrowse() {
        var browseOutputPath = Folder.selectDialog();
        if (browseOutputPath != null) {
            atcPal.grp.outputPath.main.box.text = browseOutputPath.fsName.toString();
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

    function audioTimecode_exportAsScript() {
        //code
    }

    function audioTimecode_exportAsText() { 
        var audioTimecode_text = new File(atcData.usePath + "/" + atcData.activeItemName + ".txt");
        audioTimecode_text.open("w");
        var nothingToWrite = false;
        if (atcData.audioLayersData != "") {
            for (var i = 0; i < atcData.audioLayersData.length; i++) {
                audioTimecode_text.writeln("Filename: " + atcData.audioLayersData[i][0]);
                audioTimecode_text.writeln("Timecode: " + atcData.audioLayersData[i][1] + " --> " + atcData.audioLayersData[i][2] + "\n");
            }
            audioTimecode_text.writeln("----------------------------------------" + "\n");
        } else {
            audioTimecode_text.writeln("Note: Could not find any active audio." + "\n");
            audioTimecode_text.writeln("----------------------------------------" + "\n");
        }
        if (atcData.textLayersData != "") {
            for (var j = 0; j < atcData.textLayersData.length; j++) {
                audioTimecode_text.writeln("Text    : " + atcData.textLayersData[j][0]);
                audioTimecode_text.writeln("Timecode: " + atcData.textLayersData[j][1] + " --> " + atcData.textLayersData[j][2] + "\n");
            }
            audioTimecode_text.writeln("----------------------------------------" + "\n");
        } else {
            audioTimecode_text.writeln("Note: Could not find any active text." + "\n");
            audioTimecode_text.writeln("----------------------------------------" + "\n");
        }
        if (atcData.engineLayersData != "") {
            audioTimecode_text.writeln("Script:" + "\n");
            audioTimecode_text.writeln("init {");
            for (var j = 0; j < atcData.engineLayersData.length; j++) {
                audioTimecode_text.writeln("    hide $" + atcData.engineLayersData[j][0].replace(" ", "_").replace("'", "").toLowerCase());
                if (atcData.engineLayersData[j][7].startsWith("[1]") == true) {
                    audioTimecode_text.writeln("    hide $" + atcData.projectNameNoVer);
                    audioTimecode_text.writeln("    set $" + atcData.projectNameNoVer + ".active 0");
                    audioTimecode_text.writeln("    animate $" + atcData.engineLayersData[j][0].replace(" ", "_").replace("'", "").toLowerCase() + " 100f");
                }
            }
            audioTimecode_text.writeln("}" + "\n");

            var playFirstCheck = false;
            for (var j = 0; j < atcData.engineLayersData.length; j++) {
                if (atcData.engineLayersData[j][7].startsWith("[0]") == true) {
                    var playFirstCheck = true;
                }
            }

            if (playFirstCheck == true) {
                audioTimecode_text.writeln("on !entered {");
                audioTimecode_text.writeln("    show $" + atcData.projectNameNoVer);
                audioTimecode_text.writeln("    set $" + atcData.projectNameNoVer + ".active 1");
                for (var j = 0; j < atcData.engineLayersData.length; j++) {
                    var startkey = atcData.engineLayersData[j][3];
                    var fadein = atcData.engineLayersData[j][4] - startkey;
                    var stand = atcData.engineLayersData[j][5] - startkey;
                    var fadeout = atcData.engineLayersData[j][6] - atcData.engineLayersData[j][5];
                    if (atcData.engineLayersData[j][7].startsWith("[0]") == true) {
                        audioTimecode_text.writeln("    after_fx " + startkey + " {");
                        audioTimecode_text.writeln("        fadein_fx $" + atcData.engineLayersData[j][0].replace(" ", "_").replace("'", "").toLowerCase() + " " + fadein);
                        audioTimecode_text.writeln("        after_fx " + stand + " {");
                        audioTimecode_text.writeln("            fadeout_fx $" + atcData.engineLayersData[j][0].replace(" ", "_").replace("'", "").toLowerCase() + " " + fadeout);
                        audioTimecode_text.writeln("        }");
                        audioTimecode_text.writeln("    }");
                    }
                }
                audioTimecode_text.writeln("    set #end_time " + atcData.activeItemDuration);
                audioTimecode_text.writeln("    after_fx #end_time {");
                audioTimecode_text.writeln("        hide $" + atcData.projectNameNoVer);
                audioTimecode_text.writeln("        set $" + atcData.projectNameNoVer + ".active 0");
                audioTimecode_text.writeln("        call play_next_video #end_time");
                audioTimecode_text.writeln("    }");
                audioTimecode_text.writeln("}" + "\n");
            }

            for (var j = 0; j < atcData.engineLayersData.length; j++) {
                var startkey = atcData.engineLayersData[j][3];
                var fadein = atcData.engineLayersData[j][4] - startkey;
                var stand = atcData.engineLayersData[j][5] - startkey;
                var fadeout = atcData.engineLayersData[j][6] - atcData.engineLayersData[j][5];

                if (atcData.engineLayersData[j][7].startsWith("[1]") == true) {
                    audioTimecode_text.writeln("fun play_next_video %time {");
                    audioTimecode_text.writeln("    set #end_video " + atcData.activeItemDuration);
                    audioTimecode_text.writeln("    show $" + atcData.projectNameNoVer);
                    audioTimecode_text.writeln("    set $" + atcData.projectNameNoVer + ".active 1");
                    audioTimecode_text.writeln("    after_fx " + startkey + " {");
                    audioTimecode_text.writeln("        fadein_fx $collectors_edition 1");
                    audioTimecode_text.writeln("        animate $" + atcData.engineLayersData[j][0].replace(" ", "_").replace("'", "").toLowerCase() + " 100f 1f 2.5");
                    audioTimecode_text.writeln("        after_fx " + stand + " {");
                    audioTimecode_text.writeln("            fadeout_fx $" + atcData.engineLayersData[j][0].replace(" ", "_").replace("'", "").toLowerCase() + " " + fadeout);
                    audioTimecode_text.writeln("        }");
                    audioTimecode_text.writeln("    }");
                    audioTimecode_text.writeln("    after_fx #end_video {");
                    audioTimecode_text.writeln("        hide $" + atcData.projectNameNoVer);
                    audioTimecode_text.writeln("        set $" + atcData.projectNameNoVer + ".active 0");
                    audioTimecode_text.writeln("    }");
                    audioTimecode_text.writeln("    signal !finish #end_video");
                    audioTimecode_text.writeln("}");
                }
            }
        }
        audioTimecode_text.close();
    }

    function audioTimecode_compensateTimeRemap(comp, index, value) {
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

    function audioTimecode_getAudioTimeRecursively(timeRemap, parentComp, childIndex, childComp, timeOffset, timeStretch) {
        var offsetFloat = parseFloat(timeOffset);
        var currentLayer;
        for (var i = 1; i <= childComp.layers.length; i++) {
            currentLayer = childComp.layers[i];
            if (!(currentLayer.source instanceof CompItem) && (currentLayer.source instanceof FootageItem) && (currentLayer instanceof AVLayer) && (currentLayer.source.hasAudio == true) && (currentLayer.audioEnabled == true) && (currentLayer.source.hasVideo == false)) {
                var sourceName = currentLayer.source.name;
                var layerStartTime = parseFloat(currentLayer.inPoint);
                var layerEndTime = parseFloat(currentLayer.outPoint);
                if (timeRemap == true) {
                    var startTime = audioTimecode_compensateTimeRemap(parentComp, childIndex, parseFloat(currentLayer.inPoint)) * timeStretch + offsetFloat;
                    var endTime = audioTimecode_compensateTimeRemap(parentComp, childIndex, parseFloat(currentLayer.outPoint)) * timeStretch + offsetFloat;
                } else {
                    var startTime = layerStartTime * timeStretch + offsetFloat;
                    var endTime = layerEndTime * timeStretch + offsetFloat;
                }
                atcData.audioLayersDataDirty.push([sourceName, startTime.toFixed(2), endTime.toFixed(2)]);
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
                audioTimecode_getAudioTimeRecursively(timeRemapCheck, getParentComp, getChildIndex, currentLayer.source, offset, stretch);
            }
        }
    }

    function audioTimecode_getTextTimeRecursively(timeRemap, parentComp, childIndex, childComp, timeOffset, timeStretch) {
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
                    var startTime = audioTimecode_compensateTimeRemap(parentComp, childIndex, parseFloat(currentLayer.inPoint)) * timeStretch + offsetFloat;
                    var endTime = audioTimecode_compensateTimeRemap(parentComp, childIndex, parseFloat(currentLayer.outPoint)) * timeStretch + offsetFloat;
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
                                atcData.engineLayersDataDirty.push([removeNewline(sourceText), startTime.toFixed(2), endTime.toFixed(2), key1, key2, key3, key4, comment]);
                            } else {
                                var comment_error_message = audioTimecode_localize(atcData.strCommentErr).replace('%s', '"' + removeNewline(sourceText) + '"');
                                alert(comment_error_message);
                            }
                        } else {
                            //dislay error if there are more or less keys than expected
                            var error_message = audioTimecode_localize(atcData.strKeyErr).replace('%s', '"' + removeNewline(sourceText) + '"');
                            alert(error_message);
                        }
                    }    
                } else {
                    atcData.textLayersDataDirty.push([removeNewline(sourceText), startTime.toFixed(2), endTime.toFixed(2)]);
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
                audioTimecode_getTextTimeRecursively(timeRemapCheck, getParentComp, getChildIndex, currentLayer.source, offset, stretch);
            }
        }
    }

    function audioTimecode_main() {
        //sorting function
        function compare(a, b) {
            return a[1] - b[1];
        }

        //get audio layers information
        audioTimecode_getAudioTimeRecursively(false, atcData.activeItem, 0, atcData.activeItem, 0, 1);
        var layersDataDirty = atcData.audioLayersDataDirty;
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
        atcData.audioLayersData = layersDataUnique.sort(compare);

        //get text layers information
        audioTimecode_getTextTimeRecursively(false, atcData.activeItem, 0, atcData.activeItem, 0, 1);
        var textLayersDataDirty = atcData.textLayersDataDirty;
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
        atcData.textLayersData = textLayersDataUnique.sort(compare);

        //filter engine layers information
        var engineLayersDataDirty = atcData.engineLayersDataDirty;      
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
        atcData.engineLayersData = engineLayersDataUnique.sort(compare);

        //get output path
        var editboxOutputPath = atcPal.grp.outputPath.main.box.text;
        if (editboxOutputPath == "") {
            atcData.usePath = atcData.projectFolder.fsName;
        } else {
            var usePathFolder = new Folder(editboxOutputPath);
            if (usePathFolder.exists == true) {
                atcData.usePath = editboxOutputPath;
            } else {
                alert(audioTimecode_localize(atcPal.strPathErr));
                atcData.usePath = atcData.projectFolder.fsName;
            }
        }

        //call export commands
        if (atcPal.grp.opts.rdio.script.value == true) {
            audioTimecode_exportAsScript();
        } else if (atcPal.grp.opts.rdio.text.value == true) {
            audioTimecode_exportAsText();
        } else {
            alert(audioTimecode_localize(atcData.strErr))
        }
    }

    // Button Functions:
    //

    // Execute
    function audioTimecode_doExecute() {
        app.beginUndoGroup(atcData.scriptName);
        audioTimecode_main()
        app.endUndoGroup();
        atcPal.close();
    }

    // Cancel
    function audioTimecode_doCancel() {
        atcPal.close();
    }

    // Main code:
    //

    // Warning
    if (parseFloat(app.version) < 9.0) {
        alert(audioTimecode_localize(atcData.strMinAE));
    } else {
        // Build and show the floating palette
        var atcPal = audioTimecode_buildUI(thisObj);
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