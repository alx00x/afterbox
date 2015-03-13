// engineText.jsx
// 
// Name: engineText
// Version: 0.0
// Author: Aleksandar Kocic
// 
// Description: Exports audio layers timecode.    
// 
//  


(function engineText(thisObj) {

    if (app.project.file == null) {
        alert("Save the project first.");
        return;
    }

    if (app.project.activeItem == null) {
        alert("Please, select your composition.");
        return;
    }

    // Define main variables
    var etData = new Object();

    etData.scriptNameShort = "ATC";
    etData.scriptName = "Audio Timecode";
    etData.scriptVersion = "3.0";

    etData.strPathErr = {en: "Specified path could not be found. Reverting to project folder."};
    etData.strMinAE = {en: "This script requires Adobe After Effects CS4 or later."};
    etData.strSaveProject = {en: "Save your project first.."};
    etData.strActiveCompErr = {en: "Please select a composition."};
    etData.strBrowse = {en: "Browse"};
    etData.strExecute = {en: "Export"};
    etData.strCancel = {en: "Cancel"};

    etData.strHelp = {en: "?"};
    etData.strHelpTitle = {en: "Help"};
    etData.strErr = {en: "Something went wrong."};
    etData.strNoAudioLayers = {en: "No audio layers were found."};
    etData.strHelpText = {en: "This script exports timecode data related to audio files to the external .script or .text file."};

    etData.strRenderSettings = {en: "Settings"};
    etData.strOutputPath = {en: "Output Path"};
    etData.strScript = {en: "Export as .script"};
    etData.strText = {en: "Export as .txt"};

    // Define project variables
    etData.projectName = app.project.file.name;
    etData.projectNameNoExt = etData.projectName.replace(".aepx", "").replace(".aep", "");

    etData.projectFolder = app.project.file.parent;
    etData.activeItem = app.project.activeItem;
    etData.activeItemName = etData.activeItem.name;
    etData.audioLayersDataDirty = [];
    etData.audioLayersData = [];
    etData.textLayersDataDirty = [];
    etData.textLayersData = [];

    etData.usePath;

    // Localize
    function engineText_localize(strVar) {
        return strVar["en"];
    }

    // Build UI
    function engineText_buildUI(thisObj) {
        var pal = new Window("dialog", etData.scriptName, undefined, {resizeable:false});
        if (pal !== null) {
            var res =
                "group { \
                    orientation:'column', alignment:['fill','fill'], \
                    header: Group { \
                        alignment:['fill','top'], \
                        title: StaticText { text:'" + etData.scriptNameShort + " v" + etData.scriptVersion + "', alignment:['fill','center'] }, \
                        help: Button { text:'" + engineText_localize(etData.strHelp) + "', maximumSize:[30,20], alignment:['right','center'] }, \
                    }, \
                    outputPath: Panel { \
                        alignment:['fill','top'], \
                        text: '" + engineText_localize(etData.strOutputPath) + "', alignment:['fill','top'], \
                        main: Group { \
                            alignment:['fill','top'], \
                            btn: Button { text:'" + engineText_localize(etData.strBrowse) + "', preferredSize:[50,20] }, \
                            box: EditText { alignment:['fill','center'], preferredSize:[-1,20] },  \
                        }, \
                    }, \
                    opts: Panel { \
                        alignment:['fill','top'], \
                        text: '" + engineText_localize(etData.strRenderSettings) + "', alignment:['fill','top'] \
                        rdio: Group { \
                            alignment:['fill','top'], \
                            script: RadioButton { text:'" + engineText_localize(etData.strScript) + "' }, \
                            text: RadioButton { text:'" + engineText_localize(etData.strText) + "', value:true }, \
                        }, \
                    }, \
                    sepr: Group { \
                        orientation:'row', alignment:['fill','top'], \
                        rule: Panel { height: 2, alignment:['fill','center'] }, \
                    }, \
                    cmds: Group { \
                        alignment:['fill','top'], \
                        executeBtn: Button { text:'" + engineText_localize(etData.strExecute) + "', alignment:['center','bottom'], preferredSize:[-1,20] }, \
                        cancelBtn: Button { text:'" + engineText_localize(etData.strCancel) + "', alignment:['center','bottom'], preferredSize:[-1,20] }, \
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
                alert(etData.scriptTitle + "\n" + engineText_localize(etData.strHelpText), engineText_localize(etData.strHelpTitle));
            }

            pal.grp.outputPath.main.btn.onClick = function() {
                engineText_doBrowse();
            }

            pal.grp.cmds.executeBtn.onClick = engineText_doExecute;
            pal.grp.cmds.cancelBtn.onClick = engineText_doCancel;
        }

        return pal;
    }

    // Main Functions:
    //

    function engineText_doBrowse() {
        var browseOutputPath = Folder.selectDialog();
        if (browseOutputPath != null) {
            etPal.grp.outputPath.main.box.text = browseOutputPath.fsName.toString();
        }
    }

    function engineText_exportAsScript() {
        //code
    }

    function engineText_exportAsText() { 
        var engineText_text = new File(etData.usePath + "/" + etData.activeItemName + ".txt");
        engineText_text.open("w");
        var nothingToWrite = false;
        if (etData.audioLayersData != "") {
            for (var i = 0; i < etData.audioLayersData.length; i++) {
                engineText_text.writeln("Filename: " + etData.audioLayersData[i][0]);
                engineText_text.writeln("Timecode: " + etData.audioLayersData[i][1] + " --> " + etData.audioLayersData[i][2] + "\n");
            }
            engineText_text.writeln("----------------------------------------" + "\n");
        }
        if (etData.textLayersData != "") {
            for (var j = 0; j < etData.textLayersData.length; j++) {
                engineText_text.writeln("Sound   : " + etData.textLayersData[j][0]);
                engineText_text.writeln("Timecode: " + etData.textLayersData[j][1] + " --> " + etData.textLayersData[j][2] + "\n");
            }
        }
        if ((etData.audioLayersData == "") && (etData.textLayersData == "")) {
            engineText_text.writeln("Error: Could not find any active audio or text.");
        }
        engineText_text.close();
    }

    function engineText_getAudioTimeRecursively(currentComp, timeOffset) {
        var offsetFloat = parseFloat(timeOffset);
        var currentLayer;
        for (var i = 1; i <= currentComp.layers.length; i++) {
            currentLayer = currentComp.layers[i];
            if (!(currentLayer.source instanceof CompItem) && (currentLayer.source instanceof FootageItem) && (currentLayer instanceof AVLayer) && (currentLayer.source.hasAudio == true) && (currentLayer.audioEnabled == true) && (currentLayer.source.hasVideo == false)) {
                var sourceName = currentLayer.source.name;
                var startTime = parseFloat(currentLayer.startTime) + offsetFloat;
                var endTime = parseFloat(currentLayer.outPoint) + offsetFloat;
                etData.audioLayersDataDirty.push([sourceName, startTime.toFixed(2), endTime.toFixed(2)]);
            } else if ((currentLayer.source instanceof CompItem) && (currentLayer.audioEnabled == true)) {
                var offset = currentLayer.startTime + timeOffset;
                engineText_getAudioTimeRecursively(currentLayer.source, offset);
            }
        }
    }

    function engineText_getTextTimeRecursively(currentComp, timeOffset) {
        var offsetFloat = parseFloat(timeOffset);
        var currentLayer;
        for (var i = 1; i <= currentComp.layers.length; i++) {
            currentLayer = currentComp.layers[i];
            if (currentLayer instanceof TextLayer) {
                var sourceName = String(currentLayer.text.sourceText.value);
                var startTime = parseFloat(currentLayer.inPoint) + offsetFloat;
                var endTime = parseFloat(currentLayer.outPoint) + offsetFloat;
                etData.textLayersDataDirty.push([sourceName, startTime.toFixed(2), endTime.toFixed(2)]);
            } else if (currentLayer.source instanceof CompItem) {
                var offset = currentLayer.startTime + timeOffset;
                engineText_getTextTimeRecursively(currentLayer.source, offset);
            }
        }
    }

    function engineText_main() {
        //sorting function
        function compare(a, b) {
            if (a[2] < b[2]) return -1;
            if (a[2] > b[2]) return 1;
            return 0;
        }

        //get audio layers information
        engineText_getAudioTimeRecursively(etData.activeItem, 0);
        var layersDataDirty = etData.audioLayersDataDirty;
        var layersDataUnique = [];
        layersDataUnique[0] = layersDataDirty[0];
        for (var i = 0; i < layersDataDirty.length; i++) {
            var flag = true;
            for (var j = 0; j < layersDataUnique.length; j++) {
                if (layersDataUnique[j][0] == layersDataDirty[i][0]) {
                    flag = false;
                }
            }
            if (flag == true)
                layersDataUnique.push(layersDataDirty[i]);
        }
        etData.audioLayersData = layersDataUnique.sort(compare);

        //get text layers information
        engineText_getTextTimeRecursively(etData.activeItem, 0);
        var textLayersDataDirty = etData.textLayersDataDirty;
        var textLayersDataUnique = [];
        textLayersDataUnique[0] = textLayersDataDirty[0];
        for (var i = 0; i < textLayersDataDirty.length; i++) {
            var flag = true;
            for (var j = 0; j < textLayersDataUnique.length; j++) {
                if (textLayersDataUnique[j][0] == textLayersDataDirty[i][0]) {
                    flag = false;
                }
            }
            if (flag == true)
                textLayersDataUnique.push(textLayersDataDirty[i]);
        }
        etData.textLayersData = textLayersDataUnique.sort(compare);

        //get output path
        var editboxOutputPath = etPal.grp.outputPath.main.box.text;
        if (editboxOutputPath == "") {
            etData.usePath = etData.projectFolder.fsName;
        } else {
            var usePathFolder = new Folder(editboxOutputPath);
            if (usePathFolder.exists == true) {
                etData.usePath = editboxOutputPath;
            } else {
                alert(engineText_localize(etPal.strPathErr));
                etData.usePath = etData.projectFolder.fsName;
            }
        }

        //call export commands
        if (etPal.grp.opts.rdio.script.value == true) {
            engineText_exportAsScript();
        } else if (etPal.grp.opts.rdio.text.value == true) {
            engineText_exportAsText();
        } else {
            alert(engineText_localize(etData.strErr))
        }
    }

    // Button Functions:
    //

    // Execute
    function engineText_doExecute() {
        app.beginUndoGroup(etData.scriptName);
        engineText_main()
        app.endUndoGroup();
        etPal.close();
    }

    // Cancel
    function engineText_doCancel() {
        etPal.close();
    }

    // Main code:
    //

    // Warning
    if (parseFloat(app.version) < 9.0) {
        alert(engineText_localize(etData.strMinAE));
    } else {
        // Build and show the floating palette
        var etPal = engineText_buildUI(thisObj);
        if (etPal !== null) {
            if (etPal instanceof Window) {
                // Show the palette
                etPal.center();
                etPal.show();
            } else {
                etPal.layout.layout(true);
            }
        }
    }
})(this);