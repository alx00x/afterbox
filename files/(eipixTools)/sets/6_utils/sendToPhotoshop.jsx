// sendToPhotoshop.jsx
// 
// Name: sendToPhotoshop
// Version: 0.1
// Author: Aleksandar Kocic
// 
// Description:     
// This script generates a PSD from composition for external editing and
// provides a basic interface for live updating.
// 

(function sendToPhotoshop(thisObj) {
    if (app.project.file == null) {
        alert("Save the project first.");
        return;
    }

    if (app.project.activeItem == null) {
        alert("Select your composition.");
        return;
    }

    if (app.project.activeItem.selectedLayers[0] == null) {
        alert("Select at least one layer.");
        return;
    }

    // Define main variables
    var s2psData = new Object();

    s2psData.scriptNameShort = "S2PS";
    s2psData.scriptName = "Send To Photoshop";
    s2psData.scriptVersion = "0.1";
    s2psData.scriptTitle = s2psData.scriptName + " v" + s2psData.scriptVersion;

    s2psData.strMinAE = {en: "This script requires Adobe After Effects CS4 or later."};
    s2psData.strActiveCompErr = {en: "Please select a composition."};

    s2psData.strComp = {en: "COMP"};
    s2psData.strUnlink = {en: "UNLINK"};
    s2psData.strSend = {en: "SEND"};
    s2psData.strUpdate = {en: "UPDATE"};

    s2psData.strSendHelpTip = {en: "Selected comp: "};
    s2psData.strLayered = {en: "Layered"};
    s2psData.strFlattened = {en: "Flattened"};

    s2psData.strOptions = {en: "..."};
    s2psData.strHelp = {en: "?"};

    s2psData.strHelpTitle = {en: "Help"};
    s2psData.strErr = {en: "Something went wrong."};
    s2psData.strHelpText = {en: "This script generates a PSD from composition for external editing and provides a basic interface for live updating."};

    // Define project variables
    s2psData.activeItem = app.project.activeItem;
    s2psData.activeItemID = app.project.activeItem.id;
    s2psData.activeItemName = app.project.activeItem.name;
    s2psData.activeItemFrames = app.project.activeItem.duration * app.project.activeItem.frameRate;
    s2psData.activeItemFPS = app.project.activeItem.frameRate;
    s2psData.activeItemOneFrame = 1 / app.project.activeItem.frameRate;
    s2psData.projectFolder = app.project.file.parent;

    // Script variables
    s2psData.PhotoshopPath = "C:\\Program Files\\Adobe\\Adobe Photoshop CC 2014\\Photoshop.exe";

    // Localize
    function sendToPhotoshop_localize(strVar) {
        return strVar["en"];
    }

    // Build UI
    function sendToPhotoshop_buildUI(thisObj) {
        var pal = new Window("palette", s2psData.scriptName, undefined, {resizeable:true});
        if (pal !== null) {
            var res =
                "group { \
                    orientation:'column', alignment:['fill','fill'], \
                    header: Group { \
                        alignment:['fill','top'], \
                        title: StaticText { text:'" + s2psData.scriptNameShort + " v" + s2psData.scriptVersion + "', alignment:['fill','center'] }, \
                        options: Button { text:'" + sendToPhotoshop_localize(s2psData.strOptions) + "', maximumSize:[30,20], alignment:['right','center'] }, \
                        help: Button { text:'" + sendToPhotoshop_localize(s2psData.strHelp) + "', maximumSize:[30,20], alignment:['right','center'] }, \
                    }, \
                    btns: Group { \
                        orientation:'column', alignment:['fill','top'], \
                        seperator: Panel { height: 2, alignment:['fill','center'] }, \
                        compBtn: Button { text:'" + sendToPhotoshop_localize(s2psData.strComp) + "', alignment:['fill','center'] }, \
                        sendBtn: Button { text:'" + sendToPhotoshop_localize(s2psData.strSend) + "', alignment:['fill','center'] }, \
                        unlinkBtn: Button { text:'" + sendToPhotoshop_localize(s2psData.strUnlink) + "', alignment:['fill','center'] }, \
                        radio: Group { \
                            orientation:'row', alignment:['fill','top'], \
                            layeredBtn: RadioButton { text:'" + sendToPhotoshop_localize(s2psData.strLayered) + "', alignment:['fill','top'], value:false }, \
                            flattenedBtn: RadioButton { text:'" + sendToPhotoshop_localize(s2psData.strFlattened) + "', alignment:['fill','top'], value:true }, \
                        }, \
                        seperator: Panel { height: 2, alignment:['fill','center'] }, \
                        updateBtn: Button { text:'" + sendToPhotoshop_localize(s2psData.strUpdate) + "', alignment:['fill','center'] }, \
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
                alert(s2psData.scriptTitle + "\n" + sendToPhotoshop_localize(s2psData.strHelpText), sendToPhotoshop_localize(s2psData.strHelpTitle));
            }

            pal.grp.header.options.onClick = function() {
                alert("No options yet.");
            }

            pal.grp.btns.radio.layeredBtn.enabled = false;
            pal.grp.btns.radio.flattenedBtn.enabled = true;

            pal.grp.btns.compBtn.helpTip = sendToPhotoshop_localize(s2psData.strSendHelpTip) + s2psData.activeItemName;
            pal.grp.btns.unlinkBtn.enabled = false;

            pal.grp.btns.compBtn.onClick = sendToPhotoshop_doComp;
            pal.grp.btns.sendBtn.onClick = sendToPhotoshop_doSend;
            pal.grp.btns.unlinkBtn.onClick = sendToPhotoshop_doUnlink;
            pal.grp.btns.updateBtn.onClick = sendToPhotoshop_doUpdate;
        }

        return pal;
    }

    // Support Fucntions:
    //
    function pad(num, size) {
        var s = num+"";
        while (s.length < size) s = "0" + s;
        return s;
    }

    // Button Functions:
    //

    function sendToPhotoshop_doComp() {
        //make linked comp active

    }

    function sendToPhotoshop_doSend() {
        //start undo group
        app.beginUndoGroup(s2psData.scriptName);

        //get selected layer info
        var activeItem = s2psData.activeItem;
        var activeItemName = s2psData.activeItemName;
        var selectedLayer = activeItem.selectedLayers[0];
        var index = selectedLayer.index;
        var inPoint = selectedLayer.inPoint;
        var outPoint = selectedLayer.outPoint;

        //precompose
        var layerIndicies = [];
        layerIndicies.push(index);
        var newComp = activeItem.layers.precompose(layerIndicies, selectedLayer.name, true);
        activeItem.layer(index).inPoint = inPoint;
        activeItem.layer(index).outPoint = outPoint;

        // //open new composition
        // var openCompCommand = app.findMenuCommandId("Open Layer Source");
        // app.executeCommand(openCompCommand);

        // //export composition as photoshop file
        // var saveAsPSCommand = app.findMenuCommandId("Photoshop Layers...");
        // app.executeCommand(saveAsPSCommand);

        //define render queue variables
        var renderSettingsTemplate = "Best Settings";
        var outputModuleTemplate = "Photoshop";
        var timeSpanStart = inPoint;
        var timeSpanDuration = s2psData.activeItemOneFrame;
        var outputPath = Folder.selectDialog().fsName;
        var exportedFrame = inPoint * s2psData.activeItemFPS;

        //output variables
        var outputPathFile = outputPath.toString() + "\\" + activeItemName + "_[#####].psd";
        var PSDFilePath = outputPath.toString() + "\\" + activeItemName + "_" + pad(exportedFrame, 5) + ".psd";
        var PSEXEPath = s2psData.PhotoshopPath;

        //export PSD
        var renderQueueItem = app.project.renderQueue.items.add(newComp);
        var renderQueueItemIndex = app.project.renderQueue.numItems;
        renderQueueItem.applyTemplate(renderSettingsTemplate);
        renderQueueItem.timeSpanStart = timeSpanStart;
        renderQueueItem.timeSpanDuration = timeSpanDuration;
        renderQueueItem.outputModules[1].applyTemplate(outputModuleTemplate);
        renderQueueItem.outputModules[1].file = new File(outputPathFile);
        app.project.renderQueue.render();
        renderQueueItem.remove();

        //write bat file
        var batContent = "start \"\" \"" + PSEXEPath + "\"" + " " + "\"" + PSDFilePath + "\"";

        var batFile = new File(outputPath + "\\" + activeItemName + ".bat");
        if (batFile.exists == true) {
            batFile.remove();
        }
        if (batFile.open("w")) {
            try {
                batFile.write(batContent);
            } catch (err) {
                alert(err.toString());
            } finally {
                batFile.close();
            }
        }

        //run bat file
        if (batFile.exists == true) {
            batFile.execute();
        }

        //make initial composition active
        activeItem.openInViewer();

        //delete bat file
        if (batFile.exists == true) {
            batFile.remove();
        }

        //import photoshop file as composition
        var importFile = new File(PSDFilePath);
        var importOptions = new ImportOptions(importFile);
        importOptions.importAs = ImportAsType.COMP_CROPPED_LAYERS;
        var theImport = app.project.importFile(importOptions);
        var currentSelection = app.project.selection;
        var newImport = currentSelection[0];

        //replace layer with new composition
        activeItem.openInViewer();
        activeItem.layer(index).replaceSource(newImport, true)

        //end undo group
        app.endUndoGroup();
    }

    function sendToPhotoshop_doUnlink() {
        //code
    }

    function sendToPhotoshop_doUpdate() {
        //code
    }

    // Main Code:
    //

    // Warning
    if (parseFloat(app.version) < 9.0) {
        alert(sendToPhotoshop_localize(s2psData.strMinAE));
    } else {
        // Build and show the floating palette
        var s2psPal = sendToPhotoshop_buildUI(thisObj);
        if (s2psPal !== null) {
            if (s2psPal instanceof Window) {
                // Show the palette
                s2psPal.center();
                s2psPal.show();
            } else {
                s2psPal.layout.layout(true);
            }
        }
    }
})(this);