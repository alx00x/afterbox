// previewRender.jsx
//
// Name: previewRender
// Version: 1.7
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

    // required afterbox check
    var requiredAfterBoxVersion = 4.1;
    if (app.settings.haveSetting("AfterBox", "Version")) {
        var currentAfterBoxVersion = parseFloat(app.settings.getSetting("AfterBox", "Version"));
    } else {
        var currentAfterBoxVersion = 0.0;
    }

    if (currentAfterBoxVersion < requiredAfterBoxVersion) {
        alert("This script requires afterbox version " + requiredAfterBoxVersion + " or later. Please update to use this script!");
        return;
    }

    // Define main variables
    var pvrData = new Object();

    pvrData.scriptNameShort = "PVR";
    pvrData.scriptName = "Preview Render";
    pvrData.scriptVersion = "1.7";
    pvrData.scriptTitle = pvrData.scriptName + " v" + pvrData.scriptVersion;

    pvrData.strRenderSettings = { en: "Render Settings" };
    pvrData.strOutputModule = { en: "Output Module" };
    pvrData.strOutputPath = { en: "Output Path" };
    pvrData.strPath = { en: "Path" };
    pvrData.strBrowse = { en: "Browse" };
    pvrData.strTimeSpan = { en: "Time Span" };
    pvrData.strTimeOpts = { en: ["Length of Comp", "Work Area Only"] };

    pvrData.strPathErr = { en: "Specified path could not be found. Reverting to: ~/Desktop." };
    pvrData.strMinAE = { en: "This script requires Adobe After Effects CS4 or later." };
    pvrData.strActiveCompErr = { en: "Please select a composition." };
    pvrData.strSaveActionMsg = { en: "Project needs to be saved now. Do you wish to continue?" };
    pvrData.strInstructions = { en: "Rendering with following settings:" };
    pvrData.strQuestion = { en: "Do you wish to proceed?" };
    pvrData.strExecute = { en: "Yes" };
    pvrData.strCancel = { en: "No" };

    pvrData.strHelp = { en: "?" };
    pvrData.strHelpTitle = { en: "Help" };
    pvrData.strHelpText = { en: "This script saves the project and renders the active composition in After Effects native command-line renderer." };

    if (!(app.project.activeItem instanceof CompItem) || (app.project.activeItem == null)) {
        alert(pvrData.strActiveCompErr);
        return;
    }

    // Define project variables
    pvrData.activeItem = app.project.activeItem;
    pvrData.activeItemName = app.project.activeItem.name;
    pvrData.activeItemRes = pvrData.activeItem.width / 2 + " x " + pvrData.activeItem.height / 2;
    pvrData.projectName = app.project.file.name;
    pvrData.projectNameFix = pvrData.projectName.replace("%20", " ")
    pvrData.projectFile = app.project.file;
    pvrData.projectRoot = app.project.file.fsName.replace(pvrData.projectNameFix, "");

    // Define render queue variables
    pvrData.renderSettingsTemplate = "Draft Settings";
    pvrData.outputModuleTemplate = "Lossless";

    pvrData.activeItemFPS = pvrData.activeItem.frameRate;
    pvrData.timeSpanStart = pvrData.activeItem.displayStartTime * pvrData.activeItemFPS;
    pvrData.timeSpanDuration = pvrData.activeItem.duration;
    pvrData.desktopPath = new Folder("~/Desktop");
    pvrData.outputPath = pvrData.desktopPath.fsName;

    pvrData.workAreaStart = pvrData.activeItem.workAreaStart;
    pvrData.workAreaDuration = pvrData.activeItem.workAreaDuration;

    // Images
    pvrData.imgFolder = new Folder(Folder.appPackage.fullName + "/Scripts/ScriptUI Panels/(afterbox)/images");
    pvrData.headerImage = new File(pvrData.imgFolder.fsName + "/previewRender_header.png");

    // Localize
    function previewRender_localize(strVar) {
        return strVar["en"];
    }

    // Build UI
    function previewRender_buildUI(thisObj) {
        var pal = new Window("dialog", pvrData.scriptName, undefined, { resizeable: false });
        if (pal !== null) {
            var head =
                "group { \
                    orientation:'column', alignment:['fill','fill'], \
                    header: Group { \
                        alignment:['fill','top'], \
                        title: StaticText { text:'" + pvrData.scriptNameShort + " v" + pvrData.scriptVersion + "', alignment:['fill','center'] }, \
                        help: Button { text:'" + previewRender_localize(pvrData.strHelp) + "', maximumSize:[30,20], alignment:['right','center'] }, \
                    }, \
                }, \
            }";

            var res =
                "group { \
                    orientation:'column', alignment:['fill','fill'], \
                    inst: Group { \
                        alignment:['fill','top'], \
                        stt: StaticText { text:'" + previewRender_localize(pvrData.strInstructions) + "', alignment:['left','fill'], preferredSize:[-1,20] }, \
                    }, \
                    renderSettings: Panel { \
                        alignment:['fill','top'], \
                        text: '" + previewRender_localize(pvrData.strRenderSettings) + "', alignment:['fill','top'] \
                        temp: Group { \
                            alignment:['fill','top'], \
                            sst1: StaticText { text:'Template:', preferredSize:[120,20] }, \
                            sst2: StaticText { text:'" + pvrData.renderSettingsTemplate + "', preferredSize:[-1,20] }, \
                        }, \
                        qual: Group { \
                            alignment:['fill','top'], \
                            sst1: StaticText { text:'Quality:', preferredSize:[120,20] }, \
                            sst2: StaticText { text:'Half', preferredSize:[-1,20] }, \
                        }, \
                        res: Group { \
                            alignment:['fill','top'], \
                            sst1: StaticText { text:'Resolution:', preferredSize:[120,20] }, \
                            sst2: StaticText { text:'" + pvrData.activeItemRes + "', preferredSize:[-1,20] }, \
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
                        rfrm: Group { \
                            alignment:['fill','top'], \
                            sst1: StaticText { text:'Repeat Each:', preferredSize:[120,20] }, \
                            sst2: StaticText { text:'2 frames', preferredSize:[-1,20] }, \
                        }, \
                        time: Group { \
                            alignment:['fill','top'], \
                            text: StaticText { text:'" + previewRender_localize(pvrData.strTimeSpan) + ":', preferredSize:[120,20] }, \
                            list: DropDownList { alignment:['fill','center'], preferredSize:[120,20] }, \
                        }, \
                    }, \
                    outputModules: Panel { \
                        alignment:['fill','top'], \
                        text: '" + previewRender_localize(pvrData.strOutputModule) + "', alignment:['fill','top'], \
                        temp: Group { \
                            alignment:['fill','top'], \
                            sst1: StaticText { text:'Template:', preferredSize:[120,20] }, \
                            sst2: StaticText { text:'" + pvrData.outputModuleTemplate + "', preferredSize:[-1,20] }, \
                        }, \
                    }, \
                    outputPath: Panel { \
                        alignment:['fill','top'], \
                        text: '" + previewRender_localize(pvrData.strOutputPath) + "', alignment:['fill','top'], \
                        main: Group { \
                            alignment:['fill','top'], \
                            btn: Button { text:'" + previewRender_localize(pvrData.strBrowse) + "', preferredSize:[-1,20] }, \
                            box: EditText { alignment:['fill','center'], preferredSize:[120,20] },  \
                        }, \
                    }, \
                    ques: Group { \
                        alignment:['fill','top'], \
                        stt: StaticText { text:'" + previewRender_localize(pvrData.strQuestion) + "', alignment:['left','fill'], preferredSize:[-1,20] }, \
                    }, \
                    cmds: Group { \
                        alignment:['fill','top'], \
                        executeBtn: Button { text:'" + previewRender_localize(pvrData.strExecute) + "', alignment:['center','bottom'], preferredSize:[-1,20] }, \
                        cancelBtn: Button { text:'" + previewRender_localize(pvrData.strCancel) + "', alignment:['center','bottom'], preferredSize:[-1,20] }, \
                    }, \
                }, \
            }";
            pal.hdr = pal.add(head);
            pal.img = pal.add("image", undefined, pvrData.headerImage);
            pal.grp = pal.add(res);

            pal.layout.layout(true);
            pal.grp.minimumSize = pal.grp.size;
            pal.layout.resize();
            pal.onResizing = pal.onResize = function () {
                this.layout.resize();
            }

            var timeItems = previewRender_localize(pvrData.strTimeOpts);
            for (var i = 0; i < timeItems.length; i++) {
                pal.grp.renderSettings.time.list.add("item", timeItems[i]);
            }
            pal.grp.renderSettings.time.list.selection = 1;

            pal.hdr.header.help.onClick = function () {
                alert(pvrData.scriptTitle + "\n" + previewRender_localize(pvrData.strHelpText), previewRender_localize(pvrData.strHelpTitle));
            }

            pal.grp.outputPath.main.btn.onClick = function () {
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
        pvrPal.grp.outputPath.main.box.text = browseOutputPath.toString();
    }

    // Add quotres around path
    function addQuotes(string) {
        return "\"" + string + "\"";
    }

    function previewRender_main() {
        // Add to render queue
        var renderQueueItem = app.project.renderQueue.items.add(pvrData.activeItem);
        var renderQueueItemIndex = app.project.renderQueue.numItems;
        renderQueueItem.applyTemplate(pvrData.renderSettingsTemplate);
        renderQueueItem.skipFrames = 2;
        renderQueueItem.outputModules[1].applyTemplate(pvrData.outputModuleTemplate);

        if (pvrPal.grp.renderSettings.time.list.selection.index == 1) {
            renderQueueItem.timeSpanStart = pvrData.workAreaStart;
            renderQueueItem.timeSpanDuration = pvrData.workAreaDuration;
        } else {
            renderQueueItem.timeSpanStart = pvrData.timeSpanStart;
            renderQueueItem.timeSpanDuration = pvrData.timeSpanDuration;
        }
        var usePath;
        var editboxOutputPath = pvrPal.grp.outputPath.main.box.text;
        if (editboxOutputPath == "") {
            usePath = pvrData.outputPath;
        } else {
            var usePathFolder = new Folder(editboxOutputPath);
            if (usePathFolder.exists == true) {
                usePath = editboxOutputPath;
            } else {
                alert(previewRender_localize(pvrData.strPathErr));
                usePath = pvrData.outputPath;
            }
        }
        renderQueueItem.outputModules[1].file = new File(usePath.toString() + "\\" + pvrData.activeItemName + "_[" + renderQueueItemIndex + "]_preview.avi");

        // Save the project
        app.project.save();

        // Write bat file
        var aerenderEXE = new File(Folder.appPackage.fullName + "/aerender.exe");

        var batContent = "@echo off\r\n";
        batContent += "title Please Wait\r\n"
        batContent += "start \"\" /b " + "/low" + " /wait "
        batContent += addQuotes(aerenderEXE.fsName) + " -project " + addQuotes(pvrData.projectFile.fsName) + " -rqindex " + renderQueueItemIndex + " -sound ON -i 2\r\n";
        batContent += "title Rendering Finished\r\n"
        batContent += "pause";

        var batFile = new File(app.project.file.fsName.replace(".aepx", ".bat").replace(".aep", ".bat"));
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
        pvrPal.close();
    }

    // Execute
    function previewRender_doExecute() {
        var saveAction = confirm(previewRender_localize(pvrData.strSaveActionMsg));
        if (saveAction == true) {
            app.beginUndoGroup(pvrData.scriptName);

            previewRender_main()

            app.endUndoGroup();
            pvrPal.close();
        } else {
            return;
        }
    }

    function previewRender_doCancel() {
        pvrPal.close();
    }

    // Main code:
    //

    // Warning
    if (parseFloat(app.version) < 9.0) {
        alert(previewRender_localize(pvrData.strMinAE));
    } else if (!(app.project.activeItem instanceof CompItem) || (app.project.activeItem == null)) {
        alert(previewRender_localize(pvrData.strActiveCompErr));
    } else {
        // Build and show the floating palette
        var pvrPal = previewRender_buildUI(thisObj);
        if (pvrPal !== null) {
            if (pvrPal instanceof Window) {
                // Show the palette
                pvrPal.center();
                pvrPal.show();
            } else {
                pvrPal.layout.layout(true);
            }
        }
    }
})(this);
