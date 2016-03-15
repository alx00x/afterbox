// exportSubtitles.jsx
// 
// Name: exportSubtitles
// Version: 0.1
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
    var esubData = new Object();

    esubData.scriptNameShort = "ESub";
    esubData.scriptName = "Export Subtitles";
    esubData.scriptVersion = "0.1";

    esubData.strPathErr = {en: "Specified path could not be found. Reverting to project folder."};
    esubData.strKeyErr = {en: "Leyar %s has an unexpected number of keys."};
    esubData.strCommentErr = {en: "Leyar %s doesnt have a proper marker comment."};
    esubData.strNoSubtitlesErr = {en: "Could not find any subtitle layes in this project."};
    esubData.strMinAE = {en: "This script requires Adobe After Effects CS4 or later."};
    esubData.strSaveProject = {en: "Save your project first.."};
    esubData.strActiveCompErr = {en: "Please select a composition."};
    esubData.strBrowse = {en: "Browse"};
    esubData.strExport = {en: "Export"};

    esubData.strHelp = {en: "?"};
    esubData.strHelpTitle = {en: "Help"};
    esubData.strHelpText = {en: "Provides a way to add text layes fit for export .srt"};

    esubData.strAddSubtitle = {en: "Add Subtitle"};
    esubData.strAddButton = {en: "+"};
    esubData.strExport = {en: "Export"};

    // Define project variables
    esubData.projectName = app.project.file.name;
    esubData.projectNameNoExt = esubData.projectName.replace(".aepx", "").replace(".aep", "");
    esubData.projectNameNoVer;
    esubData.projectVersion = esubData.projectNameNoExt.substring(esubData.projectNameNoExt.length, esubData.projectNameNoExt.length - 3);
    if (esubData.projectNameNoExt.substring(esubData.projectNameNoExt.length - 3, esubData.projectNameNoExt.length - 5) == "_v") {
        esubData.projectNameNoVer = esubData.projectNameNoExt.substring(0, esubData.projectNameNoExt.length - 5);
    } else {
        esubData.projectNameNoVer = esubData.projectNameNoExt;
    }

    esubData.projectFolder = app.project.file.parent
    esubData.exportFolder = esubData.projectFolder

    esubData.activeItem = app.project.activeItem;
    esubData.activeItemName = esubData.activeItem.name;
    esubData.activeItemDuration = esubData.activeItem.duration;
    esubData.textLayersDataDirty = [];
    esubData.textLayersData = [];
    esubData.usePath;

    // Localize
    function exportSubtitles_localize(strVar) {
        return strVar["en"];
    }

    // Build UI
    function exportSubtitles_buildUI(thisObj) {
        var pal = new Window("palette", esubData.scriptName, undefined, {resizeable:false});
        if (pal !== null) {
            var res =
                "group { \
                    orientation:'column', alignment:['fill','fill'], \
                    header: Group { \
                        alignment:['fill','top'], \
                        title: StaticText { text:'" + esubData.scriptNameShort + " v" + esubData.scriptVersion + "', alignment:['fill','center'] }, \
                        help: Button { text:'" + exportSubtitles_localize(esubData.strHelp) + "', maximumSize:[30,20], alignment:['right','center'] }, \
                    }, \
                    opts: Panel { \
                        alignment:['fill','top'], \
                        text: '" + exportSubtitles_localize(esubData.strAddSubtitle) + "', alignment:['fill','top'] \
                        buttons: Group { \
                            btn: Button { text:'" + exportSubtitles_localize(esubData.strAddButton) + "', alignment:['center','bottom'], preferredSize:[100,20] }, \
                        }, \
                    }, \
                    exp: Panel { \
                        alignment:['fill','top'], \
                        text: '" + exportSubtitles_localize(esubData.strExport) + "', alignment:['fill','top'], \
                        main: Group { \
                            orientation:'column', alignment:['fill','fill'], \
                            alignment:['fill','top'], \
                            browse: Button { text:'" + exportSubtitles_localize(esubData.strBrowse) + "', preferredSize:[100,20] }, \
                            export: Button { text:'" + exportSubtitles_localize(esubData.strExport) + "', alignment:['center','bottom'], preferredSize:[100,20] }, \
                        }, \
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

            pal.grp.header.help.onClick = function() {
                alert(esubData.scriptName + " v" + esubData.scriptVersion + "\n" + exportSubtitles_localize(esubData.strHelpText), exportSubtitles_localize(esubData.strHelpTitle));
            }

            pal.grp.opts.buttons.btn.onClick = exportSubtitles_doAddSubtitle;
            pal.grp.exp.main.browse.onClick = exportSubtitles_doBrowse;
            pal.grp.exp.main.export.onClick = exportSubtitles_doExport;
        }

        return pal;
    }

    // Main Functions:
    //

    function exportSubtitles_doBrowse() {
        var browseFolder = Folder.selectDialog();
        if (browseFolder != null) {
            esubData.exportFolder = browseFolder;
        }
    }

    //function to check if string starts with substring
    if (typeof String.prototype.startsWith != 'function') {
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

    //seconds to time
    String.prototype.toHHMMSS = function () {
        var sec_num = parseInt(this, 10); // don't forget the second param
        var hours   = Math.floor(sec_num / 3600);
        var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
        var seconds = sec_num - (hours * 3600) - (minutes * 60);
    
        if (hours   < 10) {hours   = "0"+hours;}
        if (minutes < 10) {minutes = "0"+minutes;}
        if (seconds < 10) {seconds = "0"+seconds;}
        var time    = hours+':'+minutes+':'+seconds;
        return time;
    }

    function exportSubtitles_exportAsSubrip() {
        var exportSubtitles_file = esubData.usePath.toString() + "/" + esubData.activeItemName + ".srt";
        var exportSubtitles_text = new File(exportSubtitles_file);
        exportSubtitles_text.open("w");
        if (esubData.textLayersData != "") {
            for (var j = 0; j < esubData.textLayersData.length; j++) {
                var st = esubData.textLayersData[j][1].toString();
                var et = esubData.textLayersData[j][2].toString();

                exportSubtitles_text.writeln(j + 1);
                exportSubtitles_text.writeln(st.split(".")[0].toHHMMSS() + "," + st.split(".")[1] + " --> " + et.split(".")[0].toHHMMSS() + "," + et.split(".")[1]);
                exportSubtitles_text.writeln(esubData.textLayersData[j][0] + "\n");
            }
        } else {
            alert(exportSubtitles_localize(esubData.strNoSubtitlesErr))
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
                if (currentLayer.property("Effects").property("Subtitle Text") != null) {
                    if (currentLayer.property("Effects").property("Subtitle Text").property("Checkbox").value == 1) {
                        esubData.textLayersDataDirty.push([removeNewline(sourceText), startTime.toFixed(3), endTime.toFixed(3)]);
                    }
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

        //get text layers information
        exportSubtitles_getTextTimeRecursively(false, esubData.activeItem, 0, esubData.activeItem, 0, 1);
        esubData.textLayersData = esubData.textLayersDataDirty.sort(compare);
        

        //get output path
        var outputPath = esubData.exportFolder;
        if (outputPath == "") {
            esubData.usePath = esubData.projectFolder.fsName;
        } else {
            var usePathFolder = new Folder(outputPath);
            if (usePathFolder.exists == true) {
                esubData.usePath = outputPath;
            } else {
                alert(exportSubtitles_localize(esubPal.strPathErr));
                esubData.usePath = esubData.projectFolder.fsName;
            }
        }

        //call export commands
        exportSubtitles_exportAsSubrip();
    }

    function exportSubtitles_addSubtitleLayer() {
        //variables
        var textFont = "TrebuchetMS-Bold";
        var textSize = 24;
        var fillColor = [1.0, 1.0, 1.0];
        var strokeColor = [0.0, 0.0, 0.0];
        var strokeSize = 3;

        //create layer
        var activeItem = esubData.activeItem;
        var curentTime = activeItem.time;
        var subtitleLayer = activeItem.layers.addText("[YOUR TEXT HERE]");
        var subtitleLayerValue = subtitleLayer.sourceText.value;
        subtitleLayer.moveToBeginning();
        subtitleLayer.guideLayer = true;
        subtitleLayer.label = 11;

        //add checkbox
        var checkbox = subtitleLayer.property("ADBE Effect Parade").addProperty("ADBE Checkbox Control");
        checkbox.name = "Subtitle Text";
        subtitleLayer.property("ADBE Effect Parade").property(1).property("ADBE Checkbox Control-0001").setValue(1);

        //set duration to 2 seconds
        subtitleLayer.startTime = curentTime;
        subtitleLayer.outPoint = curentTime + 2;

        //set stroke
        app.executeCommand(9008);
        subtitleLayer.layerStyle.stroke.color.setValue(strokeColor)
        subtitleLayer.layerStyle.stroke.size.setValue(strokeSize)

        //set position
        var activeItemWidth = activeItem.width;
        var activeItemHeight = activeItem.height;
        subtitleLayer.position.setValue([activeItemWidth/2, activeItemHeight/10*9]);

        //set font
        subtitleLayerValue.resetParagraphStyle();
        subtitleLayerValue.resetCharStyle();
        subtitleLayerValue.justification = ParagraphJustification.CENTER_JUSTIFY;
        subtitleLayerValue.fontSize = textSize;
        subtitleLayerValue.fillColor = fillColor;
        subtitleLayerValue.font = textFont;
        subtitleLayer.sourceText.setValue(subtitleLayerValue);
    }

    // Button Functions:
    //

    // Add subtitle
    function exportSubtitles_doAddSubtitle() {
        app.beginUndoGroup(esubData.scriptName + " Add Subtitle");
        exportSubtitles_addSubtitleLayer();
        app.endUndoGroup();
    }

    // export
    function exportSubtitles_doExport() {
        app.beginUndoGroup(esubData.scriptName);
        exportSubtitles_main()
        app.endUndoGroup();
        esubPal.close();
    }

    // Main code:
    //

    // Warning
    if (parseFloat(app.version) < 9.0) {
        alert(exportSubtitles_localize(esubData.strMinAE));
    } else {
        // Build and show the floating palette
        var esubPal = exportSubtitles_buildUI(thisObj);
        if (esubPal !== null) {
            if (esubPal instanceof Window) {
                // Show the palette
                esubPal.center();
                esubPal.show();
            } else {
                esubPal.layout.layout(true);
            }
        }
    }
})(this);