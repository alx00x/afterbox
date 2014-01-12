// collectFilesAndReduce.jsx
// 
// Name: collectFilesAndReduce
// Version: 0.3
// Author: Aleksandar Kocic
// Based on: Collect Files function by duduf.net
// 
// Description:
// This script removes unused footage and collects files
// at the location of the original project. It mimics the 
// "Collect Files..." function. Heavily based on a script
// by duduf.net
//  
// Note: Might not be completely stable. Use with caution.


(function collectFilesAndReduce(thisObj) {

    // Define main variables
    var collectFilesAndReduceData = new Object();

    collectFilesAndReduceData.scriptNameShort = "CFAR";
    collectFilesAndReduceData.scriptName = "Collect Files And Reduce";
    collectFilesAndReduceData.scriptVersion = "0.3";
    collectFilesAndReduceData.scriptTitle = collectFilesAndReduceData.scriptName + " v" + collectFilesAndReduceData.scriptVersion;

    collectFilesAndReduceData.strMinAE = {en: "This script requires Adobe After Effects CS5 or later."};
    collectFilesAndReduceData.strExecute = {en: "Execute"};
    collectFilesAndReduceData.strCancel = {en: "Cancel"};
    collectFilesAndReduceData.strInstructions = {en: "This script removes unused footage and collects files at the location of the original project.\\n \\nAre you sure you want to proceed?"};
    collectFilesAndReduceData.strHelp = {en: "?"};
    collectFilesAndReduceData.strHelpTitle = {en: "Help"};
    collectFilesAndReduceData.strHelpText = {en: "Might not be completely stable. Use with caution."};

    // Localize
    function collectFilesAndReduce_localize(strVar) {
        return strVar["en"];
    }

    // Build UI
    function collectFilesAndReduce_buildUI(thisObj) {
        var pal = new Window("dialog", collectFilesAndReduceData.scriptName, undefined);
        if (pal !== null) {
            var res =
                "group { \
                orientation:'column', alignment:['fill','fill'], \
                header: Group { \
                    alignment:['fill','top'], \
                    title: StaticText { text:'" + collectFilesAndReduceData.scriptNameShort + "', alignment:['fill','center'] }, \
                    help: Button { text:'" + collectFilesAndReduce_localize(collectFilesAndReduceData.strHelp) + "', maximumSize:[30,20], alignment:['right','center'] }, \
                }, \
                main: Group { \
                    alignment:['fill','top'], \
                    instructions: StaticText { text:'" + collectFilesAndReduce_localize(collectFilesAndReduceData.strInstructions) + "', alignment:['left','fill'], preferredSize:[200,80], properties:{multiline:true} }, \
                }, \
                cmds: Group { \
                    alignment:['fill','bottom'], \
                    executeBtn: Button { text:'" + collectFilesAndReduce_localize(collectFilesAndReduceData.strExecute) + "', alignment:['left','bottom'], preferredSize:[-1,20] }, \
                    cancelBtn: Button { text:'" + collectFilesAndReduce_localize(collectFilesAndReduceData.strCancel) + "', alignment:['right','bottom'], preferredSize:[-1,20] }, \
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
                alert(collectFilesAndReduceData.scriptTitle + "\n" + collectFilesAndReduce_localize(collectFilesAndReduceData.strHelpText), collectFilesAndReduce_localize(collectFilesAndReduceData.strHelpTitle));
            }
            pal.grp.cmds.executeBtn.onClick = collectFilesAndReduce_doExecute;
        }

        return pal;
    }

    // Main Functions:
    //

    // Reduce Project function
    function reduceProjectAction() {
        app.project.removeUnusedFootage();
    }

    // Collect Files function
    function collectFilesAction() {
        var projectName = app.project.file.name;
        var projectNameNoExt = projectName.replace(".aep", "");
        var projectFile = app.project.file.fsName;

        var folderProject = projectFile.replace(projectName, "");
        var folderCollectPath = folderProject + projectNameNoExt + "_folder";
        var folderFootagePath = folderCollectPath + "\\(footage)\\";

        var folderCollect = new Folder(folderCollectPath);
        var folderFootage = new Folder(folderFootagePath);

        folderCollect.create();
        folderFootage.create();

        for (i = 1; i <= app.project.numItems; i++) {
            if (app.project.item(i) instanceof FootageItem) {
                var folderElement = new Folder(folderFootage.absoluteURI + "\\" + app.project.item(i).parentFolder.name + "\\");
                folderElement.create();

                if (app.project.item(i).file != null && !app.project.item(i).footageMissing) {
                    var extension = app.project.item(i).file.name.substring(app.project.item(i).file.name.lastIndexOf(".") + 1).toLowerCase();
                    if (app.project.item(i).mainSource.isStill) {
                        app.project.item(i).file.copy(folderElement.absoluteURI + "\\" + app.project.item(i).file.name);
                        app.project.item(i).replace(new File(folderElement.absoluteURI + "\\" + app.project.item(i).file.name));
                    } else if (extension != "jpg" && extension != "jpeg" && extension != "png" && extension != "tga" && extension != "tif" && extension != "tiff" && extension != "exr" && extension != "bmp" && extension != "pxr" && extension != "pct" && extension != "hdr" && extension != "rla" && extension != "ai" && extension != "cin" && extension != "dpx") {
                        app.project.item(i).file.copy(folderElement.absoluteURI + "\\" + app.project.item(i).file.name);
                        app.project.item(i).replace(new File(folderElement.absoluteURI + "\\" + app.project.item(i).file.name));
                    } else {
                        var folderSequence = app.project.item(i).file.parent;
                        var frameSequence = folderSequence.getFiles();
                        var folderSequenceTarget = new Folder(folderElement.absoluteURI + "\\" + folderSequence.name + "\\");
                        folderSequenceTarget.create();

                        for (j = 0; j < frameSequence.length; j++) {
                            frameSequence[j].copy(folderSequenceTarget.absoluteURI + "\\" + frameSequence[j].name);
                        }

                        app.project.item(i).replaceWithSequence(new File(folderSequenceTarget.absoluteURI + "\\" + app.project.item(i).file.name), true);
                        delete folderSequence;
                        delete frameSequence;
                        delete folderSequenceTarget;
                    }
                    delete extension;
                }
                delete folderElement;
            }
        }
        var savePath = new File(folderCollectPath + "\\" + projectName);
        app.project.save(savePath);
    }

    // Execute
    function collectFilesAndReduce_doExecute() {
        app.beginUndoGroup(reduceProjectAction);
        reduceProjectAction();
        app.endUndoGroup();

        app.beginUndoGroup(collectFilesAction);
        collectFilesAction();
        app.endUndoGroup();
        cfarPal.close();
    }

    // Main code:
    //

    // Warning
    if (parseFloat(app.version) < 10.0) {
        alert(collectFilesAndReduceData.strMinAE);
    } else {
        // Build and show the floating palette
        var cfarPal = collectFilesAndReduce_buildUI(thisObj);
        if (cfarPal !== null) {
            if (cfarPal instanceof Window) {
                // Show the palette
                cfarPal.center();
                cfarPal.show();
            } else
                cfarPal.layout.layout(true);
        }
    }
})(this);