// backgroundRender.jsx
//
// Name: backgroundRender
// Version: 1.6
// Author: Aleksandar Kocic
//
// Description:
// This script renders saves the project and renders the active composition
// in after effects native command-line renderer.
//


(function backgroundRender(thisObj) {

    if (app.project.file == null) {
        alert("Save the project first.");
        return;
    }

    // Localize
    function backgroundRender_localize(strVar) {
        return strVar["en"];
    }

    // Define main variables
    var bgrData = new Object();

    bgrData.scriptNameShort = "BGR";
    bgrData.scriptName = "Background Render";
    bgrData.scriptVersion = "1.6";
    bgrData.scriptTitle = bgrData.scriptName + " v" + bgrData.scriptVersion;

    bgrData.strPathErr = {en: "Specified path could not be found. Reverting to: ~/Desktop."};
    bgrData.strMinAE = {en: "This script requires Adobe After Effects CS4 or later."};
    bgrData.strActiveCompErr = {en: "Please select a composition."};
    bgrData.strSaveActionMsg = {en: "Project needs to be saved now. Do you wish to continue?"};
    bgrData.strInstructions = {en: "Rendering with following settings:"};
    bgrData.strQuestion = {en: "Do you wish to proceed?"};
    bgrData.strExecute = {en: "Yes"};
    bgrData.strCancel = {en: "No"};

    bgrData.strOptions = {en: "Options"};
    bgrData.strOutputPath = {en: "Output Path"};
    bgrData.strRenderSettings = {en: "Render Settings"};
    bgrData.strOutputModule = {en: "Output Module"};
    bgrData.strTimeSpan = {en: "Time Span"};
    bgrData.strBrowse = {en: "Browse"};
    bgrData.strTimeOpts = {en: ["Length of Comp", "Work Area Only"]};

    bgrData.strHelp = {en: "?"};
    bgrData.strHelpTitle = {en: "Help"};
    bgrData.strHelpText = {en: "This script saves the project and renders the active composition in After Effects native command-line renderer."};

    if (!(app.project.activeItem instanceof CompItem) || (app.project.activeItem == null)) {
        alert(backgroundRender_localize(bgrData.strActiveCompErr));
        return;
    }

    // Define project variables
    bgrData.activeItem = app.project.activeItem;
    bgrData.activeItemName = app.project.activeItem.name;
    bgrData.activeItemRes = bgrData.activeItem.width + " x " + bgrData.activeItem.height;
    bgrData.projectName = app.project.file.name;
    bgrData.projectNameFix = bgrData.projectName.replace("%20", " ")
    bgrData.projectFile = app.project.file;
    bgrData.projectRoot = app.project.file.fsName.replace(bgrData.projectNameFix, "");

    // Define render queue variables
    bgrData.activeItemFPS = bgrData.activeItem.frameRate;
    bgrData.timeSpanStart = bgrData.activeItem.displayStartTime * bgrData.activeItemFPS;
    bgrData.timeSpanDuration = bgrData.activeItem.duration;
    bgrData.desktopPath = new Folder("~/Desktop");
    bgrData.outputPath = bgrData.desktopPath.fsName;

    bgrData.workAreaStart = bgrData.activeItem.workAreaStart;
    bgrData.workAreaDuration = bgrData.activeItem.workAreaDuration;

    // Prototype startsWith
    if (typeof String.prototype.startsWith != 'function') {
        String.prototype.startsWith = function(str) {
            return this.slice(0, str.length) == str;
        };
    }

    // Prototipe indexOf
    if (!Array.prototype.indexOf) {
        Array.prototype.indexOf = function(searchElement, fromIndex) {
            var k;
            if (this == null) {
                throw new TypeError('"this" is null or not defined');
            }
            var O = Object(this);
            var len = O.length >>> 0;

            // 4. If len is 0, return -1.
            if (len === 0) {
                return -1;
            }
            var n = +fromIndex || 0;
            if (Math.abs(n) === Infinity) {
                n = 0;
            }
            if (n >= len) {
                return -1;
            }
            k = Math.max(n >= 0 ? n : len - Math.abs(n), 0);
            while (k < len) {
                if (k in O && O[k] === searchElement) {
                    return k;
                }
                k++;
            }
            return -1;
        };
    }

    // Create temp render queue item
    var tempRenderQueueItem = app.project.renderQueue.items.add(bgrData.activeItem);
    var tempRenderQueueItemIndex = app.project.renderQueue.numItems;

    // Get Render Settings templates
    var rsTemplates = [];
    var rsTemplatesAll = app.project.renderQueue.item(tempRenderQueueItemIndex).templates;
    for (var i = 0; i < rsTemplatesAll.length; i++) {
        if (rsTemplatesAll[i].startsWith("_HIDDEN") == false) {
            rsTemplates.push(rsTemplatesAll[i]);
        }
    }
    var rsMMIndex = rsTemplates.indexOf("Best Settings");

    // Get Output Module templates
    var omTemplates = [];
    var omTemplatesAll = app.project.renderQueue.item(tempRenderQueueItemIndex).outputModule(1).templates;
    for (var i = 0; i < omTemplatesAll.length; i++) {
        if (omTemplatesAll[i].startsWith("_HIDDEN") == false) {
            omTemplates.push(omTemplatesAll[i]);
        }
    }
    var omMMIndex = omTemplates.indexOf("Lossless");

    // Remove temp render queue item
    app.project.renderQueue.item(tempRenderQueueItemIndex).remove();
    app.activeViewer.setActive();

    // Build UI
    function backgroundRender_buildUI(thisObj) {
        var pal = new Window("dialog", bgrData.scriptName, undefined, {resizeable:false});
        if (pal !== null) {
            var res =
                "group { \
                    orientation:'column', alignment:['fill','fill'], \
                    header: Group { \
                        alignment:['fill','top'], \
                        title: StaticText { text:'" + bgrData.scriptNameShort + " v" + bgrData.scriptVersion + "', alignment:['fill','center'] }, \
                        help: Button { text:'" + backgroundRender_localize(bgrData.strHelp) + "', maximumSize:[30,20], alignment:['right','center'] }, \
                    }, \
                    sepr: Group { \
                        orientation:'row', alignment:['fill','top'], \
                        rule: Panel { height: 2, alignment:['fill','center'] }, \
                    }, \
                    inst: Group { \
                        alignment:['fill','top'], \
                        stt: StaticText { text:'" + backgroundRender_localize(bgrData.strInstructions) + "', alignment:['left','fill'], preferredSize:[-1,20] }, \
                    }, \
                    options: Panel { \
                        alignment:['fill','top'], \
                        text: '" + backgroundRender_localize(bgrData.strOptions) + "', alignment:['fill','top'] \
                        rs: Group { \
                            alignment:['fill','top'], \
                            text: StaticText { text:'" + backgroundRender_localize(bgrData.strRenderSettings) + ":', preferredSize:[120,20] }, \
                            list: DropDownList { alignment:['fill','center'], preferredSize:[120,20] }, \
                        }, \
                        om: Group { \
                            alignment:['fill','top'], \
                            text: StaticText { text:'" + backgroundRender_localize(bgrData.strOutputModule) + ":', preferredSize:[120,20] }, \
                            list: DropDownList { alignment:['fill','center'], preferredSize:[120,20] }, \
                        }, \
                        time: Group { \
                            alignment:['fill','top'], \
                            text: StaticText { text:'" + backgroundRender_localize(bgrData.strTimeSpan) + ":', preferredSize:[120,20] }, \
                            list: DropDownList { alignment:['fill','center'], preferredSize:[120,20] }, \
                        }, \
                    }, \
                    outputPath: Panel { \
                        alignment:['fill','top'], \
                        text: '" + backgroundRender_localize(bgrData.strOutputPath) + "', alignment:['fill','top'], \
                        main: Group { \
                            alignment:['fill','top'], \
                            btn: Button { text:'" + backgroundRender_localize(bgrData.strBrowse) + "', preferredSize:[-1,20] }, \
                            box: EditText { alignment:['fill','center'], preferredSize:[-1,20] },  \
                        }, \
                    }, \
                    ques: Group { \
                        alignment:['fill','top'], \
                        text: StaticText { text:'" + backgroundRender_localize(bgrData.strQuestion) + "', alignment:['left','fill'], preferredSize:[-1,20] }, \
                    }, \
                    cmds: Group { \
                        alignment:['fill','top'], \
                        executeBtn: Button { text:'" + backgroundRender_localize(bgrData.strExecute) + "', alignment:['center','bottom'], preferredSize:[-1,20] }, \
                        cancelBtn: Button { text:'" + backgroundRender_localize(bgrData.strCancel) + "', alignment:['center','bottom'], preferredSize:[-1,20] }, \
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
                alert(bgrData.scriptTitle + "\n" + backgroundRender_localize(bgrData.strHelpText), backgroundRender_localize(bgrData.strHelpTitle));
            }

            var rsItems = rsTemplates;
            for (var i = 0; i < rsItems.length; i++) {
                pal.grp.options.rs.list.add("item", rsItems[i]);
            }
            pal.grp.options.rs.list.selection = rsMMIndex;

            var omItems = omTemplates;
            for (var i = 0; i < omItems.length; i++) {
                pal.grp.options.om.list.add("item", omItems[i]);
            }
            pal.grp.options.om.list.selection = omMMIndex;

            var timeItems = backgroundRender_localize(bgrData.strTimeOpts);
            for (var i = 0; i < timeItems.length; i++) {
                pal.grp.options.time.list.add("item", timeItems[i]);
            }
            pal.grp.options.time.list.selection = 1;

            pal.grp.outputPath.main.btn.onClick = function() {
                backgroundRender_doBrowse();
            }

            pal.grp.cmds.executeBtn.onClick = backgroundRender_doExecute;
            pal.grp.cmds.cancelBtn.onClick = backgroundRender_doCancel;
        }

        return pal;
    }

    // Main Functions:
    //

    // Dialog to let users define render location
    function backgroundRender_doBrowse() {
        var browseOutputPath = Folder.selectDialog();
        if (browseOutputPath != null) {
            bgrPal.grp.outputPath.main.box.text = browseOutputPath.toString();
        }
    }

    // Add quotes
    function addQuotes(string) {
        return "\""+ string + "\"";
    }

    // Prototipe includs a string inside another string
    if (!String.prototype.includes) {
        String.prototype.includes = function() {
            return String.prototype.indexOf.apply(this, arguments) !== -1;
        };
    }

    // Main
    function backgroundRender_main() {
        // Add to render queue
        var renderQueueItem = app.project.renderQueue.items.add(bgrData.activeItem);
        var renderQueueItemIndex = app.project.renderQueue.numItems;

        // Assign Render Settings template
        var renderSettingsTemplate = bgrPal.grp.options.rs.list.selection;
        renderQueueItem.applyTemplate(renderSettingsTemplate);

        // Assign Output Module template
        var outputModuleTemplate = bgrPal.grp.options.om.list.selection;
        renderQueueItem.outputModules[1].applyTemplate(outputModuleTemplate);

        // Assign Time Span choice
        if (bgrPal.grp.options.time.list.selection.index == 1) {
            renderQueueItem.timeSpanStart = bgrData.workAreaStart;
            renderQueueItem.timeSpanDuration = bgrData.workAreaDuration;
        } else {
            renderQueueItem.timeSpanStart = bgrData.timeSpanStart;
            renderQueueItem.timeSpanDuration = bgrData.timeSpanDuration;
        }
        var usePath;
        var editboxOutputPath = bgrPal.grp.outputPath.main.box.text;
        if (editboxOutputPath == "") {
            usePath = bgrData.outputPath;
        } else {
            var usePathFolder = new Folder(editboxOutputPath);
            if (usePathFolder.exists == true) {
                usePath = editboxOutputPath;
            } else {
                alert(backgroundRender_localize(bgrPal.strPathErr));
                usePath = bgrData.outputPath;
            }
        }

        // Padding
        if (outputModuleTemplate.toString().includes("Sequence") == true) {
            sequencePadding = "_[#####]";
        } else {
            sequencePadding = "";
        }

        // Output
        renderQueueItem.outputModules[1].file = new File(usePath.toString() + "\\" + bgrData.activeItemName + "_[" + renderQueueItemIndex + "]" + sequencePadding);

        // Save the project
        app.project.save();

        // Write bat file
        var aerenderEXE = new File(Folder.appPackage.fullName + "/aerender.exe");

        var batContent = "@echo off\r\n";
        batContent += "title Please Wait\r\n"
        batContent += "start \"\" /b " + "/low" + " /wait "
        batContent += addQuotes(aerenderEXE.fsName) + " -project " + addQuotes(bgrData.projectFile.fsName) + " -rqindex " + renderQueueItemIndex + " -sound ON -mp\r\n";
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
        bgrPal.close();
    }

    // Execute
    function backgroundRender_doExecute() {
        var saveAction = confirm(backgroundRender_localize(bgrData.strSaveActionMsg));
        if (saveAction == true) {
            app.beginUndoGroup(bgrData.scriptName);

            backgroundRender_main()

            app.endUndoGroup();
            bgrPal.close();
        } else {
            return;
        }
    }

    function backgroundRender_doCancel() {
        bgrPal.close();
    }

    // Main code:
    //

    // Warning
    if (parseFloat(app.version) < 9.0) {
        alert(backgroundRender_localize(bgrData.strMinAE));
    } else if (!(app.project.activeItem instanceof CompItem) || (app.project.activeItem == null)) {
        alert(backgroundRender_localize(bgrData.strActiveCompErr));
    } else {
        // Build and show the floating palette
        var bgrPal = backgroundRender_buildUI(thisObj);
        if (bgrPal !== null) {
            if (bgrPal instanceof Window) {
                // Show the palette
                bgrPal.center();
                bgrPal.show();
            } else {
                bgrPal.layout.layout(true);
            }
        }
    }
})(this);
