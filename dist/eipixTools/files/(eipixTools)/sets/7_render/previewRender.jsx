// previewRender.jsx
//
// Name: previewRender
// Version: 1.3
// Author: Aleksandar Kocic
//
// Description:
// This script renders saves the project and renders the active composition
// as a preview video with draft settings.
//


(function previewRender(thisObj) {

    if (app.project.file == null) {
        alert("Save the project first.");
        return;
    }

    // Define main variables
    var prrData = new Object();

    prrData.scriptNameShort = "PRR";
    prrData.scriptName = "Preview Render";
    prrData.scriptVersion = "1.3";
    prrData.scriptTitle = prrData.scriptName + " v" + prrData.scriptVersion;

    prrData.strRenderSettings = {en: "Render Settings"};
    prrData.strOutputModule = {en: "Output Module"};
    prrData.strOutputPath = {en: "Output Path"};
    prrData.strPath = {en: "Path"};
    prrData.strBrowse = {en: "Browse"};
    prrData.strTimeSpan = {en: "Time Span"};
    prrData.strTimeOpts = {en: ["Length of Comp", "Work Area Only"]};

    prrData.strPathErr = {en: "Specified path could not be found. Reverting to: ~/Desktop."};
    prrData.strMinAE = {en: "This script requires Adobe After Effects CS4 or later."};
    prrData.strActiveCompErr = {en: "Please select a composition."};
    prrData.strSaveActionMsg = {en: "Project needs to be saved now. Do you wish to continue?"};
    prrData.strInstructions = {en: "Rendering with following settings:"};
    prrData.strQuestion = {en: "Do you wish to proceed?"};
    prrData.strExecute = {en: "Yes"};
    prrData.strCancel = {en: "No"};

    prrData.strHelp = {en: "?"};
    prrData.strHelpTitle = {en: "Help"};
    prrData.strHelpText = {en: "This script saves the project and renders the active composition in After Effects native command-line renderer."};

    if (!(app.project.activeItem instanceof CompItem) || (app.project.activeItem == null)) {
        alert(prrData.strActiveCompErr);
        return;
    }

    // Define project variables
    prrData.activeItem = app.project.activeItem;
    prrData.activeItemName = app.project.activeItem.name;
    prrData.activeItemRes = prrData.activeItem.width / 2 + " x " + prrData.activeItem.height / 2;
    prrData.projectName = app.project.file.name;
    prrData.projectNameFix = prrData.projectName.replace("%20", " ")
    prrData.projectFile = app.project.file;
    prrData.projectRoot = app.project.file.fsName.replace(prrData.projectNameFix, "");

    // Define render queue variables
    prrData.renderSettingsTemplate = "Draft Settings";
    prrData.outputModuleTemplate = "Lossless";
    prrData.timeSpanStart = 0;
    prrData.timeSpanDuration = prrData.activeItem.duration;
    prrData.desktopPath = new Folder("~/Desktop");
    prrData.outputPath = prrData.desktopPath.fsName;

    prrData.workAreaStart = prrData.activeItem.workAreaStart;
    prrData.workAreaDuration = prrData.activeItem.workAreaDuration;

    // Localize
    function previewRender_localize(strVar) {
        return strVar["en"];
    }

    // Build UI
    function previewRender_buildUI(thisObj) {
        var pal = new Window("dialog", prrData.scriptName, undefined, {
            resizeable: false
        });
        if (pal !== null) {
            var res =
                "group { \
                    orientation:'column', alignment:['fill','fill'], \
                    header: Group { \
                        alignment:['fill','top'], \
                        title: StaticText { text:'" + prrData.scriptNameShort + " v" + prrData.scriptVersion + "', alignment:['fill','center'] }, \
                        help: Button { text:'" + previewRender_localize(prrData.strHelp) + "', maximumSize:[30,20], alignment:['right','center'] }, \
                    }, \
                    sepr: Group { \
                        orientation:'row', alignment:['fill','top'], \
                        rule: Panel { height: 2, alignment:['fill','center'] }, \
                    }, \
                    inst: Group { \
                        alignment:['fill','top'], \
                        stt: StaticText { text:'" + previewRender_localize(prrData.strInstructions) + "', alignment:['left','fill'], preferredSize:[-1,20] }, \
                    }, \
                    renderSettings: Panel { \
                        alignment:['fill','top'], \
                        text: '" + previewRender_localize(prrData.strRenderSettings) + "', alignment:['fill','top'] \
                        temp: Group { \
                            alignment:['fill','top'], \
                            sst1: StaticText { text:'Template:', preferredSize:[120,20] }, \
                            sst2: StaticText { text:'" + prrData.renderSettingsTemplate + "', preferredSize:[-1,20] }, \
                        }, \
                        qual: Group { \
                            alignment:['fill','top'], \
                            sst1: StaticText { text:'Quality:', preferredSize:[120,20] }, \
                            sst2: StaticText { text:'Half', preferredSize:[-1,20] }, \
                        }, \
                        res: Group { \
                            alignment:['fill','top'], \
                            sst1: StaticText { text:'Resolution:', preferredSize:[120,20] }, \
                            sst2: StaticText { text:'" + prrData.activeItemRes + "', preferredSize:[-1,20] }, \
                        }, \
                        frbl: Group { \
                            alignment:['fill','top'], \
                            sst1: StaticText { text:'Frame Blending:', preferredSize:[120,20] }, \
                            sst2: StaticText { text:'Off for Checked Layers', preferredSize:[-1,20] }, \
                        }, \
                        mblr: Group { \
                            alignment:['fill','top'], \
                            sst1: StaticText { text:'Motion Blur:', preferredSize:[120,20] }, \
                            sst2: StaticText { text:'Off for Checked Layers', preferredSize:[-1,20] }, \
                        }, \
                        time: Group { \
                            alignment:['fill','top'], \
                            text: StaticText { text:'" + previewRender_localize(prrData.strTimeSpan) + ":', preferredSize:[120,20] }, \
                            list: DropDownList { alignment:['fill','center'], preferredSize:[120,20] }, \
                        }, \
                    }, \
                    outputModules: Panel { \
                        alignment:['fill','top'], \
                        text: '" + previewRender_localize(prrData.strOutputModule) + "', alignment:['fill','top'], \
                        temp: Group { \
                            alignment:['fill','top'], \
                            sst1: StaticText { text:'Template:', preferredSize:[120,20] }, \
                            sst2: StaticText { text:'" + prrData.outputModuleTemplate + "', preferredSize:[-1,20] }, \
                        }, \
                    }, \
                    outputPath: Panel { \
                        alignment:['fill','top'], \
                        text: '" + previewRender_localize(prrData.strOutputPath) + "', alignment:['fill','top'], \
                        main: Group { \
                            alignment:['fill','top'], \
                            btn: Button { text:'" + previewRender_localize(prrData.strBrowse) + "', preferredSize:[-1,20] }, \
                            box: EditText { alignment:['fill','center'], preferredSize:[120,20] },  \
                        }, \
                    }, \
                    ques: Group { \
                        alignment:['fill','top'], \
                        stt: StaticText { text:'" + previewRender_localize(prrData.strQuestion) + "', alignment:['left','fill'], preferredSize:[-1,20] }, \
                    }, \
                    cmds: Group { \
                        alignment:['fill','top'], \
                        executeBtn: Button { text:'" + previewRender_localize(prrData.strExecute) + "', alignment:['center','bottom'], preferredSize:[-1,20] }, \
                        cancelBtn: Button { text:'" + previewRender_localize(prrData.strCancel) + "', alignment:['center','bottom'], preferredSize:[-1,20] }, \
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

            var timeItems = previewRender_localize(prrData.strTimeOpts);
            for (var i = 0; i < timeItems.length; i++) {
                pal.grp.renderSettings.time.list.add("item", timeItems[i]);
            }
            pal.grp.renderSettings.time.list.selection = 1;

            pal.grp.header.help.onClick = function() {
                alert(prrData.scriptTitle + "\n" + previewRender_localize(prrData.strHelpText), previewRender_localize(prrData.strHelpTitle));
            }

            pal.grp.outputPath.main.btn.onClick = function() {
                previewRender_doBrowse();
            }

            pal.grp.cmds.executeBtn.onClick = previewRender_doExecute;
            pal.grp.cmds.cancelBtn.onClick = previewRender_doCancel;
        }

        return pal;
    }


    // Main Functions:
    //

    // Dialog to let users define render location
    function previewRender_doBrowse() {
        var browseOutputPath = Folder.selectDialog().fsName;
        prrPal.grp.outputPath.main.box.text = browseOutputPath.toString();
    }

    // Add quotres around path
    function addQuotes(string) {
        return "\"" + string + "\"";
    }

    function previewRender_main() {
        // Add to render queue
        var renderQueueItem = app.project.renderQueue.items.add(prrData.activeItem);
        var renderQueueItemIndex = app.project.renderQueue.numItems;
        renderQueueItem.applyTemplate(prrData.renderSettingsTemplate);
        renderQueueItem.skipFrames = 2;
        renderQueueItem.outputModules[1].applyTemplate(prrData.outputModuleTemplate);

        if (prrPal.grp.renderSettings.time.list.selection.index == 1) {
            renderQueueItem.timeSpanStart = prrData.workAreaStart;
            renderQueueItem.timeSpanDuration = prrData.workAreaDuration;
        } else {
            renderQueueItem.timeSpanStart = prrData.timeSpanStart;
            renderQueueItem.timeSpanDuration = prrData.timeSpanDuration;
        }
        var usePath;
        var editboxOutputPath = prrPal.grp.outputPath.main.box.text;
        if (editboxOutputPath == "") {
            usePath = prrData.outputPath;
        } else {
            var usePathFolder = new Folder(editboxOutputPath);
            if (usePathFolder.exists == true) {
                usePath = editboxOutputPath;
            } else {
                alert(previewRender_localize(prrData.strPathErr));
                usePath = prrData.outputPath;
            }
        }
        renderQueueItem.outputModules[1].file = new File(usePath.toString() + "\\" + prrData.activeItemName + "_[" + renderQueueItemIndex + "]_preview.avi");

        // Save the project
        app.project.save();

        // Write bat file
        var aerenderEXE = new File(Folder.appPackage.fullName + "/aerender.exe");

        var batContent = "@echo off\r\n";
        batContent += "title Please Wait\r\n"
        batContent += "start \"\" /b " + "/low" + " /wait "
        batContent += addQuotes(aerenderEXE.fsName) + " -project " + addQuotes(prrData.projectFile.fsName) + " -rqindex " + renderQueueItemIndex + " -sound ON -mp\r\n";
        batContent += "title Rendering Finished\r\n"
        batContent += "pause";

        var batFile = new File(app.project.file.fsName.replace(".aep", ".bat"));
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

        // Start rendering
        if (batFile.exists == true) {
            batFile.execute();
        }

        // Remove queue item
        app.project.renderQueue.item(renderQueueItemIndex).remove();

        // Close interface
        prrPal.close();
    }

    // Execute
    function previewRender_doExecute() {
        var saveAction = confirm(previewRender_localize(prrData.strSaveActionMsg));
        if (saveAction == true) {
            app.beginUndoGroup(prrData.scriptName);

            previewRender_main()

            app.endUndoGroup();
            prrPal.close();
        } else {
            return;
        }
    }

    function previewRender_doCancel() {
        prrPal.close();
    }

    // Main code:
    //

    // Warning
    if (parseFloat(app.version) < 9.0) {
        alert(previewRender_localize(prrData.strMinAE));
    } else if (!(app.project.activeItem instanceof CompItem) || (app.project.activeItem == null)) {
        alert(previewRender_localize(prrData.strActiveCompErr));
    } else {
        // Build and show the floating palette
        var prrPal = previewRender_buildUI(thisObj);
        if (prrPal !== null) {
            if (prrPal instanceof Window) {
                // Show the palette
                prrPal.center();
                prrPal.show();
            } else {
                prrPal.layout.layout(true);
            }
        }
    }
})(this);
